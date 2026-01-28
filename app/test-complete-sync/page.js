'use client'

import { useState, useEffect } from 'react'
import { getDemoDashboardData } from '@/lib/utils/demo-dashboard'
import { saveDemoSupplier, getDemoSuppliers, deleteDemoSupplier } from '@/lib/utils/demo-suppliers'
import { saveDemoProduct, getDemoProducts, deleteDemoProduct } from '@/lib/utils/demo-products'
import { createDemoTransaction, getDemoTransactions } from '@/lib/utils/demo-transactions'
import { formatRupiah } from '@/lib/utils/currency'
import TouchButton from '@/components/ui/TouchButton'

export default function TestCompleteSync() {
  const [dashboardData, setDashboardData] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [testResults, setTestResults] = useState([])
  const [isRunning, setIsRunning] = useState(false)

  const loadAllData = () => {
    console.log('=== LOADING ALL DATA ===')
    
    // Load dashboard data
    const dashData = getDemoDashboardData()
    setDashboardData(dashData)
    console.log('Dashboard data:', dashData)
    
    // Load suppliers
    const suppliersData = getDemoSuppliers()
    setSuppliers(suppliersData)
    console.log('Suppliers:', suppliersData)
    
    // Load products
    const productsData = getDemoProducts()
    setProducts(productsData)
    console.log('Products:', productsData)
    
    // Load transactions
    const transactionsData = getDemoTransactions()
    setTransactions(transactionsData.transactions)
    console.log('Transactions:', transactionsData)
  }

  useEffect(() => {
    loadAllData()
    
    // Listen for all data changes
    const handleDataUpdate = (event) => {
      console.log(`[TestCompleteSync] ${event.type} event received:`, event.detail)
      loadAllData()
    }

    window.addEventListener('suppliersUpdated', handleDataUpdate)
    window.addEventListener('productsUpdated', handleDataUpdate)
    window.addEventListener('transactionsUpdated', handleDataUpdate)
    window.addEventListener('storage', handleDataUpdate)

    return () => {
      window.removeEventListener('suppliersUpdated', handleDataUpdate)
      window.removeEventListener('productsUpdated', handleDataUpdate)
      window.removeEventListener('transactionsUpdated', handleDataUpdate)
      window.removeEventListener('storage', handleDataUpdate)
    }
  }, [])

  const addTestResult = (test, result, details = '') => {
    const newResult = {
      id: Date.now(),
      test,
      result,
      details,
      timestamp: new Date().toLocaleString('id-ID')
    }
    setTestResults(prev => [newResult, ...prev])
    return result
  }

  const runComprehensiveTest = async () => {
    setIsRunning(true)
    setTestResults([])
    
    try {
      // Test 1: Add supplier and verify sync
      console.log('=== TEST 1: SUPPLIER SYNC ===')
      const initialSupplierCount = suppliers.length
      const testSupplier = {
        id: `test-sync-supp-${Date.now()}`,
        name: `Test Sync Supplier ${Date.now()}`,
        contact: 'Test sync contact',
        notes: 'Added for sync testing',
        transactionCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      saveDemoSupplier(testSupplier)
      window.dispatchEvent(new CustomEvent('suppliersUpdated', { detail: testSupplier }))
      
      // Wait for sync
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newSuppliers = getDemoSuppliers()
      const supplierAdded = newSuppliers.length === initialSupplierCount + 1
      const dashboardUpdated = getDemoDashboardData().stats.totalSuppliers === newSuppliers.length
      
      addTestResult(
        'Supplier Add & Dashboard Sync',
        supplierAdded && dashboardUpdated ? 'PASS' : 'FAIL',
        `Suppliers: ${initialSupplierCount} → ${newSuppliers.length}, Dashboard: ${dashboardUpdated}`
      )

      // Test 2: Add product with low stock and verify alerts
      console.log('=== TEST 2: PRODUCT & LOW STOCK SYNC ===')
      const initialProductCount = products.length
      const testProduct = {
        id: `test-sync-prod-${Date.now()}`,
        sku: `SYNC-${Date.now()}`,
        brand: 'Test Brand',
        name: `Test Sync Product ${Date.now()}`,
        category: 'Test Category',
        size: '1',
        unit: 'Unit',
        purchasePrice: 10000,
        sellingPrice: 15000,
        minimumStock: 10,
        currentStock: 3, // Low stock to trigger alert
        transactionCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      saveDemoProduct(testProduct)
      window.dispatchEvent(new CustomEvent('productsUpdated', { detail: testProduct }))
      
      // Wait for sync
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newProducts = getDemoProducts()
      const newDashboard = getDemoDashboardData()
      const productAdded = newProducts.length === initialProductCount + 1
      const dashboardProductsUpdated = newDashboard.stats.totalProducts === newProducts.length
      const lowStockDetected = newDashboard.lowStockAlerts.some(alert => alert.id === testProduct.id)
      
      addTestResult(
        'Product Add & Low Stock Alert Sync',
        productAdded && dashboardProductsUpdated && lowStockDetected ? 'PASS' : 'FAIL',
        `Products: ${initialProductCount} → ${newProducts.length}, Dashboard Products: ${dashboardProductsUpdated}, Low Stock Alert: ${lowStockDetected}`
      )

      // Test 3: Create transaction and verify stock update
      console.log('=== TEST 3: TRANSACTION & STOCK SYNC ===')
      const initialTransactionCount = transactions.length
      const productBeforeTransaction = getDemoProducts().find(p => p.id === testProduct.id)
      const initialStock = productBeforeTransaction.currentStock
      
      const transactionData = {
        type: 'IN',
        transactionDate: new Date(),
        supplierId: testSupplier.id,
        notes: 'Test sync transaction',
        items: [
          {
            productId: testProduct.id,
            quantity: 20,
            unitCost: 10000,
            product: {
              id: testProduct.id,
              name: testProduct.name,
              sku: testProduct.sku,
              brand: testProduct.brand
            }
          }
        ]
      }
      
      const transactionResult = createDemoTransaction(transactionData)
      
      // Wait for sync
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newTransactions = getDemoTransactions()
      const productAfterTransaction = getDemoProducts().find(p => p.id === testProduct.id)
      const finalDashboard = getDemoDashboardData()
      
      const transactionAdded = transactionResult.success && newTransactions.transactions.length === initialTransactionCount + 1
      const stockUpdated = productAfterTransaction.currentStock === initialStock + 20
      const dashboardTransactionsUpdated = finalDashboard.stats.totalTransactions === newTransactions.transactions.length
      const totalValueUpdated = finalDashboard.stats.totalValue > 0
      const lowStockResolved = !finalDashboard.lowStockAlerts.some(alert => alert.id === testProduct.id)
      
      addTestResult(
        'Transaction & Stock Update Sync',
        transactionAdded && stockUpdated && dashboardTransactionsUpdated ? 'PASS' : 'FAIL',
        `Transaction: ${transactionAdded}, Stock: ${initialStock} → ${productAfterTransaction.currentStock}, Dashboard Txns: ${dashboardTransactionsUpdated}, Value: ${totalValueUpdated}, Low Stock Resolved: ${lowStockResolved}`
      )

      // Test 4: Delete supplier and verify sync
      console.log('=== TEST 4: DELETE SYNC ===')
      const suppliersBeforeDelete = getDemoSuppliers().length
      
      deleteDemoSupplier(testSupplier.id)
      window.dispatchEvent(new CustomEvent('suppliersUpdated'))
      
      // Wait for sync
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const suppliersAfterDelete = getDemoSuppliers()
      const dashboardAfterDelete = getDemoDashboardData()
      
      const supplierDeleted = suppliersAfterDelete.length === suppliersBeforeDelete - 1
      const dashboardSuppliersUpdated = dashboardAfterDelete.stats.totalSuppliers === suppliersAfterDelete.length
      const supplierNotInList = !suppliersAfterDelete.some(s => s.id === testSupplier.id)
      
      addTestResult(
        'Supplier Delete & Dashboard Sync',
        supplierDeleted && dashboardSuppliersUpdated && supplierNotInList ? 'PASS' : 'FAIL',
        `Suppliers: ${suppliersBeforeDelete} → ${suppliersAfterDelete.length}, Dashboard: ${dashboardSuppliersUpdated}, Not in list: ${supplierNotInList}`
      )

      // Test 5: Delete product and verify sync
      deleteDemoProduct(testProduct.id)
      window.dispatchEvent(new CustomEvent('productsUpdated'))
      
      // Wait for sync
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const productsAfterDelete = getDemoProducts()
      const finalDashboardAfterDelete = getDemoDashboardData()
      
      const productDeleted = !productsAfterDelete.some(p => p.id === testProduct.id)
      const dashboardProductsAfterDelete = finalDashboardAfterDelete.stats.totalProducts === productsAfterDelete.length
      
      addTestResult(
        'Product Delete & Dashboard Sync',
        productDeleted && dashboardProductsAfterDelete ? 'PASS' : 'FAIL',
        `Product deleted: ${productDeleted}, Dashboard updated: ${dashboardProductsAfterDelete}`
      )

      // Final summary
      const passedTests = testResults.filter(r => r.result === 'PASS').length
      const totalTests = testResults.length
      
      addTestResult(
        'OVERALL SYNC TEST',
        passedTests === totalTests ? 'PASS' : 'FAIL',
        `${passedTests}/${totalTests} tests passed`
      )

    } catch (error) {
      console.error('Test error:', error)
      addTestResult('Test Execution', 'ERROR', error.message)
    } finally {
      setIsRunning(false)
      loadAllData() // Final data reload
    }
  }

  const resetAllData = () => {
    localStorage.removeItem('demo-suppliers')
    localStorage.removeItem('demo-products')
    localStorage.removeItem('demo-transactions')
    localStorage.removeItem('deleted-demo-suppliers')
    localStorage.removeItem('deleted-demo-products')
    setTestResults([])
    loadAllData()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Data Synchronization Test
          </h1>
          <p className="text-gray-600">
            Comprehensive testing of real-time data synchronization across all components
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Test Controls
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TouchButton
              variant="primary"
              onClick={runComprehensiveTest}
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? 'Running Tests...' : 'Run Comprehensive Test'}
            </TouchButton>
            <TouchButton
              variant="outline"
              onClick={loadAllData}
              className="w-full"
            >
              Refresh All Data
            </TouchButton>
            <TouchButton
              variant="outline"
              onClick={resetAllData}
              className="w-full text-red-600"
            >
              Reset All Data
            </TouchButton>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Test Results
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {testResults.map((result) => (
                <div 
                  key={result.id} 
                  className={`p-4 rounded-lg border ${
                    result.result === 'PASS' 
                      ? 'bg-green-50 border-green-200' 
                      : result.result === 'FAIL'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium mr-3 ${
                          result.result === 'PASS' 
                            ? 'bg-green-100 text-green-800' 
                            : result.result === 'FAIL'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {result.result}
                        </span>
                        <h3 className="font-medium text-gray-900">
                          {result.test}
                        </h3>
                      </div>
                      {result.details && (
                        <p className="text-sm text-gray-600 mt-1">
                          {result.details}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {result.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Data State */}
        {dashboardData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Dashboard Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Dashboard Stats
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Products:</span>
                  <span className="font-medium">{dashboardData.stats.totalProducts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Suppliers:</span>
                  <span className="font-medium">{dashboardData.stats.totalSuppliers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Transactions:</span>
                  <span className="font-medium">{dashboardData.stats.totalTransactions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Low Stock Items:</span>
                  <span className="font-medium text-red-600">{dashboardData.stats.lowStockCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Value:</span>
                  <span className="font-medium">{formatRupiah(dashboardData.stats.totalValue)}</span>
                </div>
              </div>
            </div>

            {/* Suppliers */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Suppliers ({suppliers.length})
              </h2>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {suppliers.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No suppliers</p>
                ) : (
                  suppliers.map((supplier) => (
                    <div key={supplier.id} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="font-medium">{supplier.name}</div>
                      <div className="text-xs text-gray-500">ID: {supplier.id}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Products */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Products ({products.length})
              </h2>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {products.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No products</p>
                ) : (
                  products.map((product) => (
                    <div key={product.id} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-gray-500">
                        Stock: {product.currentStock}/{product.minimumStock} | ID: {product.id}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Low Stock Alerts ({dashboardData.lowStockAlerts.length})
              </h2>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {dashboardData.lowStockAlerts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No low stock alerts</p>
                ) : (
                  dashboardData.lowStockAlerts.map((alert) => (
                    <div key={alert.id} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                      <div className="font-medium text-red-900">{alert.name}</div>
                      <div className="text-xs text-red-700">
                        Current: {alert.currentStock} | Min: {alert.minimumStock}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Transactions ({transactions.length})
              </h2>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {transactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No transactions</p>
                ) : (
                  transactions.slice(0, 10).map((transaction) => (
                    <div key={transaction.id} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="font-medium">{transaction.referenceNumber}</div>
                      <div className="text-xs text-gray-500">
                        {transaction.type} | {formatRupiah(transaction.totalValue)} | {transaction.items.length} items
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity ({dashboardData.activity.length})
              </h2>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {dashboardData.activity.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                ) : (
                  dashboardData.activity.map((activity) => (
                    <div key={activity.id} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="font-medium">{activity.description}</div>
                      <div className="text-xs text-gray-500">
                        {activity.referenceNumber} | {new Date(activity.timestamp).toLocaleString('id-ID')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Debug Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TouchButton
              variant="outline"
              onClick={() => {
                console.log('=== COMPLETE DEBUG INFO ===')
                console.log('Dashboard data:', dashboardData)
                console.log('Suppliers:', suppliers)
                console.log('Products:', products)
                console.log('Transactions:', transactions)
                console.log('localStorage demo-suppliers:', localStorage.getItem('demo-suppliers'))
                console.log('localStorage demo-products:', localStorage.getItem('demo-products'))
                console.log('localStorage demo-transactions:', localStorage.getItem('demo-transactions'))
                console.log('localStorage deleted-demo-suppliers:', localStorage.getItem('deleted-demo-suppliers'))
                console.log('localStorage deleted-demo-products:', localStorage.getItem('deleted-demo-products'))
              }}
              className="w-full text-xs"
            >
              Log Complete Debug Info
            </TouchButton>
            
            <TouchButton
              variant="outline"
              onClick={() => window.location.href = '/dashboard'}
              className="w-full text-xs"
            >
              Go to Real Dashboard
            </TouchButton>
          </div>
        </div>
      </div>
    </div>
  )
}