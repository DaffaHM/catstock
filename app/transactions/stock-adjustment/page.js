import { getSession } from '@/lib/auth'
import StockAdjustmentPage from '@/components/transactions/StockAdjustmentPage'

export const metadata = {
  title: 'Stock Adjustment - CatStock',
  description: 'Adjust inventory levels based on physical counts'
}

export default async function StockAdjustmentRoute() {
  // Check authentication manually to avoid redirect loops
  const session = await getSession()
  
  if (!session?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access stock adjustments.</p>
          <a 
            href="/login" 
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  return <StockAdjustmentPage />
}