import { loginAction } from '@/lib/actions/auth'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DirectLoginPage() {
  const session = await getSession()
  
  // If already authenticated, redirect to working test
  if (session?.isAuthenticated) {
    redirect('/working-test')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-8">Direct Login</h1>
          
          <form action={loginAction} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                defaultValue="owner@catstock.com"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                defaultValue="admin123"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Test Links</h3>
            <div className="space-y-2">
              <a href="/working-test" className="block w-full bg-green-100 text-green-800 py-2 px-4 rounded text-center hover:bg-green-200">
                Working Test Page
              </a>
              <a href="/quick-login" className="block w-full bg-blue-100 text-blue-800 py-2 px-4 rounded text-center hover:bg-blue-200">
                Quick Login Page
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}