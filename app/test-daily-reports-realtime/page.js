'use client'

import { useState, useEffect } from 'react'
import { getDemoProducts } from '@/lib/utils/demo-products'
import { getDemoTransactions, createDemoTransaction } from '@/lib/utils/demo-transactions'
import { getDailyReportsData } from '@/lib/utils/demo-daily-reports'
import { formatRupiah } from '@/lib/utils/currency'

export default function TestDailyReportsRealtimePage() {
  const [products, setProducts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [dailyReports, setDailyReports] = useState({ dailyData: [], summary: {} })
  const [testResults, setTestResults] = useState([])
  const [isCreatingTransaction, setIsCreatingTransaction] = useState(false)

  useEffect(() => {
    loadAllData()
    
    // Listen for data changes
    const handleDataUpdate = () => {
      console.log('[Test] Data updated, refreshing...')
      loadAllData()
    }

    window.addEventListener('transactionsUpdated', handleDataUpdate)
    window.addEventListener('productsUpdated', handleDataUpdate)
    window.addEventListener('storage', handleDataUpdate)

    return () => {
      window.removeEventListener('transactionsUpdated', handleDataUpdate)
      window.removeEventListener('productsUpdated', handleDataUpdate)
      window.removeEventListener('storage', handleDataUpdate)
    }
  }, [])

  const loadAllData = () => {
    const productsData = getDemoProducts()
    const transactionsData = getDemoTransactions()
    const reportsData = getDailyReportsData(7) // Last 7 days

    setProducts(productsData)
    setTransactions(transactionsData.transactions)
    setDailyReports(reportsData)

    console.log('Loaded data:', {
      products: productsData.length,
      transactions: transactionsData.transactions.length,
      dailyReports: reportsData.dailyData.length,
      totalSales: reportsData.summary.totalSales,
      totalProfit: reportsData.summary.totalProfit
    })
  }

  const createTestTransaction = async () => {
    if (products.length === 0) {
      setTestResults(prev => [...prev, 'ERROR: No products available to create transaction'])
      return
    }

    setIsCreatingTransaction(true)
    
    try {
      // Get a random product
      const randomProduct = products[Math.floor(Math.random() * products.length)]
      const quantity = Math.floor(Math.random() * 5) + 1 // 1-5 units
      
      const transactionData = {
        type: 'OUT',
        transactionDate: new Date().toISOString(),
        supplierId: 'demo-supp-1',
        notes: `Test transaction - ${new Date().toLocaleTimeString('id-ID')}`,
        items: [{
          productId: randomProduct.id,
          quantity: quantity,
          unitPrice: randomProduct.sellingPrice,
          product: randomProduct
        }]
      }

      console.log('Creating test transaction:', transactionData)
      
      const result = await createDemoTransaction(transactionData)
      
      if (result.success) {
        const revenue = randomProduct.sellingPrice * quantity
        const profit = (randomProduct.sellingPrice - randomProduct.purchasePrice) * quantity
        
        setTestResults(prev => [...prev, 
          `SUCCESS: Created transaction - ${randomProduct.name} x${quantity} = ${formatRupiah(revenue)} (Profit: ${formatRupiah(profit)})`
        ])
        
        // Wait a bit for events to propagate, then reload data
        setTimeout(() => {
          loadAllData()
        }, 100)
      } else {
        setTestResults(prev => [...prev, `ERROR: ${result.error}`])
      }
    } catch (error) {
      setTestResults(prev => [...prev, `ERROR: ${error.message}`])
    } finally {
      setIsCreatingTransaction(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  const getTodayData = () => {
    const today = new Date().toISOString().split('T')[0]
    return dailyReports.dailyData.find(day => day.date === today) || {
      sales: 0,
      profit: 0,
      transactionCount: 0,
      itemsSold: 0
    }
  }

  const todayData = getTodayData()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Daily Reports Real-time</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Current Status</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Products Available:</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {products.length} items
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Total Transactions:</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {transactions.length} transactions
                </span>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Today's Performance</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Sales:</span>
                    <div className="font-bold text-blue-900">{formatRupiah(todayData.sales)}</div>
                  </div>
                  <div>
                    <span className="text-blue-700">Profit:</span>
                    <div className="font-bold text-blue-900">{formatRupiah(todayData.profit)}</div>
                  </div>
                  <div>
                    <span className="text-blue-700">Transactions:</span>
                    <div className="font-bold text-blue-900">{todayData.transactionCount}</div>
                  </div>
                  <div>
                    <span className="text-blue-700">Items Sold:</span>
                    <div className="font-bold text-blue-900">{todayData.itemsSold}</div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">7-Day Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-700">Total Sales:</span>
                    <div className="font-bold text-green-900">{formatRupiah(dailyReports.summary.totalSales)}</div>
                  </div>
                  <div>
                    <span className="text-green-700">Total Profit:</span>
                    <div className="font-bold text-green-900">{formatRupiah(dailyReports.summary.totalProfit)}</div>
                  </div>
                  <div>
                    <span className="text-green-700">Days with Sales:</span>
                    <div className="font-bold text-green-900">{dailyReports.summary.daysWithSales}</div>
                  </div>
                  <div>
                    <span className="text-green-700">Avg Daily Sales:</span>
                    <div className="font-bold text-green-900">{formatRupiah(dailyReports.summary.averageDailySales)}</div>
                  </div>
                </div>
              </div>
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
            <h2 className="text-xl font-semibold mb-4">Real-time Test Actions</h2>
            
            <div className="space-y-3">
              <button
                onClick={createTestTransaction}
                disabled={isCreatingTransaction || products.length === 0}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isCreatingTransaction ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Transaction...
                  </div>
                ) : (
                  '💰 Create Test Sale Transaction'
                )}
              </button>

              <button
                onClick={clearResults}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                🧹 Clear Test Results
              </button>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-medium text-yellow-900 mb-2">Real-time Features:</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>✅ Auto-refresh every 30 seconds</li>
                  <li>✅ Event-driven updates</li>
                  <li>✅ localStorage synchronization</li>
                  <li>✅ Live calculation updates</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mt-8">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg text-sm ${
                    result.includes('SUCCESS') 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  <span className="text-xs text-gray-500 mr-2">
                    {new Date().toLocaleTimeString('id-ID')}
                  </span>
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Data Table */}
        {dailyReports.dailyData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mt-8">
            <h2 className="text-xl font-semibold mb-4">Daily Reports Data (Last 7 Days)</h2>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items Sold
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dailyReports.dailyData.map((day, index) => (
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {day.itemsSold}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-8 text-center space-x-4">
          <a
            href="/reports/daily-reports"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            📊 Go to Daily Reports
          </a>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            🏠 Back to Dashboard
          </a>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">🧪 Testing Instructions</h2>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>1. Test Real-time Updates:</strong> Click "Create Test Sale Transaction" and watch the data update automatically</p>
            <p><strong>2. Check Daily Reports:</strong> Go to Daily Reports page and verify the data matches</p>
            <p><strong>3. Test Auto-refresh:</strong> Wait 30 seconds and see if data refreshes automatically</p>
            <p><strong>4. Test Event Listeners:</strong> Create transactions from other pages and see if this page updates</p>
            <p><strong>5. Test Multiple Transactions:</strong> Create several transactions and watch the cumulative effect</p>
          </div>
        </div>
      </div>
    </div>
  )
}