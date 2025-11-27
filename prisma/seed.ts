/**
 * DATABASE SEED SCRIPT
 * Creates superadmin user and example tenant with sample data
 * 
 * Run: npm run db:seed
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Get superadmin credentials from .env
  const superadminEmail = process.env.SUPERADMIN_EMAIL || 'admin@docuverse.id';
  const superadminPassword = process.env.SUPERADMIN_PASSWORD || 'ChangeMeInProduction123!';
  const superadminName = process.env.SUPERADMIN_NAME || 'Super Admin';

  // =============================================================================
  // 1. CREATE SUPERADMIN USER
  // =============================================================================
  console.log('👤 Creating superadmin user...');
  
  const hashedPassword = await hash(superadminPassword, 12);

  const superadmin = await prisma.user.upsert({
    where: { email: superadminEmail },
    update: {},
    create: {
      email: superadminEmail,
      name: superadminName,
      password: hashedPassword,
      role: 'SUPERADMIN',
      emailVerified: new Date(),
    },
  });

  console.log(`   ✅ Superadmin created: ${superadmin.email}`);
  console.log(`   🔑 Password: ${superadminPassword}\n`);

  // =============================================================================
  // 2. CREATE EXAMPLE USER
  // =============================================================================
  console.log('👤 Creating example user...');

  const exampleUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'John Doe',
      password: await hash('password123', 12),
      role: 'USER',
      emailVerified: new Date(),
    },
  });

  console.log(`   ✅ Example user created: ${exampleUser.email}\n`);

  // =============================================================================
  // 3. CREATE EXAMPLE TENANT (DEMO COMPANY)
  // =============================================================================
  console.log('🏢 Creating example tenant...');

  const exampleTenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'Demo Company',
      slug: 'demo',
      ownerId: exampleUser.id,
      plan: 'PRO',
      subscriptionStatus: 'TRIALING',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
    },
  });

  console.log(`   ✅ Tenant created: ${exampleTenant.name} (${exampleTenant.slug})`);
  console.log(`   🌐 Access at: http://demo.localhost:3000\n`);

  // =============================================================================
  // 4. CREATE TENANT SETTINGS
  // =============================================================================
  console.log('⚙️  Creating tenant settings...');

  await prisma.tenantSettings.upsert({
    where: { tenantId: exampleTenant.id },
    update: {},
    create: {
      tenantId: exampleTenant.id,
      primaryColor: '#3b82f6',
      accentColor: '#06b6d4',
      allowPublicDocs: true,
      enableSearch: true,
      enableAnalytics: true,
      enableVersioning: true,
    },
  });

  console.log('   ✅ Tenant settings created\n');

  // =============================================================================
  // 5. ADD TENANT MEMBERS
  // =============================================================================
  console.log('👥 Adding tenant members...');

  await prisma.tenantMember.upsert({
    where: {
      tenantId_userId: {
        tenantId: exampleTenant.id,
        userId: exampleUser.id,
      },
    },
    update: {},
    create: {
      tenantId: exampleTenant.id,
      userId: exampleUser.id,
      role: 'OWNER',
    },
  });

  // Add superadmin as admin member
  await prisma.tenantMember.upsert({
    where: {
      tenantId_userId: {
        tenantId: exampleTenant.id,
        userId: superadmin.id,
      },
    },
    update: {},
    create: {
      tenantId: exampleTenant.id,
      userId: superadmin.id,
      role: 'ADMIN',
    },
  });

  console.log('   ✅ Members added\n');

  // =============================================================================
  // 6. CREATE EXAMPLE PROJECT
  // =============================================================================
  console.log('📚 Creating example project...');

  const project = await prisma.project.upsert({
    where: {
      tenantId_slug: {
        tenantId: exampleTenant.id,
        slug: 'getting-started',
      },
    },
    update: {},
    create: {
      tenantId: exampleTenant.id,
      name: 'Getting Started',
      slug: 'getting-started',
      description: 'Learn how to use DocuVerse SaaS',
      isPublic: true,
      order: 0,
    },
  });

  console.log(`   ✅ Project created: ${project.name}\n`);

  // =============================================================================
  // 7. CREATE VERSIONS
  // =============================================================================
  console.log('📦 Creating versions...');

  const version1 = await prisma.version.upsert({
    where: {
      projectId_slug: {
        projectId: project.id,
        slug: 'v1',
      },
    },
    update: {},
    create: {
      projectId: project.id,
      name: 'v1.0',
      slug: 'v1',
      isDefault: true,
      isPublished: true,
      order: 0,
    },
  });

  console.log(`   ✅ Version created: ${version1.name}\n`);

  // =============================================================================
  // 8. CREATE SAMPLE DOCUMENTS
  // =============================================================================
  console.log('📄 Creating sample documents...');

  const documents = [
    {
      title: 'Introduction',
      slug: 'introduction',
      content: `# Introduction

Welcome to **DocuVerse SaaS** — the most beautiful, fastest, and developer-friendly documentation platform.

## Features

- 🚀 **Multi-tenant SaaS** with subdomain routing
- 🎨 **Beautiful UI** with glassmorphism effects
- ⚡ **Instant search** powered by Typesense
- 🌍 **Multi-language** support (English & Indonesian)
- 📱 **Responsive** on all devices
- 🔐 **Secure** with NextAuth.js v5

## Quick Start

Get started in just 5 minutes:

\`\`\`bash
npm install
npm run db:push
npm run db:seed
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000) to see your docs live!`,
      category: 'Getting Started',
      order: 0,
    },
    {
      title: 'Installation',
      slug: 'installation',
      content: `# Installation

Follow these steps to install DocuVerse SaaS on your machine.

## Prerequisites

- Node.js 20+
- npm or yarn
- Database (SQLite, MySQL, or PostgreSQL)

## Installation Steps

### 1. Clone the repository

\`\`\`bash
git clone https://github.com/your-org/docuverse-saas.git
cd docuverse-saas
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Setup environment

\`\`\`bash
cp .env.example .env
\`\`\`

Edit \`.env\` and configure your database.

### 4. Initialize database

\`\`\`bash
npm run db:push
npm run db:seed
\`\`\`

### 5. Start development server

\`\`\`bash
npm run dev
\`\`\`

Your app is now running at [http://localhost:3000](http://localhost:3000)! 🎉`,
      category: 'Getting Started',
      order: 1,
    },
    {
      title: 'Configuration',
      slug: 'configuration',
      content: `# Configuration

Learn how to configure DocuVerse SaaS for your needs.

## Database Configuration

DocuVerse supports 4 database modes:

### SQLite (Development)

\`\`\`env
DATABASE_MODE=sqlite
DATABASE_URL="file:./dev.db"
\`\`\`

### Turso (Production - Recommended)

\`\`\`env
DATABASE_MODE=turso
DATABASE_URL="libsql://your-db.turso.io"
TURSO_AUTH_TOKEN="your-token"
\`\`\`

### MySQL (Self-Hosted)

\`\`\`env
DATABASE_MODE=mysql
DATABASE_URL="mysql://user:pass@localhost:3306/db"
\`\`\`

### PlanetScale (Cloud)

\`\`\`env
DATABASE_MODE=planetscale
DATABASE_URL="mysql://your-connection-string"
\`\`\`

## Environment Variables

See \`.env.example\` for all available configuration options.`,
      category: 'Configuration',
      order: 2,
    },
  ];

  for (const doc of documents) {
    await prisma.document.upsert({
      where: {
        versionId_slug_locale: {
          versionId: version1.id,
          slug: doc.slug,
          locale: 'en',
        },
      },
      update: {},
      create: {
        versionId: version1.id,
        title: doc.title,
        slug: doc.slug,
        content: doc.content,
        locale: 'en',
        category: doc.category,
        order: doc.order,
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    console.log(`   ✅ Document created: ${doc.title}`);
  }

  console.log('\n🎉 Database seeding completed successfully!\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('LOGIN CREDENTIALS:');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Superadmin: ${superadminEmail}`);
  console.log(`Password:   ${superadminPassword}`);
  console.log('───────────────────────────────────────────────────────────');
  console.log(`User:       ${exampleUser.email}`);
  console.log(`Password:   password123`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n🌐 Access the app:');
  console.log(`   Super Admin: http://localhost:3000/saas-admin`);
  console.log(`   Demo Tenant: http://demo.localhost:3000`);
  console.log('═══════════════════════════════════════════════════════════\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
