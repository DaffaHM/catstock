'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SplitView from '@/components/layout/SplitView'
import ProductList from './ProductList'
import ProductDetail from './ProductDetail'
import ProductForm from './ProductForm'
import ProductFilters from './ProductFilters'
import TouchButton from '@/components/ui/TouchButton'
import ExportButton from '@/components/ui/ExportButton'
import { PlusIcon, SearchIcon } from 'lucide-react'
import { getProductsAction, searchProductsAction } from '@/lib/actions/products'

export default function ProductListPage({
  initialProducts,
  initialPagination,
  categories,
  brands,
  searchParams
}) {
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  
  // State management
  const [products, setProducts] = useState(initialProducts)
  const [pagination, setPagination] = useState(initialPagination)
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams?.search || '')
  const [filters, setFilters] = useState({
    category: searchParams?.category || '',
    brand: searchParams?.brand || '',
    sortBy: searchParams?.sortBy || 'name',
    sortOrder: searchParams?.sortOrder || 'asc'
  })

  // Update URL when filters change
  const updateURL = useCallback((newFilters, newSearch) => {
    const params = new URLSearchParams()
    
    if (newSearch) params.set('search', newSearch)
    if (newFilters.category) params.set('category', newFilters.category)
    if (newFilters.brand) params.set('brand', newFilters.brand)
    if (newFilters.sortBy !== 'name') params.set('sortBy', newFilters.sortBy)
    if (newFilters.sortOrder !== 'asc') params.set('sortOrder', newFilters.sortOrder)
    
    const queryString = params.toString()
    const newURL = queryString ? `/products?${queryString}` : '/products'
    
    router.push(newURL, { scroll: false })
  }, [router])

  // Load products with current filters
  const loadProducts = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const searchFilters = {
        search: searchQuery,
        ...filters,
        page,
        limit: 20
      }

      const result = await getProductsAction(searchFilters)
      
      if (result.success) {
        setProducts(result.products)
        setPagination(result.pagination)
      }
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, filters])

  // Handle search
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query)
    updateURL(filters, query)
    
    if (query.length >= 2) {
      await loadProducts(1)
    } else if (query.length === 0) {
      await loadProducts(1)
    }
  }, [filters, updateURL, loadProducts])

  // Handle filter changes
  const handleFilterChange = useCallback(async (newFilters) => {
    setFilters(newFilters)
    updateURL(newFilters, searchQuery)
    await loadProducts(1)
  }, [searchQuery, updateURL, loadProducts])

  // Handle pagination
  const handlePageChange = useCallback(async (page) => {
    await loadProducts(page)
  }, [loadProducts])

  // Handle product selection
  const handleProductSelect = useCallback((productId) => {
    setSelectedProductId(productId)
    setShowForm(false)
    setEditingProduct(null)
  }, [])

  // Handle product creation
  const handleCreateProduct = useCallback(() => {
    setShowForm(true)
    setEditingProduct(null)
    setSelectedProductId(null)
  }, [])

  // Handle product editing
  const handleEditProduct = useCallback((product) => {
    setEditingProduct(product)
    setShowForm(true)
    setSelectedProductId(null)
  }, [])

  // Handle form success
  const handleFormSuccess = useCallback(async (product) => {
    setShowForm(false)
    setEditingProduct(null)
    
    // Refresh products list
    await loadProducts(pagination.page)
    
    // Select the created/updated product
    if (product) {
      setSelectedProductId(product.id)
    }
  }, [loadProducts, pagination.page])

  // Handle form cancel
  const handleFormCancel = useCallback(() => {
    setShowForm(false)
    setEditingProduct(null)
  }, [])

  // Handle product deletion
  const handleProductDeleted = useCallback(async () => {
    setSelectedProductId(null)
    await loadProducts(pagination.page)
  }, [loadProducts, pagination.page])

  // Master content - Product list with filters
  const masterContent = (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">
              {pagination.totalCount} {pagination.totalCount === 1 ? 'product' : 'products'}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <ExportButton
              exportType="products"
              filters={{
                search: searchQuery,
                category: filters.category,
                brand: filters.brand,
                includeStockLevels: true
              }}
              variant="outline"
            >
              Export Products
            </ExportButton>
            
            <TouchButton
              variant="primary"
              onClick={handleCreateProduct}
              className="flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Product
            </TouchButton>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name, brand, or SKU..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full h-12 pl-10 pr-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation"
          />
        </div>

        {/* Filters */}
        <ProductFilters
          filters={filters}
          categories={categories}
          brands={brands}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Product List */}
      <div className="flex-1 overflow-y-auto">
        <ProductList
          products={products}
          selectedProductId={selectedProductId}
          onProductSelect={handleProductSelect}
          onProductEdit={handleEditProduct}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )

  // Detail content - Product detail or form
  const detailContent = showForm ? (
    <ProductForm
      product={editingProduct}
      categories={categories}
      onSuccess={handleFormSuccess}
      onCancel={handleFormCancel}
    />
  ) : selectedProductId ? (
    <ProductDetail
      productId={selectedProductId}
      onEdit={handleEditProduct}
      onDeleted={handleProductDeleted}
      onClose={() => setSelectedProductId(null)}
    />
  ) : (
    <div className="h-full flex items-center justify-center bg-white">
      <div className="text-center text-gray-500">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <PlusIcon className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Product Selected</h3>
        <p className="text-sm mb-4">
          Select a product from the list to view details, or create a new product.
        </p>
        <TouchButton
          variant="primary"
          onClick={handleCreateProduct}
        >
          Create New Product
        </TouchButton>
      </div>
    </div>
  )

  return (
    <SplitView
      masterContent={masterContent}
      detailContent={detailContent}
      masterWidth="45%"
      showDetail={showForm || selectedProductId !== null}
    />
  )
}