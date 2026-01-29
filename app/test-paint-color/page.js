'use client'

import { useState, useEffect } from 'react'
import SimpleNavLayout from '@/components/layout/SimpleNavLayout'
import ProductForm from '@/components/products/ProductForm'
import TouchButton from '@/components/ui/TouchButton'
import { getDemoProducts, saveDemoProduct } from '@/lib/utils/demo-products'

export default function TestPaintColorPage() {
  const [showForm, setShowForm] = useState(false)
  const [products, setProducts] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = () => {
    const demoProducts = getDemoProducts()
    setProducts(demoProducts)
  }

  const handleProductSuccess = (product) => {
    console.log('Product saved:', product)
    setShowForm(false)
    setEditingProduct(null)
    loadProducts()
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const createTestProduct = () => {
    const testProduct = {
      id: `demo-prod-${Date.now()}`,
      sku: `PAINT-${Date.now()}`,
      brand: 'Dulux',
      name: 'Cat Tembok Premium',
      category: 'Interior Paint',
      size: '1 Galon',
      paintColor: 'Putih Gading',
      unit: 'Gallon',
      purchasePrice: 150000,
      sellingPrice: 200000,
      profitMargin: 33.33,
      minimumStock: 10,
      currentStock: 50,
      transactionCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    saveDemoProduct(testProduct)
    loadProducts()
  }

  return (
    <SimpleNavLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Test: Field Warna Cat
            </h1>
            <p className="text-gray-600">
              Testing the new paint color field in product forms. 
              You can now add paint colors when creating or editing products.
            </p>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Actions
            </h2>
            
            <div className="flex flex-wrap gap-4">
              <TouchButton
                variant="primary"
                onClick={() => setShowForm(true)}
              >
                Tambah Produk Baru
              </TouchButton>
              
              <TouchButton
                variant="outline"
                onClick={createTestProduct}
              >
                Buat Produk Test dengan Warna
              </TouchButton>
              
              <TouchButton
                variant="outline"
                onClick={loadProducts}
              >
                Refresh Products
              </TouchButton>
            </div>
          </div>

          {/* Product List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Products with Paint Colors
            </h2>
            
            {products.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No products found. Create some products to test the paint color field.
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div 
                    key={product.id} 
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {product.name}
                        </h3>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">SKU:</span>
                            <span className="ml-2">{product.sku}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Brand:</span>
                            <span className="ml-2">{product.brand}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Size:</span>
                            <span className="ml-2">{product.size}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Warna Cat:</span>
                            <span className={`ml-2 ${product.paintColor ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                              {product.paintColor || 'Tidak ada warna'}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          Category: {product.category} • Unit: {product.unit}
                        </div>
                      </div>
                      
                      <TouchButton
                        variant="outline"
                        onClick={() => handleEditProduct(product)}
                        className="ml-4"
                      >
                        Edit
                      </TouchButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expected Behavior */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              Expected Behavior
            </h2>
            <div className="space-y-2 text-blue-800">
              <div>✅ Form produk memiliki field "Warna Cat" yang bisa diketik manual</div>
              <div>✅ Field warna cat bersifat opsional (tidak wajib diisi)</div>
              <div>✅ Warna cat tersimpan dan ditampilkan di daftar produk</div>
              <div>✅ Bisa edit warna cat pada produk yang sudah ada</div>
              <div>✅ Placeholder memberikan contoh warna (Putih, Biru Laut, Hijau Daun)</div>
              <div className="font-semibold text-blue-900">🎨 BARU: Warna cat ditampilkan dengan badge khusus di tabel produk</div>
              <div className="font-semibold text-blue-900">🎨 BARU: Warna cat muncul di card produk mobile view</div>
              <div className="font-semibold text-blue-900">🎨 BARU: Kolom "Warna Cat" ditambahkan di tabel utama produk</div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <ProductForm
              product={editingProduct}
              categories={['Interior Paint', 'Exterior Paint', 'Primer', 'Stain', 'Varnish']}
              onSuccess={handleProductSuccess}
              onCancel={() => {
                setShowForm(false)
                setEditingProduct(null)
              }}
              isDemoMode={true}
            />
          </div>
        </div>
      )}
    </SimpleNavLayout>
  )
}