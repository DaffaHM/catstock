import { authenticateUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Force Login - CatStock',
  description: 'Force login for testing'
}

async function forceLogin() {
  'use server'
  
  console.log('[ForceLogin] Starting force login')
  
  try {
    const result = await authenticateUser('owner@catstock.com', 'admin123')
    console.log('[ForceLogin] Auth result:', result)
    
    if (result.success) {
      console.log('[ForceLogin] Login successful, redirecting to dashboard')
      redirect('/dashboard')
    } else {
      console.log('[ForceLogin] Login failed:', result.error)
      redirect('/force-login?error=' + encodeURIComponent(result.error))
    }
  } catch (error) {
    console.error('[ForceLogin] Error:', error)
    // Don't redirect on error, just return error state
    return { error: 'Force login failed: ' + error.message }
  }
}

export default async function ForceLoginPage({ searchParams }) {
  const error = searchParams?.error

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Force Login Test</h1>
      
      <div className="bg-white p-6 rounded-lg border">
        <p className="mb-4">This will force login with hardcoded credentials and redirect to session check:</p>
        <ul className="list-disc list-inside mb-6 space-y-1">
          <li>Email: owner@catstock.com</li>
          <li>Password: admin123</li>
        </ul>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            Error: {error}
          </div>
        )}
        
        <form action={forceLogin}>
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700"
          >
            Force Login & Check Session
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <a href="/session-check" className="text-blue-600 hover:underline">
            Check Session Status
          </a>
        </div>
      </div>
    </div>
  )
}