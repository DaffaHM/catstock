'use client'

import { useState, useEffect } from 'react'
import { getLowStockProductsAction, updateReorderPointAction } from '@/lib/actions/notifications'
import { AlertTriangleIcon, PackageIcon, ClockIcon, TrendingDownIcon, SettingsIcon } from 'lucide-react'

export default function LowStockAlerts({ alerts: initialAlerts }) {
  const [alerts, setAlerts] = useState(initialAlerts || [])
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [newReorderPoint, setNewReorderPoint] = useState('')

  // Load low stock products
  const loadLowStockProducts = async () => {
    try {
      setLoading(true)
      const result = await getLowStockProductsAction()
      
      if (result.success) {
        setAlerts(result.products)
      }
    } catch (error) {
      console.error('Error loading low stock products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount if no initial data
  useEffect(() => {
    if (!initialAlerts || initialAlerts.length === 0) {
      loadLowStockProducts()
    }
  }, [initialAlerts])

  // Handle reorder point update
  const handleUpdateReorderPoint = async (productId, reorderPoint) => {
    try {
      const result = await updateReorderPointAction(productId, parseInt(reorderPoint))
      
      if (result.success) {
        // Refresh the alerts
        await loadLowStockProducts()
        setEditingProduct(null)
        setNewReorderPoint('')
      } else {
        alert(result.error || 'Gagal memperbarui reorder point')
      }
    } catch (error) {
      console.error('Error updating reorder point:', error)
      alert('Terjadi kesalahan saat memperbarui reorder point')
    }
  }

  // Get urgency color and icon
  const getUrgencyStyle = (urgencyLevel) => {
    switch (urgencyLevel) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: '🚨',
          badge: 'bg-red-100 text-red-800'
        }
      case 'high':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-700',
          icon: '⚠️',
          badge: 'bg-orange-100 text-orange-800'
        }
      case 'medium':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          icon: '⚡',
          badge: 'bg-yellow-100 text-yellow-800'
        }
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          icon: 'ℹ️',
          badge: 'bg-blue-100 text-blue-800'
        }
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Peringatan Stok Rendah</h2>
        </div>
        <div className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data stok...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Peringatan Stok Rendah</h2>
          <button
            onClick={loadLowStockProducts}
            className="text-blue-600 hover:text-blue-700 transition-colors"
            title="Refresh"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
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

  // Count alerts by urgency
  const criticalCount = alerts.filter(a => a.urgencyLevel === 'critical').length
  const highCount = alerts.filter(a => a.urgencyLevel === 'high').length

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Peringatan Stok Rendah</h2>
            <div className="flex items-center space-x-4 mt-1">
              {criticalCount > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  🚨 {criticalCount} Kritis
                </span>
              )}
              {highCount > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  ⚠️ {highCount} Tinggi
                </span>
              )}
              <span className="text-sm text-gray-500">
                Total: {alerts.length} produk
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadLowStockProducts}
              className="text-blue-600 hover:text-blue-700 transition-colors"
              title="Refresh"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-gray-600 hover:text-gray-700 transition-colors"
              title="Pengaturan"
            >
              <SettingsIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {alerts.map((alert) => {
            const style = getUrgencyStyle(alert.urgencyLevel)
            
            return (
              <div key={alert.id} className={`p-4 rounded-lg border ${style.bg} ${style.border}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{style.icon}</span>
                      <h3 className={`font-medium ${style.text} truncate`}>
                        {alert.brand} {alert.name}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${style.badge}`}>
                        {alert.urgencyLevel ? alert.urgencyLevel.toUpperCase() : 'UNKNOWN'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">SKU: {alert.sku}</p>
                        <p className="text-gray-600">Kategori: {alert.category}</p>
                      </div>
                      <div>
                        <p className={`font-medium ${style.text}`}>
                          Stok: {alert.currentStock} {alert.unit}
                        </p>
                        <p className="text-gray-600">
                          Reorder: {alert.reorderPoint} {alert.unit}
                        </p>
                      </div>
                    </div>

                    {alert.daysUntilEmpty && (
                      <div className="mt-2 flex items-center text-sm text-gray-600">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span>Perkiraan habis dalam {alert.daysUntilEmpty} hari</span>
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col space-y-2">
                    {showSettings && (
                      <button
                        onClick={() => {
                          setEditingProduct(alert)
                          setNewReorderPoint(alert.reorderPoint.toString())
                        }}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        Atur Reorder
                      </button>
                    )}
                    <a
                      href={`/products?search=${alert.sku}`}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-center"
                    >
                      Lihat Produk
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {alerts.length > 5 && (
          <div className="mt-4 text-center">
            <a
              href="/reports?filter=low-stock"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <TrendingDownIcon className="h-4 w-4 mr-2" />
              Lihat Semua Stok Rendah
            </a>
          </div>
        )}
      </div>

      {/* Reorder Point Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Atur Reorder Point
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                {editingProduct.brand} {editingProduct.name}
              </p>
              <p className="text-sm text-gray-500">
                Stok saat ini: {editingProduct.currentStock} {editingProduct.unit}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reorder Point Baru
              </label>
              <input
                type="number"
                value={newReorderPoint}
                onChange={(e) => setNewReorderPoint(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan reorder point"
                min="0"
              />
              <p className="mt-1 text-xs text-gray-500">
                Sistem akan memberikan peringatan ketika stok mencapai angka ini
              </p>
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setEditingProduct(null)
                  setNewReorderPoint('')
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleUpdateReorderPoint(editingProduct.id, newReorderPoint)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={!newReorderPoint || parseInt(newReorderPoint) < 0}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}