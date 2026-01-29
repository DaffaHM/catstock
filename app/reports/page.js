import { getSession } from '@/lib/auth'
import { getQuickSession } from '@/lib/auth-quick'
import SimpleNavLayout from '@/components/layout/SimpleNavLayout'
import CurrentStockReportPage from '@/components/reports/CurrentStockReportPage'
import ReportsNavigation from '@/components/reports/ReportsNavigation'

export const metadata = {
  title: 'Laporan - CatStock',
  description: 'Laporan inventori CatStock',
}

export default async function ReportsPage() {
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
      console.log('[Reports] Auth failed:', authError.message)
    }
  }

  if (!session?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Diperlukan Autentikasi</h2>
          <p className="text-gray-600 mb-6">Silakan masuk untuk mengakses halaman laporan.</p>
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
    <SimpleNavLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Laporan</h1>
          <p className="text-gray-600">Kelola dan lihat berbagai laporan bisnis Anda</p>
        </div>
        
        <ReportsNavigation />
        <CurrentStockReportPage session={session} isDemoMode={isDemoMode} />
      </div>
    </SimpleNavLayout>
  )
}