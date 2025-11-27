/**
 * DATABASE SETUP HELPER
 * 
 * Run this after changing DATABASE_MODE to verify configuration
 */

import { db, checkDatabaseConnection } from './lib/db';

async function main() {
  console.log('🔍 Checking database configuration...\n');
  
  const mode = process.env.DATABASE_MODE || 'sqlite';
  console.log(`📊 Database Mode: ${mode.toUpperCase()}`);
  console.log(`🔗 Database URL: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@')}\n`);
  
  // Test connection
  const connected = await checkDatabaseConnection();
  
  if (!connected) {
    console.error('❌ Failed to connect to database');
    console.error('\nPlease check your .env configuration:');
    console.error('1. Verify DATABASE_MODE is correct');
    console.error('2. Verify DATABASE_URL is valid');
    console.error('3. For Turso: check TURSO_AUTH_TOKEN');
    console.error('4. For cloud DBs: check network access\n');
    process.exit(1);
  }
  
  // Test query
  try {
    const userCount = await db.user.count();
    const tenantCount = await db.tenant.count();
    
    console.log('\n📈 Database Statistics:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Tenants: ${tenantCount}`);
    
    if (userCount === 0) {
      console.log('\n💡 Tip: Run "npm run db:seed" to populate sample data');
    }
    
    console.log('\n✅ Database setup is working correctly!\n');
  } catch (error) {
    console.error('❌ Error querying database:', error);
    console.error('\nYou may need to push the schema:');
    console.error('   npm run db:push\n');
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
