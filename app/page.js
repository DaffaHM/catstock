import { getSession } from '@/lib/auth'

export default async function HomePage() {
  const session = await getSession()
  
  if (!session?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-2xl mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">CatStock</h1>
          <p className="text-lg text-gray-600 mb-8">Paint Store Inventory Management</p>
          <a 
            href="/login" 
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Sign In
          </a>
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">CatStock</h1>
        <p className="text-lg text-gray-600 mb-4">Welcome back, {session.user.name}!</p>
        <p className="text-gray-600 mb-8">Paint Store Inventory Management</p>
        <a 
          href="/dashboard" 
          className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  )
}