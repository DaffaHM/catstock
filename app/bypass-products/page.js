import { getSession } from '@/lib/auth'

export const metadata = {
  title: 'Bypass Products - CatStock',
  description: 'Bypass products test'
}

export default async function BypassProductsPage() {
  const session = await getSession()

  if (!session?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access products.</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Products (Bypass)</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {session.user.name}</span>
            <a href="/bypass-dashboard" className="text-blue-600 hover:underline">Dashboard</a>
            <a href="/bypass-test" className="text-blue-600 hover:underline">Back to Test</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Products Management</h2>
            <p className="text-gray-600">This is the bypass products page. Navigation is working!</p>
          </div>

          {/* Sample Products */}
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Product List</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold">Paint Product 1</h4>
                  <p className="text-sm text-gray-600">Category: Interior Paint</p>
                  <p className="text-sm text-gray-600">Stock: 50 units</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold">Paint Product 2</h4>
                  <p className="text-sm text-gray-600">Category: Exterior Paint</p>
                  <p className="text-sm text-gray-600">Stock: 30 units</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold">Paint Product 3</h4>
                  <p className="text-sm text-gray-600">Category: Primer</p>
                  <p className="text-sm text-gray-600">Stock: 25 units</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-6 bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Quick Navigation</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/bypass-dashboard" className="block p-3 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-center">
                Dashboard
              </a>
              <a href="/bypass-suppliers" className="block p-3 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 text-center">
                Suppliers
              </a>
              <a href="/bypass-reports" className="block p-3 bg-orange-100 text-orange-800 rounded hover:bg-orange-200 text-center">
                Reports
              </a>
              <a href="/bypass-settings" className="block p-3 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-center">
                Settings
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}