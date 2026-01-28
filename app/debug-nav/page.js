'use client'

import { useState } from 'react'

export default function DebugNavPage() {
  const [logs, setLogs] = useState([])

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `${timestamp}: ${message}`])
  }

  const testNavigation = (url, method) => {
    addLog(`Testing ${method} navigation to ${url}`)
    
    if (method === 'window.location') {
      window.location.href = url
    } else if (method === 'window.location.assign') {
      window.location.assign(url)
    } else if (method === 'window.location.replace') {
      window.location.replace(url)
    }
  }

  const testFetch = async (url) => {
    addLog(`Testing fetch to ${url}`)
    try {
      const response = await fetch(url)
      addLog(`Fetch response: ${response.status} ${response.statusText}`)
      if (response.redirected) {
        addLog(`Redirected to: ${response.url}`)
      }
    } catch (error) {
      addLog(`Fetch error: ${error.message}`)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Navigation Debug</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Navigation Tests */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Navigation Tests</h2>
          <div className="space-y-2">
            <button 
              onClick={() => testNavigation('/dashboard', 'window.location')}
              className="block w-full p-3 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-left"
            >
              window.location.href = '/dashboard'
            </button>
            <button 
              onClick={() => testNavigation('/dashboard', 'window.location.assign')}
              className="block w-full p-3 bg-green-100 text-green-800 rounded hover:bg-green-200 text-left"
            >
              window.location.assign('/dashboard')
            </button>
            <button 
              onClick={() => testNavigation('/dashboard', 'window.location.replace')}
              className="block w-full p-3 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 text-left"
            >
              window.location.replace('/dashboard')
            </button>
            <button 
              onClick={() => testFetch('/dashboard')}
              className="block w-full p-3 bg-orange-100 text-orange-800 rounded hover:bg-orange-200 text-left"
            >
              fetch('/dashboard')
            </button>
          </div>
        </div>

        {/* Regular Links */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Regular Links</h2>
          <div className="space-y-2">
            <a href="/dashboard" className="block p-3 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
              Regular link to Dashboard
            </a>
            <a href="/products" className="block p-3 bg-green-100 text-green-800 rounded hover:bg-green-200">
              Regular link to Products
            </a>
            <a href="/test-dashboard" className="block p-3 bg-purple-100 text-purple-800 rounded hover:bg-purple-200">
              Regular link to Test Dashboard
            </a>
            <a href="/login" className="block p-3 bg-gray-100 text-gray-800 rounded hover:bg-gray-200">
              Regular link to Login
            </a>
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="bg-white p-6 rounded-lg border mt-6">
        <h2 className="text-lg font-semibold mb-4">Debug Logs</h2>
        {logs.length === 0 ? (
          <p className="text-gray-500">No logs yet</p>
        ) : (
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-sm font-mono bg-gray-50 p-2 rounded">
                {log}
              </div>
            ))}
          </div>
        )}
        <button 
          onClick={() => setLogs([])}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Clear Logs
        </button>
      </div>
    </div>
  )
}