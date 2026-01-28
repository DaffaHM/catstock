import { getSession } from '@/lib/auth'
import { getQuickSession } from '@/lib/auth-quick'
import ReturnsPage from '@/components/transactions/ReturnsPage'

export const metadata = {
  title: 'Retur - CatStock',
  description: 'Proses transaksi retur',
}

export default async function Returns() {
  let session = null
  
  // Try quick authentication first (for demo mode)
  try {
    session = await getQuickSession()
    console.log('[Returns] Quick auth result:', !!session?.isAuthenticated)
  } catch (error) {
    console.log('[Returns] Quick auth failed, trying regular auth')
  }
  
  // If quick auth failed, try regular JWT authentication
  if (!session?.isAuthenticated) {
    try {
      session = await getSession()
      console.log('[Returns] Regular auth result:', !!session?.isAuthenticated)
    } catch (error) {
      console.log('[Returns] Regular auth also failed')
    }
  }
  
  if (!session?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Diperlukan Autentikasi</h2>
          <p className="text-gray-600 mb-6">Silakan masuk untuk mengakses retur.</p>
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

  return <ReturnsPage />
}