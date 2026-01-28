import { getSession } from '@/lib/auth'
import { getQuickSession } from '@/lib/auth-quick'
import StockOutPage from '@/components/transactions/StockOutPage'

export const metadata = {
  title: 'Stok Keluar - CatStock',
  description: 'Proses inventori keluar dan penjualan'
}

export default async function StockOutTransactionPage() {
  let session = null
  
  // Try quick authentication first (for demo mode)
  try {
    session = await getQuickSession()
    console.log('[Stock Out] Quick auth result:', !!session?.isAuthenticated)
  } catch (error) {
    console.log('[Stock Out] Quick auth failed, trying regular auth')
  }
  
  // If quick auth failed, try regular JWT authentication
  if (!session?.isAuthenticated) {
    try {
      session = await getSession()
      console.log('[Stock Out] Regular auth result:', !!session?.isAuthenticated)
    } catch (error) {
      console.log('[Stock Out] Regular auth also failed')
    }
  }
  
  if (!session?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Diperlukan Autentikasi</h2>
          <p className="text-gray-600 mb-6">Silakan masuk untuk mengakses transaksi stok.</p>
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

  return <StockOutPage />
}