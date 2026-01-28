import { authenticateUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Manual Login Test - CatStock',
  description: 'Manual login test'
}

async function testLogin() {
  'use server'
  
  console.log('[ManualTest] Starting manual login test')
  
  try {
    const result = await authenticateUser('owner@catstock.com', 'admin123')
    console.log('[ManualTest] Auth result:', result)
    
    if (result.success) {
      console.log('[ManualTest] Login successful, redirecting to dashboard')
      redirect('/dashboard')
    } else {
      console.log('[ManualTest] Login failed:', result.error)
      redirect('/manual-login-test?error=' + encodeURIComponent(result.error))
    }
  } catch (error) {
    console.error('[ManualTest] Error:', error)
    redirect('/manual-login-test?error=' + encodeURIComponent('Login test failed'))
  }
}

export default async function ManualLoginTestPage({ searchParams }) {
  const error = searchParams?.error

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manual Login Test</h1>
      
      <div className="bg-white p-6 rounded-lg border">
        <p className="mb-4">This will test the authentication system with hardcoded credentials:</p>
        <ul className="list-disc list-inside mb-6 space-y-1">
          <li>Email: owner@catstock.com</li>
          <li>Password: admin123</li>
        </ul>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            Error: {error}
          </div>
        )}
        
        <form action={testLogin}>
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700"
          >
            Test Login
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <a href="/test-auth" className="text-blue-600 hover:underline">
            Check Auth Status
          </a>
        </div>
      </div>
    </div>
  )
}