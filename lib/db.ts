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
import { createClient } from '@libsql/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

// Get database mode from environment
const DATABASE_MODE = process.env.DATABASE_MODE || 'sqlite';
const DATABASE_URL = process.env.DATABASE_URL!;
const PRISMA_ACCELERATE_URL = process.env.PRISMA_ACCELERATE_URL;

// =============================================================================
// INITIALIZE PRISMA CLIENT BASED ON DATABASE MODE
// =============================================================================

function initializePrisma() {
  console.log(`🗄️  Initializing Prisma with mode: ${DATABASE_MODE}`);

  switch (DATABASE_MODE.toLowerCase()) {
    // -------------------------------------------------------------------------
    // MODE 1: LOCAL SQLITE (Development)
    // -------------------------------------------------------------------------
    case 'sqlite':
      console.log('   → Using local SQLite database');
      return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });

    // -------------------------------------------------------------------------
    // MODE 2: TURSO (Edge SQLite)
    // -------------------------------------------------------------------------
    case 'turso':
      console.log('   → Using Turso (libSQL) database');
      if (!process.env.TURSO_AUTH_TOKEN) {
        throw new Error('TURSO_AUTH_TOKEN is required when DATABASE_MODE=turso');
      }
      
      const libsql = createClient({
        url: DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      });

      const adapter = new PrismaLibSQL(libsql);

      return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });

    // -------------------------------------------------------------------------
    // MODE 3: MYSQL (Self-Hosted)
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
    // MODE 4: PLANETSCALE / NEON / RAILWAY (Cloud)
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
    // FALLBACK: Default to SQLite
    // -------------------------------------------------------------------------
    default:
      console.warn(`⚠️  Unknown DATABASE_MODE: ${DATABASE_MODE}, falling back to SQLite`);
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

if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await db.$disconnect();
  });
}

export default db;
