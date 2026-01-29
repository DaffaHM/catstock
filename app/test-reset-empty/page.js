'use client'

import { useState, useEffect } from 'react'
import { getDemoProducts, resetDemoProducts, saveDemoProduct } from '@/lib/utils/demo-products'
import { getDemoSuppliers, resetDemoSuppliers, saveDemoSupplier } from '@/lib/utils/demo-suppliers'
import { getDemoTransactions, resetDemoTransactions } from '@/lib/utils/demo-transactions'
import { getDemoDashboardData } from '@/lib/utils/demo-dashboard'

export default function TestResetEmptyPage() {
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [dashboardData, setDashboardData] = useState(null)
  const [testResults, setTestResults] = useState([])

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = () => {
    const productsData = getDemoProducts()
    const suppliersData = getDemoSuppliers()
    const transactionsData = getDemoTransactions()
    const dashData = getDemoDashboardData()

    setProducts(productsData)
    setSuppliers(suppliersData)
    setTransactions(transactionsData.transactions)
    setDashboardData(dashData)

    console.log('Loaded data:', {
      products: productsData.length,
      suppliers: suppliersData.length,
      transactions: transactionsData.transactions.length
    })
  }

  const testResetToEmpty = () => {
    try {
      // Reset all data
      resetDemoProducts()
      resetDemoSuppliers()
      resetDemoTransactions()

      // Reload data
      loadAllData()

      const result = `Reset Test: SUCCESS - All data cleared (Products: ${products.length}, Suppliers: ${suppliers.length}, Transactions: ${transactions.length})`
      setTestResults(prev => [...prev, result])
    } catch (error) {
      const result = `Reset Test: FAILED - ${error.message}`
      setTestResults(prev => [...prev, result])
    }
  }

  const testAddSampleData = () => {
    try {
      // Add sample product
      const sampleProduct = {
        id: `test-prod-${Date.now()}`,
        sku: 'TEST-001',
        brand: 'Test Brand',
        name: 'Test Product',
        category: 'Test Category',
        size: '1',
        unit: 'Liter',
        purchasePrice: 50000,
        sellingPrice: 75000,
        minimumStock: 10,
        currentStock: 0,
        transactionCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Add sample supplier
      const sampleSupplier = {
        id: `test-supp-${Date.now()}`,
        name: 'Test Supplier',
        contact: 'Test Contact Info',
        notes: 'Test supplier notes',
        transactionCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      saveDemoProduct(sampleProduct)
      saveDemoSupplier(sampleSupplier)

      // Reload data
      loadAllData()

      const result = `Add Sample Data: SUCCESS - Added 1 product and 1 supplier`
      setTestResults(prev => [...prev, result])
    } catch (error) {
      const result = `Add Sample Data: FAILED - ${error.message}`
      setTestResults(prev => [...prev, result])
    }
  }

  const testResetAfterData = () => {
    try {
      // Reset all data after adding some
      resetDemoProducts()
      resetDemoSuppliers()
      resetDemoTransactions()

      // Reload data
      loadAllData()

      const isEmpty = products.length === 0 && suppliers.length === 0 && transactions.length === 0
      const result = `Reset After Data: ${isEmpty ? 'SUCCESS' : 'FAILED'} - Data should be empty (Products: ${products.length}, Suppliers: ${suppliers.length}, Transactions: ${transactions.length})`
      setTestResults(prev => [...prev, result])
    } catch (error) {
      const result = `Reset After Data: FAILED - ${error.message}`
      setTestResults(prev => [...prev, result])
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  const clearLocalStorage = () => {
    try {
      const keys = ['demo-products', 'demo-suppliers', 'demo-transactions', 'deleted-demo-products', 'deleted-demo-suppliers']
      keys.forEach(key => localStorage.removeItem(key))
      loadAllData()
      setTestResults(prev => [...prev, 'LocalStorage Cleared: SUCCESS'])
    } catch (error) {
      setTestResults(prev => [...prev, `LocalStorage Clear: FAILED - ${error.message}`])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Reset to Empty Functionality</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Data Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Current Data Status</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Products:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  products.length === 0 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {products.length} items
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Suppliers:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  suppliers.length === 0 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {suppliers.length} items
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Transactions:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  transactions.length === 0 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {transactions.length} items
                </span>
              </div>

              {dashboardData && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Dashboard Stats:</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Total Products: {dashboardData.stats.totalProducts}</div>
                    <div>Total Suppliers: {dashboardData.stats.totalSuppliers}</div>
                    <div>Total Transactions: {dashboardData.stats.totalTransactions}</div>
                    <div>Low Stock Count: {dashboardData.stats.lowStockCount}</div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={loadAllData}
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Refresh Data
            </button>
          </div>

          {/* Test Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
            
            <div className="space-y-3">
              <button
                onClick={testResetToEmpty}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                🗑️ Test Reset to Empty
              </button>

              <button
                onClick={testAddSampleData}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                ➕ Add Sample Data
              </button>

              <button
                onClick={testResetAfterData}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                🔄 Reset After Adding Data
              </button>

              <button
                onClick={clearLocalStorage}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                💾 Clear LocalStorage Completely
              </button>

              <button
                onClick={clearResults}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                🧹 Clear Test Results
              </button>
            </div>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mt-8">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg text-sm ${
                    result.includes('SUCCESS') 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Details */}
        {(products.length > 0 || suppliers.length > 0 || transactions.length > 0) && (
          <div className="bg-white rounded-lg shadow p-6 mt-8">
            <h2 className="text-xl font-semibold mb-4">Data Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Products ({products.length})</h3>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {products.map(product => (
                      <div key={product.id} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                        {product.name} ({product.sku})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {suppliers.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Suppliers ({suppliers.length})</h3>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {suppliers.map(supplier => (
                      <div key={supplier.id} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                        {supplier.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {transactions.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Transactions ({transactions.length})</h3>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {transactions.map(transaction => (
                      <div key={transaction.id} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                        {transaction.referenceNumber} ({transaction.type})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 text-center space-x-4">
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            🏠 Back to Dashboard
          </a>
          <a
            href="/products"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            📦 Check Products Page
          </a>
          <a
            href="/suppliers"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            🚚 Check Suppliers Page
          </a>
          <a
            href="/transactions/stock-in"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            📥 Check Stock In Page
          </a>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">🧪 Testing Instructions</h2>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>1. Test Initial Reset:</strong> Click "Test Reset to Empty" - should show all zeros</p>
            <p><strong>2. Test Empty Pages:</strong> Visit Products and Suppliers pages - should show "no data" messages</p>
            <p><strong>3. Test Add Data:</strong> Click "Add Sample Data" - should show 1 product and 1 supplier</p>
            <p><strong>4. Test Reset After Data:</strong> Click "Reset After Adding Data" - should return to empty state</p>
            <p><strong>5. Test Dashboard Reset:</strong> Go to Dashboard and use the red "Reset Data" button</p>
          </div>
        </div>
      </div>
    </div>
  )
}