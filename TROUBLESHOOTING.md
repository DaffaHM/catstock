# CatStock Troubleshooting Guide

## Error: "TypeError: Failed to fetch"

Jika Anda mengalami error "Failed to fetch" saat login, ikuti langkah-langkah berikut:

### 1. Pastikan Server Berjalan
```bash
npm run dev
```
Pastikan server berjalan dan tidak ada error. Catat port yang digunakan (biasanya 3000, 3001, 3002, atau 3003).

### 2. Akses URL yang Benar
Buka browser dan akses:
- `http://localhost:3000` (atau port yang ditampilkan di terminal)
- Jangan gunakan `https://` - gunakan `http://`

### 3. Clear Browser Cache
- **Chrome/Edge**: Ctrl+Shift+Delete → Clear browsing data
- **Firefox**: Ctrl+Shift+Delete → Clear recent history
- Atau coba mode incognito/private browsing

### 4. Periksa Network Tab
1. Buka Developer Tools (F12)
2. Buka tab Network
3. Coba login lagi
4. Lihat apakah ada request yang failed

### 5. Coba Browser Lain
Jika masih error, coba browser yang berbeda:
- Chrome
- Firefox
- Edge

### 6. Restart Development Server
```bash
# Stop server (Ctrl+C)
# Kemudian jalankan lagi
npm run dev
```

### 7. Reset Database (jika diperlukan)
```bash
npm run db:reset
npm run db:seed
```

## Error: React Hooks / "Rendered more hooks than during the previous render"

Jika Anda mengalami error React hooks, ikuti langkah-langkah berikut:

### 1. Clear Next.js Cache
```bash
# Stop server (Ctrl+C)
# Hapus cache Next.js
Remove-Item -Recurse -Force .next
# Restart server
npm run dev
```

### 2. Hard Refresh Browser
- Tekan `Ctrl+Shift+R` (Windows/Linux)
- Atau `Cmd+Shift+R` (Mac)

### 3. Clear Browser Storage
1. Buka Developer Tools (F12)
2. Buka tab Application/Storage
3. Clear Local Storage dan Session Storage
4. Clear Cookies untuk localhost

### 4. Restart Development Environment
```bash
# Stop server
# Clear cache
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules/.cache
# Restart
npm run dev
```

## Login Credentials

**Email:** `owner@catstock.com`  
**Password:** `admin123`

## Jika Masih Error

1. Pastikan tidak ada antivirus/firewall yang memblokir
2. Pastikan port tidak digunakan aplikasi lain
3. Coba restart komputer
4. Periksa console browser untuk error JavaScript

## Kontak Support

Jika masalah masih berlanjut, screenshot error dan kirimkan ke tim development.