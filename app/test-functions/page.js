'use client'

import { useState } from 'react'
import { createProductAction, updateProductAction, deleteProductAction } from '@/lib/actions/products'
import { createSupplierAction, updateSupplierAction, deleteSupplierAction } from '@/lib/actions/suppliers'
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from '@/lib/actions/categories'
import { getProfitAnalysisAction } from '@/lib/actions/profit-analysis'

export default function TestFunctionsPage() {
  const [testResults, setTestResults] = useState([])
  const [testing, setTesting] = useState(false)

  const addResult = (feature, status, message, data = null) => {
    setTestResults(prev => [...prev, {
      feature,
      status, // 'success', 'error', 'warning'
      message,
      data,
      timestamp: new Date().toISOString()
    }])
  }

  const runAllFunctionTests = async () => {
    setTesting(true)
    setTestResults([])
    
    // Test 1: Product Functions
    try {
      addResult('Product Functions', 'info', 'Testing product CRUD operations...')
      
      // Test create product
      const productFormData = new FormData()
      productFormData.append('sku', `TEST-${Date.now()}`)
      productFormData.append('brand', 'Test Brand')
      productFormData.append('name', 'Test Product')
      productFormData.append('category', 'Test Category')
      productFormData.append('size', '1')
      productFormData.append('unit', 'Liter')
      productFormData.append('purchasePrice', '50000')
      productFormData.append('sellingPrice', '75000')
      productFormData.append('minimumStock', '10')
      
      const createResult = await createProductAction({}, productFormData)
      if (createResult.success) {
        addResult('Product - Create', 'success', 
          `✅ Product created successfully: ${createResult.product.name}`, 
          createResult.product)
        
        // Test update product
        const updateFormData = new FormData()
        updateFormData.append('name', 'Updated Test Product')
        updateFormData.append('sellingPrice', '80000')
        
        const updateResult = await updateProductAction(createResult.product.id, {}, updateFormData)
        if (updateResult.success) {
          addResult('Product - Update', 'success', 
            `✅ Product updated successfully`)
        } else {
          addResult('Product - Update', 'error', 
            `❌ Failed to update product: ${updateResult.error}`)
        }
        
        // Test delete product
        const deleteResult = await deleteProductAction(createResult.product.id)
        if (deleteResult.success) {
          addResult('Product - Delete', 'success', 
            `✅ Product deleted successfully`)
        } else {
          addResult('Product - Delete', 'error', 
            `❌ Failed to delete product: ${deleteResult.error}`)
        }
        
      } else {
        addResult('Product - Create', 'error', 
          `❌ Failed to create product: ${createResult.error}`)
      }
      
    } catch (error) {
      addResult('Product Functions', 'error', `❌ Product functions error: ${error.message}`)
    }

    // Test 2: Supplier Functions
    try {
      addResult('Supplier Functions', 'info', 'Testing supplier CRUD operations...')
      
      // Test create supplier
      const supplierFormData = new FormData()
      supplierFormData.append('name', `Test Supplier ${Date.now()}`)
      supplierFormData.append('contact', 'Test Contact Info')
      supplierFormData.append('notes', 'Test supplier notes')
      
      const createSupplierResult = await createSupplierAction({}, supplierFormData)
      if (createSupplierResult.success) {
        addResult('Supplier - Create', 'success', 
          `✅ Supplier created successfully: ${createSupplierResult.supplier.name}`)
        
        // Test update supplier
        const updateSupplierFormData = new FormData()
        updateSupplierFormData.append('name', 'Updated Test Supplier')
        
        const updateSupplierResult = await updateSupplierAction(createSupplierResult.supplier.id, {}, updateSupplierFormData)
        if (updateSupplierResult.success) {
          addResult('Supplier - Update', 'success', 
            `✅ Supplier updated successfully`)
        } else {
          addResult('Supplier - Update', 'error', 
            `❌ Failed to update supplier: ${updateSupplierResult.error}`)
        }
        
        // Test delete supplier
        const deleteSupplierResult = await deleteSupplierAction(createSupplierResult.supplier.id)
        if (deleteSupplierResult.success) {
          addResult('Supplier - Delete', 'success', 
            `✅ Supplier deleted successfully`)
        } else {
          addResult('Supplier - Delete', 'error', 
            `❌ Failed to delete supplier: ${deleteSupplierResult.error}`)
        }
        
      } else {
        addResult('Supplier - Create', 'error', 
          `❌ Failed to create supplier: ${createSupplierResult.error}`)
      }
      
    } catch (error) {
      addResult('Supplier Functions', 'error', `❌ Supplier functions error: ${error.message}`)
    }

    // Test 3: Category Functions
    try {
      addResult('Category Functions', 'info', 'Testing category CRUD operations...')
      
      // Test create category
      const categoryFormData = new FormData()
      categoryFormData.append('name', `Test Category ${Date.now()}`)
      
      const createCategoryResult = await createCategoryAction({}, categoryFormData)
      if (createCategoryResult.success) {
        addResult('Category - Create', 'success', 
          `✅ Category created successfully: ${createCategoryResult.category.name}`)
        
        // Test update category
        const updateCategoryFormData = new FormData()
        updateCategoryFormData.append('name', 'Updated Test Category')
        
        const updateCategoryResult = await updateCategoryAction(createCategoryResult.category.id, {}, updateCategoryFormData)
        if (updateCategoryResult.success) {
          addResult('Category - Update', 'success', 
            `✅ Category updated successfully`)
        } else {
          addResult('Category - Update', 'error', 
            `❌ Failed to update category: ${updateCategoryResult.error}`)
        }
        
        // Test delete category
        const deleteCategoryResult = await deleteCategoryAction(createCategoryResult.category.id)
        if (deleteCategoryResult.success) {
          addResult('Category - Delete', 'success', 
            `✅ Category deleted successfully`)
        } else {
          addResult('Category - Delete', 'error', 
            `❌ Failed to delete category: ${deleteCategoryResult.error}`)
        }
        
      } else {
        addResult('Category - Create', 'error', 
          `❌ Failed to create category: ${createCategoryResult.error}`)
      }
      
    } catch (error) {
      addResult('Category Functions', 'error', `❌ Category functions error: ${error.message}`)
    }

    // Test 4: Profit Analysis Functions
    try {
      addResult('Profit Analysis', 'info', 'Testing profit analysis functions...')
      
      const profitResult = await getProfitAnalysisAction()
      if (profitResult.success) {
        addResult('Profit Analysis', 'success', 
          `✅ Profit analysis working: ${profitResult.products.length} products analyzed`, 
          profitResult.summary)
      } else {
        addResult('Profit Analysis', 'error', 
          `❌ Failed to get profit analysis: ${profitResult.error}`)
      }
      
    } catch (error) {
      addResult('Profit Analysis', 'error', `❌ Profit analysis error: ${error.message}`)
    }

    // Test 5: API Endpoints
    try {
      addResult('API Endpoints', 'info', 'Testing API endpoints...')
      
      // Test products API
      const productsAPI = await fetch('/api/products')
      if (productsAPI.ok) {
        const data = await productsAPI.json()
        addResult('API - Products', 'success', 
          `✅ Products API working: ${data.products?.length || 0} products`)
      } else {
        addResult('API - Products', 'error', 
          `❌ Products API failed: ${productsAPI.status}`)
      }
      
      // Test suppliers API
      const suppliersAPI = await fetch('/api/suppliers')
      if (suppliersAPI.ok) {
        const data = await suppliersAPI.json()
        addResult('API - Suppliers', 'success', 
          `✅ Suppliers API working: ${data.suppliers?.length || 0} suppliers`)
      } else {
        addResult('API - Suppliers', 'error', 
          `❌ Suppliers API failed: ${suppliersAPI.status}`)
      }
      
      // Test categories API
      const categoriesAPI = await fetch('/api/categories')
      if (categoriesAPI.ok) {
        const data = await categoriesAPI.json()
        addResult('API - Categories', 'success', 
          `✅ Categories API working: ${data.categories?.length || 0} categories`)
      } else {
        addResult('API - Categories', 'error', 
          `❌ Categories API failed: ${categoriesAPI.status}`)
      }
      
      // Test profit analysis API
      const profitAPI = await fetch('/api/profit-analysis')
      if (profitAPI.ok) {
        const data = await profitAPI.json()
        addResult('API - Profit Analysis', 'success', 
          `✅ Profit Analysis API working: ${data.products?.length || 0} products`)
      } else {
        addResult('API - Profit Analysis', 'error', 
          `❌ Profit Analysis API failed: ${profitAPI.status}`)
      }
      
    } catch (error) {
      addResult('API Endpoints', 'error', `❌ API testing error: ${error.message}`)
    }

    setTesting(false)
    addResult('Test Complete', 'success', '🎉 All function tests completed!')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'border-green-500 bg-green-50 text-green-800'
      case 'error': return 'border-red-500 bg-red-50 text-red-800'
      case 'warning': return 'border-yellow-500 bg-yellow-50 text-yellow-800'
      case 'info': return 'border-blue-500 bg-blue-50 text-blue-800'
      default: return 'border-gray-500 bg-gray-50 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Test Semua Fungsi CatStock
          </h1>
          <p className="text-gray-600">
            Test komprehensif untuk memastikan semua fungsi CRUD dan API bekerja dengan baik
          </p>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Test Controls</h2>
            <button
              onClick={runAllFunctionTests}
              disabled={testing}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                testing 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {testing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Testing Functions...
                </div>
              ) : (
                '🚀 Test All Functions'
              )}
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Test Results</h2>
            {testResults.length > 0 && (
              <div className="mt-2 flex space-x-4 text-sm">
                <span className="text-green-600">
                  ✅ {testResults.filter(r => r.status === 'success').length} Passed
                </span>
                <span className="text-red-600">
                  ❌ {testResults.filter(r => r.status === 'error').length} Failed
                </span>
                <span className="text-yellow-600">
                  ⚠️ {testResults.filter(r => r.status === 'warning').length} Warnings
                </span>
              </div>
            )}
          </div>
          
          <div className="p-6">
            {testResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">🧪</div>
                <p>Click "Test All Functions" to start comprehensive function testing</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${getStatusColor(result.status)}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{result.feature}</div>
                        <div className="text-sm mt-1">{result.message}</div>
                        {result.data && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                              View Data ({typeof result.data === 'object' ? 'object' : 'data'})
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 ml-4">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Links for Manual Testing</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
              { name: 'Products', path: '/products', icon: '📦' },
              { name: 'Categories', path: '/categories', icon: '📁' },
              { name: 'Suppliers', path: '/suppliers', icon: '🚚' },
              { name: 'Profit Analysis', path: '/profit-analysis', icon: '💰' },
              { name: 'Reports', path: '/reports', icon: '📊' },
              { name: 'Settings', path: '/settings', icon: '⚙️' },
              { name: 'Test All Features', path: '/test-all-features', icon: '🧪' }
            ].map(link => (
              <a
                key={link.path}
                href={link.path}
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl mr-3">{link.icon}</span>
                <span className="font-medium">{link.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}