'use client'

import { useState, useEffect } from 'react'
import { generateLowStockAlerts, generateStockReport, getNotificationSummary } from '@/lib/utils/demo-notifications'
import { getDemoProducts } from '@/lib/utils/demo-products'
import { getDemoTransactions } from '@/lib/utils/demo-transactions'
import LowStockAlerts from '@/components/dashboard/LowStockAlerts'
import CurrentStockReportPage from '@/components/reports/CurrentStockReportPage'

export default function TestNotificationsSyncPage() {
  const [alerts, setAlerts] = useState([])
  const [stockReport, setStockReport] = useState({ products: [], summary: {} })
  const [notificationSummary, setNotificationSummary] = useState({})
  const [products, setProducts] = useState([])
  const [transactions, setTransactions] = useState([])

  const refreshData = () => {
    console.log('Refreshing notification and stock data...')
    
    // Get raw data
    const demoProducts = getDemoProducts()
    const demoTransactions = getDemoTransactions()
    
    // Generate synchronized reports
    const lowStockAlerts = generateLowStockAlerts()
    const stockReportData = generateStockReport()
    const notifSummary = getNotificationSummary()
    
    setProducts(demoProducts)
    setTransactions(demoTransactions.transactions)
    setAlerts(lowStockAlerts)
    setStockReport(stockReportData)
    setNotificationSummary(notifSummary)
    
    console.log('Data refreshed:', {
      products: demoProducts.length,
      transactions: demoTransactions.transactions.length,
      alerts: lowStockAlerts.length,
      stockProducts: stockReportData.products.length
    })
  }

  useEffect(() => {
    refreshData()

    // Listen for data updates
    const handleProductsUpdated = () => {
      console.log('Products updated event received')
      refreshData()
    }

    const handleTransactionsUpdated = () => {
      console.log('Transactions updated event received')
      refreshData()
    }

    window.addEventListener('productsUpdated', handleProductsUpdated)
    window.addEventListener('transactionsUpdated', handleTransactionsUpdated)

    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdated)
      window.removeEventListener('transactionsUpdated', handleTransactionsUpdated)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Test Sinkronisasi Notifikasi & Laporan Stok
            </h1>
            <button
              onClick={refreshData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Refresh Data
            </button>
          </div>

          {/* Data Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{products.length}</div>
              <div className="text-blue-800 font-medium">Total Produk</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{transactions.length}</div>
              <div className="text-green-800 font-medium">Total Transaksi</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">{alerts.length}</div>
              <div className="text-orange-800 font-medium">Peringatan Stok</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{stockReport.products.length}</div>
              <div className="text-purple-800 font-medium">Produk di Laporan</div>
            </div>
          </div>

          {/* Notification Summary */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Notifikasi</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-gray-600">{notificationSummary.totalAlerts || 0}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-red-600">{notificationSummary.criticalCount || 0}</div>
                <div className="text-sm text-red-500">Kritis</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-orange-600">{notificationSummary.highCount || 0}</div>
                <div className="text-sm text-orange-500">Tinggi</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-yellow-600">{notificationSummary.mediumCount || 0}</div>
                <div className="text-sm text-yellow-500">Sedang</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-600">{notificationSummary.lowCount || 0}</div>
                <div className="text-sm text-blue-500">Rendah</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
            <div className="flex flex-wrap gap-4">
              <a
                href="/products"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                📦 Kelola Produk
              </a>
              <a
                href="/transactions/stock-in"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                📥 Stok Masuk
              </a>
              <a
                href="/transactions/stock-out"
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                📤 Stok Keluar
              </a>
              <a
                href="/notifications"
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                🔔 Notifikasi
              </a>
              <a
                href="/reports"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                📊 Laporan
              </a>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts Component */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Komponen Peringatan Stok Rendah</h2>
          <LowStockAlerts alerts={alerts} />
        </div>

        {/* Stock Report Component */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Komponen Laporan Stok</h2>
          <CurrentStockReportPage isDemoMode={true} />
        </div>

        {/* Raw Data Debug */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Debug Data (Raw)</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Produk dengan Stok Rendah:</h3>
              <div className="bg-gray-50 rounded p-3 max-h-64 overflow-y-auto">
                <pre className="text-xs text-gray-600">
                  {JSON.stringify(alerts, null, 2)}
                </pre>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Ringkasan Laporan Stok:</h3>
              <div className="bg-gray-50 rounded p-3 max-h-64 overflow-y-auto">
                <pre className="text-xs text-gray-600">
                  {JSON.stringify(stockReport.summary, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}