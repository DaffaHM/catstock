'use client'

import { useState, useEffect } from 'react'

export default function ComprehensiveTestPage() {
  const [sessionStatus, setSessionStatus] = useState('checking...')
  const [loginStatus, setLoginStatus] = useState('')
  const [navigationLogs, setNavigationLogs] = useState([])

  useEffect(() => {
    checkSession()
  }, [])

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString()
    setNavigationLogs(prev => [...prev, `${timestamp}: ${message}`])
  }

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
    addLog('Starting login process')
    
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
        addLog('Login successful via API')
        // Recheck session after login
        setTimeout(checkSession, 1000)
      } else {
        setLoginStatus(`❌ Login failed: ${data.error}`)
        addLog(`Login failed: ${data.error}`)
      }
    } catch (error) {
      setLoginStatus('❌ Login error')
      addLog(`Login error: ${error.message}`)
    }
  }

  const testNavigation = (url, method = 'anchor') => {
    addLog(`Testing ${method} navigation to ${url}`)
    
    if (method === 'window.location') {
      window.location.href = url
    } else if (method === 'anchor') {
      // This will be handled by the anchor tag click
      addLog(`Anchor click to ${url} - should navigate now`)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Comprehensive Navigation Test</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Authentication Section */}
        <div className="space-y-6">
          {/* Session Status */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Session Status</h2>
            <p className="mb-4 text-lg">{sessionStatus}</p>
            <button 
              onClick={checkSession}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Session Status
            </button>
          </div>

          {/* Login Test */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Login Test</h2>
            <p className="mb-4 text-lg">{loginStatus}</p>
            <button 
              onClick={handleLogin}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Test Login (API)
            </button>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-6">
          {/* Navigation Test with Buttons */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Navigation Test (JavaScript)</h2>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => testNavigation('/dashboard', 'window.location')}
                className="p-3 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-left"
              >
                Dashboard (window.location)
              </button>
              <button 
                onClick={() => testNavigation('/products', 'window.location')}
                className="p-3 bg-green-100 text-green-800 rounded hover:bg-green-200 text-left"
              >
                Products (window.location)
              </button>
              <button 
                onClick={() => testNavigation('/suppliers', 'window.location')}
                className="p-3 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 text-left"
              >
                Suppliers (window.location)
              </button>
            </div>
          </div>

          {/* Navigation Test with Anchor Tags */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Navigation Test (Anchor Tags)</h2>
            <div className="grid grid-cols-1 gap-3">
              <a 
                href="/dashboard" 
                onClick={() => testNavigation('/dashboard', 'anchor')}
                className="block p-3 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
              >
                Dashboard (anchor tag)
              </a>
              <a 
                href="/products" 
                onClick={() => testNavigation('/products', 'anchor')}
                className="block p-3 bg-green-100 text-green-800 rounded hover:bg-green-200"
              >
                Products (anchor tag)
              </a>
              <a 
                href="/suppliers" 
                onClick={() => testNavigation('/suppliers', 'anchor')}
                className="block p-3 bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
              >
                Suppliers (anchor tag)
              </a>
              <a 
                href="/reports" 
                onClick={() => testNavigation('/reports', 'anchor')}
                className="block p-3 bg-orange-100 text-orange-800 rounded hover:bg-orange-200"
              >
                Reports (anchor tag)
              </a>
              <a 
                href="/settings" 
                onClick={() => testNavigation('/settings', 'anchor')}
                className="block p-3 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
              >
                Settings (anchor tag)
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Logs */}
      <div className="bg-white p-6 rounded-lg border mt-8">
        <h2 className="text-xl font-semibold mb-4">Navigation Logs</h2>
        {navigationLogs.length === 0 ? (
          <p className="text-gray-500">No navigation attempts yet</p>
        ) : (
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {navigationLogs.map((log, index) => (
              <div key={index} className="text-sm font-mono bg-gray-50 p-2 rounded">
                {log}
              </div>
            ))}
          </div>
        )}
        <button 
          onClick={() => setNavigationLogs([])}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Clear Logs
        </button>
      </div>

      {/* Quick Links */}
      <div className="bg-white p-6 rounded-lg border mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/login" className="block p-3 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-center">
            Login Page
          </a>
          <a href="/debug-nav" className="block p-3 bg-green-100 text-green-800 rounded hover:bg-green-200 text-center">
            Debug Nav
          </a>
          <a href="/simple-test" className="block p-3 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 text-center">
            Simple Test
          </a>
          <a href="/test-dashboard" className="block p-3 bg-orange-100 text-orange-800 rounded hover:bg-orange-200 text-center">
            Test Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}