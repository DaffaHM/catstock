'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function NavigationTestPage() {
  const [testResults, setTestResults] = useState([])

  const addResult = (test, result) => {
    setTestResults(prev => [...prev, { test, result, timestamp: new Date().toLocaleTimeString() }])
  }

  const testNextLink = () => {
    addResult('Next.js Link to Dashboard', 'Attempting...')
    // This will be handled by the Link component
  }

  const testWindowLocation = () => {
    addResult('window.location to Dashboard', 'Attempting...')
    window.location.href = '/dashboard'
  }

  const testFetch = async () => {
    addResult('Fetch Dashboard', 'Attempting...')
    try {
      const response = await fetch('/dashboard')
      if (response.ok) {
        addResult('Fetch Dashboard', `✅ Success: ${response.status}`)
      } else {
        addResult('Fetch Dashboard', `❌ Failed: ${response.status}`)
      }
    } catch (error) {
      addResult('Fetch Dashboard', `❌ Error: ${error.message}`)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Navigation Test</h1>
      
      <div className="space-y-6">
        {/* Test Buttons */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Navigation Tests</h2>
          <div className="space-y-4">
            <div>
              <Link 
                href="/dashboard" 
                onClick={() => testNextLink()}
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Test Next.js Link to Dashboard
              </Link>
            </div>
            
            <div>
              <button 
                onClick={testWindowLocation}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Test window.location to Dashboard
              </button>
            </div>
            
            <div>
              <button 
                onClick={testFetch}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Test Fetch Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Test Results</h2>
          {testResults.length === 0 ? (
            <p className="text-gray-500">No tests run yet</p>
          ) : (
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded">
                  <div className="font-medium">{result.test}</div>
                  <div className="text-sm text-gray-600">{result.result} - {result.timestamp}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Direct Links for Comparison */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Direct Links</h2>
          <div className="space-y-2">
            <a href="/dashboard" className="block p-3 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
              Regular anchor to Dashboard
            </a>
            <a href="/products" className="block p-3 bg-green-100 text-green-800 rounded hover:bg-green-200">
              Regular anchor to Products
            </a>
            <a href="/bypass-dashboard" className="block p-3 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200">
              Bypass Dashboard (no middleware)
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}