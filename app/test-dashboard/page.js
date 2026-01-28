import { getSession } from '@/lib/auth'

export const metadata = {
  title: 'Test Dashboard - CatStock',
  description: 'Test dashboard to debug navigation issues'
}

export default async function TestDashboardPage() {
  console.log('[TestDashboard] Page loading...')
  
  let session
  try {
    session = await getSession()
    console.log('[TestDashboard] Session check result:', session ? 'authenticated' : 'not authenticated')
  } catch (error) {
    console.error('[TestDashboard] Session check error:', error)
  }

  if (!session?.isAuthenticated) {
    console.log('[TestDashboard] Not authenticated, showing login prompt')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access the dashboard.</p>
          <a 
            href="/login" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  console.log('[TestDashboard] Authenticated, rendering dashboard')
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Test Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {session.user.name}</span>
            <a href="/nav-test" className="text-blue-600 hover:underline">Navigation Test</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Dashboard is Working!</h2>
            <p className="text-gray-600">This page loaded successfully with authentication.</p>
          </div>

          {/* Navigation Test */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Navigation Test</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/products" className="block p-4 bg-green-100 text-green-800 rounded hover:bg-green-200 text-center">
                Products
              </a>
              <a href="/suppliers" className="block p-4 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 text-center">
                Suppliers
              </a>
              <a href="/reports" className="block p-4 bg-orange-100 text-orange-800 rounded hover:bg-orange-200 text-center">
                Reports
              </a>
              <a href="/settings" className="block p-4 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-center">
                Settings
              </a>
            </div>
          </div>

          {/* Session Info */}
          <div className="bg-white p-6 rounded-lg border mt-6">
            <h3 className="text-lg font-semibold mb-4">Session Information</h3>
            <div className="space-y-2">
              <p><strong>User:</strong> {session.user.email}</p>
              <p><strong>Name:</strong> {session.user.name}</p>
              <p><strong>ID:</strong> {session.user.id}</p>
              <p><strong>Authenticated:</strong> {session.isAuthenticated ? '✅ Yes' : '❌ No'}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}