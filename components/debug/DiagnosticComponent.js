'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DiagnosticComponent() {
  const router = useRouter()
  const pathname = usePathname()
  const [clientInfo, setClientInfo] = useState({})
  const [testResults, setTestResults] = useState([])

  useEffect(() => {
    // Gather client-side information
    setClientInfo({
      userAgent: navigator.userAgent,
      cookiesEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      language: navigator.language,
      platform: navigator.platform,
      windowLocation: window.location.href,
      documentReadyState: document.readyState,
      hasLocalStorage: typeof(Storage) !== "undefined",
      screenSize: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    })
  }, [])

  const addTestResult = (test, result, details = '') => {
    setTestResults(prev => [...prev, {
      test,
      result,
      details,
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  const testNavigation = async (href, method) => {
    try {
      addTestResult(`Navigation to ${href} via ${method}`, 'STARTED')
      
      if (method === 'router.push') {
        router.push(href)
        addTestResult(`Navigation to ${href} via ${method}`, 'SUCCESS', 'router.push() called')
      } else if (method === 'window.location') {
        window.location.href = href
        addTestResult(`Navigation to ${href} via ${method}`, 'SUCCESS', 'window.location set')
      }
    } catch (error) {
      addTestResult(`Navigation to ${href} via ${method}`, 'ERROR', error.message)
    }
  }

  const testJavaScript = () => {
    try {
      // Test basic JavaScript functionality
      const testObj = { test: 'value' }
      const testArray = [1, 2, 3]
      const testFunction = () => 'test'
      
      addTestResult('JavaScript Basic Objects', 'SUCCESS', 'Objects, arrays, and functions work')
      
      // Test console
      console.log('Diagnostic: Console test')
      addTestResult('Console Logging', 'SUCCESS', 'Console.log works')
      
      // Test event handling
      const testButton = document.createElement('button')
      testButton.onclick = () => addTestResult('Event Handling', 'SUCCESS', 'Click events work')
      testButton.click()
      
    } catch (error) {
      addTestResult('JavaScript Test', 'ERROR', error.message)
    }
  }

  const clearResults = () => setTestResults([])

  return (
    <div className="space-y-6">
      {/* Client Info */}
      <div className="bg-white p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-2">Client Information</h2>
        <div className="text-sm space-y-1">
          <p><strong>Current Path:</strong> {pathname}</p>
          <p><strong>User Agent:</strong> {clientInfo.userAgent}</p>
          <p><strong>Cookies Enabled:</strong> {clientInfo.cookiesEnabled ? 'Yes' : 'No'}</p>
          <p><strong>Online:</strong> {clientInfo.onLine ? 'Yes' : 'No'}</p>
          <p><strong>Language:</strong> {clientInfo.language}</p>
          <p><strong>Platform:</strong> {clientInfo.platform}</p>
          <p><strong>Screen Size:</strong> {clientInfo.screenSize}</p>
          <p><strong>Viewport Size:</strong> {clientInfo.viewportSize}</p>
          <p><strong>Local Storage:</strong> {clientInfo.hasLocalStorage ? 'Available' : 'Not available'}</p>
          <p><strong>Document Ready:</strong> {clientInfo.documentReadyState}</p>
        </div>
      </div>

      {/* Navigation Tests */}
      <div className="bg-white p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Navigation Tests</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <h3 className="font-medium mb-2">Next.js Link</h3>
            <Link 
              href="/dashboard" 
              className="block p-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors text-center"
              onClick={() => addTestResult('Link to /dashboard', 'CLICKED', 'Next.js Link component')}
            >
              Dashboard
            </Link>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">useRouter</h3>
            <button 
              onClick={() => testNavigation('/dashboard', 'router.push')}
              className="w-full p-2 bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
            >
              Dashboard
            </button>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">window.location</h3>
            <button 
              onClick={() => testNavigation('/dashboard', 'window.location')}
              className="w-full p-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>

        <div className="mb-4">
          <button 
            onClick={testJavaScript}
            className="px-4 py-2 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition-colors mr-2"
          >
            Test JavaScript
          </button>
          <button 
            onClick={clearResults}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
          >
            Clear Results
          </button>
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-white p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-2">Test Results</h2>
        <div className="max-h-60 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-gray-500 text-sm">No test results yet. Run some tests above.</p>
          ) : (
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className={`p-2 rounded text-sm ${
                  result.result === 'SUCCESS' ? 'bg-green-50 text-green-800' :
                  result.result === 'ERROR' ? 'bg-red-50 text-red-800' :
                  result.result === 'CLICKED' ? 'bg-blue-50 text-blue-800' :
                  'bg-yellow-50 text-yellow-800'
                }`}>
                  <div className="font-medium">{result.test}</div>
                  <div className="text-xs opacity-75">
                    {result.timestamp} - {result.result}
                    {result.details && ` - ${result.details}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-medium text-blue-900 mb-2">Diagnostic Instructions</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>1. Open browser developer tools (F12) and check the Console tab</li>
          <li>2. Click on the navigation test buttons above</li>
          <li>3. Watch for any JavaScript errors in the console</li>
          <li>4. Check if the URL changes when you click navigation links</li>
          <li>5. Note any error messages in the test results below</li>
        </ul>
      </div>
    </div>
  )
}