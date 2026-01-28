import { getSession } from '@/lib/auth'
import { getQuickSession } from '@/lib/auth-quick'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Pengaturan - CatStock',
  description: 'Pengaturan aplikasi dan preferensi',
}

export default async function SettingsPage() {
  let session = null
  
  // Try quick authentication first (for demo mode)
  try {
    session = await getQuickSession()
    console.log('[Settings] Quick auth result:', !!session?.isAuthenticated)
  } catch (error) {
    console.log('[Settings] Quick auth failed, trying regular auth')
  }
  
  // If quick auth failed, try regular JWT authentication
  if (!session?.isAuthenticated) {
    try {
      session = await getSession()
      console.log('[Settings] Regular auth result:', !!session?.isAuthenticated)
    } catch (error) {
      console.log('[Settings] Regular auth also failed')
    }
  }
  
  if (!session?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Diperlukan Autentikasi</h2>
          <p className="text-gray-600 mb-6">Silakan masuk untuk mengakses pengaturan.</p>
          <div className="space-y-3">
            <a 
              href="/quick-login" 
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-3"
            >
              Quick Login (Demo)
            </a>
            <a 
              href="/login" 
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Login Regular
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pengaturan</h1>
        <p className="text-gray-600">Kelola preferensi aplikasi dan pengaturan akun Anda</p>
      </div>

      <div className="space-y-6">
        {/* Account Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Akun</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama
              </label>
              <p className="text-gray-900">{session.user.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="text-gray-900">{session.user.email}</p>
            </div>
          </div>
        </div>

        {/* Application Preferences */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferensi Aplikasi</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mata Uang Default
              </label>
              <select className="w-full h-12 px-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option value="IDR">IDR (Rp)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batas Stok Minimum
              </label>
              <input
                type="number"
                defaultValue="10"
                className="w-full h-12 px-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Masukkan tingkat stok minimum"
              />
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Manajemen Data</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Ekspor Data</h3>
                <p className="text-sm text-gray-600">Unduh data inventori Anda sebagai CSV</p>
              </div>
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors min-h-[44px]">
                Ekspor
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Backup Database</h3>
                <p className="text-sm text-gray-600">Buat backup data Anda</p>
              </div>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors min-h-[44px]">
                Backup
              </button>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Sistem</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Versi:</span>
              <span className="ml-2 text-gray-900">1.0.0</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Terakhir Diperbarui:</span>
              <span className="ml-2 text-gray-900">{new Date().toLocaleDateString('id-ID')}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Database:</span>
              <span className="ml-2 text-gray-900">Terhubung</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Environment:</span>
              <span className="ml-2 text-gray-900">{process.env.NODE_ENV}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}