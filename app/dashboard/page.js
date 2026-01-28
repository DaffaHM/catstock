import { getSession } from '@/lib/auth'
import { getQuickSession } from '@/lib/auth-quick'
import DashboardContent from '@/components/dashboard/DashboardContent'
import { testDatabaseConnection } from '@/lib/prisma'

export const metadata = {
  title: 'Dasbor - CatStock',
  description: 'Dasbor manajemen inventori CatStock',
}

// Error boundary component for dashboard
function DashboardError({ error, retry }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Terjadi Kesalahan</h2>
        <p className="text-gray-600 mb-6">
          Maaf, terjadi kesalahan saat memuat dashboard. Silakan coba lagi.
        </p>
        <div className="space-y-3">
          <button 
            onClick={retry}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-3"
          >
            Coba Lagi
          </button>
          <a 
            href="/quick-login" 
            className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Login Ulang
          </a>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">Detail Error (Development)</summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
              {error?.message || 'Unknown error'}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  let session = null
  let isDemoMode = false
  let error = null
  
  try {
    // Test database connection first
    const dbConnected = await testDatabaseConnection()
    if (!dbConnected) {
      console.log('[Dashboard] Database not available, using demo mode')
      isDemoMode = true
    }
    
    // Try quick authentication first (for demo mode)
    try {
      session = await getQuickSession()
      if (session?.isAuthenticated) {
        isDemoMode = true
        console.log('[Dashboard] Using demo mode with quick session')
      }
    } catch (quickAuthError) {
      console.log('[Dashboard] Quick auth failed:', quickAuthError.message)
    }
    
    // If quick auth failed, try regular JWT authentication
    if (!session?.isAuthenticated && dbConnected) {
      try {
        session = await getSession()
        console.log('[Dashboard] Regular auth result:', !!session?.isAuthenticated)
      } catch (authError) {
        console.log('[Dashboard] Regular auth failed:', authError.message)
        error = authError
      }
    }
    
    // Handle authentication manually to avoid redirect loops
    if (!session?.isAuthenticated) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Diperlukan Autentikasi</h2>
            <p className="text-gray-600 mb-6">Silakan masuk untuk mengakses dasbor.</p>
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
            {error && process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left max-w-md mx-auto">
                <summary className="cursor-pointer text-sm text-gray-500">Detail Error (Development)</summary>
                <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                  {error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return <DashboardContent session={session} isDemoMode={isDemoMode} />
    
  } catch (criticalError) {
    console.error('[Dashboard] Critical error:', criticalError)
    
    return (
      <DashboardError 
        error={criticalError} 
        retry={() => {
          if (typeof window !== 'undefined') {
            window.location.reload()
          }
        }} 
      />
    )
  }
}