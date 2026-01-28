import { getSession } from '@/lib/auth'
import { getQuickSession } from '@/lib/auth-quick'

export default async function HomePage() {
  // Try both authentication methods
  let session = null
  
  try {
    session = await getQuickSession()
  } catch (error) {
    try {
      session = await getSession()
    } catch (error2) {
      // Both failed, show login options
    }
  }
  
  if (!session?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-2xl mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🎨 CatStock</h1>
          <p className="text-lg text-gray-600 mb-8">Sistem Manajemen Inventori Toko Cat</p>
          
          <div className="space-y-4">
            <a 
              href="/login" 
              className="block w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              🔐 Masuk ke Sistem
            </a>
            
            <a 
              href="/quick-login" 
              className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🚀 Quick Login (Demo)
            </a>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Mode Demo</h3>
            <p className="text-blue-700 text-sm mb-2">
              Untuk testing tanpa database PostgreSQL
            </p>
            <div className="text-blue-600 text-sm">
              <div><strong>Email:</strong> owner@catstock.com</div>
              <div><strong>Password:</strong> admin123</div>
            </div>
          </div>
          
          <div className="mt-6 space-y-2">
            <p className="text-sm text-gray-500">
              Dioptimalkan untuk iPad Pro 11&quot; • Antarmuka ramah sentuh
            </p>
            <div className="flex justify-center space-x-4">
              <a href="/tutorial" className="text-blue-600 hover:underline text-sm">Tutorial</a>
              <a href="/debug-auth" className="text-gray-500 hover:underline text-sm">Debug</a>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Show dashboard link for authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-2xl mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🎨 CatStock</h1>
        <p className="text-lg text-gray-600 mb-4">Selamat datang kembali, {session.user.name}!</p>
        <p className="text-gray-600 mb-8">Sistem Manajemen Inventori Toko Cat</p>
        <a 
          href="/dashboard" 
          className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Ke Dashboard
        </a>
      </div>
    </div>
  )
}