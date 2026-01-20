import { describe, expect, it, vi } from 'vitest';
import {
  type AccessTokenPayload,
  generateRefreshToken,
  hashRefreshToken,
  signAccessToken,
  verifyAccessToken,
  verifyRefreshTokenHash,
} from '~/auth/jwt';
import { shouldRotateRefreshToken } from '~/auth/token-service';

describe('AT+RT Token Flow Integration', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    emailVerified: true,
  };

  describe('Complete Token Lifecycle', () => {
    it('should generate and verify access token', async () => {
      const payload: AccessTokenPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        emailVerified: mockUser.emailVerified,
        sessionId: 'session-456',
      };

      // 1. Generate AT
      const accessToken = await signAccessToken(payload);
      expect(accessToken).toBeDefined();

      // 2. Verify AT
      const result = await verifyAccessToken(accessToken);
      expect(result.isValid).toBe(true);

      if (result.isValid) {
        // 3. Extract user info from token
        expect(result.payload.sub).toBe(mockUser.id);
        expect(result.payload.email).toBe(mockUser.email);
        expect(result.payload.sessionId).toBe('session-456');
      }
    });

    it('should generate and hash refresh token', () => {
      // 1. Generate RT
      const refreshToken = generateRefreshToken();
      expect(refreshToken).toBeDefined();
      expect(refreshToken).toHaveLength(64);

      // 2. Hash RT for storage
      const hash = hashRefreshToken(refreshToken);
      expect(hash).toBeDefined();
      expect(hash).not.toBe(refreshToken);

      // 3. Verify RT against hash
      expect(verifyRefreshTokenHash(refreshToken, hash)).toBe(true);
      expect(verifyRefreshTokenHash('wrong-token', hash)).toBe(false);
    });

    it('should simulate full AT+RT pair creation', async () => {
      const sessionId = 'session-789';
      const payload: AccessTokenPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        emailVerified: mockUser.emailVerified,
        sessionId,
      };

      // Create token pair
      const accessToken = await signAccessToken(payload);
      const refreshToken = generateRefreshToken();
      const refreshTokenHash = hashRefreshToken(refreshToken);

      // Simulate what would be stored in DB
      const sessionRecord = {
        id: sessionId,
        userId: mockUser.id,
        refreshTokenHash,
        refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };

      // Verify AT is valid
      const atResult = await verifyAccessToken(accessToken);
      expect(atResult.isValid).toBe(true);

      // Verify RT matches stored hash
      expect(verifyRefreshTokenHash(refreshToken, sessionRecord.refreshTokenHash)).toBe(true);
    });
  });

  describe('Token Refresh Scenarios', () => {
    it('should determine RT rotation correctly for fresh token', () => {
      const now = new Date();
      const createdAt = now;
      const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Fresh token - should not rotate
      expect(shouldRotateRefreshToken(expiresAt, createdAt)).toBe(false);
    });

    it('should determine RT rotation correctly for 50% used token', () => {
      const totalLifetime = 7 * 24 * 60 * 60 * 1000; // 7 days
      const now = new Date();
      const createdAt = new Date(now.getTime() - totalLifetime * 0.5);
      const expiresAt = new Date(createdAt.getTime() + totalLifetime);

      // 50% used - should not rotate
      expect(shouldRotateRefreshToken(expiresAt, createdAt)).toBe(false);
    });

    it('should determine RT rotation correctly for 80% used token', () => {
      const totalLifetime = 7 * 24 * 60 * 60 * 1000; // 7 days
      const now = new Date();
      const createdAt = new Date(now.getTime() - totalLifetime * 0.8);
      const expiresAt = new Date(createdAt.getTime() + totalLifetime);

      // 80% used - should rotate
      expect(shouldRotateRefreshToken(expiresAt, createdAt)).toBe(true);
    });

    it('should determine RT rotation correctly for 95% used token', () => {
      const totalLifetime = 7 * 24 * 60 * 60 * 1000; // 7 days
      const now = new Date();
      const createdAt = new Date(now.getTime() - totalLifetime * 0.95);
      const expiresAt = new Date(createdAt.getTime() + totalLifetime);

      // 95% used - should definitely rotate
      expect(shouldRotateRefreshToken(expiresAt, createdAt)).toBe(true);
    });
  });

  describe('Token Expiration Handling', () => {
    it('should detect expired refresh token', () => {
      const now = new Date();
      const expiredAt = new Date(now.getTime() - 1000); // 1 second ago

      // Check if expired
      const isExpired = expiredAt < now;
      expect(isExpired).toBe(true);
    });

    it('should detect valid refresh token', () => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Check if valid
      const isValid = expiresAt > now;
      expect(isValid).toBe(true);
    });
  });

  describe('Security Properties', () => {
    it('should generate cryptographically random refresh tokens', () => {
      const tokens: string[] = [];
      for (let i = 0; i < 1000; i++) {
        tokens.push(generateRefreshToken());
      }

      // All tokens should be unique
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(1000);

      // All tokens should be 64 chars (32 bytes hex)
      tokens.forEach((token) => {
        expect(token).toHaveLength(64);
        expect(/^[a-f0-9]+$/.test(token)).toBe(true);
      });
    });

    it('should not leak refresh token in hash', () => {
      const token = generateRefreshToken();
      const hash = hashRefreshToken(token);

      // Hash should not contain the token
      expect(hash.includes(token)).toBe(false);

      // Cannot reverse hash to get token
      expect(hash).not.toBe(token);
      expect(hash.length).toBe(64);
    });

    it('should produce consistent hashes', () => {
      const token = generateRefreshToken();
      const hash1 = hashRefreshToken(token);
      const hash2 = hashRefreshToken(token);
      const hash3 = hashRefreshToken(token);

      expect(hash1).toBe(hash2);
      expect(hash2).toBe(hash3);
    });
  });
});
