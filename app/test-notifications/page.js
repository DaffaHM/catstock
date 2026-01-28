'use client'

import { useState, useEffect } from 'react'
import { getLowStockProductsAction } from '@/lib/actions/notifications'

export default function TestNotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [testResults, setTestResults] = useState([])

  const addTestResult = (test, result, error = null) => {
    setTestResults(prev => [...prev, { test, result, error, timestamp: new Date().toISOString() }])
  }

  const testGetLowStock = async () => {
    try {
      setLoading(true)
      addTestResult('Get Low Stock', 'Starting...')
      
      const result = await getLowStockProductsAction()
      
      if (result.success) {
        setNotifications(result.products)
        addTestResult('Get Low Stock', `Success: ${result.products.length} low stock products found`)
      } else {
        addTestResult('Get Low Stock', 'Failed', result.error)
        setError(result.error)
      }
    } catch (err) {
      addTestResult('Get Low Stock', 'Error', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testAPIEndpoint = async () => {
    try {
      addTestResult('API Test', 'Starting...')
      
      const response = await fetch('/api/notifications/low-stock')
      const data = await response.json()
      
      if (response.ok && data.success) {
        addTestResult('API Test', `Success: ${data.products.length} low stock products via API`)
      } else {
        addTestResult('API Test', 'Failed', data.error || 'Unknown API error')
      }
    } catch (err) {
      addTestResult('API Test', 'Error', err.message)
    }
  }

  useEffect(() => {
    testGetLowStock()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Notifications System Test</h1>
        
        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Test Controls</h2>
          <div className="flex space-x-4">
            <button
              onClick={testGetLowStock}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Test Get Low Stock
            </button>
            <button
              onClick={testAPIEndpoint}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              Test API Endpoint
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Test Results</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className={`p-3 rounded border-l-4 ${
                result.error ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium">{result.test}:</span>
                    <span className="ml-2">{result.result}</span>
                    {result.error && (
                      <div className="text-red-600 text-sm mt-1">{result.error}</div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications Data */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Low Stock Data</h2>
          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(notifications, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}