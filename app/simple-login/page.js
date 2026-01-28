import { getSession, authenticateUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Simple Login - CatStock',
  description: 'Simple login page'
}

async function handleLogin(formData) {
  'use server'
  
  const email = formData.get('email')
  const password = formData.get('password')
  
  console.log('[SimpleLogin] Login attempt for:', email)
  
  if (!email || !password) {
    redirect('/simple-login?error=missing')
  }
  
  const result = await authenticateUser(email, password)
  
  if (result.error) {
    console.log('[SimpleLogin] Failed:', result.error)
    redirect('/simple-login?error=invalid')
  }
  
  console.log('[SimpleLogin] Success, redirecting to dashboard')
  redirect('/dashboard')
}

export default async function SimpleLoginPage({ searchParams }) {
  const session = await getSession()
  
  if (session?.isAuthenticated) {
    redirect('/dashboard')
  }
  
  const error = searchParams?.error

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CatStock</h1>
          <p className="text-gray-600">Paint Store Inventory Management</p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6">Sign In</h2>
          
          {error === 'missing' && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              Email and password are required
            </div>
          )}
          
          {error === 'invalid' && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              Invalid email or password
            </div>
          )}
          
          <form action={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="owner@catstock.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin123"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Sign In
            </button>
          </form>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            Test: owner@catstock.com / admin123
          </div>
        </div>
      </div>
    </div>
  )
}