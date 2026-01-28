import { getSession } from '@/lib/auth'
import { cookies } from 'next/headers'

export const metadata = {
  title: 'Auth Test - CatStock',
  description: 'Test authentication system'
}

export default async function TestAuthPage() {
  const session = await getSession()
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('catstock-session')
  const allCookies = cookieStore.getAll()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Test</h1>
      
      <div className="space-y-6">
        {/* Current Session */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Current Session</h2>
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

        {/* Session Cookie */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Session Cookie</h2>
          {sessionCookie ? (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">✅ Cookie Found</p>
              <div className="bg-gray-100 p-4 rounded">
                <p><strong>Name:</strong> {sessionCookie.name}</p>
                <p><strong>Value Length:</strong> {sessionCookie.value.length}</p>
                <p><strong>Preview:</strong> {sessionCookie.value.substring(0, 100)}...</p>
              </div>
            </div>
          ) : (
            <p className="text-red-600 font-medium">❌ No Session Cookie</p>
          )}
        </div>

        {/* All Cookies */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">All Cookies ({allCookies.length})</h2>
          {allCookies.length > 0 ? (
            <div className="space-y-2">
              {allCookies.map((cookie, index) => (
                <div key={index} className="bg-gray-100 p-3 rounded">
                  <p><strong>{cookie.name}:</strong> {cookie.value.substring(0, 50)}...</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No cookies found</p>
          )}
        </div>

        {/* Test Links */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Test Navigation</h2>
          <div className="space-y-2">
            <a href="/simple-login" className="block p-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
              Simple Login Page
            </a>
            <a href="/login" className="block p-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
              Regular Login Page
            </a>
            <a href="/dashboard" className="block p-2 bg-green-100 text-green-800 rounded hover:bg-green-200">
              Dashboard (requires auth)
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}