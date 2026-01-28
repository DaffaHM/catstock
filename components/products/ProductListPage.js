'use client'

import { useState, useEffect } from 'react'
import { getProductsAction, getProductCategoriesAction } from '@/lib/actions/products'
import { getCategoriesAction, assignProductsToCategoryAction } from '@/lib/actions/categories'
import ProductForm from './ProductForm'
import ProductFilters from './ProductFilters'
import { 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  PackageIcon,
  TagIcon,
  CheckIcon
} from 'lucide-react'
import TouchButton from '@/components/ui/TouchButton'

export default function ProductListPage({ session, isDemoMode }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [bulkCategory, setBulkCategory] = useState('')
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    brand: '',
    page: 1,
    limit: 20
  })

  // Load products and categories
  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    try {
      setLoading(true)
      const [productsResult, categoriesResult] = await Promise.all([
        getProductsAction(filters),
        getCategoriesAction()
      ])

      if (productsResult.success) {
        setProducts(productsResult.products)
      }

      if (categoriesResult.success) {
        // Flatten category tree for selection
        const flatCategories = flattenCategories(categoriesResult.categories)
        setCategories(flatCategories)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to flatten category tree
  const flattenCategories = (categories, prefix = '') => {
    let result = []
    categories.forEach(category => {
      const name = prefix ? `${prefix} > ${category.name}` : category.name
      result.push({ id: category.id, name: category.name, displayName: name })
      if (category.children && category.children.length > 0) {
        result = result.concat(flattenCategories(category.children, name))
      }
    })
    return result
  }

  const handleCreateProduct = () => {
    setEditingProduct(null)
    setShowForm(true)
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleFormSuccess = (product) => {
    setShowForm(false)
    setEditingProduct(null)
    loadData() // Reload data
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId)
      } else {
        return [...prev, productId]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map(p => p.id))
    }
  }

  const handleBulkCategoryAssign = async () => {
    if (!bulkCategory || selectedProducts.length === 0) return

    try {
      const result = await assignProductsToCategoryAction(selectedProducts, bulkCategory)
      if (result.success) {
        setSelectedProducts([])
        setShowBulkActions(false)
        setBulkCategory('')
        loadData() // Reload data
      }
    } catch (error) {
      console.error('Error assigning category:', error)
    }
  }

  if (showForm) {
    return (
      <ProductForm
        product={editingProduct}
        categories={categories.map(c => c.name)}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <PackageIcon className="h-8 w-8 text-primary-600 mr-3" />
            Products
            {isDemoMode && (
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">
                Demo
              </span>
            )}
          </h1>
          <p className="text-gray-600 mt-1">Manage your product catalog</p>
        </div>

        <TouchButton
          variant="primary"
          onClick={handleCreateProduct}
          className="flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Product
        </TouchButton>
      </div>

      {/* Filters */}
      <ProductFilters
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories.map(c => c.name)}
      />

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-blue-800 font-medium">
                {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {!showBulkActions ? (
                <TouchButton
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkActions(true)}
                  className="flex items-center"
                >
                  <TagIcon className="h-4 w-4 mr-2" />
                  Assign Category
                </TouchButton>
              ) : (
                <div className="flex items-center space-x-2">
                  <select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.displayName}
                      </option>
                    ))}
                  </select>
                  <TouchButton
                    variant="primary"
                    size="sm"
                    onClick={handleBulkCategoryAssign}
                    disabled={!bulkCategory}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </TouchButton>
                  <TouchButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBulkActions(false)}
                  >
                    Cancel
                  </TouchButton>
                </div>
              )}
              <TouchButton
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProducts([])}
              >
                Clear Selection
              </TouchButton>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <PackageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No products found</p>
            <TouchButton
              variant="primary"
              onClick={handleCreateProduct}
              className="mt-4"
            >
              Add Your First Product
            </TouchButton>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          {product.brand} • {product.sku}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.size} {product.unit}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (product.currentStock || 0) <= (product.minimumStock || 0)
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {product.currentStock || 0} units
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {product.sellingPrice && (
                          <div className="font-medium text-gray-900">
                            ${product.sellingPrice.toLocaleString()}
                          </div>
                        )}
                        {product.purchasePrice && (
                          <div className="text-gray-500">
                            Cost: ${product.purchasePrice.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <TouchButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EditIcon className="h-4 w-4" />
                        </TouchButton>
                        <TouchButton
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </TouchButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}