import { eq } from 'drizzle-orm';
import { db } from '~/db';
import { session, user as userTable } from '~/db/schema';
import env from '~/lib/env';
import {
  type AccessTokenPayload,
  generateRefreshToken,
  getAccessTokenExpiresAt,
  getRefreshTokenExpiresAt,
  hashRefreshToken,
  signAccessToken,
} from './jwt';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

export interface UserForToken {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
}

/** Rotation threshold: rotate RT when >80% of its lifetime has passed */
const RT_ROTATION_THRESHOLD = 0.8;

/**
 * Issue a new token pair (AT + RT) for a user session
 * Stores the hashed refresh token in the session record
 */
export async function issueTokenPair(user: UserForToken, sessionId: string): Promise<TokenPair> {
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);
  const refreshTokenExpiresAt = getRefreshTokenExpiresAt();
  const accessTokenExpiresAt = getAccessTokenExpiresAt();

  const payload: AccessTokenPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified,
    sessionId,
  };

  const accessToken = await signAccessToken(payload);

  // Update session with refresh token hash
  await db
    .update(session)
    .set({
      refreshTokenHash,
      refreshTokenExpiresAt,
      updatedAt: new Date(),
    })
    .where(eq(session.id, sessionId));

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
  };
}

/**
 * Check if refresh token should be rotated (>80% of lifetime used)
 */
export function shouldRotateRefreshToken(expiresAt: Date, createdAt: Date): boolean {
  const now = Date.now();
  const totalLifetime = expiresAt.getTime() - createdAt.getTime();
  const elapsed = now - createdAt.getTime();
  const usedPercentage = elapsed / totalLifetime;
  return usedPercentage >= RT_ROTATION_THRESHOLD;
}

/**
 * Refresh tokens - validate RT and issue new AT
 *
 * Token refresh strategy:
 * 1. AT + RT both expired → return null (401)
 * 2. AT expired, RT valid → issue new AT
 * 3. RT > 80% used → also rotate RT
 *
 * @param refreshToken - The plain refresh token from client
 * @param forceRotate - Force RT rotation regardless of threshold
 */
export async function refreshTokens(refreshToken: string, forceRotate = false): Promise<TokenPair | null> {
  const refreshTokenHash = hashRefreshToken(refreshToken);

  // Find session with matching refresh token hash
  const sessions = await db.select().from(session).where(eq(session.refreshTokenHash, refreshTokenHash)).limit(1);

  const sessionRecord = sessions[0];

  if (!sessionRecord) {
    return null;
  }

  // Check if refresh token is expired → 401
  if (sessionRecord.refreshTokenExpiresAt && sessionRecord.refreshTokenExpiresAt < new Date()) {
    // Invalidate the session since RT is expired
    await invalidateSessionTokens(sessionRecord.id);
    return null;
  }

  // Check if session itself is expired → 401
  if (sessionRecord.expiresAt < new Date()) {
    return null;
  }

  // Fetch user data
  const users = await db.select().from(userTable).where(eq(userTable.id, sessionRecord.userId)).limit(1);

  const userRecord = users[0];
  if (!userRecord) {
    return null;
  }

  const user: UserForToken = {
    id: userRecord.id,
    email: userRecord.email,
    name: userRecord.name,
    emailVerified: userRecord.emailVerified,
  };

  // Determine if RT should be rotated
  const shouldRotate =
    forceRotate ||
    (sessionRecord.refreshTokenExpiresAt &&
      shouldRotateRefreshToken(sessionRecord.refreshTokenExpiresAt, sessionRecord.createdAt));

  if (shouldRotate) {
    // Issue completely new token pair with rotated RT
    return issueTokenPair(user, sessionRecord.id);
  }

  // Just issue new AT, keep same RT
  const accessTokenExpiresAt = getAccessTokenExpiresAt();
  const payload: AccessTokenPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified,
    sessionId: sessionRecord.id,
  };

  const accessToken = await signAccessToken(payload);

  return {
    accessToken,
    refreshToken, // Return same RT
    accessTokenExpiresAt,
    refreshTokenExpiresAt: sessionRecord.refreshTokenExpiresAt ?? getRefreshTokenExpiresAt(),
  };
}

/**
 * Result of auto-refresh attempt
 */
export interface AutoRefreshResult {
  success: boolean;
  tokens?: TokenPair;
  rotated: boolean;
  error?: 'no_refresh_token' | 'expired' | 'invalid';
}

/**
 * Auto-refresh tokens from refresh token
 * Used by middleware to transparently refresh expired AT
 *
 * @param refreshToken - The plain refresh token (from cookie)
 */
export async function autoRefreshTokens(refreshToken: string | undefined): Promise<AutoRefreshResult> {
  if (!refreshToken) {
    return { success: false, rotated: false, error: 'no_refresh_token' };
  }

  const refreshTokenHash = hashRefreshToken(refreshToken);

  // Find session
  const sessions = await db.select().from(session).where(eq(session.refreshTokenHash, refreshTokenHash)).limit(1);

  const sessionRecord = sessions[0];

  if (!sessionRecord) {
    return { success: false, rotated: false, error: 'invalid' };
  }

  // Check if RT is expired
  if (sessionRecord.refreshTokenExpiresAt && sessionRecord.refreshTokenExpiresAt < new Date()) {
    await invalidateSessionTokens(sessionRecord.id);
    return { success: false, rotated: false, error: 'expired' };
  }

  // Check if session is expired
  if (sessionRecord.expiresAt < new Date()) {
    return { success: false, rotated: false, error: 'expired' };
  }

  // Determine if RT should be rotated (>80% used)
  const shouldRotate =
    sessionRecord.refreshTokenExpiresAt &&
    shouldRotateRefreshToken(sessionRecord.refreshTokenExpiresAt, sessionRecord.createdAt);

  // Fetch user
  const users = await db.select().from(userTable).where(eq(userTable.id, sessionRecord.userId)).limit(1);

  const userRecord = users[0];
  if (!userRecord) {
    return { success: false, rotated: false, error: 'invalid' };
  }

  const user: UserForToken = {
    id: userRecord.id,
    email: userRecord.email,
    name: userRecord.name,
    emailVerified: userRecord.emailVerified,
  };

  if (shouldRotate) {
    // Rotate RT (issue new token pair)
    const tokens = await issueTokenPair(user, sessionRecord.id);
    return { success: true, tokens, rotated: true };
  }

  // Just refresh AT, keep same RT
  const accessTokenExpiresAt = getAccessTokenExpiresAt();
  const payload: AccessTokenPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified,
    sessionId: sessionRecord.id,
  };

  const accessToken = await signAccessToken(payload);

  return {
    success: true,
    tokens: {
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt: sessionRecord.refreshTokenExpiresAt ?? getRefreshTokenExpiresAt(),
    },
    rotated: false,
  };
}

/**
 * Invalidate all tokens for a session (logout)
 */
export async function invalidateSessionTokens(sessionId: string): Promise<void> {
  await db
    .update(session)
    .set({
      refreshTokenHash: null,
      refreshTokenExpiresAt: null,
      updatedAt: new Date(),
    })
    .where(eq(session.id, sessionId));
}

/**
 * Invalidate all sessions for a user (force logout everywhere)
 */
export async function invalidateAllUserSessions(userId: string): Promise<void> {
  await db
    .update(session)
    .set({
      refreshTokenHash: null,
      refreshTokenExpiresAt: null,
      updatedAt: new Date(),
    })
    .where(eq(session.userId, userId));
}

/**
 * Get cookie options for access token (Web clients)
 * HttpOnly for security - web clients use cookies automatically
 */
export function getAccessTokenCookieOptions() {
  const isProduction = env.NODE_ENV === 'production';
  return {
    httpOnly: true, // HttpOnly for web security (XSS protection)
    secure: isProduction,
    sameSite: 'lax' as const,
    maxAge: env.AUTH_ACCESS_TOKEN_EXPIRES_IN,
    path: '/',
  };
}

/**
 * Get cookie options for refresh token (Web clients)
 * HttpOnly for security - never accessible to JS
 */
export function getRefreshTokenCookieOptions() {
  const isProduction = env.NODE_ENV === 'production';
  return {
    httpOnly: true, // HttpOnly for security
    secure: isProduction,
    sameSite: 'lax' as const,
    maxAge: env.AUTH_REFRESH_TOKEN_EXPIRES_IN,
    path: '/',
  };
}

// Cookie names
export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';
