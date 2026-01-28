import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'

export const metadata = {
  title: 'Debug Session - CatStock',
  description: 'Debug session and cookies'
}

export default async function DebugSessionPage() {
  const session = await getSession()
  const cookieStore = cookies()
  const allCookies = cookieStore.getAll()
  const sessionCookie = cookieStore.get('catstock-session')

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Session Debug</h1>
      
      <div className="space-y-6">
        {/* Session Status */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Session Status</h2>
          {session ? (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">✅ Session Valid</p>
              <div className="bg-gray-100 p-4 rounded">
                <pre className="text-sm">{JSON.stringify(session, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <p className="text-red-600 font-medium">❌ No Valid Session</p>
          )}
        </div>

        {/* Session Cookie */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Session Cookie</h2>
          {sessionCookie ? (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">✅ Session Cookie Found</p>
              <div className="bg-gray-100 p-4 rounded">
                <p><strong>Name:</strong> {sessionCookie.name}</p>
                <p><strong>Value Length:</strong> {sessionCookie.value.length} characters</p>
                <p><strong>Value Preview:</strong> {sessionCookie.value.substring(0, 50)}...</p>
              </div>
            </div>
          ) : (
            <p className="text-red-600 font-medium">❌ No Session Cookie Found</p>
          )}
        </div>

        {/* All Cookies */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">All Cookies ({allCookies.length})</h2>
          {allCookies.length > 0 ? (
            <div className="space-y-2">
              {allCookies.map((cookie, index) => (
                <div key={index} className="bg-gray-100 p-3 rounded">
                  <p><strong>{cookie.name}:</strong> {cookie.value.substring(0, 100)}{cookie.value.length > 100 ? '...' : ''}</p>
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
            <a href="/login" className="block p-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
              Go to Login
            </a>
            <a href="/dashboard" className="block p-2 bg-green-100 text-green-800 rounded hover:bg-green-200">
              Go to Dashboard (should redirect to login if no session)
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}