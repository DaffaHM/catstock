'use client'

import { useState } from 'react'
import { getCategoriesAction, createCategoryAction } from '@/lib/actions/categories'
import { getLowStockProductsAction } from '@/lib/actions/notifications'

export default function TestAllFeaturesPage() {
  const [testResults, setTestResults] = useState([])
  const [testing, setTesting] = useState(false)

  const addResult = (feature, status, message, data = null) => {
    setTestResults(prev => [...prev, {
      feature,
      status, // 'success', 'error', 'warning'
      message,
      data,
      timestamp: new Date().toISOString()
    }])
  }

  const runAllTests = async () => {
    setTesting(true)
    setTestResults([])
    
    // Test 1: Category Management
    try {
      addResult('Category Management', 'info', 'Testing category system...')
      
      // Test get categories
      const categoriesResult = await getCategoriesAction()
      if (categoriesResult.success) {
        addResult('Category Management - Get', 'success', 
          `✅ Successfully loaded ${categoriesResult.categories.length} categories`, 
          categoriesResult.categories)
      } else {
        addResult('Category Management - Get', 'error', 
          `❌ Failed to load categories: ${categoriesResult.error}`)
      }
      
      // Test create category
      const formData = new FormData()
      formData.append('name', `Test Category ${Date.now()}`)
      const createResult = await createCategoryAction({}, formData)
      if (createResult.success) {
        addResult('Category Management - Create', 'success', 
          `✅ Successfully created category: ${createResult.category.name}`)
      } else {
        addResult('Category Management - Create', 'error', 
          `❌ Failed to create category: ${createResult.error}`)
      }
      
    } catch (error) {
      addResult('Category Management', 'error', `❌ Category system error: ${error.message}`)
    }

    // Test 2: Low Stock Notifications
    try {
      addResult('Low Stock Notifications', 'info', 'Testing notification system...')
      
      const notificationsResult = await getLowStockProductsAction()
      if (notificationsResult.success) {
        addResult('Low Stock Notifications', 'success', 
          `✅ Successfully loaded ${notificationsResult.products.length} low stock alerts`, 
          notificationsResult.products)
      } else {
        addResult('Low Stock Notifications', 'error', 
          `❌ Failed to load notifications: ${notificationsResult.error}`)
      }
      
    } catch (error) {
      addResult('Low Stock Notifications', 'error', `❌ Notification system error: ${error.message}`)
    }

    // Test 3: API Endpoints
    try {
      addResult('API Endpoints', 'info', 'Testing API endpoints...')
      
      // Test categories API
      const categoriesAPI = await fetch('/api/categories')
      if (categoriesAPI.ok) {
        const data = await categoriesAPI.json()
        addResult('API - Categories', 'success', 
          `✅ Categories API working: ${data.categories?.length || 0} categories`)
      } else {
        addResult('API - Categories', 'error', 
          `❌ Categories API failed: ${categoriesAPI.status}`)
      }
      
      // Test notifications API
      const notificationsAPI = await fetch('/api/notifications/low-stock')
      if (notificationsAPI.ok) {
        const data = await notificationsAPI.json()
        addResult('API - Notifications', 'success', 
          `✅ Notifications API working: ${data.products?.length || 0} alerts`)
      } else {
        addResult('API - Notifications', 'error', 
          `❌ Notifications API failed: ${notificationsAPI.status}`)
      }
      
    } catch (error) {
      addResult('API Endpoints', 'error', `❌ API testing error: ${error.message}`)
    }

    // Test 4: Navigation Links
    try {
      addResult('Navigation', 'info', 'Testing navigation links...')
      
      const links = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Products', path: '/products' },
        { name: 'Categories', path: '/categories' },
        { name: 'Suppliers', path: '/suppliers' },
        { name: 'Reports', path: '/reports' },
        { name: 'Settings', path: '/settings' }
      ]
      
      for (const link of links) {
        try {
          const response = await fetch(link.path, { method: 'HEAD' })
          if (response.ok || response.status === 405) { // 405 is OK for HEAD requests
            addResult(`Navigation - ${link.name}`, 'success', `✅ ${link.name} page accessible`)
          } else {
            addResult(`Navigation - ${link.name}`, 'warning', `⚠️ ${link.name} page returned ${response.status}`)
          }
        } catch (error) {
          addResult(`Navigation - ${link.name}`, 'error', `❌ ${link.name} page error: ${error.message}`)
        }
      }
      
    } catch (error) {
      addResult('Navigation', 'error', `❌ Navigation testing error: ${error.message}`)
    }

    // Test 5: Database Connection
    try {
      addResult('Database', 'info', 'Testing database connection...')
      
      // Try to fetch some data to test DB
      const dbTest = await fetch('/api/categories')
      if (dbTest.ok) {
        addResult('Database', 'success', '✅ Database connection working')
      } else {
        addResult('Database', 'error', '❌ Database connection failed')
      }
      
    } catch (error) {
      addResult('Database', 'error', `❌ Database testing error: ${error.message}`)
    }

    setTesting(false)
    addResult('Test Complete', 'success', '🎉 All tests completed!')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'border-green-500 bg-green-50 text-green-800'
      case 'error': return 'border-red-500 bg-red-50 text-red-800'
      case 'warning': return 'border-yellow-500 bg-yellow-50 text-yellow-800'
      case 'info': return 'border-blue-500 bg-blue-50 text-blue-800'
      default: return 'border-gray-500 bg-gray-50 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Enhanced CatStock Features Test Suite
          </h1>
          <p className="text-gray-600">
            Comprehensive testing of all enhanced features to identify issues
          </p>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Test Controls</h2>
            <button
              onClick={runAllTests}
              disabled={testing}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                testing 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {testing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Running Tests...
                </div>
              ) : (
                '🚀 Run All Tests'
              )}
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Test Results</h2>
            {testResults.length > 0 && (
              <div className="mt-2 flex space-x-4 text-sm">
                <span className="text-green-600">
                  ✅ {testResults.filter(r => r.status === 'success').length} Passed
                </span>
                <span className="text-red-600">
                  ❌ {testResults.filter(r => r.status === 'error').length} Failed
                </span>
                <span className="text-yellow-600">
                  ⚠️ {testResults.filter(r => r.status === 'warning').length} Warnings
                </span>
              </div>
            )}
          </div>
          
          <div className="p-6">
            {testResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">🧪</div>
                <p>Click "Run All Tests" to start comprehensive testing</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${getStatusColor(result.status)}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{result.feature}</div>
                        <div className="text-sm mt-1">{result.message}</div>
                        {result.data && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                              View Data ({Array.isArray(result.data) ? result.data.length : 'object'} items)
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 ml-4">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Links for Manual Testing</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
              { name: 'Products', path: '/products', icon: '📦' },
              { name: 'Categories', path: '/categories', icon: '📁' },
              { name: 'Suppliers', path: '/suppliers', icon: '🚚' },
              { name: 'Reports', path: '/reports', icon: '📊' },
              { name: 'Settings', path: '/settings', icon: '⚙️' },
              { name: 'Test Categories', path: '/test-categories', icon: '🧪' },
              { name: 'Test Notifications', path: '/test-notifications', icon: '🔔' }
            ].map(link => (
              <a
                key={link.path}
                href={link.path}
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl mr-3">{link.icon}</span>
                <span className="font-medium">{link.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}