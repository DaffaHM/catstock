'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'

export default function NavigationTest() {
  const router = useRouter()
  const pathname = usePathname()
  const [logs, setLogs] = useState([])

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testNavigation = (href, method = 'link') => {
    addLog(`Testing navigation to ${href} using ${method}`)
    
    if (method === 'router') {
      try {
        router.push(href)
        addLog(`Router.push(${href}) called successfully`)
      } catch (error) {
        addLog(`Router.push(${href}) failed: ${error.message}`)
      }
    }
  }

  const clearLogs = () => setLogs([])

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Navigation Debug Test</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">Current pathname: <code className="bg-gray-100 px-2 py-1 rounded">{pathname}</code></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="font-medium mb-2">Test with Next.js Link</h3>
          <div className="space-y-2">
            <Link 
              href="/dashboard" 
              className="block p-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
              onClick={() => addLog('Link to /dashboard clicked')}
            >
              Dashboard (Link)
            </Link>
            <Link 
              href="/products" 
              className="block p-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
              onClick={() => addLog('Link to /products clicked')}
            >
              Products (Link)
            </Link>
            <Link 
              href="/suppliers" 
              className="block p-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
              onClick={() => addLog('Link to /suppliers clicked')}
            >
              Suppliers (Link)
            </Link>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Test with useRouter</h3>
          <div className="space-y-2">
            <button 
              onClick={() => testNavigation('/dashboard', 'router')}
              className="block w-full p-2 bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
            >
              Dashboard (Router)
            </button>
            <button 
              onClick={() => testNavigation('/products', 'router')}
              className="block w-full p-2 bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
            >
              Products (Router)
            </button>
            <button 
              onClick={() => testNavigation('/suppliers', 'router')}
              className="block w-full p-2 bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
            >
              Suppliers (Router)
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Debug Logs</h3>
          <button 
            onClick={clearLogs}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Clear Logs
          </button>
        </div>
        <div className="bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-sm">No logs yet. Click on navigation links to test.</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="text-xs font-mono text-gray-700">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <p><strong>Instructions:</strong></p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>Click on the navigation links above to test if they work</li>
          <li>Check the logs to see if click events are being triggered</li>
          <li>Watch the URL bar to see if navigation actually occurs</li>
          <li>Open browser console (F12) to check for JavaScript errors</li>
        </ul>
      </div>
    </div>
  )
}