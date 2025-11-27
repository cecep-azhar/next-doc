# ✅ Installation Verification Checklist

Use this checklist to verify your DocuVerse SaaS installation is working correctly.

---

## 📋 Pre-Installation

- [ ] Node.js 20+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git installed (`git --version`)
- [ ] Code editor ready (VS Code recommended)

---

## 🔧 Installation Steps

### 1. Clone & Install
```bash
git clone https://github.com/your-org/docuverse-saas.git
cd docuverse-saas
npm install
```

**Verify:**
- [ ] Repository cloned successfully
- [ ] `node_modules` folder created
- [ ] No installation errors

---

### 2. Environment Configuration

**Option A: Interactive Wizard (Recommended)**
```bash
npm run setup
```

**Option B: Manual Setup**
```bash
cp .env.example .env
# Edit .env file
```

**Verify:**
- [ ] `.env` file exists
- [ ] `DATABASE_MODE` is set
- [ ] `DATABASE_URL` is configured
- [ ] `AUTH_SECRET` is generated (not empty)
- [ ] `NEXT_PUBLIC_APP_URL` is set

---

### 3. Database Setup

```bash
npm run db:push
npm run db:seed
```

**Verify:**
- [ ] No database errors
- [ ] See "Superadmin created" message
- [ ] See "Database seeding completed" message
- [ ] `prisma/dev.db` file created (if using SQLite)

**Quick Check:**
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

- [ ] Database check passes
- [ ] User count shows 2
- [ ] Tenant count shows 1

---

### 4. Start Development Server

```bash
npm run dev
```

**Verify:**
- [ ] Server starts without errors
- [ ] Console shows "Local: http://localhost:3000"
- [ ] No TypeScript errors
- [ ] No build errors

---

## 🧪 Functional Testing

### Test 1: Homepage
**URL:** http://localhost:3000

**Expected:**
- [ ] Page loads successfully
- [ ] Hero section visible
- [ ] "DocuVerse SaaS" logo appears
- [ ] Navigation menu works
- [ ] "Get Started" button visible
- [ ] Features section displays
- [ ] Footer displays

---

### Test 2: Sign In Page
**URL:** http://localhost:3000/auth/signin

**Expected:**
- [ ] Sign in form displays
- [ ] Email input works
- [ ] Password input works
- [ ] "Sign in with GitHub" button visible
- [ ] "Sign in with Google" button visible
- [ ] "Sign up" link works

**Try Login:**
- Email: `admin@docuverse.id`
- Password: `ChangeMeInProduction123!`

- [ ] Login successful
- [ ] Redirected to dashboard or homepage
- [ ] User session created

---

### Test 3: Sign Up Page
**URL:** http://localhost:3000/auth/signup

**Expected:**
- [ ] Sign up form displays
- [ ] Name, email, password inputs work
- [ ] OAuth buttons visible
- [ ] Terms and Privacy links present

---

### Test 4: Pricing Page
**URL:** http://localhost:3000/pricing

**Expected:**
- [ ] Three pricing tiers display
- [ ] Free, Pro, Team cards visible
- [ ] Prices show correctly ($0, $9, $29)
- [ ] Feature lists display
- [ ] "Get Started" buttons work

---

### Test 5: Super Admin Access
**URL:** http://localhost:3000/saas-admin

**Login with:**
- Email: `admin@docuverse.id`
- Password: `ChangeMeInProduction123!`

**Expected:**
- [ ] Requires authentication
- [ ] Only accessible to SUPERADMIN role
- [ ] Redirects if not authorized

---

### Test 6: Multi-Tenant Subdomain
**URL:** http://demo.localhost:3000

**Expected:**
- [ ] Subdomain routing works
- [ ] Tenant-specific content loads
- [ ] Different from main site

**Note:** On Windows/Mac, you may need to add to hosts file:
```
127.0.0.1 demo.localhost
```

- [ ] Subdomain accessible
- [ ] Tenant detected correctly

---

## 🔌 Database Verification

### SQLite (Default)
```bash
# Check if database file exists
ls -la prisma/dev.db

# Open Prisma Studio
npm run db:studio
```

**Verify:**
- [ ] Database file exists
- [ ] Prisma Studio opens at localhost:5555
- [ ] Can view Users table (2 records)
- [ ] Can view Tenants table (1 record)
- [ ] Can view Documents table (3 records)

---

### Turso/MySQL/PlanetScale
```bash
npm run db:check
```

**Expected:**
- [ ] Connection successful
- [ ] Tables exist
- [ ] Data populated

---

## 🎨 UI Component Verification

### Theme Switching
- [ ] Light mode works
- [ ] Dark mode works
- [ ] System preference detection works
- [ ] Theme persists on reload

### Responsive Design
Test on different screen sizes:
- [ ] Mobile (< 640px) - Navigation collapses
- [ ] Tablet (640px - 1024px) - Layout adjusts
- [ ] Desktop (> 1024px) - Full layout

### Interactive Elements
- [ ] Buttons have hover effects
- [ ] Links have hover states
- [ ] Forms have focus states
- [ ] Cards have shadow on hover
- [ ] Animations work smoothly

---

## 🔍 Console Checks

### Browser Console
Open DevTools (F12) and check:

**No Errors:**
- [ ] No red errors in console
- [ ] No 404 errors
- [ ] No CORS errors
- [ ] No hydration errors

**Expected Logs:**
```
🗄️  Initializing Prisma with mode: sqlite
   → Using local SQLite database
✅ Database connection successful
```

---

### Terminal Console
Check development server terminal:

**No Errors:**
- [ ] No TypeScript errors
- [ ] No build errors
- [ ] No middleware errors
- [ ] No API route errors

**Expected:**
- Hot reload works on file changes
- Page compiles successfully
- No memory leaks

---

## 🚀 Performance Checks

### Lighthouse Audit
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run audit

**Target Scores:**
- [ ] Performance: 90+
- [ ] Accessibility: 95+
- [ ] Best Practices: 95+
- [ ] SEO: 90+

### Load Times
- [ ] Homepage loads < 2 seconds
- [ ] Sign in page loads < 1 second
- [ ] Pricing page loads < 1.5 seconds
- [ ] Navigation is instant

---

## 🔐 Security Checks

### Environment Variables
- [ ] `.env` not committed to Git
- [ ] `.env.example` exists
- [ ] `AUTH_SECRET` is strong (32+ chars)
- [ ] No sensitive data in code

### Authentication
- [ ] Password hashing works
- [ ] Session management works
- [ ] Protected routes redirect to signin
- [ ] Logout works correctly

### Headers
Check response headers (Network tab):
- [ ] `X-Frame-Options` present
- [ ] `X-Content-Type-Options` present
- [ ] `Strict-Transport-Security` present (in production)

---

## 🛠️ Development Tools

### Prisma Studio
```bash
npm run db:studio
```

- [ ] Opens successfully
- [ ] Can view all tables
- [ ] Can edit records
- [ ] Changes persist

### Database Check Script
```bash
npm run db:check
```

- [ ] Runs without errors
- [ ] Shows connection status
- [ ] Shows record counts

### Environment Validation
```bash
npm run validate:env
```

- [ ] Validates all required variables
- [ ] Shows warnings for optional variables
- [ ] Passes validation

---

## 📱 Feature Testing

### Authentication Flow
1. Sign up with new account
2. Sign in with credentials
3. Sign out
4. Sign in with OAuth (if configured)

- [ ] All flows work
- [ ] Sessions persist
- [ ] Redirects work correctly

### Tenant Management
1. Create new tenant
2. Access via subdomain
3. Invite team member
4. Manage settings

- [ ] Tenant creation works
- [ ] Subdomain routing works
- [ ] Member management works

---

## ✅ Final Verification

### Core Functionality
- [ ] Database connected and seeded
- [ ] Authentication working
- [ ] Multi-tenancy routing works
- [ ] UI components render correctly
- [ ] No console errors
- [ ] Development server stable

### Documentation
- [ ] README.md is readable
- [ ] SETUP.md is helpful
- [ ] .env.example is clear
- [ ] Code comments present

### Ready for Development
- [ ] Can modify files and see hot reload
- [ ] Can create new components
- [ ] Can query database
- [ ] Can test locally

---

## 🎉 Success Criteria

**Your installation is successful if:**

✅ All tests pass  
✅ No critical errors  
✅ Homepage loads correctly  
✅ Authentication works  
✅ Database is functional  
✅ Development server is stable  

---

## 🐛 Troubleshooting

If any checks fail, see:
- [SETUP.md](SETUP.md) - Setup guide
- [README.md](README.md) - Project overview
- GitHub Issues - Community support

Common issues:
1. **Port 3000 in use** - Use `PORT=3001 npm run dev`
2. **Database connection failed** - Check .env configuration
3. **Module not found** - Run `npm install` again
4. **Subdomain not working** - Check hosts file

---

## 📞 Get Help

Stuck? We're here to help!

- 📧 Email: support@docuverse.id
- 💬 Discord: discord.gg/docuverse
- 🐛 Issues: GitHub Issues

---

**Happy Building! 🚀**
