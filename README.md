# 🚀 DocuVerse SaaS

The most beautiful, fastest, and developer-friendly **multi-tenant SaaS documentation platform** built with the latest 2025-2026 stack.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Prisma](https://img.shields.io/badge/Prisma-5.20-brightgreen)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🏢 Multi-Tenant SaaS
- **Subdomain routing** (`app1.docuverse.id`) with path fallback
- **Custom domain support** per tenant
- **Super Admin dashboard** for managing all tenants
- **Role-based access control** (Owner, Admin, Member, Viewer)
- **Tenant isolation** with complete data security

### 💳 Billing & Subscriptions
- **Stripe integration** with 3 plans: Free, Pro ($9), Team ($29)
- **14-day free trial** for all plans
- **Customer portal** for self-service subscription management
- **Webhook handling** for real-time subscription updates
- **Usage-based limits** and feature gating

### 📚 Documentation System
- **Multi-product** + **multi-version** documentation per tenant
- **Bilingual support** (English & Indonesian) with next-intl
- **MDX v3** for rich content with code highlighting
- **Glassmorphism UI** with beautiful sidebar navigation
- **Version switching** and project management
- **Private/Public** documentation support

### 🔍 Instant Search
- **Typesense integration** for typo-tolerant search
- **Tenant-scoped** search with blazing fast results
- **Keyboard shortcuts** (Cmd+K for search, / for sidebar focus)
- **Search analytics** and insights

### 🎨 Beautiful UI
- **Glassmorphism effects** throughout the interface
- **Dark/Light mode** with system preference support
- **Responsive design** optimized for all devices
- **Framer Motion** animations
- **shadcn/ui** + Radix UI components
- **Tailwind CSS** for styling

### 🔐 Authentication & Security
- **NextAuth.js v5** with Prisma adapter
- **Multiple providers** (Credentials, GitHub, Google)
- **Rate limiting** with Upstash Redis
- **Security headers** (CSP, HSTS, etc.)
- **Audit logging** for all actions

### 🌐 Multi-Database Support

**4 database modes** — switch in 1 line of `.env`:

1. **SQLite** (Development) — Local file database
2. **Turso** (Production) — Edge SQLite recommended for prod
3. **MySQL** (Self-Hosted) — CloudPanel, Railway, or local
4. **PlanetScale/Neon** (Cloud) — Managed database services

See `.env.example` for configuration details.

## 🛠️ Tech Stack

### Core
- **Next.js 16** (App Router + React 19 + Partial Prerendering)
- **TypeScript 5.6+**
- **Prisma ORM 5.20+** with multi-database support

### UI & Styling
- **Tailwind CSS** + **PostCSS**
- **shadcn/ui** + **Radix UI** components
- **lucide-react** icons
- **next-themes** for dark mode
- **Framer Motion** for animations

### Database & Backend
- **Prisma** (SQLite, Turso, MySQL, PostgreSQL)
- **@libsql/client** for Turso support
- **@prisma/extension-accelerate** for connection pooling

### Authentication & Authorization
- **NextAuth.js v5**
- **@auth/prisma-adapter**
- **bcryptjs** for password hashing

### Payments
- **Stripe** for subscriptions
- **@stripe/stripe-js** client SDK

### Search
- **Typesense** for instant search

### Email
- **Resend** for transactional emails

### Internationalization
- **next-intl** for i18n (EN/ID)

### File Uploads
- **UploadThing**

### Rate Limiting
- **@upstash/ratelimit** + **@upstash/redis**

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+**
- **npm** or **yarn** or **pnpm**
- Database (SQLite works out of the box)

### Fastest Setup (Interactive Wizard) ⚡

```bash
# 1. Clone the repository
git clone https://github.com/your-org/docuverse-saas.git
cd docuverse-saas

# 2. Install dependencies
npm install

# 3. Run interactive setup wizard
npm run setup

# 4. Start development server
npm run dev
```

The wizard will guide you through database selection, environment configuration, and sample data seeding.

### Manual Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/docuverse-saas.git
cd docuverse-saas

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Initialize database
npm run db:push

# 5. Seed database with sample data
npm run db:seed

# 6. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

### Login Credentials (After Seeding)

**Super Admin:**
- Email: `admin@docuverse.id`
- Password: `ChangeMeInProduction123!`

**Example User:**
- Email: `user@example.com`
- Password: `password123`

**Demo Tenant:** [http://demo.localhost:3000](http://demo.localhost:3000)

## 📦 Database Configuration

### Option 1: SQLite (Development)

```env
DATABASE_MODE=sqlite
DATABASE_URL="file:./dev.db"
```

### Option 2: Turso (Production - Recommended)

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Create database
turso db create docuverse-prod

# Get database URL
turso db show docuverse-prod

# Create auth token
turso db tokens create docuverse-prod
```

```env
DATABASE_MODE=turso
DATABASE_URL="libsql://your-db.turso.io"
TURSO_AUTH_TOKEN="your-turso-token"
```

### Option 3: MySQL (Self-Hosted)

```env
DATABASE_MODE=mysql
DATABASE_URL="mysql://user:password@localhost:3306/docuverse"
```

### Option 4: PlanetScale (Cloud)

```env
DATABASE_MODE=planetscale
DATABASE_URL="mysql://user:password@aws.connect.psdb.cloud/docuverse?sslaccept=strict"
PRISMA_ACCELERATE_URL="prisma://accelerate.prisma-data.net/?api_key=your-key"
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server with Turbo
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push Prisma schema to database
npm run db:migrate   # Create migration (MySQL/PostgreSQL)
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Environment Variables for Production

Required:
```env
DATABASE_MODE=turso
DATABASE_URL=
TURSO_AUTH_TOKEN=
AUTH_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=
```

Optional:
```env
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
TYPESENSE_HOST=
TYPESENSE_API_KEY=
RESEND_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## 📁 Project Structure

```
docuverse-saas/
├── app/
│   ├── (saas-admin)/          # Super admin dashboard
│   ├── auth/                  # Authentication pages
│   ├── api/                   # API routes
│   │   ├── auth/              # NextAuth.js routes
│   │   └── webhook/           # Stripe webhooks
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Landing page
│   └── globals.css            # Global styles
├── components/
│   ├── ui/                    # shadcn/ui components
│   └── theme-provider.tsx     # Theme provider
├── lib/
│   ├── db.ts                  # Multi-database Prisma client
│   ├── auth.ts                # NextAuth.js configuration
│   ├── tenant.ts              # Tenant utilities
│   ├── stripe.ts              # Stripe integration
│   ├── typesense.ts           # Search integration
│   └── utils.ts               # Utility functions
├── prisma/
│   ├── schema.prisma          # Prisma schema
│   └── seed.ts                # Database seeding
├── middleware.ts              # Next.js middleware
├── .env.example               # Environment variables template
├── next.config.js             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── package.json               # Dependencies
```

## 🎨 Customization

### Change Database Mode

Simply update `.env`:

```env
DATABASE_MODE=turso  # or: sqlite, mysql, planetscale, neon
```

### Configure Stripe Plans

Edit `lib/stripe.ts`:

```typescript
export const STRIPE_PLANS = {
  FREE: { price: 0, ... },
  PRO: { price: 9, ... },
  TEAM: { price: 29, ... },
}
```

### Add New Language

1. Add locale in `next.config.js`
2. Create translation files in `messages/`
3. Update `NEXT_PUBLIC_DEFAULT_LOCALE` in `.env`

## 🔒 Security Features

- ✅ Content Security Policy (CSP)
- ✅ HSTS headers
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ SQL injection prevention (Prisma)
- ✅ Password hashing (bcrypt)
- ✅ Secure session management
- ✅ Input validation
- ✅ Audit logging

## 📊 Performance

- ⚡ **100/100 Lighthouse score**
- 🚀 **Partial Prerendering** with Next.js 16
- 🎯 **React 19 Compiler** for optimization
- 📦 **Code splitting** and lazy loading
- 🖼️ **Image optimization** with Next.js Image
- 💾 **Edge caching** with Vercel
- 🔍 **Instant search** with Typesense

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

- 📧 Email: support@docuverse.id
- 💬 Discord: [Join our community](https://discord.gg/docuverse)
- 📚 Documentation: [docs.docuverse.id](https://docs.docuverse.id)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/docuverse-saas/issues)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Prisma](https://prisma.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Stripe](https://stripe.com/)
- [Typesense](https://typesense.org/)
- [Vercel](https://vercel.com/)

---

Built with ❤️ in Indonesia 🇮🇩

**Made for developers, by developers.**
