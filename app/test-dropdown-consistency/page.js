'use client'

import { useState, useEffect } from 'react'
import { searchDemoSuppliers } from '@/lib/utils/demo-suppliers'
import { searchDemoProducts } from '@/lib/utils/demo-products'
import SupplierDropdown from '@/components/ui/SupplierDropdown'
import ProductDropdown from '@/components/ui/ProductDropdown'
import TouchButton from '@/components/ui/TouchButton'

export default function TestDropdownConsistency() {
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    // Load suppliers using the same method as SupplierListPage
    const supplierResult = searchDemoSuppliers('', {
      page: 1,
      limit: 100,
      sortBy: 'name',
      sortOrder: 'asc'
    })
    setSuppliers(supplierResult.suppliers)

    // Load products using the same method as ProductListPage
    const productResult = searchDemoProducts('', {
      page: 1,
      limit: 100,
      sortBy: 'name',
      sortOrder: 'asc'
    })
    setProducts(productResult.products)
  }, [])

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dropdown Data Consistency Test
          </h1>
          <p className="text-gray-600">
            Testing that dropdowns show the same data as management pages
          </p>
          <TouchButton
            variant="outline"
            onClick={handleRefresh}
            className="mt-4"
          >
            Refresh Page
          </TouchButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Suppliers Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Suppliers Test
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Suppliers from Management Page Method ({suppliers.length} total)
                </h3>
                <div className="bg-gray-50 rounded p-3 max-h-40 overflow-y-auto">
                  {suppliers.length === 0 ? (
                    <p className="text-gray-500 text-sm">No suppliers found</p>
                  ) : (
                    <ul className="space-y-1">
                      {suppliers.map(supplier => (
                        <li key={supplier.id} className="text-sm">
                          <strong>{supplier.name}</strong> (ID: {supplier.id})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Supplier Dropdown (should show same data)
                </h3>
                <SupplierDropdown
                  value={selectedSupplier}
                  onSupplierSelect={setSelectedSupplier}
                  placeholder="Click to see available suppliers..."
                  isDemoMode={true}
                />
                {selectedSupplier && (
                  <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                    <strong>Selected:</strong> {selectedSupplier.name} (ID: {selectedSupplier.id})
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Products Test
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Products from Management Page Method ({products.length} total)
                </h3>
                <div className="bg-gray-50 rounded p-3 max-h-40 overflow-y-auto">
                  {products.length === 0 ? (
                    <p className="text-gray-500 text-sm">No products found</p>
                  ) : (
                    <ul className="space-y-1">
                      {products.map(product => (
                        <li key={product.id} className="text-sm">
                          <strong>{product.name}</strong> (ID: {product.id})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Product Dropdown (should show same data)
                </h3>
                <ProductDropdown
                  onProductSelect={setSelectedProduct}
                  placeholder="Click to see available products..."
                  isDemoMode={true}
                />
                {selectedProduct && (
                  <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                    <strong>Selected:</strong> {selectedProduct.name} (ID: {selectedProduct.id})
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Debug Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                localStorage demo-suppliers
              </h3>
              <pre className="bg-gray-50 rounded p-3 text-xs overflow-x-auto">
                {localStorage.getItem('demo-suppliers') || 'null'}
              </pre>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                localStorage demo-products
              </h3>
              <pre className="bg-gray-50 rounded p-3 text-xs overflow-x-auto">
                {localStorage.getItem('demo-products') || 'null'}
              </pre>
            </div>
          </div>

          <div className="mt-4">
            <TouchButton
              variant="outline"
              onClick={() => {
                console.log('Suppliers from searchDemoSuppliers:', suppliers)
                console.log('Products from searchDemoProducts:', products)
                console.log('Selected supplier:', selectedSupplier)
                console.log('Selected product:', selectedProduct)
              }}
              className="mr-2"
            >
              Log to Console
            </TouchButton>
            
            <TouchButton
              variant="outline"
              onClick={() => {
                localStorage.removeItem('demo-suppliers')
                localStorage.removeItem('demo-products')
                window.location.reload()
              }}
              className="text-red-600"
            >
              Clear localStorage & Reload
            </TouchButton>
          </div>
        </div>
      </div>
    </div>
  )
}