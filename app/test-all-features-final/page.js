'use client'

import { useState, useEffect } from 'react'

export default function TestAllFeaturesPage() {
  const [authStatus, setAuthStatus] = useState('checking')
  const [sessionData, setSessionData] = useState(null)
  const [testResults, setTestResults] = useState({})
  const [loading, setLoading] = useState(false)

  const features = [
    { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { name: 'Products', path: '/products', icon: '📦' },
    { name: 'Categories', path: '/categories', icon: '📁' },
    { name: 'Suppliers', path: '/suppliers', icon: '🚚' },
    { name: 'Stock In', path: '/transactions/stock-in', icon: '📥' },
    { name: 'Stock Out', path: '/transactions/stock-out', icon: '📤' },
    { name: 'Stock Adjustment', path: '/transactions/stock-adjustment', icon: '⚖️' },
    { name: 'Returns', path: '/transactions/returns', icon: '🔄' },
    { name: 'Reports', path: '/reports', icon: '📊' },
    { name: 'Daily Reports', path: '/reports/daily-reports', icon: '📈' },
    { name: 'Sales Summary', path: '/reports/sales-purchase-summary', icon: '📋' },
    { name: 'Profit Analysis', path: '/profit-analysis', icon: '💎' },
    { name: 'Notifications', path: '/notifications', icon: '🔔' },
    { name: 'Settings', path: '/settings', icon: '⚙️' }
  ]

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/session-check', {
        method: 'GET',
        credentials: 'include'
      })
      
      const data = await response.json()
      setSessionData(data)
      
      if (data.isAuthenticated) {
        setAuthStatus('authenticated')
      } else {
        setAuthStatus('not-authenticated')
      }
    } catch (err) {
      setAuthStatus('error')
    }
  }

  const testFeatureAccess = async (feature) => {
    try {
      const response = await fetch(feature.path, {
        method: 'HEAD',
        credentials: 'include'
      })
      
      return {
        status: response.status,
        accessible: response.status === 200 || response.status === 404, // 404 is OK for client-side routes
        error: null
      }
    } catch (error) {
      return {
        status: 'error',
        accessible: false,
        error: error.message
      }
    }
  }

  const testAllFeatures = async () => {
    setLoading(true)
    const results = {}
    
    for (const feature of features) {
      const result = await testFeatureAccess(feature)
      results[feature.path] = result
    }
    
    setTestResults(results)
    setLoading(false)
  }

  const goToLogin = () => {
    window.location.href = '/quick-login'
  }

  const navigateToFeature = (path) => {
    window.location.href = path
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test All Features Access</h1>
        
        {/* Authentication Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          
          <div className="flex items-center gap-3 mb-4">
            <span className="font-medium">Status:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              authStatus === 'authenticated' ? 'bg-green-100 text-green-800' :
              authStatus === 'not-authenticated' ? 'bg-red-100 text-red-800' :
              authStatus === 'error' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {authStatus === 'checking' ? 'Checking...' :
               authStatus === 'authenticated' ? 'Authenticated ✓' :
               authStatus === 'not-authenticated' ? 'Not Authenticated ✗' :
               'Error ⚠️'}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={checkAuthentication}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Refresh Auth
            </button>

            {authStatus === 'not-authenticated' && (
              <button
                onClick={goToLogin}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                🔐 Go to Login
              </button>
            )}

            {authStatus === 'authenticated' && (
              <button
                onClick={testAllFeatures}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading ? '🔄 Testing...' : '🧪 Test All Features'}
              </button>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Features Access Test</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => {
              const testResult = testResults[feature.path]
              
              return (
                <div
                  key={feature.path}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                    testResult?.accessible === true ? 'border-green-200 bg-green-50' :
                    testResult?.accessible === false ? 'border-red-200 bg-red-50' :
                    'border-gray-200 bg-gray-50'
                  }`}
                  onClick={() => authStatus === 'authenticated' && navigateToFeature(feature.path)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{feature.icon}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">{feature.name}</h3>
                      <p className="text-sm text-gray-600">{feature.path}</p>
                    </div>
                  </div>
                  
                  {testResult && (
                    <div className="mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        testResult.accessible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {testResult.accessible ? '✓ Accessible' : '✗ Not Accessible'}
                      </span>
                      {testResult.error && (
                        <p className="text-xs text-red-600 mt-1">{testResult.error}</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Session Data */}
        {sessionData && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Session Data</h2>
            <pre className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg overflow-auto">
              {JSON.stringify(sessionData, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 text-center">
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            🏠 Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}