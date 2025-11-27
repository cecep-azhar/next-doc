# 🚀 DEPLOYMENT GUIDE

This guide covers deploying DocuVerse SaaS to production with different database and hosting options.

## 📋 Pre-Deployment Checklist

- [ ] Set up production database (Turso/PlanetScale/MySQL)
- [ ] Configure Stripe account and get API keys
- [ ] Set up Typesense instance (cloud or self-hosted)
- [ ] Configure email service (Resend)
- [ ] Set up Redis for rate limiting (Upstash)
- [ ] Configure OAuth providers (GitHub, Google)
- [ ] Generate secure `AUTH_SECRET`
- [ ] Configure custom domain DNS

## 🌐 Deployment Options

### Option 1: Vercel + Turso (Recommended)

Best for: Global edge deployment with SQLite at the edge

**1. Setup Turso Database**

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Create production database
turso db create docuverse-prod --location lhr

# Get database URL
turso db show docuverse-prod

# Create auth token
turso db tokens create docuverse-prod
```

**2. Deploy to Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**3. Configure Environment Variables in Vercel**

Go to Vercel Dashboard → Project Settings → Environment Variables:

```env
# Database
DATABASE_MODE=turso
DATABASE_URL=libsql://docuverse-prod-xxx.turso.io
TURSO_AUTH_TOKEN=eyJhbGc...

# Auth
AUTH_SECRET=generate-with-openssl-rand-base64-32
AUTH_URL=https://your-domain.com
AUTH_TRUST_HOST=true

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_PRICE_ID_PRO=price_xxx
STRIPE_PRICE_ID_TEAM=price_xxx

# Typesense
TYPESENSE_HOST=your-typesense-host.com
TYPESENSE_PORT=443
TYPESENSE_PROTOCOL=https
TYPESENSE_API_KEY=xxx
NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY=xxx

# Email
RESEND_API_KEY=re_xxx
EMAIL_FROM="DocuVerse <noreply@yourdomain.com>"

# Rate Limiting
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME="DocuVerse SaaS"
```

**4. Configure Webhook Endpoints**

Stripe Dashboard → Webhooks → Add endpoint:
- URL: `https://your-domain.com/api/webhook/stripe`
- Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`

**5. Run Database Migration**

```bash
# From your local machine (connected to Turso)
npm run db:push
npm run db:seed
```

---

### Option 2: Vercel + PlanetScale

Best for: MySQL with branching and zero-downtime schema changes

**1. Setup PlanetScale**

```bash
# Install PlanetScale CLI
brew install planetscale/tap/pscale

# Login
pscale auth login

# Create database
pscale database create docuverse-prod --region us-east

# Create branch
pscale branch create docuverse-prod main

# Get connection string
pscale connect docuverse-prod main
```

**2. Configure Prisma Accelerate**

Visit: https://console.prisma.io/
- Create new project
- Connect to PlanetScale
- Get Accelerate connection string

**3. Environment Variables**

```env
DATABASE_MODE=planetscale
DATABASE_URL=mysql://user:pass@aws.connect.psdb.cloud/docuverse?sslaccept=strict
PRISMA_ACCELERATE_URL=prisma://accelerate.prisma-data.net/?api_key=xxx
```

**4. Deploy Schema**

```bash
npx prisma migrate dev
npx prisma generate
```

---

### Option 3: CloudPanel + MySQL + Vercel

Best for: Self-hosted MySQL with CloudPanel

**1. Setup CloudPanel Server**

- Install CloudPanel on your VPS
- Create MySQL database in CloudPanel
- Create database user with full privileges

**2. Configure Firewall**

```bash
# Allow MySQL connections
ufw allow 3306/tcp

# Or restrict to Vercel IPs (recommended)
# Get Vercel IPs from: https://vercel.com/docs/concepts/functions/serverless-functions/regions
```

**3. Environment Variables**

```env
DATABASE_MODE=mysql
DATABASE_URL="mysql://user:password@your-server-ip:3306/docuverse"
```

**4. Secure Connection**

Recommended: Use SSH tunnel or SSL connection

```env
DATABASE_URL="mysql://user:password@your-server-ip:3306/docuverse?ssl=true"
```

---

### Option 4: Railway (All-in-One)

Best for: Quick deployment with managed services

**1. Create Railway Project**

Visit: https://railway.app
- Create new project
- Add MySQL database
- Deploy from GitHub

**2. Environment Variables**

Railway will auto-fill `DATABASE_URL`. Add others:

```env
DATABASE_MODE=mysql
# DATABASE_URL automatically set by Railway
AUTH_SECRET=xxx
# ... other variables
```

**3. Custom Domain**

Railway → Settings → Domains → Add custom domain

---

## 🗄️ Typesense Deployment

### Option A: Typesense Cloud (Easiest)

Visit: https://cloud.typesense.org
- Create cluster
- Get API keys
- Configure in environment variables

### Option B: Self-Hosted with Docker

```bash
# On your server
docker run -d \
  -p 8108:8108 \
  -v /data/typesense:/data \
  -e TYPESENSE_DATA_DIR=/data \
  -e TYPESENSE_API_KEY=your-secret-key \
  typesense/typesense:26.0
```

### Option C: Railway Typesense

Use Railway template:
https://railway.app/template/typesense

---

## 📧 Email Configuration

### Setup Resend

1. Visit: https://resend.com
2. Add your domain
3. Verify DNS records
4. Get API key
5. Configure in `.env`:

```env
RESEND_API_KEY=re_xxx
EMAIL_FROM="DocuVerse <noreply@yourdomain.com>"
```

---

## 🔐 OAuth Providers

### GitHub OAuth

1. GitHub → Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Callback URL: `https://your-domain.com/api/auth/callback/github`
4. Get Client ID and Secret

### Google OAuth

1. Google Cloud Console → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID
3. Authorized redirect URI: `https://your-domain.com/api/auth/callback/google`
4. Get Client ID and Secret

---

## 🌍 Custom Domain & Subdomain Setup

### Main Domain DNS (for docuverse.com)

```
Type: A
Name: @
Value: 76.76.21.21 (Vercel IP)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Wildcard Subdomain (for *.docuverse.com)

```
Type: CNAME
Name: *
Value: cname.vercel-dns.com
```

### Tenant Custom Domains

For tenant custom domains (e.g., docs.company.com):

1. Tenant adds CNAME pointing to your main domain
2. Add domain in Vercel dashboard
3. Verify ownership
4. SSL certificate auto-provisioned

---

## 🚀 Post-Deployment Steps

### 1. Initialize Database

```bash
# Connect to production database
DATABASE_URL="your-prod-url" npm run db:push
DATABASE_URL="your-prod-url" npm run db:seed
```

### 2. Initialize Typesense

```bash
# Run from your local machine (pointing to prod Typesense)
node scripts/init-typesense.js
```

### 3. Create Super Admin

Login with credentials from seed script:
- Email: `admin@docuverse.id`
- Password: (from `.env`)

**IMPORTANT:** Change password immediately!

### 4. Configure Stripe Webhooks

Test webhook:
```bash
stripe listen --forward-to https://your-domain.com/api/webhook/stripe
```

### 5. Test Multi-Tenancy

1. Create test tenant
2. Visit: `https://test-tenant.your-domain.com`
3. Verify subdomain routing works

### 6. Performance Testing

- Run Lighthouse audit (target: 100/100)
- Test page load times
- Verify edge caching
- Check Typesense search speed

---

## 📊 Monitoring & Analytics

### Setup Vercel Analytics

```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Setup Error Monitoring (Sentry)

```bash
npm install @sentry/nextjs
```

Initialize:
```bash
npx @sentry/wizard@latest -i nextjs
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

## 🛡️ Security Hardening

### 1. Environment Variables

✅ Never commit `.env` to Git
✅ Use different secrets for dev/prod
✅ Rotate secrets regularly

### 2. Rate Limiting

Enabled by default via Upstash Redis

### 3. CORS Configuration

Update `next.config.js` if needed:

```js
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
      ],
    },
  ];
}
```

### 4. Database Security

- Use read-only replicas for analytics
- Enable connection pooling (Prisma Accelerate)
- Regular backups
- Monitor slow queries

---

## 🐛 Troubleshooting

### Issue: Subdomain routing not working

**Solution:**
- Verify wildcard DNS is configured
- Check Vercel domain settings
- Clear DNS cache: `ipconfig /flushdns` (Windows) or `sudo killall -HUP mDNSResponder` (Mac)

### Issue: Database connection timeout

**Solution:**
- Check firewall rules
- Verify connection string
- Use Prisma Accelerate for connection pooling
- Increase timeout in `lib/db.ts`

### Issue: Stripe webhooks failing

**Solution:**
- Verify webhook secret matches
- Check endpoint URL is correct
- Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhook/stripe`
- Check Vercel function logs

### Issue: Search not working

**Solution:**
- Verify Typesense is running
- Check API key is correct
- Re-index documents: `npm run index-documents`
- Check Typesense logs

---

## 📞 Support

Need help with deployment?
- 📧 Email: support@docuverse.id
- 💬 Discord: [Join our community](https://discord.gg/docuverse)
- 📚 Docs: [docs.docuverse.id](https://docs.docuverse.id)

---

**Happy Deploying! 🚀**
