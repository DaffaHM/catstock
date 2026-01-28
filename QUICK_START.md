# 🚀 CatStock Quick Start Guide

## Langkah Cepat Menjalankan Aplikasi

### 1. Jalankan Development Server
```bash
npm run dev
```

### 2. Akses Aplikasi
Buka browser dan kunjungi:
- **URL:** `http://localhost:3000` (atau port yang ditampilkan)
- **Jangan gunakan HTTPS** - gunakan HTTP

### 3. Login
**Email:** `owner@catstock.com`  
**Password:** `admin123`

## ✅ Jika Berhasil Login

Anda akan melihat:
- **Dashboard** dengan overview stok
- **Navigation** yang responsif (sidebar di desktop, bottom nav di mobile)
- **Menu utama:** Products, Suppliers, Transactions, Reports

## ❌ Jika Ada Error

### Error React Hooks / "Rendered more hooks"
```bash
# Stop server (Ctrl+C)
Remove-Item -Recurse -Force .next
npm run dev
```

### Error "Failed to fetch"
1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** (Ctrl+Shift+R)
3. **Coba browser lain** (Chrome, Firefox, Edge)
4. **Coba mode incognito**

### Error Database
```bash
npm run db:reset
npm run db:seed
npm run dev
```

## 📱 Fitur Utama

### **Products Management**
- Tambah/edit produk cat
- SKU tracking
- Kategori dan pricing
- Stock levels

### **Stock Transactions**
- **IN:** Pembelian/penerimaan
- **OUT:** Penjualan/pengeluaran  
- **ADJUST:** Stock opname
- **RETURN:** Retur barang

### **Suppliers**
- Database vendor
- Contact information
- Supplier relationships

### **Reports & Analytics**
- Current stock levels
- Transaction history
- Low stock alerts
- Sales/purchase summaries
- CSV export

## 🎯 Optimasi iPad

- **Touch targets:** Minimum 44px
- **Large fonts:** 16px+ untuk readability
- **Responsive layout:** Sidebar (landscape) / Bottom nav (portrait)
- **Touch-friendly forms:** Large inputs, steppers
- **No zoom issues:** Optimized for iPad Safari

## 🔐 Security Features

- **Secure authentication** dengan rate limiting
- **CSRF protection** untuk semua form
- **Session management** dengan httpOnly cookies
- **Input validation** dengan Zod schemas
- **SQL injection prevention** dengan Prisma ORM

## 📞 Support

Jika masih ada masalah:
1. Screenshot error message
2. Cek browser console (F12)
3. Cek terminal untuk server errors
4. Hubungi tim development

---

**Happy inventory managing! 🎨📦**