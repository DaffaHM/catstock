'use client'

export default function ProductListPage({ session, isDemoMode }) {
  const demoProducts = [
    { id: 1, name: 'Cat Tembok Putih 5L', brand: 'Dulux', category: 'Cat Tembok', stock: 15, price: 125000 },
    { id: 2, name: 'Cat Kayu Coklat 2.5L', brand: 'Avian', category: 'Cat Kayu', stock: 8, price: 85000 },
    { id: 3, name: 'Cat Besi Hitam 1L', brand: 'Nippon', category: 'Cat Besi', stock: 12, price: 45000 },
    { id: 4, name: 'Cat Tembok Biru 5L', brand: 'Dulux', category: 'Cat Tembok', stock: 6, price: 130000 }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Produk {isDemoMode && <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">Demo</span>}
            </h1>
            <p className="text-gray-600 mt-1">Kelola katalog produk toko cat</p>
          </div>
          
          <div className="p-6">
            <div className="mb-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                + Tambah Produk
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {demoProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{product.brand}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{product.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${product.stock < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {product.stock} unit
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        Rp {product.price.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                        <button className="text-red-600 hover:text-red-900">Hapus</button>
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