# 📚 Tutorial Penggunaan CatStock - Sistem Manajemen Inventori Toko Cat

## 🎯 Apa itu CatStock?

CatStock adalah aplikasi web untuk mengelola inventori toko cat yang dioptimalkan untuk iPad Pro 11". Aplikasi ini membantu Anda:
- Mengelola stok produk cat
- Mencatat transaksi masuk dan keluar
- Mengelola data pemasok
- Membuat laporan inventori
- Memantau stok yang hampir habis

---

## 🚀 Cara Memulai

### 1. Mengakses Aplikasi
- Buka browser di iPad atau komputer
- Ketik alamat: `http://localhost:3000` (atau alamat yang diberikan)
- Anda akan melihat halaman login

### 2. Login ke Sistem
**Akun Default:**
- **Email:** `owner@catstock.com`
- **Kata Sandi:** `admin123`

**Langkah Login:**
1. Masukkan email dan kata sandi
2. Klik tombol "Masuk"
3. Jika berhasil, Anda akan diarahkan ke Dasbor

---

## 🏠 Mengenal Tampilan Utama

### Desktop/iPad Landscape (Layar Lebar)
- **Sidebar Kiri:** Menu navigasi utama
- **Area Utama:** Konten halaman yang sedang aktif
- **Header:** Judul halaman dan informasi pengguna

### Mobile/iPad Portrait (Layar Kecil)
- **Header Atas:** Judul dan menu cepat
- **Area Utama:** Konten halaman
- **Bottom Navigation:** Menu utama di bagian bawah

---

## 📋 Menu Utama dan Fungsinya

### 1. 🏠 **Dasbor**
**Fungsi:** Halaman utama yang menampilkan ringkasan bisnis
**Yang Ditampilkan:**
- Total produk
- Jumlah pemasok
- Ringkasan transaksi
- Stok yang hampir habis
- Aktivitas terbaru

**Cara Menggunakan:**
- Klik "Dasbor" di menu
- Lihat ringkasan data di kartu-kartu
- Klik "Lihat Detail" untuk informasi lebih lengkap

### 2. 📦 **Produk**
**Fungsi:** Mengelola katalog produk cat
**Fitur:**
- Daftar semua produk
- Tambah produk baru
- Edit informasi produk
- Hapus produk
- Cari dan filter produk

**Cara Menggunakan:**
1. **Melihat Daftar Produk:**
   - Klik "Produk" di menu
   - Scroll untuk melihat semua produk
   - Gunakan kotak pencarian untuk mencari produk tertentu

2. **Menambah Produk Baru:**
   - Klik tombol "Tambah Produk"
   - Isi form:
     - Nama produk (contoh: "Cat Tembok Putih")
     - Kode produk (contoh: "CTW001")
     - Kategori (contoh: "Cat Tembok")
     - Merek (contoh: "Dulux")
     - Harga beli (contoh: Rp 100.000)
     - Harga jual (contoh: Rp 125.000)
     - Stok minimum (contoh: 10)
   - Klik "Simpan"

3. **Mengedit Produk:**
   - Klik produk yang ingin diedit
   - Ubah informasi yang diperlukan
   - Klik "Simpan Perubahan"

### 3. 🚚 **Pemasok**
**Fungsi:** Mengelola data pemasok/supplier
**Fitur:**
- Daftar pemasok
- Tambah pemasok baru
- Edit informasi pemasok
- Lihat riwayat pembelian dari pemasok

**Cara Menggunakan:**
1. **Menambah Pemasok:**
   - Klik "Pemasok" di menu
   - Klik "Tambah Pemasok"
   - Isi informasi:
     - Nama pemasok (contoh: "PT Cat Indah")
     - Kontak person (contoh: "Budi Santoso")
     - Telepon (contoh: "021-12345678")
     - Email (contoh: "budi@catindah.com")
     - Alamat lengkap
   - Klik "Simpan"

### 4. ⬆️ **Stok Masuk**
**Fungsi:** Mencatat barang yang masuk ke toko
**Kapan Digunakan:**
- Saat menerima barang dari pemasok
- Saat ada penambahan stok
- Saat ada retur dari pelanggan

**Cara Menggunakan:**
1. Klik "Stok Masuk" di menu
2. Klik "Buat Transaksi Baru"
3. Pilih pemasok dari dropdown
4. Tambah produk:
   - Pilih produk dari daftar
   - Masukkan jumlah yang diterima
   - Masukkan harga beli (jika berbeda)
5. Tambah catatan jika perlu
6. Klik "Simpan Transaksi"

### 5. ⬇️ **Stok Keluar**
**Fungsi:** Mencatat barang yang keluar dari toko
**Kapan Digunakan:**
- Saat menjual produk ke pelanggan
- Saat ada barang rusak/hilang
- Saat mengirim barang ke cabang lain

**Cara Menggunakan:**
1. Klik "Stok Keluar" di menu
2. Klik "Buat Transaksi Baru"
3. Pilih jenis transaksi (Penjualan/Lainnya)
4. Tambah produk:
   - Pilih produk
   - Masukkan jumlah yang keluar
   - Masukkan harga jual
5. Masukkan informasi pelanggan (jika penjualan)
6. Klik "Simpan Transaksi"

### 6. ⚖️ **Penyesuaian Stok**
**Fungsi:** Menyesuaikan stok karena selisih perhitungan
**Kapan Digunakan:**
- Setelah stock opname
- Saat ada barang rusak
- Koreksi kesalahan pencatatan

**Cara Menggunakan:**
1. Klik "Penyesuaian Stok"
2. Pilih produk yang akan disesuaikan
3. Masukkan:
   - Stok sistem saat ini
   - Stok fisik hasil perhitungan
   - Alasan penyesuaian
4. Sistem akan otomatis menghitung selisih
5. Klik "Simpan Penyesuaian"

### 7. 🔄 **Retur**
**Fungsi:** Mencatat barang yang dikembalikan
**Jenis Retur:**
- Retur dari pelanggan (barang rusak/tidak sesuai)
- Retur ke pemasok (barang cacat)

**Cara Menggunakan:**
1. Klik "Retur" di menu
2. Pilih jenis retur
3. Cari transaksi asli (jika ada)
4. Pilih produk yang diretur
5. Masukkan jumlah dan alasan retur
6. Klik "Proses Retur"

### 8. 📊 **Laporan**
**Fungsi:** Melihat berbagai laporan bisnis
**Jenis Laporan:**
- Laporan Stok Saat Ini
- Laporan Penjualan
- Laporan Pembelian
- Laporan Laba Rugi
- Laporan Stok Minimum

**Cara Menggunakan:**
1. Klik "Laporan" di menu
2. Pilih jenis laporan yang diinginkan
3. Atur filter:
   - Rentang tanggal
   - Kategori produk
   - Pemasok (jika relevan)
4. Klik "Tampilkan Laporan"
5. Gunakan tombol "Ekspor" untuk download CSV

### 9. ⚙️ **Pengaturan**
**Fungsi:** Mengatur preferensi aplikasi
**Yang Bisa Diatur:**
- Informasi akun
- Mata uang default
- Batas stok minimum
- Backup data

---

## 💡 Tips Penggunaan Sehari-hari

### Workflow Harian Toko Cat:

#### **Pagi Hari:**
1. Buka aplikasi dan login
2. Cek Dasbor untuk melihat:
   - Stok yang hampir habis
   - Transaksi kemarin
3. Cek notifikasi stok minimum

#### **Saat Ada Barang Masuk:**
1. Buka "Stok Masuk"
2. Buat transaksi baru
3. Scan atau pilih produk
4. Input jumlah yang diterima
5. Simpan transaksi

#### **Saat Ada Penjualan:**
1. Buka "Stok Keluar"
2. Buat transaksi penjualan
3. Tambah produk yang dibeli pelanggan
4. Input harga dan jumlah
5. Simpan transaksi

#### **Akhir Hari:**
1. Cek laporan penjualan hari ini
2. Review stok yang hampir habis
3. Plan pembelian untuk esok hari

### Workflow Mingguan:

#### **Awal Minggu:**
1. Review laporan penjualan minggu lalu
2. Buat daftar produk yang perlu diorder
3. Hubungi pemasok untuk order barang

#### **Akhir Minggu:**
1. Lakukan stock opname untuk produk tertentu
2. Buat penyesuaian stok jika perlu
3. Review performa penjualan

---

## 🔧 Troubleshooting - Mengatasi Masalah Umum

### Masalah Login:
**Gejala:** Tidak bisa masuk ke aplikasi
**Solusi:**
1. Pastikan email dan password benar
2. Coba refresh halaman (F5)
3. Clear cache browser
4. Coba browser lain

### Masalah Navigasi:
**Gejala:** Menu tidak bisa diklik
**Solusi:**
1. Refresh halaman
2. Pastikan sudah login
3. Coba logout dan login lagi

### Data Tidak Muncul:
**Gejala:** Halaman kosong atau data tidak tampil
**Solusi:**
1. Refresh halaman
2. Cek koneksi internet
3. Tunggu beberapa detik untuk loading

### Stok Tidak Akurat:
**Gejala:** Stok di sistem tidak sesuai fisik
**Solusi:**
1. Lakukan stock opname manual
2. Gunakan fitur "Penyesuaian Stok"
3. Catat alasan penyesuaian

---

## 📱 Optimasi untuk iPad

### Gesture dan Touch:
- **Tap:** Klik biasa
- **Long Press:** Tahan untuk menu konteks
- **Swipe:** Geser untuk navigasi
- **Pinch:** Zoom in/out (jika tersedia)

### Keyboard Shortcuts:
- **Tab:** Pindah antar field
- **Enter:** Submit form
- **Esc:** Cancel/tutup dialog

### Orientasi:
- **Portrait:** Menu di bawah, cocok untuk input data
- **Landscape:** Menu di samping, cocok untuk melihat laporan

---

## 🆘 Bantuan dan Dukungan

### Jika Mengalami Masalah:
1. **Coba solusi di Troubleshooting**
2. **Restart aplikasi:** Tutup dan buka lagi browser
3. **Cek koneksi:** Pastikan internet stabil
4. **Hubungi admin:** Jika masalah berlanjut

### Fitur Test:
Jika aplikasi bermasalah, gunakan halaman test:
- `/test-indonesia` - Test bahasa dan mata uang
- `/final-working-test` - Test login dan navigasi
- `/working-test` - Test fungsi dasar

---

## 📈 Best Practices

### Keamanan Data:
1. **Logout** setelah selesai menggunakan
2. **Jangan share** password dengan orang lain
3. **Backup data** secara berkala
4. **Update password** secara rutin

### Akurasi Data:
1. **Input data** segera setelah transaksi
2. **Double check** jumlah dan harga
3. **Lakukan stock opname** rutin
4. **Catat alasan** setiap penyesuaian

### Efisiensi:
1. **Gunakan shortcut** keyboard
2. **Manfaatkan filter** untuk pencarian cepat
3. **Set reminder** untuk stok minimum
4. **Review laporan** secara berkala

---

## 🎓 Kesimpulan

CatStock adalah aplikasi yang powerful untuk mengelola inventori toko cat. Dengan mengikuti tutorial ini, Anda sudah bisa:

✅ Login dan navigasi dasar
✅ Mengelola produk dan pemasok
✅ Mencatat transaksi masuk dan keluar
✅ Membuat laporan
✅ Mengatasi masalah umum

**Ingat:** Latihan membuat sempurna! Semakin sering digunakan, semakin mahir Anda mengoperasikan aplikasi ini.

---

*Tutorial ini dibuat untuk membantu pengguna memahami dan menggunakan CatStock dengan maksimal. Jika ada pertanyaan atau saran, jangan ragu untuk bertanya!*