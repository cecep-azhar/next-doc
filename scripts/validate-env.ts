/**
 * PRODUCTION ENVIRONMENT VALIDATOR
 * 
 * Validates all required environment variables before deployment
 */

const requiredVars = {
  critical: [
    'DATABASE_MODE',
    'DATABASE_URL',
    'AUTH_SECRET',
    'NEXT_PUBLIC_APP_URL',
  ],
  stripe: [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  ],
  optional: [
    'TYPESENSE_HOST',
    'TYPESENSE_API_KEY',
    'RESEND_API_KEY',
    'UPSTASH_REDIS_REST_URL',
    'GITHUB_CLIENT_ID',
    'GOOGLE_CLIENT_ID',
  ],
};

function checkEnvVar(name: string, required: boolean = true): boolean {
  const value = process.env[name];
  const exists = !!value && value !== '';
  
  if (required && !exists) {
    console.error(`❌ Missing required variable: ${name}`);
    return false;
  } else if (!required && !exists) {
    console.warn(`⚠️  Optional variable not set: ${name}`);
    return true;
  } else {
    console.log(`✅ ${name}: ${value.substring(0, 20)}...`);
    return true;
  }
}

function validateDatabaseConfig(): boolean {
  const mode = process.env.DATABASE_MODE;
  
  if (!mode) {
    console.error('❌ DATABASE_MODE not set');
    return false;
  }
  
  console.log(`\n📊 Validating database mode: ${mode}\n`);
  
  switch (mode.toLowerCase()) {
    case 'turso':
      if (!process.env.TURSO_AUTH_TOKEN) {
        console.error('❌ TURSO_AUTH_TOKEN required for Turso mode');
        return false;
      }
      break;
    
    case 'planetscale':
    case 'neon':
      if (process.env.PRISMA_ACCELERATE_URL) {
        console.log('✅ Prisma Accelerate enabled (recommended)');
      } else {
        console.warn('⚠️  Consider enabling Prisma Accelerate for better performance');
      }
      break;
  }
  
  return true;
}

function validateAuthSecret(): boolean {
  const secret = process.env.AUTH_SECRET;
  
  if (!secret) {
    console.error('❌ AUTH_SECRET not set');
    console.error('   Generate with: openssl rand -base64 32');
    return false;
  }
  
  if (secret.length < 32) {
    console.error('❌ AUTH_SECRET too short (minimum 32 characters)');
    return false;
  }
  
  if (secret === 'change-me-in-production') {
    console.error('❌ AUTH_SECRET must be changed from default');
    return false;
  }
  
  return true;
}

function main() {
  console.log('🔍 Validating Production Environment Variables\n');
  console.log('═'.repeat(60));
  
  let allValid = true;
  
  // Check critical vars
  console.log('\n📌 Critical Variables:\n');
  for (const varName of requiredVars.critical) {
    if (!checkEnvVar(varName, true)) {
      allValid = false;
    }
  }
  
  // Check Stripe vars
  console.log('\n💳 Stripe Variables:\n');
  for (const varName of requiredVars.stripe) {
    if (!checkEnvVar(varName, true)) {
      allValid = false;
    }
  }
  
  // Check optional vars
  console.log('\n⭐ Optional Variables:\n');
  for (const varName of requiredVars.optional) {
    checkEnvVar(varName, false);
  }
  
  // Validate database config
  if (!validateDatabaseConfig()) {
    allValid = false;
  }
  
  // Validate auth secret
  console.log('\n🔐 Security Checks:\n');
  if (!validateAuthSecret()) {
    allValid = false;
  }
  
  // Check NODE_ENV
  if (process.env.NODE_ENV !== 'production') {
    console.warn('\n⚠️  NODE_ENV is not set to "production"');
  }
  
  console.log('\n' + '═'.repeat(60));
  
  if (allValid) {
    console.log('\n✅ All validations passed! Ready for deployment.\n');
    process.exit(0);
  } else {
    console.error('\n❌ Validation failed. Please fix the errors above.\n');
    console.error('💡 Tip: Copy .env.example and fill in all required values.\n');
    process.exit(1);
  }
}

main();
