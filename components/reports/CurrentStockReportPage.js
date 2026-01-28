'use client'

export default function CurrentStockReportPage({ session, isDemoMode }) {
  const demoStockData = [
    { id: 1, name: 'Cat Tembok Putih 5L', category: 'Cat Tembok', currentStock: 15, minStock: 10, value: 1875000, status: 'normal' },
    { id: 2, name: 'Cat Kayu Coklat 2.5L', category: 'Cat Kayu', currentStock: 5, minStock: 10, value: 425000, status: 'low' },
    { id: 3, name: 'Cat Besi Hitam 1L', category: 'Cat Besi', currentStock: 12, minStock: 8, value: 540000, status: 'normal' },
    { id: 4, name: 'Cat Tembok Biru 5L', category: 'Cat Tembok', currentStock: 2, minStock: 8, value: 260000, status: 'critical' }
  ]

  const totalValue = demoStockData.reduce((sum, item) => sum + item.value, 0)
  const lowStockItems = demoStockData.filter(item => item.status !== 'normal').length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Laporan Stok {isDemoMode && <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">Demo</span>}
            </h1>
            <p className="text-gray-600 mt-1">Laporan stok saat ini dan peringatan</p>
          </div>
          
          {/* Summary Cards */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{demoStockData.length}</div>
                <div className="text-blue-800 font-medium">Total Produk</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">{lowStockItems}</div>
                <div className="text-red-800 font-medium">Stok Rendah</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">Rp {totalValue.toLocaleString('id-ID')}</div>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok Saat Ini</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok Minimum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {demoStockData.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{item.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{item.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{item.currentStock}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{item.minStock}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        Rp {item.value.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.status === 'normal' ? 'bg-green-100 text-green-800' :
                          item.status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.status === 'normal' ? 'Normal' :
                           item.status === 'low' ? 'Rendah' : 'Kritis'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}