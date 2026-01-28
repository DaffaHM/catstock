'use client'

import { useState } from 'react'

export default function QuickLoginPage() {
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus('Logging in...')

    try {
      const formData = new FormData()
      formData.append('email', 'owner@catstock.com')
      formData.append('password', 'admin123')

      const response = await fetch('/login', {
        method: 'POST',
        body: formData
      })

      if (response.redirected) {
        setStatus('✅ Login successful! Redirecting...')
        window.location.href = response.url
      } else {
        const result = await response.text()
        setStatus(`❌ Login failed: ${result}`)
      }
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testNavigation = (url) => {
    setStatus(`Testing navigation to ${url}...`)
    window.location.href = url
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-8">Quick Login Test</h1>
          
          <div className="space-y-6">
            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Login as Owner'}
            </button>

            {/* Status */}
            {status && (
              <div className="p-4 bg-gray-100 rounded-lg">
                <p className="text-sm">{status}</p>
              </div>
            )}

            {/* Navigation Tests */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Test Navigation</h3>
              <div className="space-y-2">
                <button
                  onClick={() => testNavigation('/dashboard')}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => testNavigation('/products')}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
                >
                  Go to Products
                </button>
                <button
                  onClick={() => testNavigation('/working-test')}
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700"
                >
                  Go to Working Test
                </button>
              </div>
            </div>

            {/* Direct Links */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Direct Links</h3>
              <div className="space-y-2">
                <a href="/dashboard" className="block w-full bg-blue-100 text-blue-800 py-2 px-4 rounded text-center hover:bg-blue-200">
                  Dashboard (Direct Link)
                </a>
                <a href="/products" className="block w-full bg-green-100 text-green-800 py-2 px-4 rounded text-center hover:bg-green-200">
                  Products (Direct Link)
                </a>
                <a href="/working-test" className="block w-full bg-orange-100 text-orange-800 py-2 px-4 rounded text-center hover:bg-orange-200">
                  Working Test (Direct Link)
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}