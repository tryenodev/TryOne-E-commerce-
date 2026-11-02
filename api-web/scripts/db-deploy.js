const { execSync } = require('child_process');

// If DIRECT_URL is not set, fallback to DATABASE_URL so Prisma schema validation passes
if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  console.log('[db-deploy] Notice: DIRECT_URL was not found. Falling back to DATABASE_URL.');
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

// 1. Generate Prisma Client
console.log('[db-deploy] Generating Prisma Client...');
execSync('prisma generate', { stdio: 'inherit', env: process.env });

// 2. Run migrations / schema sync if database URL is available
if (process.env.DATABASE_URL) {
  try {
    console.log('[db-deploy] Running prisma migrate deploy...');
    execSync('prisma migrate deploy', { stdio: 'inherit', env: process.env });
  } catch (migrateErr) {
    console.warn('[db-deploy] prisma migrate deploy failed or no migrations found, running prisma db push...');
    try {
      execSync('prisma db push', { stdio: 'inherit', env: process.env });
    } catch (pushErr) {
      console.error('[db-deploy] prisma db push also failed:', pushErr.message);
      process.exit(1);
    }
  }

  // 3. Ensure demo users and categories exist (idempotent upserts)
  if (process.env.AUTO_SEED !== 'false') {
    try {
      console.log('[db-deploy] Running prisma/seed.ts to ensure demo accounts exist...');
      execSync('npx tsx prisma/seed.ts', { stdio: 'inherit', env: process.env });
      if (process.env.AUTO_SEED === 'true') {
        console.log('[db-deploy] AUTO_SEED=true: Seeding rich sample products...');
        execSync('npx tsx scripts/seed-all-rich-products.ts', { stdio: 'inherit', env: process.env });
      }
      console.log('[db-deploy] Seeding finished successfully.');
    } catch (seedErr) {
      console.warn('[db-deploy] Seed step warning (non-fatal):', seedErr.message);
    }
  }
} else {
  console.log('[db-deploy] DATABASE_URL not set; skipping database migration step.');
}
