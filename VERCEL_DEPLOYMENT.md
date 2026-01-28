# 🚀 Panduan Deployment CatStock ke Vercel

## 📋 Persiapan Sebelum Deploy

### 1. Database PostgreSQL
CatStock memerlukan database PostgreSQL untuk production. Anda bisa menggunakan:
- **Vercel Postgres** (Recommended)
- **Supabase** (Free tier tersedia)
- **Railway** (Free tier tersedia)
- **PlanetScale** (Free tier tersedia)

### 2. Environment Variables
Set environment variables berikut di Vercel Dashboard:

```env
DATABASE_URL="postgresql://username:password@host:5432/catstock"
JWT_SECRET="your-secure-jwt-secret-min-32-characters-long"
NODE_ENV="production"
```

## 🔧 Langkah-langkah Deployment

### 1. Setup Database (Contoh dengan Vercel Postgres)

1. **Buat Vercel Postgres Database:**
   - Login ke Vercel Dashboard
   - Pilih project CatStock
   - Go to Storage tab
   - Create new Postgres database
   - Copy connection string

2. **Set Environment Variables:**
   - Go to Settings > Environment Variables
   - Add `DATABASE_URL` dengan connection string PostgreSQL
   - Add `JWT_SECRET` dengan random string minimal 32 karakter

### 2. Deploy ke Vercel

1. **Via GitHub (Recommended):**
   ```bash
   # Push ke GitHub (sudah dilakukan)
   git push origin main
   
   # Import project di Vercel
   # - Login ke vercel.com
   # - Import dari GitHub: DaffaHM/catstock
   # - Set environment variables
   # - Deploy
   ```

2. **Via Vercel CLI:**
   ```bash
   npm i -g vercel
   vercel login
   vercel --prod
   ```

### 3. Setup Database Schema

Setelah deploy pertama kali, jalankan migration:

```bash
# Via Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy
npx prisma db seed
```

Atau setup via Vercel Functions (otomatis):
- Database schema akan di-generate otomatis saat build
- Seed data akan dijalankan jika database kosong

## ⚙️ Konfigurasi Vercel

### vercel.json (Opsional)
```json
{
  "buildCommand": "npm run vercel-build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.js": {
      "maxDuration": 30
    }
  },
  "regions": ["sin1"]
}
```

### Build Settings di Vercel Dashboard:
- **Framework Preset:** Next.js
- **Build Command:** `npm run vercel-build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

## 🔐 Environment Variables yang Diperlukan

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret untuk JWT tokens | `your-super-secret-key-min-32-chars` |
| `NODE_ENV` | Environment mode | `production` |

## 🧪 Testing Deployment

Setelah deploy, test fitur-fitur berikut:

### 1. Authentication
- [ ] Login dengan `owner@catstock.com` / `admin123`
- [ ] Session persistence
- [ ] Logout functionality

### 2. Core Features
- [ ] Dashboard loading
- [ ] Product management
- [ ] Supplier management
- [ ] Stock transactions
- [ ] Reports generation

### 3. iPad Compatibility
- [ ] Touch navigation
- [ ] Responsive layout
- [ ] Portrait/landscape modes

## 🐛 Troubleshooting

### Build Errors

1. **"Authentication required" during build:**
   ```
   Error: Authentication required at requireAuth()
   ```
   **Solution:** Halaman test yang menggunakan `requireAuth()` sudah dihapus.

2. **Database connection errors:**
   ```
   Error: Can't reach database server
   ```
   **Solution:** 
   - Pastikan `DATABASE_URL` benar
   - Database PostgreSQL harus accessible dari Vercel

3. **Prisma generate errors:**
   ```
   Error: Prisma schema not found
   ```
   **Solution:** 
   - Pastikan `prisma/schema.prisma` ada
   - Run `prisma generate` di build command

### Runtime Errors

1. **JWT Secret not found:**
   ```
   Error: JWT_SECRET is required
   ```
   **Solution:** Set `JWT_SECRET` di environment variables

2. **Database migration errors:**
   ```
   Error: Table doesn't exist
   ```
   **Solution:** Run database migration:
   ```bash
   npx prisma migrate deploy
   ```

## 📊 Performance Optimization

### 1. Database
- Connection pooling sudah diatur di Prisma
- Query optimization dengan select statements
- Proper indexing di schema

### 2. Next.js
- Static generation untuk halaman public
- Server-side rendering untuk halaman auth
- Image optimization otomatis

### 3. Caching
- Dashboard data caching
- API response caching
- Static asset caching

## 🔄 Update Deployment

Untuk update aplikasi:

```bash
# Push changes ke GitHub
git add .
git commit -m "Update: description"
git push origin main

# Vercel akan otomatis deploy
```

## 📱 Domain Custom (Opsional)

1. **Beli domain** (contoh: catstock.com)
2. **Add domain di Vercel:**
   - Go to project settings
   - Domains tab
   - Add custom domain
   - Update DNS records

## 🎯 Post-Deployment Checklist

- [ ] Database connected dan seeded
- [ ] Authentication working
- [ ] All pages loading correctly
- [ ] iPad optimization working
- [ ] SSL certificate active
- [ ] Custom domain configured (if applicable)
- [ ] Performance monitoring setup
- [ ] Error tracking setup (optional)

## 🆘 Support

Jika mengalami masalah deployment:

1. **Check Vercel logs:**
   - Go to Vercel Dashboard
   - Select deployment
   - Check Function Logs

2. **Check database connection:**
   ```bash
   npx prisma studio
   ```

3. **Test locally first:**
   ```bash
   npm run build
   npm run start
   ```

---

**Happy Deploying! 🚀**

*Dokumentasi ini akan diupdate sesuai kebutuhan dan feedback deployment.*