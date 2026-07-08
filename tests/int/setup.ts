// Draait vóór elke testfile (vitest setupFiles).
// ONVOORWAARDELIJKE override: tests raken nooit de database uit .env (Neon van Els).
process.env.DATABASE_URI =
  process.env.TEST_DATABASE_URI ??
  "postgresql://localhost:5432/humanmargin_test";
process.env.PAYLOAD_SECRET = "test-secret-alleen-lokaal";
process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
