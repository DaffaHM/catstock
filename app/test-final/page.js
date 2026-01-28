import { getSession } from '@/lib/auth'
import { getQuickSession } from '@/lib/auth-quick'

export const metadata = {
  title: 'Test Final - CatStock',
  description: 'Test final untuk memverifikasi semua sistem berfungsi'
}

export default async function TestFinalPage() {
  let regularSession = null
  let quickSession = null
  let regularError = null
  let quickError = null

  // Test regular authentication
  try {
    regularSession = await getSession()
  } catch (error) {
    regularError = error.message
  }

  // Test quick authentication
  try {
    quickSession = await getQuickSession()
  } catch (error) {
    quickError = error.message
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">🧪 Test Final - CatStock</h1>
          <p className="text-gray-600 mb-8">
            Halaman ini menguji semua sistem authentication dan memberikan informasi lengkap.
          </p>
        </div>

        {/* Authentication Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Regular Auth */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🔐 Regular Authentication</h2>
            {regularSession?.isAuthenticated ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-green-600 text-xl mr-2">✅</span>
                  <span className="font-semibold text-green-800">Authenticated</span>
                </div>
                <div className="text-green-700 text-sm space-y-1">
                  <div><strong>ID:</strong> {regularSession.user.id}</div>
                  <div><strong>Email:</strong> {regularSession.user.email}</div>
                  <div><strong>Name:</strong> {regularSession.user.name}</div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-red-600 text-xl mr-2">❌</span>
                  <span className="font-semibold text-red-800">Not Authenticated</span>
                </div>
                {regularError && (
                  <div className="text-red-700 text-sm">
                    <strong>Error:</strong> {regularError}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Auth */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 Quick Authentication</h2>
            {quickSession?.isAuthenticated ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-green-600 text-xl mr-2">✅</span>
                  <span className="font-semibold text-green-800">Authenticated</span>
                </div>
                <div className="text-green-700 text-sm space-y-1">
                  <div><strong>ID:</strong> {quickSession.user.id}</div>
                  <div><strong>Email:</strong> {quickSession.user.email}</div>
                  <div><strong>Name:</strong> {quickSession.user.name}</div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-red-600 text-xl mr-2">❌</span>
                  <span className="font-semibold text-red-800">Not Authenticated</span>
                </div>
                {quickError && (
                  <div className="text-red-700 text-sm">
                    <strong>Error:</strong> {quickError}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Login Options */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🔑 Login Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="/login" 
              className="block p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-center"
            >
              <div className="text-2xl mb-2">🔐</div>
              <h3 className="font-semibold text-blue-800">Regular Login</h3>
              <p className="text-blue-600 text-sm">Database + Fallback</p>
            </a>
            
            <a 
              href="/quick-login" 
              className="block p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-center"
            >
              <div className="text-2xl mb-2">🚀</div>
              <h3 className="font-semibold text-green-800">Quick Login</h3>
              <p className="text-green-600 text-sm">Demo Mode</p>
            </a>
            
            <a 
              href="/debug-auth" 
              className="block p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-center"
            >
              <div className="text-2xl mb-2">🔧</div>
              <h3 className="font-semibold text-gray-800">Debug Auth</h3>
              <p className="text-gray-600 text-sm">Diagnostic</p>
            </a>
          </div>
        </div>

        {/* Navigation Test */}
        {(regularSession?.isAuthenticated || quickSession?.isAuthenticated) && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🧭 Navigation Test</h2>
            <p className="text-gray-600 mb-4">
              Klik link di bawah untuk menguji navigasi ke berbagai halaman:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <a href="/dashboard" className="block p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-center">
                <div className="text-lg mb-1">📊</div>
                <div className="text-sm font-medium text-blue-800">Dashboard</div>
              </a>
              <a href="/products" className="block p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-center">
                <div className="text-lg mb-1">📦</div>
                <div className="text-sm font-medium text-green-800">Produk</div>
              </a>
              <a href="/suppliers" className="block p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-center">
                <div className="text-lg mb-1">🚚</div>
                <div className="text-sm font-medium text-yellow-800">Pemasok</div>
              </a>
              <a href="/reports" className="block p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-center">
                <div className="text-lg mb-1">📈</div>
                <div className="text-sm font-medium text-purple-800">Laporan</div>
              </a>
              <a href="/transactions/stock-in" className="block p-3 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors text-center">
                <div className="text-lg mb-1">⬆️</div>
                <div className="text-sm font-medium text-indigo-800">Stok Masuk</div>
              </a>
              <a href="/transactions/stock-out" className="block p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-center">
                <div className="text-lg mb-1">⬇️</div>
                <div className="text-sm font-medium text-red-800">Stok Keluar</div>
              </a>
              <a href="/transactions/stock-adjustment" className="block p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-center">
                <div className="text-lg mb-1">⚖️</div>
                <div className="text-sm font-medium text-orange-800">Penyesuaian</div>
              </a>
              <a href="/settings" className="block p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-center">
                <div className="text-lg mb-1">⚙️</div>
                <div className="text-sm font-medium text-gray-800">Pengaturan</div>
              </a>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">📋 Instruksi Testing</h2>
          <div className="space-y-3 text-blue-700">
            <div className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>Jika belum login, pilih salah satu opsi login di atas</span>
            </div>
            <div className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>Gunakan kredensial: <code className="bg-blue-100 px-2 py-1 rounded">owner@catstock.com</code> / <code className="bg-blue-100 px-2 py-1 rounded">admin123</code></span>
            </div>
            <div className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>Setelah login berhasil, test navigasi dengan mengklik link-link di atas</span>
            </div>
            <div className="flex items-start">
              <span className="font-bold mr-2">4.</span>
              <span>Semua halaman harus dapat diakses tanpa redirect ke login</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}