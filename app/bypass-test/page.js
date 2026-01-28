import { getSession } from '@/lib/auth'

export const metadata = {
  title: 'Bypass Test - CatStock',
  description: 'Bypass middleware test'
}

export default async function BypassTestPage() {
  const session = await getSession()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Bypass Middleware Test</h1>
      
      <div className="space-y-6">
        {/* Session Status */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Session Status</h2>
          {session?.isAuthenticated ? (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">✅ Authenticated</p>
              <div className="bg-gray-100 p-4 rounded">
                <p><strong>User:</strong> {session.user.email}</p>
                <p><strong>Name:</strong> {session.user.name}</p>
                <p><strong>ID:</strong> {session.user.id}</p>
              </div>
            </div>
          ) : (
            <p className="text-red-600 font-medium">❌ Not Authenticated</p>
          )}
        </div>

        {/* Navigation Test - Bypass Middleware */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Navigation Test (Bypass Middleware)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <a href="/bypass-dashboard" className="block p-4 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-center font-medium">
              Dashboard
            </a>
            <a href="/bypass-products" className="block p-4 bg-green-100 text-green-800 rounded hover:bg-green-200 text-center font-medium">
              Products
            </a>
            <a href="/bypass-suppliers" className="block p-4 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 text-center font-medium">
              Suppliers
            </a>
            <a href="/bypass-reports" className="block p-4 bg-orange-100 text-orange-800 rounded hover:bg-orange-200 text-center font-medium">
              Reports
            </a>
            <a href="/bypass-stock-in" className="block p-4 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 text-center font-medium">
              Stock In
            </a>
            <a href="/bypass-settings" className="block p-4 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-center font-medium">
              Settings
            </a>
          </div>
        </div>

        {/* Login */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Authentication</h2>
          <a href="/simple-login" className="block p-4 bg-blue-600 text-white rounded hover:bg-blue-700 text-center font-medium">
            Go to Simple Login
          </a>
        </div>
      </div>
    </div>
  )
}