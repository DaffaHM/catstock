'use client'

import { useState, useEffect } from 'react'
import { searchDemoSuppliers, getDemoSuppliers } from '@/lib/utils/demo-suppliers'
import { searchDemoProducts, getDemoProducts } from '@/lib/utils/demo-products'
import SupplierDropdown from '@/components/ui/SupplierDropdown'
import ProductDropdown from '@/components/ui/ProductDropdown'
import TouchButton from '@/components/ui/TouchButton'

export default function TestSyncVerification() {
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const loadData = () => {
    // Load suppliers using same method as SupplierListPage
    const supplierResult = searchDemoSuppliers('', {
      page: 1,
      limit: 100,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
    
    // Load products using same method as ProductListPage
    const productResult = searchDemoProducts('', {
      page: 1,
      limit: 100,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
    
    setSuppliers(supplierResult.suppliers)
    setProducts(productResult.products)
    
    console.log('=== SYNC VERIFICATION TEST ===')
    console.log('Suppliers loaded:', supplierResult.suppliers.length)
    console.log('Products loaded:', productResult.products.length)
  }

  useEffect(() => {
    loadData()
  }, [refreshKey])

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    setSelectedSupplier(null)
    setSelectedProduct(null)
  }

  const handleAddTestSupplier = () => {
    const testSupplier = {
      id: `test-supp-${Date.now()}`,
      name: `Test Supplier ${Date.now()}`,
      contact: 'Test contact info',
      notes: 'Added via sync verification test',
      transactionCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Save to localStorage
    const stored = localStorage.getItem('demo-suppliers')
    const existingSuppliers = stored ? JSON.parse(stored) : []
    existingSuppliers.push(testSupplier)
    localStorage.setItem('demo-suppliers', JSON.stringify(existingSuppliers))
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('suppliersUpdated', { detail: testSupplier }))
    
    // Trigger refresh
    handleRefresh()
  }

  const handleAddTestProduct = () => {
    const testProduct = {
      id: `test-prod-${Date.now()}`,
      sku: `TEST-${Date.now()}`,
      brand: 'Test Brand',
      name: `Test Product ${Date.now()}`,
      category: 'Test Category',
      size: '1',
      unit: 'Unit',
      purchasePrice: 10000,
      sellingPrice: 15000,
      minimumStock: 5,
      currentStock: 10,
      transactionCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Save to localStorage
    const stored = localStorage.getItem('demo-products')
    const existingProducts = stored ? JSON.parse(stored) : []
    existingProducts.push(testProduct)
    localStorage.setItem('demo-products', JSON.stringify(existingProducts))
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('productsUpdated', { detail: testProduct }))
    
    // Trigger refresh
    handleRefresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Data Synchronization Verification
          </h1>
          <p className="text-gray-600">
            Testing data sync between management pages and transaction dropdowns
          </p>
          
          <div className="flex gap-2 mt-4">
            <TouchButton variant="outline" onClick={handleRefresh}>
              Refresh All Data
            </TouchButton>
            <TouchButton variant="primary" onClick={handleAddTestSupplier}>
              Add Test Supplier
            </TouchButton>
            <TouchButton variant="primary" onClick={handleAddTestProduct}>
              Add Test Product
            </TouchButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Suppliers Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Suppliers ({suppliers.length})
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier Dropdown (Demo Mode)
                  </label>
                  <SupplierDropdown
                    value={selectedSupplier}
                    onSupplierSelect={setSelectedSupplier}
                    placeholder="Click to see suppliers..."
                    isDemoMode={true}
                    forceRefresh={refreshKey}
                  />
                </div>
                
                {selectedSupplier && (
                  <div className="bg-green-50 border border-green-200 rounded p-4">
                    <h3 className="font-medium text-green-900 mb-2">
                      Selected Supplier:
                    </h3>
                    <div className="text-sm text-green-800">
                      <div><strong>Name:</strong> {selectedSupplier.name}</div>
                      <div><strong>ID:</strong> {selectedSupplier.id}</div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 bg-gray-50 rounded p-4 max-h-60 overflow-y-auto">
                <h3 className="font-medium text-gray-900 mb-2">
                  Management Page Data:
                </h3>
                {suppliers.length === 0 ? (
                  <p className="text-gray-500 text-sm">No suppliers found</p>
                ) : (
                  <div className="space-y-2">
                    {suppliers.map((supplier, index) => (
                      <div key={supplier.id} className="bg-white rounded p-2 border text-sm">
                        <div className="font-medium">
                          {index + 1}. {supplier.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {supplier.id}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Products ({products.length})
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Dropdown (Demo Mode)
                  </label>
                  <ProductDropdown
                    onProductSelect={setSelectedProduct}
                    placeholder="Click to see products..."
                    isDemoMode={true}
                  />
                </div>
                
                {selectedProduct && (
                  <div className="bg-green-50 border border-green-200 rounded p-4">
                    <h3 className="font-medium text-green-900 mb-2">
                      Selected Product:
                    </h3>
                    <div className="text-sm text-green-800">
                      <div><strong>Name:</strong> {selectedProduct.name}</div>
                      <div><strong>ID:</strong> {selectedProduct.id}</div>
                      <div><strong>SKU:</strong> {selectedProduct.sku}</div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 bg-gray-50 rounded p-4 max-h-60 overflow-y-auto">
                <h3 className="font-medium text-gray-900 mb-2">
                  Management Page Data:
                </h3>
                {products.length === 0 ? (
                  <p className="text-gray-500 text-sm">No products found</p>
                ) : (
                  <div className="space-y-2">
                    {products.map((product, index) => (
                      <div key={product.id} className="bg-white rounded p-2 border text-sm">
                        <div className="font-medium">
                          {index + 1}. {product.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {product.id} | SKU: {product.sku}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Synchronization Status
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h3 className="font-medium text-blue-900 mb-2">
                Expected Behavior:
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Dropdowns should show same count as management data</li>
                <li>• Adding test items should update both immediately</li>
                <li>• Dropdowns should show "isDemoMode: true" in debug info</li>
                <li>• Data should persist after page refresh</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded p-4">
              <h3 className="font-medium text-gray-900 mb-2">
                Debug Actions:
              </h3>
              <div className="space-y-2">
                <TouchButton
                  variant="outline"
                  onClick={() => {
                    console.log('=== DEBUG INFO ===')
                    console.log('Suppliers state:', suppliers)
                    console.log('Products state:', products)
                    console.log('localStorage demo-suppliers:', localStorage.getItem('demo-suppliers'))
                    console.log('localStorage demo-products:', localStorage.getItem('demo-products'))
                    console.log('localStorage deleted-demo-suppliers:', localStorage.getItem('deleted-demo-suppliers'))
                    console.log('localStorage deleted-demo-products:', localStorage.getItem('deleted-demo-products'))
                  }}
                  className="w-full text-xs"
                >
                  Log Debug Info
                </TouchButton>
                
                <TouchButton
                  variant="outline"
                  onClick={() => {
                    localStorage.removeItem('demo-suppliers')
                    localStorage.removeItem('demo-products')
                    localStorage.removeItem('deleted-demo-suppliers')
                    localStorage.removeItem('deleted-demo-products')
                    handleRefresh()
                  }}
                  className="w-full text-xs text-red-600"
                >
                  Reset All Data
                </TouchButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}