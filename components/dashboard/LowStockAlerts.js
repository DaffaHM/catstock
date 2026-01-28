'use client'

export default function LowStockAlerts({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Peringatan Stok Rendah</h2>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">✅</div>
            <p>Semua produk memiliki stok yang cukup</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Peringatan Stok Rendah</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{alert.name}</h3>
                <p className="text-sm text-gray-600">{alert.category}</p>
                <p className="text-sm text-red-600">
                  Stok: {alert.currentStock} / Min: {alert.minimumStock}
                </p>
              </div>
              <div className="text-red-600 text-xl">⚠️</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}