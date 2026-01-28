import { getSession } from '@/lib/auth'
import ReturnsPage from '@/components/transactions/ReturnsPage'

export const metadata = {
  title: 'Returns - CatStock',
  description: 'Process return transactions',
}

export default async function Returns() {
  // Check authentication manually to avoid redirect loops
  const session = await getSession()
  
  if (!session?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access returns.</p>
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

  return <ReturnsPage />
}