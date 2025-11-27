# 📖 SETUP GUIDE - DocuVerse SaaS

Complete step-by-step guide to get DocuVerse SaaS running on your machine in **under 10 minutes**.

---

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ **Node.js 20+** ([Download](https://nodejs.org/))
- ✅ **npm** or **yarn** or **pnpm**
- ✅ **Git** ([Download](https://git-scm.com/))
- ✅ **Code Editor** (VS Code recommended)

Optional (for production features):
- Stripe account (for billing)
- Typesense instance (for search)
- Resend account (for emails)
- Upstash account (for rate limiting)

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Clone & Install

```bash
# Clone the repository
git clone https://github.com/your-org/docuverse-saas.git
cd docuverse-saas

# Install dependencies
npm install
```

⏱️ **Time:** ~2 minutes (depending on internet speed)

---

### Step 2: Setup Environment

```bash
# Copy environment template
cp .env.example .env
```

**Edit `.env` file:**

```env
# Minimum required for local development:
DATABASE_MODE=sqlite
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-secret-here-generate-with-openssl"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Generate AUTH_SECRET:**

```bash
# On macOS/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Copy the output and paste it into `AUTH_SECRET` in `.env`

⏱️ **Time:** ~1 minute

---

### Step 3: Initialize Database

```bash
# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

You should see:
```
✅ Superadmin created: admin@docuverse.id
✅ Example user created: user@example.com
✅ Tenant created: Demo Company (demo)
✅ Database seeding completed successfully!
```

⏱️ **Time:** ~30 seconds

---

### Step 4: Start Development Server

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000) 🎉

⏱️ **Time:** ~10 seconds

---

## 🔐 Login Credentials

After seeding, you can login with:

### Super Admin
- URL: http://localhost:3000/auth/signin
- Email: `admin@docuverse.id`
- Password: `ChangeMeInProduction123!`
- Access: Full system access + tenant management

### Regular User
- URL: http://localhost:3000/auth/signin
- Email: `user@example.com`
- Password: `password123`
- Access: Demo tenant owner

### Demo Tenant
- URL: http://demo.localhost:3000
- Multi-tenant subdomain example

---

## 🗄️ Database Options

### Option 1: SQLite (Default - Easiest)

Perfect for local development. Works out of the box.

```env
DATABASE_MODE=sqlite
DATABASE_URL="file:./dev.db"
```

**Location:** `./prisma/dev.db`

**Pros:**
- Zero setup required
- File-based, easy to delete/recreate
- Fast for development

**Cons:**
- Not for production
- Limited concurrency

---

### Option 2: Turso (Recommended for Production)

Free tier available, edge SQLite, perfect for global deployment.

**1. Install Turso CLI:**

```bash
# macOS/Linux:
curl -sSfL https://get.tur.so/install.sh | bash

# Windows:
# Download from https://github.com/tursodatabase/turso-cli/releases
```

**2. Create Database:**

```bash
# Login
turso auth login

# Create database
turso db create docuverse-dev

# Get database URL
turso db show docuverse-dev

# Create auth token
turso db tokens create docuverse-dev
```

**3. Update `.env`:**

```env
DATABASE_MODE=turso
DATABASE_URL="libsql://docuverse-dev-xxx.turso.io"
TURSO_AUTH_TOKEN="eyJhbGc..."
```

**4. Push Schema:**

```bash
npm run db:push
npm run db:seed
```

---

### Option 3: MySQL (Local or Cloud)

**Local MySQL with Docker:**

```bash
docker run -d \
  --name docuverse-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=docuverse \
  -p 3306:3306 \
  mysql:8
```

**Update `.env`:**

```env
DATABASE_MODE=mysql
DATABASE_URL="mysql://root:root@localhost:3306/docuverse"
```

**Push Schema:**

```bash
npm run db:push
npm run db:seed
```

---

### Option 4: PlanetScale (Production MySQL)

**1. Create Account:** [planetscale.com](https://planetscale.com)

**2. Create Database:**
- Click "New database"
- Choose region
- Get connection string

**3. Update `.env`:**

```env
DATABASE_MODE=planetscale
DATABASE_URL="mysql://..."
```

---

## 🔧 Advanced Configuration

### Stripe Billing (Optional for Development)

**1. Create Stripe Account:** [stripe.com](https://stripe.com)

**2. Get Test API Keys:**
- Dashboard → Developers → API Keys
- Copy Publishable key and Secret key

**3. Create Products:**
- Dashboard → Products → Create product
  - **Pro Plan:** $9/month → Get Price ID
  - **Team Plan:** $29/month → Get Price ID

**4. Update `.env`:**

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PRICE_ID_PRO="price_..."
STRIPE_PRICE_ID_TEAM="price_..."
```

**5. Setup Webhook (for local testing):**

```bash
# Install Stripe CLI
# Download from: https://stripe.com/docs/stripe-cli

# Login
stripe login

# Listen for webhooks
npm run stripe:listen
```

Copy webhook secret to `.env`:
```env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

### Typesense Search (Optional)

**Option A: Docker (Local)**

```bash
docker run -d \
  -p 8108:8108 \
  -v $(pwd)/typesense-data:/data \
  -e TYPESENSE_DATA_DIR=/data \
  -e TYPESENSE_API_KEY=xyz \
  typesense/typesense:26.0
```

**Option B: Typesense Cloud**

Visit [cloud.typesense.org](https://cloud.typesense.org) and create cluster.

**Update `.env`:**

```env
TYPESENSE_HOST="localhost"  # or your-cluster.a1.typesense.net
TYPESENSE_PORT="8108"       # or 443 for cloud
TYPESENSE_PROTOCOL="http"   # or https for cloud
TYPESENSE_API_KEY="xyz"
NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY="xyz"
```

---

### Email with Resend (Optional)

**1. Create Account:** [resend.com](https://resend.com)

**2. Get API Key:**
- Dashboard → API Keys → Create

**3. Add Domain (for production):**
- Dashboard → Domains → Add Domain
- Verify DNS records

**4. Update `.env`:**

```env
RESEND_API_KEY="re_..."
EMAIL_FROM="DocuVerse <noreply@yourdomain.com>"
```

---

### Rate Limiting with Upstash (Optional)

**1. Create Account:** [upstash.com](https://upstash.com)

**2. Create Redis Database:**
- Choose region
- Get REST URL and Token

**3. Update `.env`:**

```env
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="..."
```

---

### OAuth Providers (Optional)

#### GitHub OAuth

**1. Create OAuth App:**
- GitHub → Settings → Developer settings → OAuth Apps → New
- Application name: DocuVerse Dev
- Homepage URL: http://localhost:3000
- Callback URL: http://localhost:3000/api/auth/callback/github

**2. Update `.env`:**

```env
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

#### Google OAuth

**1. Create OAuth Client:**
- Google Cloud Console → APIs & Services → Credentials
- Create OAuth 2.0 Client ID
- Authorized redirect URI: http://localhost:3000/api/auth/callback/google

**2. Update `.env`:**

```env
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

---

## ✅ Verification Steps

### 1. Check Database Connection

```bash
npm run db:check
```

Expected output:
```
✅ Database connection successful
📈 Database Statistics:
   Users: 2
   Tenants: 1
✅ Database setup is working correctly!
```

---

### 2. Validate Environment

```bash
npm run validate:env
```

This checks all required environment variables.

---

### 3. Test Application

1. **Homepage:** http://localhost:3000
   - Should load landing page

2. **Sign In:** http://localhost:3000/auth/signin
   - Login with test credentials

3. **Super Admin:** http://localhost:3000/saas-admin
   - Requires superadmin login

4. **Subdomain:** http://demo.localhost:3000
   - Should load demo tenant

---

## 🐛 Troubleshooting

### Issue: Database connection failed

**Solution:**
```bash
# Delete existing database
rm prisma/dev.db

# Recreate
npm run db:push
npm run db:seed
```

---

### Issue: Port 3000 already in use

**Solution:**
```bash
# Use different port
PORT=3001 npm run dev
```

Or kill existing process:
```bash
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Windows (PowerShell):
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

---

### Issue: Module not found

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

---

### Issue: Subdomain not working locally

**Solution:**

On **macOS/Linux**, edit `/etc/hosts`:
```
127.0.0.1 demo.localhost
127.0.0.1 test.localhost
```

On **Windows**, edit `C:\Windows\System32\drivers\etc\hosts`:
```
127.0.0.1 demo.localhost
127.0.0.1 test.localhost
```

---

## 📚 Next Steps

Now that you're set up:

1. **Explore the Code:**
   - `app/` - Next.js pages
   - `lib/` - Core utilities
   - `components/` - UI components
   - `prisma/` - Database schema

2. **Read Documentation:**
   - [README.md](README.md) - Project overview
   - [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment
   - [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guide

3. **Customize:**
   - Update branding in `app/layout.tsx`
   - Modify pricing plans in `lib/stripe.ts`
   - Add new features!

4. **Deploy:**
   - Follow [DEPLOYMENT.md](DEPLOYMENT.md) for production setup

---

## 🆘 Need Help?

- 📧 Email: support@docuverse.id
- 💬 Discord: [discord.gg/docuverse](https://discord.gg/docuverse)
- 📚 Docs: [docs.docuverse.id](https://docs.docuverse.id)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/docuverse-saas/issues)

---

**Happy Building! 🚀**
