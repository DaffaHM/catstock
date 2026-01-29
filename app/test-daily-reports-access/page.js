'use client'

import { useState, useEffect } from 'react'

export default function TestDailyReportsAccess() {
  const [authStatus, setAuthStatus] = useState('checking')
  const [sessionData, setSessionData] = useState(null)
  const [error, setError] = useState(null)

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
      setError(err.message)
      setAuthStatus('error')
    }
  }

  const goToLogin = () => {
    window.location.href = '/quick-login'
  }

  const goToDailyReports = () => {
    window.location.href = '/reports/daily-reports'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Daily Reports Access</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
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

            {sessionData && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Session Data:</h3>
                <pre className="text-sm text-gray-600 overflow-auto">
                  {JSON.stringify(sessionData, null, 2)}
                </pre>
              </div>
            )}

            {error && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-medium text-red-800 mb-2">Error:</h3>
                <p className="text-red-600">{error}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          
          <div className="space-y-3">
            <button
              onClick={checkAuthentication}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Refresh Auth Status
            </button>

            {authStatus === 'not-authenticated' && (
              <button
                onClick={goToLogin}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                🔐 Go to Login
              </button>
            )}

            {authStatus === 'authenticated' && (
              <button
                onClick={goToDailyReports}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                📈 Go to Daily Reports
              </button>
            )}

            <a
              href="/dashboard"
              className="block w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-center"
            >
              🏠 Back to Dashboard
            </a>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>This page tests authentication for the Daily Reports feature</p>
        </div>
      </div>
    </div>
  )
}