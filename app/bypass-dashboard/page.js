import { getSession } from '@/lib/auth'

export const metadata = {
  title: 'Bypass Dashboard - CatStock',
  description: 'Bypass dashboard test'
}

export default async function BypassDashboardPage() {
  const session = await getSession()

  if (!session?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access the dashboard.</p>
          <a 
            href="/simple-login" 
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">CatStock Dashboard (Bypass)</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {session.user.name}</span>
            <a href="/bypass-test" className="text-blue-600 hover:underline">Back to Test</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Dashboard Content</h2>
            <p className="text-gray-600">This is the bypass dashboard page. Navigation is working!</p>
          </div>

          {/* Quick Navigation */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Quick Navigation</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/bypass-products" className="block p-4 bg-green-100 text-green-800 rounded hover:bg-green-200 text-center">
                Products
              </a>
              <a href="/bypass-suppliers" className="block p-4 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 text-center">
                Suppliers
              </a>
              <a href="/bypass-reports" className="block p-4 bg-orange-100 text-orange-800 rounded hover:bg-orange-200 text-center">
                Reports
              </a>
              <a href="/bypass-settings" className="block p-4 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-center">
                Settings
              </a>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white p-6 rounded-lg border">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Total Products</h4>
              <p className="text-3xl font-bold text-blue-600">8</p>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Suppliers</h4>
              <p className="text-3xl font-bold text-green-600">2</p>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Transactions</h4>
              <p className="text-3xl font-bold text-purple-600">3</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}