'use client'

import { useState, useEffect } from 'react'
import { getDemoProducts, resetDemoProducts } from '@/lib/utils/demo-products'
import { getDemoSuppliers, resetDemoSuppliers } from '@/lib/utils/demo-suppliers'
import { getDemoTransactions, resetDemoTransactions } from '@/lib/utils/demo-transactions'
import { getDemoDashboardData } from '@/lib/utils/demo-dashboard'
import { formatRupiah } from '@/lib/utils/currency'

export default function TestResetPage() {
  const [data, setData] = useState({
    products: [],
    suppliers: [],
    transactions: [],
    dashboardData: null
  })
  const [loading, setLoading] = useState(true)

  const loadData = () => {
    try {
      console.log('[Test Reset] Loading data...')
      
      const products = getDemoProducts()
      const suppliers = getDemoSuppliers()
      const transactions = getDemoTransactions()
      const dashboardData = getDemoDashboardData()

      console.log('[Test Reset] Products:', products.length)
      console.log('[Test Reset] Suppliers:', suppliers.length)
      console.log('[Test Reset] Transactions:', transactions.transactions.length)

      setData({
        products,
        suppliers,
        transactions: transactions.transactions,
        dashboardData
      })
      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setLoading(false)
    }
  }

  const handleResetAll = () => {
    try {
      console.log('[Test Reset] Resetting all data...')
      
      // Reset all data
      resetDemoProducts()
      resetDemoSuppliers()
      resetDemoTransactions()
      
      // Clear additional localStorage keys
      const keysToRemove = [
        'demo-products',
        'demo-suppliers', 
        'demo-transactions',
        'deleted-demo-products',
        'deleted-demo-suppliers'
      ]
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key)
        } catch (error) {
          console.warn(`Failed to remove ${key}:`, error)
        }
      })
      
      console.log('[Test Reset] All data cleared')
      
      // Reload data
      loadData()
      
      // Notify other components
      window.dispatchEvent(new CustomEvent('productsUpdated'))
      window.dispatchEvent(new CustomEvent('suppliersUpdated'))
      window.dispatchEvent(new CustomEvent('transactionsUpdated'))
      
      alert('Semua data berhasil direset!')
      
    } catch (error) {
      console.error('Error resetting data:', error)
      alert('Terjadi kesalahan saat mereset data: ' + error.message)
    }
  }

  useEffect(() => {
    loadData()

    // Listen for data changes
    const handleDataUpdate = () => {
      console.log('[Test Reset] Data updated, refreshing')
      loadData()
    }

    window.addEventListener('transactionsUpdated', handleDataUpdate)
    window.addEventListener('productsUpdated', handleDataUpdate)
    window.addEventListener('suppliersUpdated', handleDataUpdate)
    
    return () => {
      window.removeEventListener('transactionsUpdated', handleDataUpdate)
      window.removeEventListener('productsUpdated', handleDataUpdate)
      window.removeEventListener('suppliersUpdated', handleDataUpdate)
    }
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Reset Functionality</h1>
        <p className="text-gray-600">Test the reset all data functionality</p>
      </div>

      {/* Current Data Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Products</h3>
          <p className="text-3xl font-bold text-blue-600">{data.products.length}</p>
          <p className="text-sm text-gray-500 mt-2">In localStorage</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Suppliers</h3>
          <p className="text-3xl font-bold text-green-600">{data.suppliers.length}</p>
          <p className="text-sm text-gray-500 mt-2">In localStorage</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Transactions</h3>
          <p className="text-3xl font-bold text-purple-600">{data.transactions.length}</p>
          <p className="text-sm text-gray-500 mt-2">In localStorage</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Profit</h3>
          <p className="text-2xl font-bold text-emerald-600">{formatRupiah(data.dashboardData?.profit?.totalProfit || 0)}</p>
          <p className="text-sm text-gray-500 mt-2">Calculated</p>
        </div>
      </div>

      {/* LocalStorage Keys Status */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">LocalStorage Keys Status</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'demo-products',
              'demo-suppliers',
              'demo-transactions',
              'deleted-demo-products',
              'deleted-demo-suppliers',
              'quick-session'
            ].map(key => {
              const exists = localStorage.getItem(key) !== null
              return (
                <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-mono text-sm">{key}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    exists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {exists ? 'EXISTS' : 'NOT_FOUND'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Reset Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Reset Instructions</h3>
        <ol className="list-decimal list-inside space-y-2 text-yellow-700">
          <li>Check current data counts above</li>
          <li>Click "Reset All Data" button below</li>
          <li>Verify all counts return to base values (8 products, 2 suppliers, 0 transactions)</li>
          <li>Check that localStorage keys are cleared</li>
          <li>Visit other pages to verify they also show reset data</li>
        </ol>
      </div>

      {/* Actions */}
      <div className="text-center space-x-4">
        <button
          onClick={loadData}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Data
        </button>
        
        <button
          onClick={handleResetAll}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reset All Data
        </button>
        
        <a
          href="/dashboard"
          className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Go to Dashboard
        </a>
        
        <a
          href="/products"
          className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Check Products
        </a>
        
        <a
          href="/suppliers"
          className="inline-block px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Check Suppliers
        </a>
      </div>

      {/* Expected Values After Reset */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Expected Values After Reset</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <strong>Products:</strong> 8 (base demo products)
          </div>
          <div>
            <strong>Suppliers:</strong> 2 (base demo suppliers)
          </div>
          <div>
            <strong>Transactions:</strong> 0 (all cleared)
          </div>
          <div>
            <strong>Total Profit:</strong> Rp 0 (no transactions)
          </div>
        </div>
      </div>
    </div>
  )
}