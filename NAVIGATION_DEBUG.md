# Navigation Debug Guide

## 🔍 Debugging Navigation Issues

Aplikasi sekarang menggunakan **Test Navigation** untuk membantu debug masalah navigation.

## 📋 Langkah-langkah Debug

### 1. Buka Browser Console
- **Chrome/Edge**: F12 atau Ctrl+Shift+I
- **Firefox**: F12 atau Ctrl+Shift+K
- **Safari**: Cmd+Option+I

### 2. Test Navigation Links
Coba klik setiap link dan perhatikan:

#### ✅ Yang Harus Terjadi:
- Console log muncul: `"Navigation clicked: /dashboard"`
- Current path berubah di indicator
- Halaman berpindah ke URL yang benar

#### ❌ Jika Tidak Berfungsi:
- Tidak ada console log → JavaScript error
- Console log ada tapi halaman tidak berubah → Routing error
- Error message di console → Cek error details

### 3. Test Halaman Sederhana
Klik **"🧪 Test Dashboard"** terlebih dahulu:
- Ini halaman paling sederhana tanpa kompleksitas
- Jika ini tidak berfungsi, masalah ada di routing dasar
- Jika ini berfungsi, masalah ada di halaman kompleks

### 4. Cek Error Messages
Perhatikan error di console browser:

#### Common Errors:
```
TypeError: Cannot read property 'xxx' of undefined
→ Ada masalah dengan data/props

ReferenceError: xxx is not defined  
→ Ada masalah dengan import/export

ChunkLoadError: Loading chunk xxx failed
→ Ada masalah dengan build/bundling

Hydration error
→ Ada masalah dengan SSR/client mismatch
```

## 🛠️ Troubleshooting Steps

### Jika Links Tidak Berfungsi Sama Sekali:

1. **Hard Refresh Browser**
   ```
   Ctrl+Shift+R (Windows)
   Cmd+Shift+R (Mac)
   ```

2. **Clear Browser Cache**
   - Chrome: Settings > Privacy > Clear browsing data
   - Firefox: Settings > Privacy > Clear Data

3. **Restart Development Server**
   ```bash
   # Stop server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

4. **Clear Next.js Cache**
   ```bash
   rm -rf .next
   npm run dev
   ```

### Jika Ada JavaScript Errors:

1. **Check Console for Specific Errors**
   - Copy error message
   - Look for file names and line numbers

2. **Common Fixes:**
   ```bash
   # Reinstall dependencies
   npm install
   
   # Clear all caches
   rm -rf .next node_modules package-lock.json
   npm install
   npm run dev
   ```

### Jika Routing Tidak Berfungsi:

1. **Check URL Changes**
   - Apakah URL berubah di address bar?
   - Jika ya: masalah di halaman target
   - Jika tidak: masalah di Link component

2. **Check Network Tab**
   - Buka Network tab di DevTools
   - Lihat apakah ada request ke server
   - Cek status codes (200, 404, 500, etc.)

## 🔧 Manual Testing

### Test 1: Basic Link Functionality
```javascript
// Paste this in browser console:
console.log('Testing Link click...');
document.querySelector('a[href="/test-dashboard"]').click();
```

### Test 2: Check Current Location
```javascript
// Paste this in browser console:
console.log('Current location:', window.location.href);
console.log('Current pathname:', window.location.pathname);
```

### Test 3: Manual Navigation
```javascript
// Paste this in browser console:
window.location.href = '/test-dashboard';
```

## 📞 Next Steps

### If Test Dashboard Works:
✅ Basic routing is working
→ Problem is with complex pages (dashboard, products, etc.)
→ Check for data loading issues or component errors

### If Test Dashboard Doesn't Work:
❌ Basic routing is broken
→ Fundamental issue with Next.js setup
→ Check server logs and browser console

### If Nothing Works:
🚨 Critical issue
→ Check if server is running: http://localhost:3005
→ Check if you're logged in properly
→ Try different browser

## 🔄 Restore Normal Navigation

Once debugging is complete, restore normal navigation:

1. Edit `components/layout/ResponsiveLayout.js`
2. Change `TestNavigation` back to `StaticLayout`
3. Restart server

## 📝 Report Issues

If problems persist, note:
- Browser and version
- Exact error messages from console
- Steps that reproduce the issue
- Whether test dashboard works or not