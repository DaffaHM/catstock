import { getSession } from '@/lib/auth'

export const metadata = {
  title: 'Test Kerja - CatStock',
  description: 'Test apakah navigasi berfungsi'
}

export default async function WorkingTestPage() {
  const session = await getSession()

  if (!session?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Diperlukan Autentikasi</h2>
          <p className="text-gray-600 mb-6">Silakan masuk untuk mengakses halaman ini.</p>
          <a 
            href="/login" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ke Halaman Masuk
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Halaman Test Kerja</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Selamat datang, {session.user.name}</span>
            <a href="/login" className="text-blue-600 hover:underline">Keluar</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">✅ Autentikasi Berfungsi!</h2>
            <p className="text-gray-600">Anda berhasil masuk dan dapat mengakses halaman yang dilindungi.</p>
          </div>

          {/* Navigation Test */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Test Navigasi</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/dashboard" className="block p-4 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-center">
                Dasbor
              </a>
              <a href="/products" className="block p-4 bg-green-100 text-green-800 rounded hover:bg-green-200 text-center">
                Produk
              </a>
              <a href="/suppliers" className="block p-4 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 text-center">
                Pemasok
              </a>
              <a href="/reports" className="block p-4 bg-orange-100 text-orange-800 rounded hover:bg-orange-200 text-center">
                Laporan
              </a>
              <a href="/settings" className="block p-4 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-center">
                Pengaturan
              </a>
              <a href="/transactions/stock-in" className="block p-4 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 text-center">
                Stok Masuk
              </a>
              <a href="/transactions/stock-out" className="block p-4 bg-red-100 text-red-800 rounded hover:bg-red-200 text-center">
                Stok Keluar
              </a>
              <a href="/transactions/returns" className="block p-4 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 text-center">
                Retur
              </a>
            </div>
          </div>

          {/* Session Info */}
          <div className="bg-white p-6 rounded-lg border mt-6">
            <h3 className="text-lg font-semibold mb-4">Informasi Sesi</h3>
            <div className="space-y-2">
              <p><strong>Pengguna:</strong> {session.user.email}</p>
              <p><strong>Nama:</strong> {session.user.name}</p>
              <p><strong>ID:</strong> {session.user.id}</p>
              <p><strong>Terautentikasi:</strong> {session.isAuthenticated ? '✅ Ya' : '❌ Tidak'}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}