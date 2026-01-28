'use client'

import { useState, useEffect } from 'react'
import { getProductsAction, deleteProductAction } from '@/lib/actions/products'
import { getCategoriesAction, assignProductsToCategoryAction } from '@/lib/actions/categories'
import { getDemoProducts, saveDemoProduct, deleteDemoProduct, searchDemoProducts, getDemoProductCategories } from '@/lib/utils/demo-products'
import { formatRupiah } from '@/lib/utils/currency'
import ProductForm from './ProductForm'
import ProductFilters from './ProductFilters'
import { 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  PackageIcon,
  TagIcon,
  CheckIcon,
  SearchIcon
} from 'lucide-react'
import TouchButton from '@/components/ui/TouchButton'

export default function ProductListPage({ session, isDemoMode }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [bulkCategory, setBulkCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    brand: '',
    page: 1,
    limit: 20
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0
  })

  // Load products and categories - use client-side demo data if in demo mode
  const loadData = async (page = 1, search = '', category = '', brand = '') => {
    try {
      setLoading(true)
      console.log('Loading products:', { page, search, category, brand, isDemoMode })
      
      if (isDemoMode) {
        // Use client-side demo data
        const result = searchDemoProducts(search, {
          page,
          limit: 20,
          category,
          brand,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        })
        
        console.log('Demo products loaded:', result)
        setProducts(result.products)
        setPagination(result.pagination)
        
        // Load demo categories
        const demoCategories = getDemoProductCategories()
        setCategories(demoCategories.map(name => ({ id: name, name, displayName: name })))
        setError(null)
      } else {
        // Use server action for real data
        const [productsResult, categoriesResult] = await Promise.all([
          getProductsAction({ search, category, brand, page, limit: 20 }),
          getCategoriesAction()
        ])

        console.log('Server products loaded:', productsResult)

        if (productsResult.success) {
          setProducts(productsResult.products)
          setPagination(productsResult.pagination)
          setError(null)
        } else {
          setError(productsResult.error)
          console.error('Failed to load products:', productsResult.error)
        }

        if (categoriesResult.success) {
          // Flatten category tree for selection
          const flatCategories = flattenCategories(categoriesResult.categories)
          setCategories(flatCategories)
        }
      }
    } catch (err) {
      console.error('Load products error:', err)
      setError('Gagal memuat data produk')
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    loadData()
  }, [])

  // Search handler with proper debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadData(1, searchTerm, filters.category, filters.brand)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, filters.category, filters.brand])

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

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)
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
    console.log('Form success, new product:', product)
    setShowForm(false)
    setEditingProduct(null)
    
    if (isDemoMode) {
      // In demo mode, handle client-side
      if (!editingProduct && product) {
        // Save to localStorage
        saveDemoProduct(product)
        
        // Add to current list immediately
        setProducts(prevProducts => {
          const exists = prevProducts.find(p => p.id === product.id)
          if (!exists) {
            return [product, ...prevProducts]
          }
          return prevProducts
        })
        
        // Update pagination count
        setPagination(prev => ({
          ...prev,
          totalCount: prev.totalCount + 1
        }))
        
        // Notify other components that products have been updated
        window.dispatchEvent(new CustomEvent('productsUpdated', { detail: product }))
      }
    } else {
      // In database mode, reload from server
      loadData(1, searchTerm, filters.category, filters.brand)
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  // Handle delete product
  const handleDeleteProduct = async (product) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus produk "${product.name}"?`)) {
      return
    }

    try {
      if (isDemoMode) {
        // Handle demo mode deletion
        deleteDemoProduct(product.id)
        
        // Remove from current list
        setProducts(prevProducts => prevProducts.filter(p => p.id !== product.id))
        setPagination(prev => ({
          ...prev,
          totalCount: Math.max(0, prev.totalCount - 1)
        }))
      } else {
        // Handle database deletion
        const result = await deleteProductAction(product.id)
        if (result.success) {
          loadData(pagination.page, searchTerm, filters.category, filters.brand)
        } else {
          alert(result.error || 'Gagal menghapus produk')
        }
      }
    } catch (err) {
      alert('Gagal menghapus produk')
    }
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
      if (isDemoMode) {
        console.log('Demo mode - bulk category assignment simulated')
        setSelectedProducts([])
        setShowBulkActions(false)
        setBulkCategory('')
      } else {
        const result = await assignProductsToCategoryAction(selectedProducts, bulkCategory)
        if (result.success) {
          setSelectedProducts([])
          setShowBulkActions(false)
          setBulkCategory('')
          loadData(pagination.page, searchTerm, filters.category, filters.brand)
        }
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
        isDemoMode={isDemoMode}
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
            Produk
            {isDemoMode && (
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">
                Demo
              </span>
            )}
          </h1>
          <p className="text-gray-600 mt-1">Kelola katalog produk Anda</p>
        </div>

        <TouchButton
          variant="primary"
          onClick={handleCreateProduct}
          className="flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Tambah Produk
        </TouchButton>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex gap-2">
              <TouchButton
                variant="primary"
                onClick={handleCreateProduct}
                className="flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Tambah Produk
              </TouchButton>
            </div>

            {/* Search */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Memuat produk...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && products.length === 0 && !error && (
            <div className="text-center py-12">
              <PackageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada produk</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Tidak ada produk yang sesuai dengan pencarian.' : 'Mulai dengan menambahkan produk pertama.'}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <TouchButton
                    variant="primary"
                    onClick={handleCreateProduct}
                    className="flex items-center mx-auto"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Tambah Produk
                  </TouchButton>
                </div>
              )}
            </div>
          )}

          {/* Products Table */}
          {!loading && products.length > 0 && (
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
                      Produk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stok
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Harga
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
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
                          {product.currentStock || 0} unit
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {product.sellingPrice && (
                            <div className="font-medium text-gray-900">
                              {formatRupiah(product.sellingPrice)}
                            </div>
                          )}
                          {product.purchasePrice && (
                            <div className="text-gray-500">
                              Modal: {formatRupiah(product.purchasePrice)}
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
                            onClick={() => handleDeleteProduct(product)}
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

          {/* Pagination */}
          {!loading && products.length > 0 && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.totalCount)} dari {pagination.totalCount} produk
              </div>
              
              <div className="flex items-center space-x-2">
                <TouchButton
                  variant="outline"
                  size="sm"
                  onClick={() => loadData(pagination.page - 1, searchTerm, filters.category, filters.brand)}
                  disabled={!pagination.hasPreviousPage}
                >
                  Sebelumnya
                </TouchButton>
                
                <span className="text-sm text-gray-700">
                  Halaman {pagination.page} dari {pagination.totalPages}
                </span>
                
                <TouchButton
                  variant="outline"
                  size="sm"
                  onClick={() => loadData(pagination.page + 1, searchTerm, filters.category, filters.brand)}
                  disabled={!pagination.hasNextPage}
                >
                  Selanjutnya
                </TouchButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}