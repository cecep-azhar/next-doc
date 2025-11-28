/**
 * MULTI-DATABASE PRISMA CLIENT
 * 
 * Supports 4 database modes — automatically detected from .env:
 * 
 * 1. DEVELOPMENT (sqlite) → Local SQLite file (./prisma/dev.db)
 * 2. TURSO (turso) → libSQL + Turso cloud/edge
 * 3. MYSQL (mysql) → Self-hosted MySQL 8+ (CloudPanel, Railway, local)
 * 4. PLANETSCALE/NEON (planetscale/neon) → Cloud providers
 * 
 * HOW TO SWITCH DATABASE:
 * Simply change DATABASE_MODE in .env to: sqlite | turso | mysql | planetscale | neon
 * 
 * Example .env:
 * DATABASE_MODE=turso
 * DATABASE_URL="libsql://your-db.turso.io"
 * TURSO_AUTH_TOKEN="your-token"
 */

import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// Get database mode from environment
const DATABASE_MODE = process.env.DATABASE_MODE || 'mysql';
const DATABASE_URL = process.env.DATABASE_URL!;
const PRISMA_ACCELERATE_URL = process.env.PRISMA_ACCELERATE_URL;

// =============================================================================
// INITIALIZE PRISMA CLIENT BASED ON DATABASE MODE
// =============================================================================

function initializePrisma() {
  console.log(`🗄️  Initializing Prisma with mode: ${DATABASE_MODE}`);

  switch (DATABASE_MODE.toLowerCase()) {
    // -------------------------------------------------------------------------
    // MODE 1: MYSQL (Primary - Self-Hosted or Cloud)
    // -------------------------------------------------------------------------
    case 'mysql':
      console.log('   → Using MySQL database');
      const mysqlClient = new PrismaClient({
        datasources: {
          db: {
            url: DATABASE_URL,
          },
        },
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });

      // Add Prisma Accelerate if URL provided
      if (PRISMA_ACCELERATE_URL) {
        console.log('   → Prisma Accelerate enabled');
        return mysqlClient.$extends(withAccelerate());
      }

      return mysqlClient;

    // -------------------------------------------------------------------------
    // MODE 2: PLANETSCALE / NEON / RAILWAY (Cloud)
    // -------------------------------------------------------------------------
    case 'planetscale':
    case 'neon':
    case 'railway':
      console.log(`   → Using ${DATABASE_MODE.toUpperCase()} cloud database`);
      const cloudClient = new PrismaClient({
        datasources: {
          db: {
            url: PRISMA_ACCELERATE_URL || DATABASE_URL,
          },
        },
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });

      // Prisma Accelerate recommended for cloud providers
      if (PRISMA_ACCELERATE_URL) {
        console.log('   → Prisma Accelerate enabled (recommended for production)');
        return cloudClient.$extends(withAccelerate());
      }

      return cloudClient;

    // -------------------------------------------------------------------------
    // FALLBACK: Default to MySQL
    // -------------------------------------------------------------------------
    default:
      console.warn(`⚠️  Unknown DATABASE_MODE: ${DATABASE_MODE}, falling back to MySQL`);
      return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
  }
}

// =============================================================================
// SINGLETON PATTERN (Prevent multiple instances in development)
// =============================================================================

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof initializePrisma> | undefined;
};

export const db = globalForPrisma.prisma ?? initializePrisma();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

// =============================================================================
// HEALTH CHECK UTILITY
// =============================================================================

export async function checkDatabaseConnection() {
  try {
    await db.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// =============================================================================
// GRACEFUL SHUTDOWN
// =============================================================================

// Note: Removed process.on('beforeExit') as it's not supported in Edge Runtime
// Database connections will be managed by connection pooling

export default db;
