'use client'

import { generateStockReport } from '@/lib/utils/demo-notifications'
import { useEffect, useState } from 'react'

export default function CurrentStockReportPage({ session, isDemoMode }) {
  const [stockData, setStockData] = useState([])
  const [summary, setSummary] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    criticalStockCount: 0,
    totalValue: 0
  })

  useEffect(() => {
    // Generate real-time stock report from actual demo data
    const reportData = generateStockReport()
    setStockData(reportData.products)
    setSummary(reportData.summary)

    // Listen for product updates to refresh report
    const handleProductsUpdated = () => {
      const updatedReport = generateStockReport()
      setStockData(updatedReport.products)
      setSummary(updatedReport.summary)
    }

    const handleTransactionsUpdated = () => {
      const updatedReport = generateStockReport()
      setStockData(updatedReport.products)
      setSummary(updatedReport.summary)
    }

    window.addEventListener('productsUpdated', handleProductsUpdated)
    window.addEventListener('transactionsUpdated', handleTransactionsUpdated)

    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdated)
      window.removeEventListener('transactionsUpdated', handleTransactionsUpdated)
    }
  }, [])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Laporan Stok {isDemoMode && <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">Demo</span>}
          </h1>
          <p className="text-gray-600 mt-1">Laporan stok saat ini dan peringatan</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Summary Cards */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{summary.totalProducts}</div>
              <div className="text-blue-800 font-medium">Total Produk</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">{summary.lowStockCount}</div>
              <div className="text-yellow-800 font-medium">Stok Rendah</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">{summary.criticalStockCount}</div>
              <div className="text-red-800 font-medium">Stok Kritis</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalValue)}</div>
              <div className="text-green-800 font-medium">Nilai Total</div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Detail Stok</h2>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              📊 Export Excel
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok Saat Ini</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok Minimum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai Stok</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stockData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      <div className="text-center">
                        <div className="text-4xl mb-4">📦</div>
                        <p className="text-lg font-medium mb-2">Tidak ada data produk</p>
                        <p className="text-sm">Tambahkan produk untuk melihat laporan stok</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  stockData.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.brand}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-sm">{item.sku}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{item.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                        {item.currentStock} {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {item.minimumStock} {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {formatCurrency(item.stockValue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          item.status === 'normal' ? 'bg-green-100 text-green-800' :
                          item.status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.status === 'normal' ? 'Normal' :
                           item.status === 'low' ? 'Rendah' : 'Kritis'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}