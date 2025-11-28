# Setup Database MySQL

## Panduan Lengkap Setup MySQL untuk Next-Doc

### 1. Install MySQL (Pilih salah satu)

#### Option A: MySQL Lokal (Windows)
1. Download MySQL dari: https://dev.mysql.com/downloads/installer/
2. Install dan ikuti wizard
3. Set password untuk root user
4. Start MySQL service

#### Option B: XAMPP (Lebih Mudah)
1. Download XAMPP dari: https://www.apachefriends.org/
2. Install XAMPP
3. Buka XAMPP Control Panel
4. Start Apache dan MySQL
5. Default: username `root`, password kosong

#### Option C: Docker (Rekomendasi untuk Development)
```bash
docker run --name mysql-nextdoc -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=next_doc -p 3306:3306 -d mysql:8
```

### 2. Buat Database

#### Via phpMyAdmin (XAMPP):
1. Buka http://localhost/phpmyadmin
2. Klik tab "Databases"
3. Buat database baru dengan nama: `next_doc`
4. Collation: `utf8mb4_unicode_ci`

#### Via MySQL Command Line:
```sql
CREATE DATABASE next_doc CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Konfigurasi Environment

Copy file `.env.local` dan sesuaikan `DATABASE_URL`:

```env
# Untuk XAMPP (password kosong)
DATABASE_URL="mysql://root:@localhost:3306/next_doc"

# Untuk MySQL dengan password
DATABASE_URL="mysql://root:your_password@localhost:3306/next_doc"

# Untuk Docker
DATABASE_URL="mysql://root:password@localhost:3306/next_doc"
```

### 4. Jalankan Migration

```bash
# Generate Prisma Client
pnpm prisma generate

# Buat tabel database
pnpm prisma db push

# Atau gunakan migration (production-ready)
pnpm prisma migrate dev --name init

# (Optional) Seed data awal
pnpm prisma db seed
```

### 5. Verifikasi Database

```bash
# Check koneksi database
pnpm prisma studio
```

Akan membuka Prisma Studio di browser untuk melihat dan mengedit data.

### 6. Jalankan Development Server

```bash
pnpm dev
```

Server akan berjalan di: http://localhost:3000

---

## Setup MySQL Production

### Option 1: Railway (Rekomendasi - Gratis)

1. Sign up di: https://railway.app
2. New Project → Deploy MySQL
3. Copy `DATABASE_URL` dari Railway
4. Tambahkan ke `.env.production` atau environment variables di hosting

```env
DATABASE_URL="mysql://root:xxxxx@containers-us-west-xxx.railway.app:3306/railway"
```

### Option 2: PlanetScale (MySQL-compatible, Serverless)

1. Sign up di: https://planetscale.com
2. Create database
3. Copy connection string
4. Update `.env.production`:

```env
DATABASE_MODE=planetscale
DATABASE_URL="mysql://xxxxx@aws.connect.psdb.cloud/database?sslaccept=strict"
```

### Option 3: VPS / CloudPanel

1. Install MySQL di VPS
2. Buat database dan user
3. Update firewall untuk allow port 3306
4. Gunakan connection string:

```env
DATABASE_URL="mysql://username:password@your-server.com:3306/database_name"
```

### Option 4: Digital Ocean MySQL

1. Create Managed MySQL database
2. Copy connection string
3. Update `.env.production`

---

## Troubleshooting

### Error: Can't connect to MySQL server
- Pastikan MySQL service berjalan
- Cek port 3306 tidak digunakan aplikasi lain
- Cek username dan password benar

### Error: Access denied for user
- Pastikan username dan password benar di `DATABASE_URL`
- Grant privileges ke user:
```sql
GRANT ALL PRIVILEGES ON next_doc.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### Error: Unknown database
- Pastikan database sudah dibuat
- Jalankan: `CREATE DATABASE next_doc;`

### Error: Too many connections
- Increase max_connections di MySQL config
- Atau gunakan connection pooling (Prisma Accelerate)

---

## Migration vs DB Push

### `prisma db push` (Development)
- Cepat, langsung sync schema ke database
- Tidak buat migration files
- Cocok untuk prototyping

```bash
pnpm prisma db push
```

### `prisma migrate` (Production)
- Buat migration files (version control friendly)
- Rollback support
- Cocok untuk production

```bash
pnpm prisma migrate dev --name add_users_table
pnpm prisma migrate deploy  # Production
```

---

## Backup Database

### Manual Backup
```bash
# Export
mysqldump -u root -p next_doc > backup.sql

# Import
mysql -u root -p next_doc < backup.sql
```

### Automated Backup (Railway/PlanetScale)
- Railway: Automatic daily backups
- PlanetScale: Branch-based workflow

---

## Performance Tips

1. **Add indexes** untuk query yang sering digunakan
2. **Connection pooling** via Prisma Accelerate
3. **Caching** dengan Redis (Upstash)
4. **Monitor** slow queries dengan `prisma:query` log

---

## Next Steps

1. ✅ Setup MySQL
2. ✅ Configure environment
3. ✅ Run migrations
4. 🔄 Seed initial data
5. 🔄 Deploy to production

Selamat coding! 🚀
