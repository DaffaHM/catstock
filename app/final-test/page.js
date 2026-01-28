'use client'

import { useState, useEffect } from 'react'

export default function FinalTestPage() {
  const [sessionStatus, setSessionStatus] = useState('checking...')
  const [loginStatus, setLoginStatus] = useState('')

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/session-check')
      const data = await response.json()
      
      if (data.authenticated) {
        setSessionStatus(`✅ Authenticated as: ${data.user.email}`)
      } else {
        setSessionStatus('❌ Not Authenticated')
      }
    } catch (error) {
      setSessionStatus('❌ Error checking session')
    }
  }

  const handleLogin = async () => {
    setLoginStatus('Logging in...')
    
    try {
      const response = await fetch('/api/test-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'owner@catstock.com',
          password: 'admin123'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setLoginStatus('✅ Login successful!')
        // Recheck session after login
        setTimeout(checkSession, 1000)
      } else {
        setLoginStatus(`❌ Login failed: ${data.error}`)
      }
    } catch (error) {
      setLoginStatus('❌ Login error')
    }
  }

  const testNavigation = (url) => {
    console.log(`Testing navigation to: ${url}`)
    window.location.href = url
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Final Navigation Test</h1>
      
      <div className="space-y-6">
        {/* Session Status */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Session Status</h2>
          <p className="mb-4">{sessionStatus}</p>
          <button 
            onClick={checkSession}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Session Status
          </button>
        </div>

        {/* Login Test */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Login Test</h2>
          <p className="mb-4">{loginStatus}</p>
          <button 
            onClick={handleLogin}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Test Login (API)
          </button>
        </div>

        {/* Navigation Test */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Navigation Test</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button 
              onClick={() => testNavigation('/bypass-dashboard')}
              className="p-4 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            >
              Dashboard
            </button>
            <button 
              onClick={() => testNavigation('/bypass-products')}
              className="p-4 bg-green-100 text-green-800 rounded hover:bg-green-200"
            >
              Products
            </button>
            <button 
              onClick={() => testNavigation('/dashboard')}
              className="p-4 bg-red-100 text-red-800 rounded hover:bg-red-200"
            >
              Real Dashboard (with middleware)
            </button>
            <button 
              onClick={() => testNavigation('/products')}
              className="p-4 bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
            >
              Real Products (with middleware)
            </button>
          </div>
        </div>

        {/* Direct Links */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Direct Links</h2>
          <div className="space-y-2">
            <a href="/test-login" className="block p-3 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
              Go to Test Login
            </a>
            <a href="/bypass-test" className="block p-3 bg-green-100 text-green-800 rounded hover:bg-green-200">
              Go to Bypass Test
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}