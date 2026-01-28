import { getSession } from '@/lib/auth'

export const metadata = {
  title: 'Tutorial - CatStock',
  description: 'Panduan lengkap menggunakan aplikasi CatStock'
}

export default async function TutorialPage() {
  const session = await getSession()

  if (!session?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Diperlukan Autentikasi</h2>
          <p className="text-gray-600 mb-6">Silakan masuk untuk mengakses tutorial.</p>
          <a 
            href="/login" 
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Ke Halaman Masuk
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">📚 Tutorial CatStock</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Selamat datang, {session.user.name}</span>
            <a href="/dashboard" className="text-blue-600 hover:underline">Kembali ke Dasbor</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Introduction */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">🎯 Selamat Datang di CatStock!</h2>
            <p className="text-lg mb-4">
              CatStock adalah sistem manajemen inventori toko cat yang mudah digunakan dan dioptimalkan untuk iPad Pro 11".
            </p>
            <p className="text-blue-100">
              Tutorial ini akan membantu Anda memahami semua fitur dan cara menggunakan aplikasi dengan efektif.
            </p>
          </div>

          {/* Quick Start */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">🚀 Mulai Cepat</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Langkah Pertama:</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Anda sudah berhasil login ✅</li>
                  <li>Familiarisasi dengan menu navigasi</li>
                  <li>Cek Dasbor untuk ringkasan data</li>
                  <li>Mulai dengan mengelola Produk</li>
                </ol>
              </div>
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Akun Default:</h4>
                <div className="bg-gray-50 p-4 rounded">
                  <p><strong>Email:</strong> owner@catstock.com</p>
                  <p><strong>Password:</strong> admin123</p>
                  <p><strong>Role:</strong> Pemilik Toko Cat</p>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Overview */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">📋 Menu Utama</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <a href="/dashboard" className="block p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">🏠</span>
                  <h4 className="font-semibold text-blue-800">Dasbor</h4>
                </div>
                <p className="text-sm text-blue-600">Ringkasan bisnis, stok hampir habis, aktivitas terbaru</p>
              </a>

              <a href="/products" className="block p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">📦</span>
                  <h4 className="font-semibold text-green-800">Produk</h4>
                </div>
                <p className="text-sm text-green-600">Kelola katalog produk cat, tambah, edit, hapus produk</p>
              </a>

              <a href="/suppliers" className="block p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">🚚</span>
                  <h4 className="font-semibold text-purple-800">Pemasok</h4>
                </div>
                <p className="text-sm text-purple-600">Data supplier, kontak, riwayat pembelian</p>
              </a>

              <a href="/transactions/stock-in" className="block p-4 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">⬆️</span>
                  <h4 className="font-semibold text-indigo-800">Stok Masuk</h4>
                </div>
                <p className="text-sm text-indigo-600">Catat barang masuk dari pemasok</p>
              </a>

              <a href="/transactions/stock-out" className="block p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">⬇️</span>
                  <h4 className="font-semibold text-red-800">Stok Keluar</h4>
                </div>
                <p className="text-sm text-red-600">Catat penjualan dan barang keluar</p>
              </a>

              <a href="/reports" className="block p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">📊</span>
                  <h4 className="font-semibold text-orange-800">Laporan</h4>
                </div>
                <p className="text-sm text-orange-600">Berbagai laporan bisnis dan analisis</p>
              </a>

            </div>
          </div>

          {/* Workflow */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">🔄 Alur Kerja Harian</h3>
            <div className="space-y-6">
              
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="text-lg font-semibold text-blue-800 mb-2">🌅 Pagi Hari</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Buka Dasbor untuk cek ringkasan</li>
                  <li>Lihat stok yang hampir habis</li>
                  <li>Review transaksi kemarin</li>
                </ul>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="text-lg font-semibold text-green-800 mb-2">📦 Saat Barang Datang</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Buka menu "Stok Masuk"</li>
                  <li>Pilih pemasok</li>
                  <li>Input produk dan jumlah</li>
                  <li>Simpan transaksi</li>
                </ul>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="text-lg font-semibold text-purple-800 mb-2">💰 Saat Ada Penjualan</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Buka menu "Stok Keluar"</li>
                  <li>Pilih produk yang dibeli</li>
                  <li>Input jumlah dan harga</li>
                  <li>Simpan transaksi penjualan</li>
                </ul>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="text-lg font-semibold text-orange-800 mb-2">🌆 Akhir Hari</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Cek laporan penjualan hari ini</li>
                  <li>Review stok minimum</li>
                  <li>Plan pembelian esok hari</li>
                </ul>
              </div>

            </div>
          </div>

          {/* Tips */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">💡 Tips & Trik</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800">🔍 Pencarian Cepat</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Gunakan kotak pencarian di halaman Produk</li>
                  <li>Filter berdasarkan kategori atau merek</li>
                  <li>Sortir berdasarkan nama atau harga</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800">📱 Optimasi iPad</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Gunakan mode landscape untuk laporan</li>
                  <li>Mode portrait untuk input data</li>
                  <li>Touch dan hold untuk menu konteks</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800">🔒 Keamanan</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Selalu logout setelah selesai</li>
                  <li>Jangan share password</li>
                  <li>Backup data secara berkala</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800">📊 Akurasi Data</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Input transaksi segera setelah terjadi</li>
                  <li>Lakukan stock opname rutin</li>
                  <li>Gunakan fitur Penyesuaian Stok</li>
                </ul>
              </div>

            </div>
          </div>

          {/* Troubleshooting */}
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
            <h3 className="text-2xl font-semibold text-yellow-800 mb-4">🔧 Mengatasi Masalah</h3>
            <div className="space-y-4">
              
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">❌ Tidak Bisa Login</h4>
                <p className="text-yellow-700 text-sm">
                  Pastikan email dan password benar, refresh halaman, atau coba browser lain.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">🔄 Menu Tidak Responsif</h4>
                <p className="text-yellow-700 text-sm">
                  Refresh halaman, pastikan sudah login, atau coba logout dan login lagi.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">📊 Data Tidak Muncul</h4>
                <p className="text-yellow-700 text-sm">
                  Cek koneksi internet, refresh halaman, atau tunggu beberapa detik untuk loading.
                </p>
              </div>

            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-4">🎯 Langkah Selanjutnya</h3>
            <p className="mb-4">Sekarang Anda sudah siap menggunakan CatStock! Mulai dengan:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="/dashboard" className="block bg-white bg-opacity-20 p-4 rounded-lg hover:bg-opacity-30 transition-colors">
                <h4 className="font-semibold mb-2">1. Cek Dasbor</h4>
                <p className="text-sm text-blue-100">Lihat ringkasan data toko Anda</p>
              </a>
              <a href="/products" className="block bg-white bg-opacity-20 p-4 rounded-lg hover:bg-opacity-30 transition-colors">
                <h4 className="font-semibold mb-2">2. Kelola Produk</h4>
                <p className="text-sm text-blue-100">Tambah atau edit produk cat</p>
              </a>
              <a href="/transactions/stock-in" className="block bg-white bg-opacity-20 p-4 rounded-lg hover:bg-opacity-30 transition-colors">
                <h4 className="font-semibold mb-2">3. Catat Transaksi</h4>
                <p className="text-sm text-blue-100">Mulai mencatat stok masuk/keluar</p>
              </a>
            </div>
          </div>

          {/* Help */}
          <div className="bg-white p-6 rounded-lg border text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">🆘 Butuh Bantuan?</h3>
            <p className="text-gray-600 mb-4">
              Jika masih ada yang kurang jelas atau mengalami masalah, jangan ragu untuk bertanya!
            </p>
            <div className="space-x-4">
              <a href="/test-indonesia" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Test Aplikasi
              </a>
              <a href="/working-test" className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Test Navigasi
              </a>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}