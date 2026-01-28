import { getSession } from '@/lib/auth'
import { getQuickSession } from '@/lib/auth-quick'
import DashboardContent from '@/components/dashboard/DashboardContent'

export const metadata = {
  title: 'Dasbor - CatStock',
  description: 'Dasbor manajemen inventori CatStock',
}

export default async function DashboardPage() {
  let session = null
  let isDemoMode = false
  
  // Try quick authentication first (for demo mode)
  try {
    session = await getQuickSession()
    if (session?.isAuthenticated) {
      isDemoMode = true
      console.log('[Dashboard] Using demo mode with quick session')
    }
  } catch (error) {
    console.log('[Dashboard] Quick auth failed, trying regular auth')
  }
  
  // If quick auth failed, try regular JWT authentication
  if (!session?.isAuthenticated) {
    try {
      session = await getSession()
      console.log('[Dashboard] Regular auth result:', !!session?.isAuthenticated)
    } catch (error) {
      console.log('[Dashboard] Regular auth also failed')
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
        </div>
      </div>
    )
  }

  return <DashboardContent session={session} isDemoMode={isDemoMode} />
}