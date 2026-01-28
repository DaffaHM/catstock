import { getQuickSession } from '@/lib/auth-quick'

export const metadata = {
  title: 'Dashboard Demo - CatStock',
  description: 'Demo dashboard untuk testing'
}

export default async function DemoDashboardPage() {
  let session = null

  try {
    session = await getQuickSession()
  } catch (err) {
    console.log('[Demo Dashboard] Auth error:', err.message)
  }

  if (!session?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Diperlukan Autentikasi</h2>
          <p className="text-gray-600 mb-6">Silakan masuk untuk mengakses dashboard.</p>
          <a 
            href="/quick-login" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ke Quick Login
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
          <h1 className="text-2xl font-bold text-gray-900">🎨 CatStock Dashboard (Demo)</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Selamat datang, {session.user.name}</span>
            <a href="/quick-login" className="text-blue-600 hover:underline">Logout</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🎉</span>
              <div>
                <h2 className="text-xl font-semibold text-green-800">Login Berhasil!</h2>
                <p className="text-green-700">
                  Selamat! Anda berhasil login ke CatStock dalam mode demo.
                </p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 Informasi Pengguna</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">ID:</span>
                <p className="text-gray-900">{session.user.id}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Email:</span>
                <p className="text-gray-900">{session.user.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Nama:</span>
                <p className="text-gray-900">{session.user.name}</p>
              </div>
            </div>
          </div>

          {/* Demo Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Produk</p>
                  <p className="text-2xl font-semibold text-gray-900">8</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <span className="text-2xl">🚚</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pemasok</p>
                  <p className="text-2xl font-semibold text-gray-900">2</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Transaksi</p>
                  <p className="text-2xl font-semibold text-gray-900">3</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Nilai</p>
                  <p className="text-2xl font-semibold text-gray-900">Rp 2.5M</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">🧭 Menu Navigasi (Demo)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <a href="/products" className="block p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">📦</span>
                  <h4 className="font-semibold text-blue-800">Produk</h4>
                </div>
                <p className="text-sm text-blue-600">Kelola katalog produk cat</p>
              </a>

              <a href="/suppliers" className="block p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">🚚</span>
                  <h4 className="font-semibold text-green-800">Pemasok</h4>
                </div>
                <p className="text-sm text-green-600">Data supplier dan kontak</p>
              </a>

              <a href="/transactions/stock-in" className="block p-4 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">⬆️</span>
                  <h4 className="font-semibold text-indigo-800">Stok Masuk</h4>
                </div>
                <p className="text-sm text-indigo-600">Catat barang masuk</p>
              </a>

              <a href="/transactions/stock-out" className="block p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">⬇️</span>
                  <h4 className="font-semibold text-red-800">Stok Keluar</h4>
                </div>
                <p className="text-sm text-red-600">Catat penjualan</p>
              </a>

              <a href="/reports" className="block p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">📊</span>
                  <h4 className="font-semibold text-orange-800">Laporan</h4>
                </div>
                <p className="text-sm text-orange-600">Berbagai laporan bisnis</p>
              </a>

              <a href="/settings" className="block p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">⚙️</span>
                  <h4 className="font-semibold text-purple-800">Pengaturan</h4>
                </div>
                <p className="text-sm text-purple-600">Konfigurasi aplikasi</p>
              </a>

            </div>
          </div>

          {/* Demo Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <h3 className="font-semibold text-yellow-800">Mode Demo</h3>
                <p className="text-yellow-700 text-sm">
                  Ini adalah mode demo. Data yang ditampilkan adalah contoh dan tidak tersimpan secara permanen.
                  Untuk versi production, setup database PostgreSQL diperlukan.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}