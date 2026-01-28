'use client'

import { useState, useEffect } from 'react'
import { getDemoProfitData } from '@/lib/utils/demo-dashboard'
import { getDemoProducts } from '@/lib/utils/demo-products'
import { getDemoTransactions } from '@/lib/utils/demo-transactions'
import { formatRupiah } from '@/lib/utils/currency'

export default function TestProfitSimplePage() {
  const [data, setData] = useState({
    products: [],
    transactions: [],
    profitData: null
  })
  const [loading, setLoading] = useState(true)

  const loadData = () => {
    try {
      console.log('[Test Profit Simple] Loading data...')
      
      const products = getDemoProducts()
      const transactions = getDemoTransactions()
      const profitData = getDemoProfitData()

      console.log('[Test Profit Simple] Products:', products.length)
      console.log('[Test Profit Simple] Transactions:', transactions.transactions.length)
      console.log('[Test Profit Simple] Profit Data:', profitData)

      setData({
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
      console.log('[Test Profit Simple] Data updated, refreshing')
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
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Profit Simple</h1>
        <p className="text-gray-600">Simple test to verify profit data synchronization</p>
      </div>

      {/* Raw Data Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Products</h3>
          <p className="text-3xl font-bold text-blue-600">{data.products.length}</p>
          <p className="text-sm text-gray-500 mt-2">From localStorage</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Transactions</h3>
          <p className="text-3xl font-bold text-green-600">{data.transactions.length}</p>
          <p className="text-sm text-gray-500 mt-2">From localStorage</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Profit</h3>
          <p className="text-2xl font-bold text-emerald-600">{formatRupiah(data.profitData?.totalProfit || 0)}</p>
          <p className="text-sm text-gray-500 mt-2">Calculated from localStorage</p>
        </div>
      </div>

      {/* Profit by Product */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Profit by Product (localStorage)</h2>
        </div>
        <div className="p-6">
          {data.profitData?.profitByProduct?.length > 0 ? (
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
                  {data.profitData.profitByProduct.map((product) => (
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
          ) : (
            <p className="text-gray-500">No profit data available</p>
          )}
        </div>
      </div>

      {/* Raw Data Debug */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Debug Info</h3>
        <div className="space-y-2 text-sm">
          <p><strong>Products in localStorage:</strong> {data.products.length}</p>
          <p><strong>Transactions in localStorage:</strong> {data.transactions.length}</p>
          <p><strong>OUT transactions:</strong> {data.transactions.filter(t => t.type === 'OUT').length}</p>
          <p><strong>Profit products calculated:</strong> {data.profitData?.profitByProduct?.length || 0}</p>
          <p><strong>Total profit calculated:</strong> {formatRupiah(data.profitData?.totalProfit || 0)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="text-center space-x-4">
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
          href="/profit-analysis"
          className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          View Profit Analysis
        </a>
        
        <a
          href="/dashboard"
          className="inline-block px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          View Dashboard
        </a>
      </div>
    </div>
  )
}