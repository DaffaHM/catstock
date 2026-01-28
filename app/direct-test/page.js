import { getSession } from '@/lib/auth'

export const metadata = {
  title: 'Direct Test - CatStock',
  description: 'Direct navigation test'
}

export default async function DirectTestPage() {
  const session = await getSession()

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Direct Navigation Test</h1>
      
      <div className="space-y-4">
        {/* Session Status */}
        <div className="bg-white p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Session Status</h2>
          {session?.isAuthenticated ? (
            <div className="text-green-600">
              <p>✅ Authenticated as: {session.user.email}</p>
            </div>
          ) : (
            <p className="text-red-600">❌ Not authenticated</p>
          )}
        </div>

        {/* Direct Navigation Links */}
        <div className="bg-white p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Direct Navigation Test</h2>
          <div className="grid grid-cols-2 gap-2">
            <a href="/dashboard" className="block p-3 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-center">
              Dashboard
            </a>
            <a href="/products" className="block p-3 bg-green-100 text-green-800 rounded hover:bg-green-200 text-center">
              Products
            </a>
            <a href="/suppliers" className="block p-3 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 text-center">
              Suppliers
            </a>
            <a href="/reports" className="block p-3 bg-orange-100 text-orange-800 rounded hover:bg-orange-200 text-center">
              Reports
            </a>
            <a href="/transactions/stock-in" className="block p-3 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 text-center">
              Stock In
            </a>
            <a href="/transactions/stock-out" className="block p-3 bg-red-100 text-red-800 rounded hover:bg-red-200 text-center">
              Stock Out
            </a>
            <a href="/settings" className="block p-3 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-center">
              Settings
            </a>
            <a href="/transactions/returns" className="block p-3 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 text-center">
              Returns
            </a>
          </div>
        </div>

        {/* Login Link */}
        <div className="bg-white p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Authentication</h2>
          <a href="/simple-login" className="block p-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-center">
            Go to Simple Login
          </a>
        </div>
      </div>
    </div>
  )
}