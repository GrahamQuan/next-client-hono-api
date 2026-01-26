import { vi } from 'vitest';

// =============================================================================
// Server Environment Variables
// =============================================================================

vi.stubEnv('NODE_ENV', 'development');
vi.stubEnv('PORT', '8787');
vi.stubEnv('API_URL', 'http://localhost:8787');
vi.stubEnv('WEBSITE_URL', 'http://localhost:3000');
vi.stubEnv('DATABASE_URL', 'postgresql://test:test@localhost:5432/test');
vi.stubEnv('CACHE_URL', 'redis://localhost:6379');

// Auth
vi.stubEnv('AUTH_TOTP_SECRET', 'test-totp-secret-32-chars-long!!');
vi.stubEnv('AUTH_BETTER_AUTH_SECRET', 'test-better-auth-secret-32chars!');
vi.stubEnv('NEXT_PUBLIC_AUTH_GOOGLE_CLIENT_ID', 'test-google-client-id');
vi.stubEnv('AUTH_GOOGLE_CLIENT_SECRET', 'test-google-client-secret');
vi.stubEnv('AUTH_TURNSTILE_SECRET_KEY', 'test-turnstile-secret');

// Email
vi.stubEnv('EMAIL_RESEND_API_KEY', 'test-resend-api-key');
vi.stubEnv('EMAIL_FROM', 'test@example.com');
vi.stubEnv('EMAIL_WEBSITE_NAME', 'Test Website');
vi.stubEnv('EMAIL_WEBSITE_URL', 'http://localhost:3000');

// Bucket
vi.stubEnv('BUCKET_NAME', 'test-bucket');
vi.stubEnv('BUCKET_REGION', 'us-east-1');
vi.stubEnv('BUCKET_ENDPOINT', 'https://s3.amazonaws.com');
vi.stubEnv('BUCKET_ACCESS_KEY_ID', 'test-access-key');
vi.stubEnv('BUCKET_SECRET_ACCESS_KEY', 'test-secret-key');
vi.stubEnv('BUCKET_PUBLIC_URL', 'https://test-bucket.s3.amazonaws.com');

// =============================================================================
// Client Environment Variables (NEXT_PUBLIC_*)
// =============================================================================

vi.stubEnv('NEXT_PUBLIC_WEBSITE_URL', 'http://localhost:3000');
vi.stubEnv('NEXT_PUBLIC_WEBSITE_NAME', 'Test Website');
vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'test-turnstile-site-key');
vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:8787');
vi.stubEnv('NEXT_PUBLIC_AUTH_GOOGLE_CLIENT_ID', 'test-google-client-id');
