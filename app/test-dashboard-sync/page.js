'use client'

import { useState, useEffect } from 'react'
import { getDemoDashboardData } from '@/lib/utils/demo-dashboard'
import { saveDemoSupplier } from '@/lib/utils/demo-suppliers'
import { saveDemoProduct } from '@/lib/utils/demo-products'
import { createDemoTransaction } from '@/lib/utils/demo-transactions'
import TouchButton from '@/components/ui/TouchButton'

export default function TestDashboardSync() {
  const [dashboardData, setDashboardData] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const loadDashboardData = () => {
    const data = getDemoDashboardData()
    setDashboardData(data)
    console.log('Dashboard data loaded:', data)
  }

  useEffect(() => {
    loadDashboardData()
    
    // Listen for data changes
    const handleDataUpdate = () => {
      console.log('Data updated, refreshing dashboard')
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
  }, [refreshKey])

  const addTestSupplier = () => {
    const testSupplier = {
      id: `test-supp-${Date.now()}`,
      name: `Test Supplier ${Date.now()}`,
      contact: 'Test contact info',
      notes: 'Added via dashboard sync test',
      transactionCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    saveDemoSupplier(testSupplier)
    window.dispatchEvent(new CustomEvent('suppliersUpdated', { detail: testSupplier }))
  }

  const addTestProduct = () => {
    const testProduct = {
      id: `test-prod-${Date.now()}`,
      sku: `TEST-${Date.now()}`,
      brand: 'Test Brand',
      name: `Test Product ${Date.now()}`,
      category: 'Test Category',
      size: '1',
      unit: 'Unit',
      purchasePrice: 10000,
      sellingPrice: 15000,
      minimumStock: 5,
      currentStock: 2, // Low stock to trigger alert
      transactionCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    saveDemoProduct(testProduct)
    window.dispatchEvent(new CustomEvent('productsUpdated', { detail: testProduct }))
  }

  const addTestTransaction = () => {
    const transactionData = {
      type: 'IN',
      transactionDate: new Date(),
      supplierId: 'demo-supp-1',
      notes: 'Test transaction from dashboard sync test',
      items: [
        {
          productId: 'demo-prod-1',
          quantity: 10,
          unitCost: 85000,
          product: {
            id: 'demo-prod-1',
            name: 'Cat Tembok Putih 5L',
            sku: 'CTB-001',
            brand: 'Brand A'
          }
        }
      ]
    }

    createDemoTransaction(transactionData)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Synchronization Test
          </h1>
          <p className="text-gray-600">
            Testing real-time dashboard data synchronization with localStorage
          </p>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Test Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TouchButton
              variant="primary"
              onClick={addTestSupplier}
              className="w-full"
            >
              Add Test Supplier
            </TouchButton>
            <TouchButton
              variant="primary"
              onClick={addTestProduct}
              className="w-full"
            >
              Add Test Product (Low Stock)
            </TouchButton>
            <TouchButton
              variant="primary"
              onClick={addTestTransaction}
              className="w-full"
            >
              Add Test Transaction
            </TouchButton>
          </div>
          <div className="mt-4">
            <TouchButton
              variant="outline"
              onClick={loadDashboardData}
              className="w-full"
            >
              Manual Refresh Dashboard
            </TouchButton>
          </div>
        </div>

        {/* Dashboard Stats */}
        {dashboardData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Dashboard Stats
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {dashboardData.stats.totalProducts}
                  </div>
                  <div className="text-sm text-blue-800">Total Products</div>
                </div>
                <div className="bg-green-50 rounded p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {dashboardData.stats.totalSuppliers}
                  </div>
                  <div className="text-sm text-green-800">Total Suppliers</div>
                </div>
                <div className="bg-purple-50 rounded p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {dashboardData.stats.totalTransactions}
                  </div>
                  <div className="text-sm text-purple-800">Total Transactions</div>
                </div>
                <div className="bg-yellow-50 rounded p-4">
                  <div className="text-2xl font-bold text-yellow-600">
                    {dashboardData.stats.lowStockCount}
                  </div>
                  <div className="text-sm text-yellow-800">Low Stock Items</div>
                </div>
              </div>
              <div className="mt-4 bg-gray-50 rounded p-4">
                <div className="text-lg font-bold text-gray-900">
                  Rp {dashboardData.stats.totalValue.toLocaleString('id-ID')}
                </div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Low Stock Alerts ({dashboardData.lowStockAlerts.length})
              </h2>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {dashboardData.lowStockAlerts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No low stock alerts
                  </p>
                ) : (
                  dashboardData.lowStockAlerts.map((alert) => (
                    <div key={alert.id} className="bg-red-50 border border-red-200 rounded p-3">
                      <div className="font-medium text-red-900">
                        {alert.name}
                      </div>
                      <div className="text-sm text-red-700">
                        Current: {alert.currentStock} | Minimum: {alert.minimumStock}
                      </div>
                      <div className="text-xs text-red-600">
                        Category: {alert.category}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity ({dashboardData.activity.length})
              </h2>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {dashboardData.activity.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No recent activity
                  </p>
                ) : (
                  dashboardData.activity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                      <div className="text-lg">
                        {activity.type === 'stock_in' ? '📥' : 
                         activity.type === 'stock_out' ? '📤' : '⚖️'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {activity.description}
                        </div>
                        <div className="text-sm text-gray-600">
                          {activity.referenceNumber} • {new Date(activity.timestamp).toLocaleString('id-ID')}
                        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TouchButton
              variant="outline"
              onClick={() => {
                console.log('=== DEBUG INFO ===')
                console.log('Dashboard data:', dashboardData)
                console.log('localStorage demo-suppliers:', localStorage.getItem('demo-suppliers'))
                console.log('localStorage demo-products:', localStorage.getItem('demo-products'))
                console.log('localStorage demo-transactions:', localStorage.getItem('demo-transactions'))
              }}
              className="w-full text-xs"
            >
              Log Debug Info
            </TouchButton>
            
            <TouchButton
              variant="outline"
              onClick={() => {
                localStorage.removeItem('demo-suppliers')
                localStorage.removeItem('demo-products')
                localStorage.removeItem('demo-transactions')
                localStorage.removeItem('deleted-demo-suppliers')
                localStorage.removeItem('deleted-demo-products')
                loadDashboardData()
              }}
              className="w-full text-xs text-red-600"
            >
              Reset All Data
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