import { getSession } from '@/lib/auth'
import { getQuickSession } from '@/lib/auth-quick'

export const metadata = {
  title: 'Pengaturan - CatStock',
  description: 'Pengaturan aplikasi CatStock',
}

export default async function SettingsPage() {
  let session = null
  let isDemoMode = false
  
  // Try authentication
  try {
    session = await getQuickSession()
    if (session?.isAuthenticated) {
      isDemoMode = true
    }
  } catch (error) {
    try {
      session = await getSession()
    } catch (authError) {
      console.log('[Settings] Auth failed:', authError.message)
    }
  }

  if (!session?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Diperlukan Autentikasi</h2>
          <p className="text-gray-600 mb-6">Silakan masuk untuk mengakses pengaturan.</p>
          <a 
            href="/quick-login" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Pengaturan {isDemoMode && <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">Demo</span>}
          </h1>
          
          <div className="space-y-6">
            {/* User Info */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pengguna</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
                  <input 
                    type="text" 
                    value={session.user.name} 
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    value={session.user.email} 
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            </div>
            
            {/* Application Settings */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pengaturan Aplikasi</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mata Uang</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="IDR">Rupiah (IDR)</option>
                    <option value="USD">US Dollar (USD)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bahasa</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="id">Bahasa Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* System Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Sistem</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Mode:</span> {isDemoMode ? 'Demo' : 'Production'}
                  </div>
                  <div>
                    <span className="font-medium">Versi:</span> 1.0.0
                  </div>
                  <div>
                    <span className="font-medium">Environment:</span> {process.env.NODE_ENV}
                  </div>
                  <div>
                    <span className="font-medium">Build:</span> {new Date().toLocaleDateString('id-ID')}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex justify-between pt-6">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Simpan Pengaturan
              </button>
              <a 
                href="/quick-login" 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}