'use client'

import { useState } from 'react'
import TouchButton from '@/components/ui/TouchButton'
import { 
  EditIcon, 
  PackageIcon, 
  AlertTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-react'

export default function ProductList({
  products,
  selectedProductId,
  onProductSelect,
  onProductEdit,
  loading,
  pagination,
  onPageChange
}) {
  const [expandedProduct, setExpandedProduct] = useState(null)

  const formatCurrency = (amount) => {
    if (!amount) return '—'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const isLowStock = (product) => {
    return product.minimumStock && product.currentStock < product.minimumStock
  }

  const handleProductClick = (product) => {
    if (selectedProductId === product.id) {
      // If already selected, expand/collapse details
      setExpandedProduct(expandedProduct === product.id ? null : product.id)
    } else {
      // Select the product
      onProductSelect(product.id)
      setExpandedProduct(null)
    }
  }

  const handleEditClick = (e, product) => {
    e.stopPropagation()
    onProductEdit(product)
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-lg border animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <PackageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">No Products Found</h3>
        <p className="text-sm">
          Try adjusting your search or filters, or create a new product.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Product Cards */}
      <div className="space-y-3 mb-6">
        {products.map((product) => {
          const isSelected = selectedProductId === product.id
          const isExpanded = expandedProduct === product.id
          const lowStock = isLowStock(product)

          return (
            <div
              key={product.id}
              className={`bg-white rounded-lg border transition-all duration-200 cursor-pointer touch-manipulation ${
                isSelected
                  ? 'border-primary-500 ring-2 ring-primary-100 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
              onClick={() => handleProductClick(product)}
            >
              {/* Main Product Info */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {product.name}
                      </h3>
                      {lowStock && (
                        <AlertTriangleIcon className="h-5 w-5 text-amber-500 ml-2 flex-shrink-0" />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-1">
                      {product.brand} • {product.sku}
                    </p>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <span>{product.category}</span>
                      <span className="mx-2">•</span>
                      <span>{product.size}</span>
                      {product.paintColor && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="text-blue-600 font-medium">🎨 {product.paintColor}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {/* Stock Status */}
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        lowStock ? 'text-amber-600' : 
                        product.currentStock > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {product.currentStock} {product.unit}
                      </div>
                      {product.minimumStock && (
                        <div className="text-xs text-gray-500">
                          Min: {product.minimumStock}
                        </div>
                      )}
                    </div>

                    {/* Edit Button */}
                    <TouchButton
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEditClick(e, product)}
                      className="text-gray-500 hover:text-gray-700"
                      aria-label="Edit product"
                    >
                      <EditIcon className="h-4 w-4" />
                    </TouchButton>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Purchase Price:</span>
                        <span className="ml-2 font-medium">
                          {formatCurrency(product.purchasePrice)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Selling Price:</span>
                        <span className="ml-2 font-medium">
                          {formatCurrency(product.sellingPrice)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Unit:</span>
                        <span className="ml-2 font-medium">{product.unit}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Warna Cat:</span>
                        <span className="ml-2 font-medium text-blue-600">
                          {product.paintColor || 'Tidak ada warna'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <span className="ml-2 font-medium">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Low Stock Warning */}
              {lowStock && (
                <div className="px-4 pb-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <AlertTriangleIcon className="h-4 w-4 text-amber-500 mr-2" />
                      <span className="text-sm text-amber-700">
                        Low stock: {product.currentStock} remaining (minimum: {product.minimumStock})
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages} 
            ({pagination.totalCount} total products)
          </div>
          
          <div className="flex items-center space-x-2">
            <TouchButton
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.hasPreviousPage}
              className="flex items-center"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Previous
            </TouchButton>
            
            <TouchButton
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              className="flex items-center"
            >
              Next
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </TouchButton>
          </div>
        </div>
      )}
    </div>
  )
}