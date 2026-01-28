'use client'

export default function SupplierListPage({ session, isDemoMode }) {
  const demoSuppliers = [
    { 
      id: 1, 
      name: 'PT Supplier A', 
      contact: 'Jl. Industri No. 123, Jakarta\nTelp: 021-1234567', 
      products: 15,
      lastOrder: '2024-01-20'
    },
    { 
      id: 2, 
      name: 'PT Supplier B', 
      contact: 'Jl. Perdagangan No. 456, Surabaya\nTelp: 031-7654321', 
      products: 8,
      lastOrder: '2024-01-18'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pemasok {isDemoMode && <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">Demo</span>}
          </h1>
          <p className="text-gray-600 mt-1">Kelola informasi pemasok</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="mb-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              + Tambah Pemasok
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoSuppliers.map((supplier) => (
              <div key={supplier.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900 text-sm">Edit</button>
                    <button className="text-red-600 hover:text-red-900 text-sm">Hapus</button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <strong>Kontak:</strong>
                    <div className="whitespace-pre-line">{supplier.contact}</div>
                  </div>
                  <div>
                    <strong>Produk:</strong> {supplier.products} item
                  </div>
                  <div>
                    <strong>Order Terakhir:</strong> {new Date(supplier.lastOrder).toLocaleDateString('id-ID')}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                    Lihat Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}