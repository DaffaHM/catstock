'use client'

import { PackageIcon } from 'lucide-react'
import { generateLowStockAlerts } from '@/lib/utils/demo-notifications'
import { useEffect, useState } from 'react'

export default function LowStockAlerts({ alerts: propAlerts }) {
  const [alerts, setAlerts] = useState(propAlerts || [])

  useEffect(() => {
    // Generate real-time alerts from actual demo data
    const realTimeAlerts = generateLowStockAlerts()
    setAlerts(realTimeAlerts)

    // Listen for product updates to refresh alerts
    const handleProductsUpdated = () => {
      const updatedAlerts = generateLowStockAlerts()
      setAlerts(updatedAlerts)
    }

    const handleTransactionsUpdated = () => {
      const updatedAlerts = generateLowStockAlerts()
      setAlerts(updatedAlerts)
    }

    window.addEventListener('productsUpdated', handleProductsUpdated)
    window.addEventListener('transactionsUpdated', handleTransactionsUpdated)

    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdated)
      window.removeEventListener('transactionsUpdated', handleTransactionsUpdated)
    }
  }, [propAlerts])
  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Peringatan Stok Rendah</h2>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500">
            <PackageIcon className="h-12 w-12 mx-auto mb-4 text-green-400" />
            <p className="text-lg font-medium mb-2">Semua produk memiliki stok yang cukup</p>
            <p className="text-sm">Tidak ada produk yang memerlukan restock saat ini</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Peringatan Stok Rendah ({alerts.length})
        </h2>
      </div>
      
      <div className="p-6">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-4 rounded-lg border bg-red-50 border-red-200">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">⚠️</span>
                      <h3 className="font-medium text-red-700 truncate">
                        {alert.name}
                      </h3>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      alert.urgencyLevel === 'critical' ? 'bg-red-100 text-red-800' :
                      alert.urgencyLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                      alert.urgencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.urgencyLevel === 'critical' ? 'Kritis' :
                       alert.urgencyLevel === 'high' ? 'Tinggi' :
                       alert.urgencyLevel === 'medium' ? 'Sedang' : 'Rendah'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">SKU: {alert.sku}</p>
                      <p className="text-gray-600">Kategori: {alert.category}</p>
                      <p className="text-gray-600">Supplier: {alert.supplier}</p>
                    </div>
                    <div>
                      <p className="font-medium text-red-700">
                        Stok: {alert.currentStock} {alert.unit}
                      </p>
                      <p className="text-gray-600">
                        Minimum: {alert.minimumStock} {alert.unit}
                      </p>
                      {alert.daysUntilEmpty && (
                        <p className="text-red-600 text-xs">
                          Habis dalam ~{alert.daysUntilEmpty} hari
                        </p>
                      )}
                    </div>
                  </div>

                  {alert.lastRestocked && (
                    <div className="mt-2 text-xs text-gray-500">
                      Terakhir diperbarui: {new Date(alert.lastRestocked).toLocaleDateString('id-ID')}
                    </div>
                  )}
                </div>

                <div className="ml-4">
                  <a
                    href={`/products`}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    Lihat Produk
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}