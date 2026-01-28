'use client'

import { PackageIcon } from 'lucide-react'

export default function LowStockAlerts({ alerts }) {
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
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">⚠️</span>
                    <h3 className="font-medium text-red-700 truncate">
                      {alert.name}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Kategori: {alert.category}</p>
                      <p className="text-gray-600">Supplier: {alert.supplier}</p>
                    </div>
                    <div>
                      <p className="font-medium text-red-700">
                        Stok: {alert.currentStock}
                      </p>
                      <p className="text-gray-600">
                        Minimum: {alert.minimumStock}
                      </p>
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