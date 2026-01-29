'use client'

import { useState, useEffect } from 'react'
import { getDemoProducts, saveDemoProduct, updateDemoProduct } from '@/lib/utils/demo-products'
import { formatRupiah } from '@/lib/utils/currency'

export default function TestProductEditPage() {
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [editForm, setEditForm] = useState({
    name: '',
    brand: '',
    category: '',
    purchasePrice: '',
    sellingPrice: ''
  })
  const [testResults, setTestResults] = useState([])

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = () => {
    const demoProducts = getDemoProducts()
    setProducts(demoProducts)
    console.log('Loaded products:', demoProducts)
  }

  const handleSelectProduct = (product) => {
    setSelectedProduct(product)
    setEditForm({
      name: product.name,
      brand: product.brand,
      category: product.category,
      purchasePrice: product.purchasePrice.toString(),
      sellingPrice: product.sellingPrice.toString()
    })
  }

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  const testCreateProduct = () => {
    const newProduct = {
      id: `test-prod-${Date.now()}`,
      sku: `TEST-${Date.now()}`,
      brand: 'Test Brand',
      name: 'Test Product',
      category: 'Test Category',
      size: '1',
      unit: 'Liter',
      purchasePrice: 50000,
      sellingPrice: 75000,
      minimumStock: 10,
      currentStock: 0,
      transactionCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const success = saveDemoProduct(newProduct)
    const result = `Create Product: ${success ? 'SUCCESS' : 'FAILED'}`
    setTestResults(prev => [...prev, result])
    
    if (success) {
      loadProducts()
    }
  }

  const testUpdateProduct = () => {
    if (!selectedProduct) {
      setTestResults(prev => [...prev, 'Update Product: FAILED - No product selected'])
      return
    }

    const updatedProduct = {
      ...selectedProduct,
      name: editForm.name,
      brand: editForm.brand,
      category: editForm.category,
      purchasePrice: parseFloat(editForm.purchasePrice) || 0,
      sellingPrice: parseFloat(editForm.sellingPrice) || 0,
      updatedAt: new Date().toISOString()
    }

    const success = saveDemoProduct(updatedProduct)
    const result = `Update Product: ${success ? 'SUCCESS' : 'FAILED'}`
    setTestResults(prev => [...prev, result])
    
    if (success) {
      loadProducts()
      // Update selected product
      setSelectedProduct(updatedProduct)
    }
  }

  const testUpdateFunction = () => {
    if (!selectedProduct) {
      setTestResults(prev => [...prev, 'Update Function: FAILED - No product selected'])
      return
    }

    const updates = {
      name: editForm.name + ' (Updated)',
      brand: editForm.brand + ' Updated',
      purchasePrice: parseFloat(editForm.purchasePrice) + 1000,
      sellingPrice: parseFloat(editForm.sellingPrice) + 1500
    }

    const updatedProduct = updateDemoProduct(selectedProduct.id, updates)
    const result = `Update Function: ${updatedProduct ? 'SUCCESS' : 'FAILED'}`
    setTestResults(prev => [...prev, result])
    
    if (updatedProduct) {
      loadProducts()
      setSelectedProduct(updatedProduct)
      setEditForm({
        name: updatedProduct.name,
        brand: updatedProduct.brand,
        category: updatedProduct.category,
        purchasePrice: updatedProduct.purchasePrice.toString(),
        sellingPrice: updatedProduct.sellingPrice.toString()
      })
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Product Edit Functionality</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Products List */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Products ({products.length})</h2>
              <button
                onClick={loadProducts}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedProduct?.id === product.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{product.name}</div>
                  <div className="text-sm text-gray-600">
                    {product.brand} • {product.sku}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatRupiah(product.sellingPrice)} • Stock: {product.currentStock}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Edit Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Edit Product {selectedProduct ? `(${selectedProduct.sku})` : ''}
            </h2>
            
            {selectedProduct ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={editForm.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Purchase Price
                    </label>
                    <input
                      type="number"
                      value={editForm.purchasePrice}
                      onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Selling Price
                    </label>
                    <input
                      type="number"
                      value={editForm.sellingPrice}
                      onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <div><strong>ID:</strong> {selectedProduct.id}</div>
                    <div><strong>Created:</strong> {new Date(selectedProduct.createdAt).toLocaleString()}</div>
                    <div><strong>Updated:</strong> {new Date(selectedProduct.updatedAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Select a product to edit</p>
            )}
          </div>
        </div>

        {/* Test Actions */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={testCreateProduct}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              ➕ Test Create Product
            </button>

            <button
              onClick={testUpdateProduct}
              disabled={!selectedProduct}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✏️ Test Update Product (Save)
            </button>

            <button
              onClick={testUpdateFunction}
              disabled={!selectedProduct}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔧 Test Update Function
            </button>

            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              🗑️ Clear Results
            </button>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Test Results:</h3>
              <div className="space-y-1">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`text-sm ${
                      result.includes('SUCCESS') ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <a
            href="/products"
            className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            🏠 Back to Products Page
          </a>
        </div>
      </div>
    </div>
  )
}