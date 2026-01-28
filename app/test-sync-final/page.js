'use client'

import { useState, useEffect } from 'react'
import { getDemoDashboardData } from '@/lib/utils/demo-dashboard'
import { saveDemoSupplier, getDemoSuppliers } from '@/lib/utils/demo-suppliers'
import { saveDemoProduct, getDemoProducts } from '@/lib/utils/demo-products'
import { createDemoTransaction } from '@/lib/utils/demo-transactions'
import { formatRupiah } from '@/lib/utils/currency'
import TouchButton from '@/components/ui/TouchButton'

export default function TestSyncFinal() {
  const [dashboardData, setDashboardData] = useState(null)
  const [testLog, setTestLog] = useState([])
  const [isRunning, setIsRunning] = useState(false)

  const addLog = (message, type = 'info') => {
    const logEntry = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleString('id-ID')
    }
    setTestLog(prev => [logEntry, ...prev])
    console.log(`[${type.toUpperCase()}] ${message}`)
  }

  const loadDashboardData = () => {
    const data = getDemoDashboardData()
    setDashboardData(data)
    addLog(`Dashboard data loaded: ${data.stats.totalProducts} products, ${data.stats.totalSuppliers} suppliers, ${data.stats.totalTransactions} transactions`)
  }

  useEffect(() => {
    loadDashboardData()
    
    // Listen for data changes
    const handleDataUpdate = (event) => {
      addLog(`Data update event received: ${event.type}`)
      loadDashboardData()
    }

    window.addEventListener('suppliersUpdated', handleDataUpdate)
    window.addEventListener('productsUpdated', handleDataUpdate)
    window.addEventListener('transactionsUpdated', handleDataUpdate)

    return () => {
      window.removeEventListener('suppliersUpdated', handleDataUpdate)
      window.removeEventListener('productsUpdated', handleDataUpdate)
      window.removeEventListener('transactionsUpdated', handleDataUpdate)
    }
  }, [])

  const runQuickTest = async () => {
    setIsRunning(true)
    setTestLog([])
    
    try {
      addLog('Starting quick synchronization test...', 'info')
      
      // Step 1: Add a supplier
      const testSupplier = {
        id: `quick-test-supp-${Date.now()}`,
        name: `Quick Test Supplier`,
        contact: 'Test contact',
        notes: 'Quick test supplier',
        transactionCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      addLog('Adding test supplier...', 'info')
      saveDemoSupplier(testSupplier)
      window.dispatchEvent(new CustomEvent('suppliersUpdated', { detail: testSupplier }))
      
      // Wait for sync
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const suppliersAfterAdd = getDemoSuppliers()
      const dashboardAfterSupplier = getDemoDashboardData()
      
      if (suppliersAfterAdd.some(s => s.id === testSupplier.id)) {
        addLog('✅ Supplier added successfully', 'success')
      } else {
        addLog('❌ Supplier not found in list', 'error')
      }
      
      if (dashboardAfterSupplier.stats.totalSuppliers === suppliersAfterAdd.length) {
        addLog('✅ Dashboard supplier count synchronized', 'success')
      } else {
        addLog('❌ Dashboard supplier count not synchronized', 'error')
      }
      
      // Step 2: Add a low stock product
      const testProduct = {
        id: `quick-test-prod-${Date.now()}`,
        sku: `QT-${Date.now()}`,
        brand: 'Quick Test',
        name: `Quick Test Product`,
        category: 'Test',
        size: '1',
        unit: 'Unit',
        purchasePrice: 5000,
        sellingPrice: 8000,
        minimumStock: 10,
        currentStock: 3, // Low stock
        transactionCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      addLog('Adding low stock test product...', 'info')
      saveDemoProduct(testProduct)
      window.dispatchEvent(new CustomEvent('productsUpdated', { detail: testProduct }))
      
      // Wait for sync
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const productsAfterAdd = getDemoProducts()
      const dashboardAfterProduct = getDemoDashboardData()
      
      if (productsAfterAdd.some(p => p.id === testProduct.id)) {
        addLog('✅ Product added successfully', 'success')
      } else {
        addLog('❌ Product not found in list', 'error')
      }
      
      if (dashboardAfterProduct.stats.totalProducts === productsAfterAdd.length) {
        addLog('✅ Dashboard product count synchronized', 'success')
      } else {
        addLog('❌ Dashboard product count not synchronized', 'error')
      }
      
      if (dashboardAfterProduct.lowStockAlerts.some(alert => alert.id === testProduct.id)) {
        addLog('✅ Low stock alert generated', 'success')
      } else {
        addLog('❌ Low stock alert not generated', 'error')
      }
      
      // Step 3: Create a transaction
      const transactionData = {
        type: 'IN',
        transactionDate: new Date(),
        supplierId: testSupplier.id,
        notes: 'Quick test transaction',
        items: [
          {
            productId: testProduct.id,
            quantity: 15,
            unitCost: 5000,
            product: {
              id: testProduct.id,
              name: testProduct.name,
              sku: testProduct.sku,
              brand: testProduct.brand
            }
          }
        ]
      }
      
      addLog('Creating test transaction...', 'info')
      const transactionResult = createDemoTransaction(transactionData)
      
      // Wait for sync
      await new Promise(resolve => setTimeout(resolve, 300))
      
      if (transactionResult.success) {
        addLog('✅ Transaction created successfully', 'success')
      } else {
        addLog('❌ Transaction creation failed', 'error')
      }
      
      const finalDashboard = getDemoDashboardData()
      const updatedProduct = getDemoProducts().find(p => p.id === testProduct.id)
      
      if (updatedProduct && updatedProduct.currentStock === 18) { // 3 + 15
        addLog('✅ Product stock updated correctly', 'success')
      } else {
        addLog(`❌ Product stock not updated correctly. Expected: 18, Got: ${updatedProduct?.currentStock}`, 'error')
      }
      
      if (finalDashboard.stats.totalTransactions > dashboardAfterProduct.stats.totalTransactions) {
        addLog('✅ Dashboard transaction count synchronized', 'success')
      } else {
        addLog('❌ Dashboard transaction count not synchronized', 'error')
      }
      
      if (finalDashboard.stats.totalValue > 0) {
        addLog(`✅ Dashboard total value updated: ${formatRupiah(finalDashboard.stats.totalValue)}`, 'success')
      } else {
        addLog('❌ Dashboard total value not updated', 'error')
      }
      
      // Check if low stock alert is resolved
      if (!finalDashboard.lowStockAlerts.some(alert => alert.id === testProduct.id)) {
        addLog('✅ Low stock alert resolved after stock increase', 'success')
      } else {
        addLog('⚠️ Low stock alert still present (may be expected if still below minimum)', 'warning')
      }
      
      addLog('Quick test completed!', 'success')
      
    } catch (error) {
      addLog(`Test error: ${error.message}`, 'error')
    } finally {
      setIsRunning(false)
    }
  }

  const resetData = () => {
    localStorage.removeItem('demo-suppliers')
    localStorage.removeItem('demo-products')
    localStorage.removeItem('demo-transactions')
    localStorage.removeItem('deleted-demo-suppliers')
    localStorage.removeItem('deleted-demo-products')
    setTestLog([])
    loadDashboardData()
    addLog('All data reset to defaults', 'info')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Final Synchronization Test
          </h1>
          <p className="text-gray-600">
            Quick test to verify all data synchronization is working properly
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TouchButton
              variant="primary"
              onClick={runQuickTest}
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? 'Running Test...' : 'Run Quick Test'}
            </TouchButton>
            <TouchButton
              variant="outline"
              onClick={loadDashboardData}
              className="w-full"
            >
              Refresh Dashboard
            </TouchButton>
            <TouchButton
              variant="outline"
              onClick={resetData}
              className="w-full text-red-600"
            >
              Reset Data
            </TouchButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Log */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Test Log ({testLog.length})
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testLog.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No test logs yet</p>
              ) : (
                testLog.map((log) => (
                  <div 
                    key={log.id} 
                    className={`p-3 rounded text-sm ${
                      log.type === 'success' 
                        ? 'bg-green-50 text-green-800' 
                        : log.type === 'error'
                        ? 'bg-red-50 text-red-800'
                        : log.type === 'warning'
                        ? 'bg-yellow-50 text-yellow-800'
                        : 'bg-blue-50 text-blue-800'
                    }`}
                  >
                    <div className="font-medium">{log.message}</div>
                    <div className="text-xs opacity-75 mt-1">{log.timestamp}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Current Dashboard State */}
          {dashboardData && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Current Dashboard State
              </h2>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded p-3">
                  <div className="text-2xl font-bold text-blue-600">
                    {dashboardData.stats.totalProducts}
                  </div>
                  <div className="text-sm text-blue-800">Products</div>
                </div>
                <div className="bg-green-50 rounded p-3">
                  <div className="text-2xl font-bold text-green-600">
                    {dashboardData.stats.totalSuppliers}
                  </div>
                  <div className="text-sm text-green-800">Suppliers</div>
                </div>
                <div className="bg-purple-50 rounded p-3">
                  <div className="text-2xl font-bold text-purple-600">
                    {dashboardData.stats.totalTransactions}
                  </div>
                  <div className="text-sm text-purple-800">Transactions</div>
                </div>
                <div className="bg-red-50 rounded p-3">
                  <div className="text-2xl font-bold text-red-600">
                    {dashboardData.stats.lowStockCount}
                  </div>
                  <div className="text-sm text-red-800">Low Stock</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded p-3 mb-4">
                <div className="text-lg font-bold text-gray-900">
                  {formatRupiah(dashboardData.stats.totalValue)}
                </div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>

              {/* Low Stock Alerts */}
              {dashboardData.lowStockAlerts.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Low Stock Alerts ({dashboardData.lowStockAlerts.length})
                  </h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {dashboardData.lowStockAlerts.map((alert) => (
                      <div key={alert.id} className="bg-red-50 border border-red-200 rounded p-2 text-sm">
                        <div className="font-medium text-red-900">{alert.name}</div>
                        <div className="text-red-700">
                          Stock: {alert.currentStock} / Min: {alert.minimumStock}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              {dashboardData.activity.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Recent Activity ({dashboardData.activity.length})
                  </h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {dashboardData.activity.slice(0, 3).map((activity) => (
                      <div key={activity.id} className="bg-gray-50 rounded p-2 text-sm">
                        <div className="font-medium">{activity.description}</div>
                        <div className="text-gray-600 text-xs">
                          {activity.referenceNumber}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Test Navigation
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <TouchButton
              variant="outline"
              onClick={() => window.location.href = '/dashboard'}
              className="w-full text-sm"
            >
              Real Dashboard
            </TouchButton>
            <TouchButton
              variant="outline"
              onClick={() => window.location.href = '/suppliers'}
              className="w-full text-sm"
            >
              Suppliers Page
            </TouchButton>
            <TouchButton
              variant="outline"
              onClick={() => window.location.href = '/products'}
              className="w-full text-sm"
            >
              Products Page
            </TouchButton>
            <TouchButton
              variant="outline"
              onClick={() => window.location.href = '/transactions/stock-in'}
              className="w-full text-sm"
            >
              Stock In Page
            </TouchButton>
          </div>
        </div>
      </div>
    </div>
  )
}