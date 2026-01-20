import { createHash, randomBytes } from 'node:crypto';
import { errors, jwtVerify, SignJWT } from 'jose';
import env from '~/lib/env';

// Access Token payload interface
export interface AccessTokenPayload {
  sub: string; // userId
  email: string;
  name: string;
  emailVerified: boolean;
  sessionId: string;
}

// Decoded access token with standard JWT claims
export interface DecodedAccessToken extends AccessTokenPayload {
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

// Result types for token verification
export type VerifyAccessTokenResult =
  | { isValid: true; payload: DecodedAccessToken }
  | { isValid: false; error: 'expired' | 'invalid' | 'malformed' };

// Encode secret to Uint8Array for jose
function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(env.AUTH_JWT_SECRET);
}

/**
 * Sign an access token (JWT) with short expiry
 * Access tokens are stateless and don't require DB lookup
 */
export async function signAccessToken(payload: AccessTokenPayload): Promise<string> {
  const secret = getSecretKey();
  const expiresIn = env.AUTH_ACCESS_TOKEN_EXPIRES_IN;

  const jwt = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setIssuer(env.API_URL)
    .setAudience(env.WEBSITE_URL)
    .setExpirationTime(`${expiresIn}s`)
    .setSubject(payload.sub)
    .sign(secret);

  return jwt;
}

/**
 * Verify and decode an access token
 * Returns payload if valid, error type if invalid
 */
export async function verifyAccessToken(token: string): Promise<VerifyAccessTokenResult> {
  const secret = getSecretKey();

  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: env.API_URL,
      audience: env.WEBSITE_URL,
    });

    return {
      isValid: true,
      payload: payload as unknown as DecodedAccessToken,
    };
  } catch (error) {
    if (error instanceof errors.JWTExpired) {
      return { isValid: false, error: 'expired' };
    }
    if (error instanceof errors.JWTClaimValidationFailed) {
      return { isValid: false, error: 'invalid' };
    }
    return { isValid: false, error: 'malformed' };
  }
}

/**
 * Generate a cryptographically secure refresh token
 * Returns a random hex string (64 characters = 32 bytes)
 */
export function generateRefreshToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Hash a refresh token for secure storage
 * Never store plain refresh tokens in the database
 */
export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Verify a refresh token against its hash
 */
export function verifyRefreshTokenHash(token: string, hash: string): boolean {
  const tokenHash = hashRefreshToken(token);
  return tokenHash === hash;
}

/**
 * Calculate refresh token expiration date
 */
export function getRefreshTokenExpiresAt(): Date {
  const expiresIn = env.AUTH_REFRESH_TOKEN_EXPIRES_IN * 1000; // Convert to milliseconds
  return new Date(Date.now() + expiresIn);
}

/**
 * Calculate access token expiration date
 */
export function getAccessTokenExpiresAt(): Date {
  const expiresIn = env.AUTH_ACCESS_TOKEN_EXPIRES_IN * 1000; // Convert to milliseconds
  return new Date(Date.now() + expiresIn);
}
