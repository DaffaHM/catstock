'use client'

import { useState, useEffect } from 'react'
import { getDemoSuppliers, deleteDemoSupplier, resetDemoSuppliers } from '@/lib/utils/demo-suppliers'
import { getDemoProducts, deleteDemoProduct, resetDemoProducts } from '@/lib/utils/demo-products'
import SupplierDropdown from '@/components/ui/SupplierDropdown'
import ProductDropdown from '@/components/ui/ProductDropdown'
import TouchButton from '@/components/ui/TouchButton'

export default function TestDeleteFix() {
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const loadData = () => {
    const suppliersData = getDemoSuppliers()
    const productsData = getDemoProducts()
    
    setSuppliers(suppliersData)
    setProducts(productsData)
    
    console.log('=== DATA LOADED ===')
    console.log('Suppliers:', suppliersData)
    console.log('Products:', productsData)
    console.log('Deleted suppliers:', localStorage.getItem('deleted-demo-suppliers'))
    console.log('Deleted products:', localStorage.getItem('deleted-demo-products'))
  }

  useEffect(() => {
    loadData()
  }, [refreshKey])

  const handleDeleteSupplier = (supplierId) => {
    console.log('Deleting supplier:', supplierId)
    deleteDemoSupplier(supplierId)
    setRefreshKey(prev => prev + 1)
  }

  const handleDeleteProduct = (productId) => {
    console.log('Deleting product:', productId)
    deleteDemoProduct(productId)
    setRefreshKey(prev => prev + 1)
  }

  const handleResetSuppliers = () => {
    resetDemoSuppliers()
    setRefreshKey(prev => prev + 1)
    setSelectedSupplier(null)
  }

  const handleResetProducts = () => {
    resetDemoProducts()
    setRefreshKey(prev => prev + 1)
    setSelectedProduct(null)
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Delete Fix Test
          </h1>
          <p className="text-gray-600">
            Testing permanent deletion of base suppliers and products
          </p>
          
          <div className="flex gap-2 mt-4">
            <TouchButton variant="outline" onClick={handleRefresh}>
              Refresh Data
            </TouchButton>
            <TouchButton variant="outline" onClick={handleResetSuppliers} className="text-red-600">
              Reset Suppliers
            </TouchButton>
            <TouchButton variant="outline" onClick={handleResetProducts} className="text-red-600">
              Reset Products
            </TouchButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Suppliers Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Suppliers ({suppliers.length})
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Available Suppliers
                </h3>
                <div className="bg-gray-50 rounded p-3 max-h-40 overflow-y-auto">
                  {suppliers.length === 0 ? (
                    <p className="text-gray-500 text-sm">No suppliers available</p>
                  ) : (
                    <div className="space-y-2">
                      {suppliers.map(supplier => (
                        <div key={supplier.id} className="flex items-center justify-between bg-white rounded p-2">
                          <div>
                            <div className="font-medium text-sm">{supplier.name}</div>
                            <div className="text-xs text-gray-500">ID: {supplier.id}</div>
                          </div>
                          <TouchButton
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSupplier(supplier.id)}
                            className="text-red-600 text-xs"
                          >
                            Delete
                          </TouchButton>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Supplier Dropdown Test
                </h3>
                <SupplierDropdown
                  value={selectedSupplier}
                  onSupplierSelect={setSelectedSupplier}
                  placeholder="Click to see suppliers..."
                  isDemoMode={true}
                  forceRefresh={refreshKey}
                />
                {selectedSupplier && (
                  <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                    <strong>Selected:</strong> {selectedSupplier.name}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Products ({products.length})
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Available Products
                </h3>
                <div className="bg-gray-50 rounded p-3 max-h-40 overflow-y-auto">
                  {products.length === 0 ? (
                    <p className="text-gray-500 text-sm">No products available</p>
                  ) : (
                    <div className="space-y-2">
                      {products.map(product => (
                        <div key={product.id} className="flex items-center justify-between bg-white rounded p-2">
                          <div>
                            <div className="font-medium text-sm">{product.name}</div>
                            <div className="text-xs text-gray-500">ID: {product.id}</div>
                          </div>
                          <TouchButton
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 text-xs"
                          >
                            Delete
                          </TouchButton>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Product Dropdown Test
                </h3>
                <ProductDropdown
                  onProductSelect={setSelectedProduct}
                  placeholder="Click to see products..."
                  isDemoMode={true}
                />
                {selectedProduct && (
                  <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                    <strong>Selected:</strong> {selectedProduct.name}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Debug Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                localStorage Keys
              </h3>
              <div className="bg-gray-50 rounded p-3 text-xs">
                <div><strong>demo-suppliers:</strong> {localStorage.getItem('demo-suppliers') ? 'exists' : 'empty'}</div>
                <div><strong>deleted-demo-suppliers:</strong> {localStorage.getItem('deleted-demo-suppliers') || 'empty'}</div>
                <div><strong>demo-products:</strong> {localStorage.getItem('demo-products') ? 'exists' : 'empty'}</div>
                <div><strong>deleted-demo-products:</strong> {localStorage.getItem('deleted-demo-products') || 'empty'}</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Test Instructions
              </h3>
              <div className="bg-blue-50 rounded p-3 text-xs text-blue-800">
                <ol className="space-y-1">
                  <li>1. Delete "PT Supplier A" and "PT Supplier B"</li>
                  <li>2. Refresh page - they should stay deleted</li>
                  <li>3. Check dropdown - should not show deleted items</li>
                  <li>4. Use "Reset" to restore all data</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}