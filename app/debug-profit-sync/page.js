'use client'

import { useState, useEffect } from 'react'
import { getDemoProfitData } from '@/lib/utils/demo-dashboard'
import { getDemoProducts } from '@/lib/utils/demo-products'
import { getDemoTransactions } from '@/lib/utils/demo-transactions'
import { formatRupiah } from '@/lib/utils/currency'

// Check if we're in demo mode
function isDemoMode() {
  if (typeof window === 'undefined') return false
  
  try {
    const session = localStorage.getItem('quick-session')
    if (session) {
      const parsed = JSON.parse(session)
      return parsed.user?.email === 'demo@catstock.com' || parsed.user?.email === 'owner@catstock.com'
    }
  } catch (error) {
    console.error('Error checking demo mode:', error)
  }
  
  return false
}

export default function DebugProfitSyncPage() {
  const [debugInfo, setDebugInfo] = useState({})
  const [loading, setLoading] = useState(true)

  const loadDebugInfo = () => {
    try {
      const isDemo = isDemoMode()
      const session = localStorage.getItem('quick-session')
      const products = getDemoProducts()
      const transactions = getDemoTransactions()
      const profitData = getDemoProfitData()

      setDebugInfo({
        isDemo,
        session: session ? JSON.parse(session) : null,
        productsCount: products.length,
        transactionsCount: transactions.transactions.length,
        profitData,
        localStorage: {
          'demo-products': localStorage.getItem('demo-products') ? 'EXISTS' : 'NOT_FOUND',
          'demo-transactions': localStorage.getItem('demo-transactions') ? 'EXISTS' : 'NOT_FOUND',
          'demo-suppliers': localStorage.getItem('demo-suppliers') ? 'EXISTS' : 'NOT_FOUND',
          'quick-session': localStorage.getItem('quick-session') ? 'EXISTS' : 'NOT_FOUND'
        }
      })
      setLoading(false)
    } catch (error) {
      console.error('Error loading debug info:', error)
      setDebugInfo({ error: error.message })
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDebugInfo()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading debug info...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Debug Profit Synchronization</h1>
        <p className="text-gray-600">Debugging profit analysis data synchronization</p>
      </div>

      {/* Demo Mode Status */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Demo Mode Status</h2>
        <div className="space-y-2">
          <p><strong>Is Demo Mode:</strong> <span className={debugInfo.isDemo ? 'text-green-600' : 'text-red-600'}>{debugInfo.isDemo ? 'YES' : 'NO'}</span></p>
          <p><strong>Session Email:</strong> {debugInfo.session?.user?.email || 'NOT_FOUND'}</p>
          <p><strong>Session Authenticated:</strong> {debugInfo.session?.isAuthenticated ? 'YES' : 'NO'}</p>
        </div>
      </div>

      {/* LocalStorage Status */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">LocalStorage Status</h2>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(debugInfo.localStorage || {}).map(([key, status]) => (
            <div key={key} className="flex justify-between">
              <span>{key}:</span>
              <span className={status === 'EXISTS' ? 'text-green-600' : 'text-red-600'}>{status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Counts */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Data Counts</h2>
        <div className="space-y-2">
          <p><strong>Products:</strong> {debugInfo.productsCount}</p>
          <p><strong>Transactions:</strong> {debugInfo.transactionsCount}</p>
          <p><strong>Profit Products:</strong> {debugInfo.profitData?.profitByProduct?.length || 0}</p>
          <p><strong>Profit Categories:</strong> {debugInfo.profitData?.profitByCategory?.length || 0}</p>
          <p><strong>Total Profit:</strong> {formatRupiah(debugInfo.profitData?.totalProfit || 0)}</p>
        </div>
      </div>

      {/* Profit Data Details */}
      {debugInfo.profitData && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Profit Data Details</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchase</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Selling</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Profit</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {debugInfo.profitData.profitByProduct?.slice(0, 10).map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatRupiah(product.purchasePrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatRupiah(product.sellingPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.totalSold}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {formatRupiah(product.totalProfit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Raw Session Data */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibent mb-4">Raw Session Data</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
          {JSON.stringify(debugInfo.session, null, 2)}
        </pre>
      </div>

      {/* Actions */}
      <div className="text-center space-x-4">
        <button
          onClick={loadDebugInfo}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Debug Info
        </button>
        
        <button
          onClick={() => {
            localStorage.clear()
            window.location.reload()
          }}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Clear All Data & Reload
        </button>
      </div>
    </div>
  )
}