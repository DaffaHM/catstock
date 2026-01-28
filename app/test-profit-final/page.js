'use client'

import { useState, useEffect } from 'react'
import { getDemoProfitData } from '@/lib/utils/demo-dashboard'
import { getDemoProducts } from '@/lib/utils/demo-products'
import { getDemoTransactions } from '@/lib/utils/demo-transactions'
import { formatRupiah } from '@/lib/utils/currency'
import ProfitAnalysisPage from '@/components/profit/ProfitAnalysisPage'

export default function TestProfitFinalPage() {
  const [demoData, setDemoData] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadData = () => {
    try {
      const products = getDemoProducts()
      const transactions = getDemoTransactions()
      const profitData = getDemoProfitData()

      console.log('[Test Profit Final] Products:', products.length)
      console.log('[Test Profit Final] Transactions:', transactions.transactions.length)
      console.log('[Test Profit Final] Profit Data:', profitData)

      setDemoData({
        products,
        transactions: transactions.transactions,
        profitData
      })
      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    // Listen for data changes
    const handleDataUpdate = () => {
      console.log('[Test Profit Final] Data updated, refreshing')
      loadData()
    }

    window.addEventListener('transactionsUpdated', handleDataUpdate)
    window.addEventListener('productsUpdated', handleDataUpdate)
    
    return () => {
      window.removeEventListener('transactionsUpdated', handleDataUpdate)
      window.removeEventListener('productsUpdated', handleDataUpdate)
    }
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading test data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Profit Analysis Final</h1>
        <p className="text-gray-600">Testing final profit analysis synchronization</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Products</h3>
          <p className="text-3xl font-bold text-blue-600">{demoData?.products?.length || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Transactions</h3>
          <p className="text-3xl font-bold text-green-600">{demoData?.transactions?.length || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Profit Products</h3>
          <p className="text-3xl font-bold text-purple-600">{demoData?.profitData?.profitByProduct?.length || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Profit</h3>
          <p className="text-2xl font-bold text-emerald-600">{formatRupiah(demoData?.profitData?.totalProfit || 0)}</p>
        </div>
      </div>

      {/* Sample Profit Data */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Sample Profit Data (Top 5)</h2>
        </div>
        <div className="p-6">
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
                {demoData?.profitData?.profitByProduct?.slice(0, 5).map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.sku}</div>
                      </div>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatRupiah(product.totalProfit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Testing Instructions</h3>
        <ol className="list-decimal list-inside space-y-2 text-yellow-700">
          <li>Check if the profit analysis component below shows the same data as the table above</li>
          <li>Go to <a href="/transactions/stock-out" className="underline">Stock Out</a> and create a new sale transaction</li>
          <li>Return to this page and verify the profit data updates automatically</li>
          <li>The "Total Keuntungan" should match between dashboard and profit analysis</li>
        </ol>
      </div>

      {/* Actual Profit Analysis Component */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Profit Analysis Component</h2>
          <p className="text-sm text-gray-600 mt-1">This should show synchronized data from localStorage</p>
        </div>
        <div className="p-6">
          <ProfitAnalysisPage />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 text-center space-x-4">
        <button
          onClick={loadData}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Data
        </button>
        
        <a
          href="/transactions/stock-out"
          className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Create Sale Transaction
        </a>
        
        <a
          href="/dashboard"
          className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          View Dashboard
        </a>
      </div>
    </div>
  )
}