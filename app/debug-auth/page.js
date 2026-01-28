import { prisma } from '@/lib/prisma'

export const metadata = {
  title: 'Debug Auth - CatStock',
  description: 'Debug authentication issues'
}

export default async function DebugAuthPage() {
  let debugInfo = {
    databaseConnected: false,
    userExists: false,
    userCount: 0,
    error: null
  }

  try {
    // Test database connection
    await prisma.$connect()
    debugInfo.databaseConnected = true

    // Check if user exists
    const userCount = await prisma.user.count()
    debugInfo.userCount = userCount

    const user = await prisma.user.findUnique({
      where: { email: 'owner@catstock.com' },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })

    debugInfo.userExists = !!user
    debugInfo.user = user

  } catch (error) {
    debugInfo.error = error.message
  } finally {
    await prisma.$disconnect()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔍 Debug Authentication</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Database Status</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="font-medium w-40">Database Connected:</span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                debugInfo.databaseConnected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {debugInfo.databaseConnected ? '✅ Connected' : '❌ Failed'}
              </span>
            </div>
            
            <div className="flex items-center">
              <span className="font-medium w-40">Total Users:</span>
              <span className="text-gray-700">{debugInfo.userCount}</span>
            </div>
            
            <div className="flex items-center">
              <span className="font-medium w-40">Owner User Exists:</span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                debugInfo.userExists 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {debugInfo.userExists ? '✅ Exists' : '❌ Not Found'}
              </span>
            </div>
          </div>
        </div>

        {debugInfo.user && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">User Details</h2>
            <div className="space-y-2">
              <div><strong>ID:</strong> {debugInfo.user.id}</div>
              <div><strong>Email:</strong> {debugInfo.user.email}</div>
              <div><strong>Name:</strong> {debugInfo.user.name}</div>
              <div><strong>Created:</strong> {new Date(debugInfo.user.createdAt).toLocaleString()}</div>
            </div>
          </div>
        )}

        {debugInfo.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-red-800 mb-4">❌ Error</h2>
            <pre className="text-red-700 text-sm overflow-auto">{debugInfo.error}</pre>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">🔧 Solutions</h2>
          
          {!debugInfo.databaseConnected && (
            <div className="mb-4">
              <h3 className="font-semibold text-blue-700">Database Connection Failed:</h3>
              <ul className="list-disc list-inside text-blue-600 mt-2">
                <li>Check DATABASE_URL environment variable</li>
                <li>Ensure PostgreSQL database is running</li>
                <li>Verify database credentials</li>
              </ul>
            </div>
          )}

          {debugInfo.databaseConnected && !debugInfo.userExists && (
            <div className="mb-4">
              <h3 className="font-semibold text-blue-700">User Not Found:</h3>
              <ul className="list-disc list-inside text-blue-600 mt-2">
                <li>Run database seed: <code className="bg-blue-100 px-2 py-1 rounded">npm run seed</code></li>
                <li>Or manually create user in database</li>
              </ul>
            </div>
          )}

          {debugInfo.databaseConnected && debugInfo.userExists && (
            <div className="mb-4">
              <h3 className="font-semibold text-green-700">✅ Database and User OK</h3>
              <p className="text-green-600 mt-2">
                Database connection and user exist. Login should work with:
              </p>
              <div className="bg-green-100 p-3 rounded mt-2">
                <div><strong>Email:</strong> owner@catstock.com</div>
                <div><strong>Password:</strong> admin123</div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-semibold text-blue-700">Quick Actions:</h3>
            <div className="flex gap-4 mt-2">
              <a 
                href="/login" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Login Again
              </a>
              <a 
                href="/test-indonesia" 
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Test Page
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}