'use client'

import { useState, useEffect } from 'react'
import { getDemoProfitData, getDemoDashboardStatsWithProfit } from '@/lib/utils/demo-dashboard'
import { getDemoProducts } from '@/lib/utils/demo-products'
import { getDemoTransactions } from '@/lib/utils/demo-transactions'
import { formatRupiah } from '@/lib/utils/currency'
import ProfitAnalysisPage from '@/components/profit/ProfitAnalysisPage'

export default function TestProfitSyncPage() {
  const [profitData, setProfitData] = useState(null)
  const [dashboardStats, setDashboardStats] = useState(null)
  const [products, setProducts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = () => {
    try {
      const profit = getDemoProfitData()
      const stats = getDemoDashboardStatsWithProfit()
      const prods = getDemoProducts()
      const txns = getDemoTransactions()

      setProfitData(profit)
      setDashboardStats(stats)
      setProducts(prods)
      setTransactions(txns.transactions)
      setLoading(false)
    } catch (error) {
      console.error('Error loading test data:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    // Listen for data changes
    const handleDataUpdate = () => {
      console.log('[Test Profit Sync] Data updated, refreshing')
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Profit Synchronization</h1>
        <p className="text-gray-600">Testing profit analysis synchronization with demo data</p>
      </div>

      {/* Debug Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Dashboard Stats</h2>
          <div className="space-y-2">
            <p><strong>Total Products:</strong> {dashboardStats?.totalProducts || 0}</p>
            <p><strong>Total Suppliers:</strong> {dashboardStats?.totalSuppliers || 0}</p>
            <p><strong>Total Transactions:</strong> {dashboardStats?.totalTransactions || 0}</p>
            <p><strong>Total Value:</strong> {formatRupiah(dashboardStats?.totalValue || 0)}</p>
            <p><strong>Total Profit:</strong> {formatRupiah(dashboardStats?.totalProfit || 0)}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Profit Summary</h2>
          <div className="space-y-2">
            <p><strong>Total Profit:</strong> {formatRupiah(profitData?.totalProfit || 0)}</p>
            <p><strong>Products with Profit:</strong> {profitData?.profitByProduct?.length || 0}</p>
            <p><strong>Categories:</strong> {profitData?.profitByCategory?.length || 0}</p>
            <p><strong>Monthly Data Points:</strong> {profitData?.monthlyProfit?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Product Profit Details */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Product Profit Details</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit/Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Profit</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {profitData?.profitByProduct?.map((product) => (
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
                      {formatRupiah(product.profitAmount)}
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

      {/* Category Profit Summary */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Profit by Category</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profitData?.profitByCategory?.map((category) => (
              <div key={category.category} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{category.category}</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Products:</strong> {category.totalProducts}</p>
                  <p><strong>Total Sold:</strong> {category.totalSold}</p>
                  <p><strong>Total Profit:</strong> {formatRupiah(category.totalProfit)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
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

      {/* Refresh Button */}
      <div className="mt-8 text-center">
        <button
          onClick={loadData}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Data
        </button>
      </div>
    </div>
  )
}