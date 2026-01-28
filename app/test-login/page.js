import { authenticateUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Test Login - CatStock',
  description: 'Test login with immediate redirect'
}

async function testLogin() {
  'use server'
  
  console.log('[TestLogin] Starting test login')
  
  const result = await authenticateUser('owner@catstock.com', 'admin123')
  console.log('[TestLogin] Auth result:', result)
  
  if (result.success) {
    console.log('[TestLogin] Login successful, redirecting to bypass-test')
    redirect('/bypass-test')
  } else {
    console.log('[TestLogin] Login failed:', result.error)
    redirect('/test-login?error=' + encodeURIComponent(result.error))
  }
}

export default async function TestLoginPage({ searchParams }) {
  const error = searchParams?.error

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Login</h1>
          <p className="text-gray-600">Automatic login with owner@catstock.com</p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6">Auto Login Test</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              Error: {error}
            </div>
          )}
          
          <form action={testLogin} className="space-y-4">
            <div className="text-center text-sm text-gray-600 mb-4">
              <p>This will automatically login with:</p>
              <p><strong>Email:</strong> owner@catstock.com</p>
              <p><strong>Password:</strong> admin123</p>
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Auto Login & Test
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <a href="/bypass-test" className="text-blue-600 hover:underline text-sm">
              Go to Bypass Test (without login)
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}