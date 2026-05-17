process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.E2E_DATABASE_URL ??
  'postgresql://postgres:postgres@192.168.1.2:5432/eletut_e2e';
process.env.READONLY_DATABASE_URL =
  process.env.E2E_READONLY_DATABASE_URL ?? process.env.DATABASE_URL;
process.env.SESSION_SECRET = process.env.SESSION_SECRET ?? 'e2e-secret';
process.env.RATE_LIMIT_ENABLED = process.env.RATE_LIMIT_ENABLED ?? 'false';
process.env.FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? 'e2e-client-id';
process.env.GOOGLE_CLIENT_SECRET =
  process.env.GOOGLE_CLIENT_SECRET ?? 'e2e-client-secret';
process.env.GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL ??
  'http://localhost:3000/auth/callback/google';
process.env.ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@example.com';
