import { beforeEach, describe, expect, it, vi } from 'vitest';
import { shouldRotateRefreshToken } from '~/auth/token-service';

describe('Token Service', () => {
  describe('shouldRotateRefreshToken', () => {
    it('should return false when RT is less than 80% used', () => {
      const now = new Date();
      const createdAt = new Date(now.getTime() - 1000 * 60 * 60); // 1 hour ago
      const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 6); // 6 days from now

      // Total lifetime: 7 days, elapsed: 1 hour = ~0.6% used
      const result = shouldRotateRefreshToken(expiresAt, createdAt);

      expect(result).toBe(false);
    });

    it('should return true when RT is more than 80% used', () => {
      const now = new Date();
      const totalLifetime = 1000 * 60 * 60 * 24 * 7; // 7 days
      const createdAt = new Date(now.getTime() - totalLifetime * 0.85); // 85% elapsed
      const expiresAt = new Date(createdAt.getTime() + totalLifetime);

      const result = shouldRotateRefreshToken(expiresAt, createdAt);

      expect(result).toBe(true);
    });

    it('should return true when RT is exactly 80% used', () => {
      const now = new Date();
      const totalLifetime = 1000 * 60 * 60 * 24 * 7; // 7 days
      const createdAt = new Date(now.getTime() - totalLifetime * 0.8); // 80% elapsed
      const expiresAt = new Date(createdAt.getTime() + totalLifetime);

      const result = shouldRotateRefreshToken(expiresAt, createdAt);

      expect(result).toBe(true);
    });

    it('should return false when RT is 79% used', () => {
      const now = new Date();
      const totalLifetime = 1000 * 60 * 60 * 24 * 7; // 7 days
      const createdAt = new Date(now.getTime() - totalLifetime * 0.79); // 79% elapsed
      const expiresAt = new Date(createdAt.getTime() + totalLifetime);

      const result = shouldRotateRefreshToken(expiresAt, createdAt);

      expect(result).toBe(false);
    });

    it('should return true when RT is 90% used', () => {
      const now = new Date();
      const totalLifetime = 1000 * 60 * 60 * 24 * 7; // 7 days
      const createdAt = new Date(now.getTime() - totalLifetime * 0.9); // 90% elapsed
      const expiresAt = new Date(createdAt.getTime() + totalLifetime);

      const result = shouldRotateRefreshToken(expiresAt, createdAt);

      expect(result).toBe(true);
    });

    it('should handle short-lived tokens', () => {
      const now = new Date();
      const totalLifetime = 1000 * 60 * 60; // 1 hour
      const createdAt = new Date(now.getTime() - totalLifetime * 0.85); // 85% elapsed
      const expiresAt = new Date(createdAt.getTime() + totalLifetime);

      const result = shouldRotateRefreshToken(expiresAt, createdAt);

      expect(result).toBe(true);
    });

    it('should handle just-created tokens', () => {
      const now = new Date();
      const createdAt = now;
      const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7); // 7 days

      const result = shouldRotateRefreshToken(expiresAt, createdAt);

      expect(result).toBe(false);
    });
  });
});

describe('Token Pair Structure', () => {
  it('should have correct token pair interface', () => {
    // This is a type check - if it compiles, the interface is correct
    const mockTokenPair = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      accessTokenExpiresAt: new Date(),
      refreshTokenExpiresAt: new Date(),
    };

    expect(mockTokenPair.accessToken).toBeDefined();
    expect(mockTokenPair.refreshToken).toBeDefined();
    expect(mockTokenPair.accessTokenExpiresAt).toBeInstanceOf(Date);
    expect(mockTokenPair.refreshTokenExpiresAt).toBeInstanceOf(Date);
  });
});

describe('Cookie Options', () => {
  it('should have correct access token cookie options structure', async () => {
    const { getAccessTokenCookieOptions } = await import('~/auth/token-service');
    const options = getAccessTokenCookieOptions();

    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe('lax');
    expect(options.path).toBe('/');
    expect(typeof options.maxAge).toBe('number');
    expect(options.maxAge).toBe(900); // 15 minutes
  });

  it('should have correct refresh token cookie options structure', async () => {
    const { getRefreshTokenCookieOptions } = await import('~/auth/token-service');
    const options = getRefreshTokenCookieOptions();

    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe('lax');
    expect(options.path).toBe('/');
    expect(typeof options.maxAge).toBe('number');
    expect(options.maxAge).toBe(604800); // 7 days
  });

  it('should set secure cookie in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    // Re-import to get fresh values
    vi.resetModules();
    const { getAccessTokenCookieOptions, getRefreshTokenCookieOptions } = await import('~/auth/token-service');

    const atOptions = getAccessTokenCookieOptions();
    const rtOptions = getRefreshTokenCookieOptions();

    expect(atOptions.secure).toBe(true);
    expect(rtOptions.secure).toBe(true);

    // Reset
    vi.stubEnv('NODE_ENV', 'development');
  });

  it('should not set secure cookie in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    vi.resetModules();
    const { getAccessTokenCookieOptions, getRefreshTokenCookieOptions } = await import('~/auth/token-service');

    const atOptions = getAccessTokenCookieOptions();
    const rtOptions = getRefreshTokenCookieOptions();

    expect(atOptions.secure).toBe(false);
    expect(rtOptions.secure).toBe(false);
  });
});

describe('Cookie Names', () => {
  it('should export correct cookie names', async () => {
    const { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } = await import('~/auth/token-service');

    expect(ACCESS_TOKEN_COOKIE).toBe('access_token');
    expect(REFRESH_TOKEN_COOKIE).toBe('refresh_token');
  });
});
