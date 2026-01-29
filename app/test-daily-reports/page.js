'use client'

import { useState, useEffect } from 'react'
import { 
  getDailyReportsData, 
  getWeeklyReportsData, 
  getMonthlyReportsData,
  getTopSellingProducts 
} from '@/lib/utils/demo-daily-reports'
import { formatRupiah } from '@/lib/utils/currency'

export default function TestDailyReportsPage() {
  const [data, setData] = useState({
    daily: { dailyData: [], summary: {} },
    weekly: [],
    monthly: [],
    topProducts: []
  })
  const [loading, setLoading] = useState(true)

  const loadData = () => {
    try {
      console.log('[Test Daily Reports] Loading data...')
      
      const daily = getDailyReportsData(30)
      const weekly = getWeeklyReportsData()
      const monthly = getMonthlyReportsData()
      const topProducts = getTopSellingProducts(30)

      console.log('[Test Daily Reports] Data loaded:', {
        dailyRecords: daily.dailyData.length,
        weeklyRecords: weekly.length,
        monthlyRecords: monthly.length,
        topProducts: topProducts.length
      })

      setData({
        daily,
        weekly,
        monthly,
        topProducts
      })
      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Daily Reports</h1>
        <p className="text-gray-600">Test the daily reports functionality</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Daily Data</h3>
          <p className="text-3xl font-bold text-blue-600">{data.daily.dailyData.length}</p>
          <p className="text-sm text-gray-500 mt-2">Records</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Weekly Data</h3>
          <p className="text-3xl font-bold text-green-600">{data.weekly.length}</p>
          <p className="text-sm text-gray-500 mt-2">Records</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Data</h3>
          <p className="text-3xl font-bold text-purple-600">{data.monthly.length}</p>
          <p className="text-sm text-gray-500 mt-2">Records</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Top Products</h3>
          <p className="text-3xl font-bold text-orange-600">{data.topProducts.length}</p>
          <p className="text-sm text-gray-500 mt-2">Products</p>
        </div>
      </div>

      {/* Daily Summary */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Daily Summary (30 days)</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-green-600">
                {formatRupiah(data.daily.summary.totalSales || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Profit</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatRupiah(data.daily.summary.totalProfit || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Daily Sales</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatRupiah(data.daily.summary.averageDailySales || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Daily Data */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Recent Daily Data (Last 7 days)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transactions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.daily.dailyData.slice(0, 7).map((day, index) => (
                <tr key={day.date} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {day.dayName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(day.date).toLocaleDateString('id-ID')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatRupiah(day.sales)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      day.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatRupiah(day.profit)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {day.transactionCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Top Selling Products (30 days)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profit
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.topProducts.slice(0, 5).map((product, index) => (
                <tr key={product.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {product.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.sku}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.quantitySold} unit
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatRupiah(product.totalRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      product.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatRupiah(product.totalProfit)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          href="/reports/daily-reports"
          className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Go to Daily Reports
        </a>
        
        <a
          href="/dashboard"
          className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Back to Dashboard
        </a>
      </div>

      {/* Debug Info */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Debug Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Daily Records:</strong> {data.daily.dailyData.length}
          </div>
          <div>
            <strong>Weekly Records:</strong> {data.weekly.length}
          </div>
          <div>
            <strong>Monthly Records:</strong> {data.monthly.length}
          </div>
          <div>
            <strong>Top Products:</strong> {data.topProducts.length}
          </div>
          <div>
            <strong>Total Sales:</strong> {formatRupiah(data.daily.summary.totalSales || 0)}
          </div>
          <div>
            <strong>Total Profit:</strong> {formatRupiah(data.daily.summary.totalProfit || 0)}
          </div>
        </div>
      </div>
    </div>
  )
}