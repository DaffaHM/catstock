import { getSession } from '@/lib/auth'
import { cookies } from 'next/headers'

export const metadata = {
  title: 'Session Check - CatStock',
  description: 'Check session status'
}

export default async function SessionCheckPage() {
  const session = await getSession()
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('catstock-session')

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Session Status</h1>
      
      <div className="space-y-4">
        {/* Session Status */}
        <div className="bg-white p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
          {session?.isAuthenticated ? (
            <div className="text-green-600">
              <p>✅ Authenticated as: {session.user.email}</p>
              <p>User ID: {session.user.id}</p>
            </div>
          ) : (
            <p className="text-red-600">❌ Not authenticated</p>
          )}
        </div>

        {/* Cookie Status */}
        <div className="bg-white p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Cookie Status</h2>
          {sessionCookie ? (
            <div className="text-green-600">
              <p>✅ Session cookie found</p>
              <p className="text-sm text-gray-600">Length: {sessionCookie.value.length} characters</p>
            </div>
          ) : (
            <p className="text-red-600">❌ No session cookie</p>
          )}
        </div>

        {/* Navigation Test */}
        <div className="bg-white p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Navigation Test</h2>
          <div className="space-y-2">
            <a href="/dashboard" className="block p-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
              Go to Dashboard
            </a>
            <a href="/products" className="block p-2 bg-green-100 text-green-800 rounded hover:bg-green-200">
              Go to Products
            </a>
            <a href="/login" className="block p-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200">
              Go to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}