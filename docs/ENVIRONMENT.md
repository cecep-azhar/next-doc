# Environment Variables Guide

## 📋 File Environment

Project ini menggunakan 3 file environment:

- **`.env`** - Base environment (committed to git)
- **`.env.local`** - Development local (tidak di-commit)
- **`.env.production`** - Production (tidak di-commit)

## 🚀 Quick Start

### 1. Copy File Environment

```bash
# Copy untuk development
cp .env.local.example .env.local

# Copy untuk production  
cp .env.production.example .env.production
```

### 2. Edit .env.local

Sesuaikan dengan konfigurasi MySQL local Anda:

```env
DATABASE_MODE=mysql
DATABASE_URL="mysql://root:@localhost:3306/next_doc"
```

### 3. Generate Auth Secret

```bash
# Generate secure random string
openssl rand -base64 32
```

Copy hasilnya ke `AUTH_SECRET` di `.env.local`

## 📝 Environment Variables Detail

### 🗄️ Database Configuration

```env
# Mode: mysql | planetscale | neon | railway
DATABASE_MODE=mysql

# MySQL Connection String
# Format: mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="mysql://root:password@localhost:3306/next_doc"
```

**Contoh berbagai provider:**

```env
# Local MySQL
DATABASE_URL="mysql://root:@localhost:3306/next_doc"

# Railway
DATABASE_URL="mysql://root:xxxxx@containers-us-west-xxx.railway.app:3306/railway"

# PlanetScale
DATABASE_URL="mysql://xxxxx@aws.connect.psdb.cloud/database?sslaccept=strict"

# Digital Ocean
DATABASE_URL="mysql://user:pass@db-mysql-sgp1-xxxxx.db.ondigitalocean.com:25060/db?ssl-mode=REQUIRED"
```

### 🔐 Authentication (NextAuth.js)

```env
# Generate dengan: openssl rand -base64 32
AUTH_SECRET="your-32-character-secret-here"

# URL aplikasi Anda
AUTH_URL="http://localhost:3000"  # Development
AUTH_URL="https://yourdomain.com"  # Production

AUTH_TRUST_HOST=true
```

### 🔑 OAuth Providers (Optional)

#### GitHub OAuth
1. Buka: https://github.com/settings/developers
2. New OAuth App
3. Copy Client ID dan Secret

```env
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_secret"
```

#### Google OAuth
1. Buka: https://console.cloud.google.com
2. Create OAuth 2.0 Client
3. Copy Client ID dan Secret

```env
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_secret"
```

### 💳 Stripe Billing

1. Sign up di: https://stripe.com
2. Get API keys dari Dashboard

**Development (Test Mode):**
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxx"
STRIPE_SECRET_KEY="sk_test_xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"
```

**Production (Live Mode):**
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_xxxxx"
STRIPE_SECRET_KEY="sk_live_xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"
```

**Price IDs:**
```env
STRIPE_PRICE_ID_FREE=""
STRIPE_PRICE_ID_PRO="price_xxxxx"
STRIPE_PRICE_ID_TEAM="price_xxxxx"
```

### 🔍 Typesense Search

#### Option A: Docker Local
```bash
docker run -p 8108:8108 -v/tmp/data:/data typesense/typesense:26.0 \
  --data-dir /data --api-key=xyz
```

```env
TYPESENSE_HOST="localhost"
TYPESENSE_PORT="8108"
TYPESENSE_PROTOCOL="http"
TYPESENSE_API_KEY="xyz"
NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY="xyz"
```

#### Option B: Typesense Cloud
1. Sign up di: https://cloud.typesense.org
2. Create cluster
3. Copy credentials

```env
TYPESENSE_HOST="xxx.a1.typesense.net"
TYPESENSE_PORT="443"
TYPESENSE_PROTOCOL="https"
TYPESENSE_API_KEY="admin_api_key"
NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY="search_only_key"
```

### 📧 Email (Resend)

1. Sign up di: https://resend.com
2. Get API key

```env
RESEND_API_KEY="re_xxxxxxxxxxxxx"
EMAIL_FROM="YourApp <noreply@yourdomain.com>"
```

### 📁 File Uploads (UploadThing)

1. Sign up di: https://uploadthing.com
2. Create app
3. Copy credentials

```env
UPLOADTHING_SECRET="sk_live_xxxxxxxxxxxxx"
UPLOADTHING_APP_ID="your_app_id"
```

### ⚡ Rate Limiting (Upstash Redis)

1. Sign up di: https://upstash.com
2. Create Redis database
3. Copy REST URL and Token

```env
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_token_here"
```

### 🌐 App Configuration

```env
# Public URL (tanpa trailing slash)
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # Development
NEXT_PUBLIC_APP_URL="https://yourdomain.com"  # Production

# App Info
NEXT_PUBLIC_APP_NAME="DocuVerse SaaS"
NEXT_PUBLIC_SUPPORT_EMAIL="support@yourdomain.com"
NEXT_PUBLIC_DEFAULT_LOCALE="en"
```

### 👤 Super Admin

```env
SUPERADMIN_EMAIL="admin@yourdomain.com"
SUPERADMIN_PASSWORD="change-me-to-strong-password"
SUPERADMIN_NAME="Super Admin"
```

⚠️ **IMPORTANT:** Ganti password ini setelah first login!

## 🔒 Security Best Practices

### ✅ DO:
- Generate `AUTH_SECRET` dengan `openssl rand -base64 32`
- Gunakan password yang kuat untuk `SUPERADMIN_PASSWORD`
- Jangan commit `.env.local` dan `.env.production`
- Gunakan environment variables di hosting (Vercel, Railway, dll)
- Enable SSL/HTTPS untuk production
- Rotate secrets secara berkala

### ❌ DON'T:
- Jangan hardcode secrets di code
- Jangan commit file dengan credentials
- Jangan share `.env` files
- Jangan gunakan default passwords
- Jangan expose admin credentials

## 📦 Deployment

### Vercel
1. Push code ke GitHub
2. Import project di Vercel
3. Add environment variables di Settings → Environment Variables
4. Deploy

### Railway
1. Connect GitHub repo
2. Add environment variables
3. Deploy
4. Connect MySQL service

### VPS / Docker
1. Copy `.env.production` ke server
2. Set environment variables
3. Run: `docker-compose up -d`

## 🧪 Testing

### Test Database Connection
```bash
pnpm prisma studio
```

### Test Stripe Webhooks
```bash
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

### Test Email
```bash
# Send test email via Resend
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json"
```

## 📚 Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
- [Prisma Connection URLs](https://www.prisma.io/docs/reference/database-reference/connection-urls)
- [Stripe API Keys](https://stripe.com/docs/keys)
- [Typesense Cloud](https://cloud.typesense.org/docs)

## ❓ Need Help?

Baca dokumentasi lengkap:
- `docs/SETUP_MYSQL.md` - Setup database
- `DEPLOYMENT.md` - Deployment guide
- `CONTRIBUTING.md` - Development guide

---

**Happy Coding! 🚀**
