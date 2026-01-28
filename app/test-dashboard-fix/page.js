import { getQuickSession } from '@/lib/auth-quick'

export const metadata = {
  title: 'Test Dashboard Fix - CatStock',
  description: 'Test perbaikan dashboard'
}

export default async function TestDashboardFixPage() {
  let session = null
  let isDemoMode = false
  let error = null

  try {
    session = await getQuickSession()
    if (session?.isAuthenticated) {
      isDemoMode = true
    }
  } catch (err) {
    error = err.message
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">🔧 Test Dashboard Fix</h1>
          <p className="text-gray-600 mb-8">
            Halaman ini menguji perbaikan dashboard untuk memastikan tidak ada lagi error "Unable to Load Dashboard".
          </p>
        </div>

        {/* Session Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🔐 Session Status</h2>
          {session?.isAuthenticated ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="text-green-600 text-xl mr-2">✅</span>
                <span className="font-semibold text-green-800">Session Active</span>
              </div>
              <div className="text-green-700 text-sm space-y-1">
                <div><strong>User:</strong> {session.user.name}</div>
                <div><strong>Email:</strong> {session.user.email}</div>
                <div><strong>Demo Mode:</strong> {isDemoMode ? 'Yes' : 'No'}</div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="text-red-600 text-xl mr-2">❌</span>
                <span className="font-semibold text-red-800">No Session</span>
              </div>
              {error && (
                <div className="text-red-700 text-sm">Error: {error}</div>
              )}
            </div>
          )}
        </div>

        {/* Dashboard Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Dashboard Test</h2>
          <p className="text-gray-600 mb-4">
            Klik tombol di bawah untuk menguji dashboard dengan perbaikan terbaru:
          </p>
          
          <div className="space-y-4">
            <a 
              href="/dashboard" 
              className="block w-full p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-center"
            >
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold text-blue-800">Test Dashboard</h3>
              <p className="text-blue-600 text-sm">
                {isDemoMode ? 'Akan menggunakan demo data' : 'Akan mencoba database + fallback'}
              </p>
            </a>
            
            <a 
              href="/demo-dashboard" 
              className="block w-full p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-center"
            >
              <div className="text-2xl mb-2">🚀</div>
              <h3 className="font-semibold text-green-800">Demo Dashboard</h3>
              <p className="text-green-600 text-sm">Dashboard khusus demo mode</p>
            </a>
          </div>
        </div>

        {/* Expected Results */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">🎯 Expected Results</h2>
          <div className="text-blue-700 space-y-2">
            <div className="flex items-start">
              <span className="font-bold mr-2">✅</span>
              <span>Dashboard harus load tanpa error "Unable to Load Dashboard"</span>
            </div>
            <div className="flex items-start">
              <span className="font-bold mr-2">✅</span>
              <span>Menampilkan statistik: 8 produk, 2 pemasok, 3 transaksi</span>
            </div>
            <div className="flex items-start">
              <span className="font-bold mr-2">✅</span>
              <span>Menampilkan low stock alerts (2 produk)</span>
            </div>
            <div className="flex items-start">
              <span className="font-bold mr-2">✅</span>
              <span>Menampilkan recent activity (3 aktivitas)</span>
            </div>
            <div className="flex items-start">
              <span className="font-bold mr-2">✅</span>
              <span>Tombol refresh berfungsi</span>
            </div>
            <div className="flex items-start">
              <span className="font-bold mr-2">✅</span>
              <span>Badge "Demo" muncul jika dalam demo mode</span>
            </div>
          </div>
        </div>

        {/* Login Options */}
        {!session?.isAuthenticated && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-800 mb-4">⚠️ Login Required</h2>
            <p className="text-yellow-700 mb-4">
              Anda perlu login terlebih dahulu untuk menguji dashboard.
            </p>
            <div className="space-y-3">
              <a 
                href="/quick-login" 
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-3"
              >
                Quick Login (Demo)
              </a>
              <a 
                href="/login" 
                className="inline-block px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Regular Login
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}