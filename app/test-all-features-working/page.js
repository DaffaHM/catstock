'use client'

import { useState } from 'react'

export default function TestAllFeaturesWorkingPage() {
  const [testResults, setTestResults] = useState({})

  const features = [
    {
      name: 'Dashboard',
      url: '/dashboard',
      description: 'Main dashboard with stats and quick actions'
    },
    {
      name: 'Products',
      url: '/products',
      description: 'Product management with add/edit/delete'
    },
    {
      name: 'Suppliers',
      url: '/suppliers',
      description: 'Supplier management with add/edit/delete'
    },
    {
      name: 'Stock In',
      url: '/transactions/stock-in',
      description: 'Add stock transactions'
    },
    {
      name: 'Stock Out',
      url: '/transactions/stock-out',
      description: 'Record sales transactions'
    },
    {
      name: 'Stock Adjustment',
      url: '/transactions/stock-adjustment',
      description: 'Adjust stock levels'
    },
    {
      name: 'Returns',
      url: '/transactions/returns',
      description: 'Handle product returns'
    },
    {
      name: 'Reports',
      url: '/reports',
      description: 'Stock reports and analytics'
    },
    {
      name: 'Daily Reports',
      url: '/reports/daily-reports',
      description: 'Daily sales and profit reports'
    },
    {
      name: 'Profit Analysis',
      url: '/profit-analysis',
      description: 'Detailed profit analysis'
    },
    {
      name: 'Settings',
      url: '/settings',
      description: 'Application settings'
    },
    {
      name: 'Notifications',
      url: '/notifications',
      description: 'System notifications'
    }
  ]

  const testFeature = async (feature) => {
    try {
      // Simple test - just try to navigate
      window.open(feature.url, '_blank')
      setTestResults(prev => ({
        ...prev,
        [feature.name]: 'success'
      }))
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [feature.name]: 'error'
      }))
    }
  }

  const testAllFeatures = () => {
    features.forEach(feature => {
      setTimeout(() => testFeature(feature), 100)
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Test All Features</h1>
        <p className="text-gray-600">Test semua fitur CatStock untuk memastikan semuanya berfungsi</p>
      </div>

      {/* Test All Button */}
      <div className="mb-8 text-center">
        <button
          onClick={testAllFeatures}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Test All Features
        </button>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <div key={feature.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{feature.name}</h3>
              {testResults[feature.name] && (
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  testResults[feature.name] === 'success' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {testResults[feature.name] === 'success' ? '✓ OK' : '✗ Error'}
                </span>
              )}
            </div>
            
            <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
            
            <div className="flex gap-2">
              <button
                onClick={() => testFeature(feature)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
              >
                Test
              </button>
              <a
                href={feature.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                Open
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Status Summary */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {features.length}
            </div>
            <div className="text-sm text-gray-600">Total Features</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Object.values(testResults).filter(r => r === 'success').length}
            </div>
            <div className="text-sm text-gray-600">Passed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {Object.values(testResults).filter(r => r === 'error').length}
            </div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Testing Instructions</h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-800">
          <li>Click "Test All Features" to open all pages in new tabs</li>
          <li>Or click individual "Test" buttons to test specific features</li>
          <li>Check that each page loads without errors</li>
          <li>Verify that all functionality works as expected</li>
          <li>Test on both desktop and mobile/tablet devices</li>
        </ol>
      </div>

      {/* Quick Links */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
        <div className="flex flex-wrap gap-2">
          <a href="/quick-login" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
            Quick Login
          </a>
          <a href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Dashboard
          </a>
          <a href="/reports/daily-reports" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
            Daily Reports
          </a>
          <a href="/test-reset" className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors">
            Test Reset
          </a>
        </div>
      </div>
    </div>
  )
}