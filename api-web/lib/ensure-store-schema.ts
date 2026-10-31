/**
 * Schema is applied at deploy time via `prisma db push` (uses DIRECT_URL).
 * Runtime raw DDL fails on Neon/Vercel pooled DATABASE_URL connections.
 */
export async function ensureStoreSchema(): Promise<void> {
  return;
}
