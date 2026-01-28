'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TouchButton from '@/components/ui/TouchButton'
import { 
  AlertTriangleIcon, 
  PackageIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  HistoryIcon
} from 'lucide-react'

export default function StockReportList({ 
  products, 
  loading, 
  pagination, 
  onPageChange 
}) {
  const router = useRouter()
  const [expandedRows, setExpandedRows] = useState(new Set())

  const toggleRowExpansion = (productId) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId)
    } else {
      newExpanded.add(productId)
    }
    setExpandedRows(newExpanded)
  }

  const getStockStatusColor = (product) => {
    if (product.currentStock === 0) {
      return 'text-red-600 bg-red-50 border-red-200'
    } else if (product.isLowStock) {
      return 'text-amber-600 bg-amber-50 border-amber-200'
    } else {
      return 'text-green-600 bg-green-50 border-green-200'
    }
  }

  const getStockStatusText = (product) => {
    if (product.currentStock === 0) {
      return 'Out of Stock'
    } else if (product.isLowStock) {
      return 'Low Stock'
    } else {
      return 'In Stock'
    }
  }

  const getStockStatusIcon = (product) => {
    if (product.currentStock === 0) {
      return <AlertTriangleIcon className="h-4 w-4" />
    } else if (product.isLowStock) {
      return <TrendingDownIcon className="h-4 w-4" />
    } else {
      return <TrendingUpIcon className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading stock report...</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="p-8 text-center">
        <PackageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
        <p className="text-gray-600">
          No products match your current filters. Try adjusting your search criteria.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Stock
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Min Stock
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Value
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr 
                key={product.id}
                className={`hover:bg-gray-50 transition-colors ${
                  product.isLowStock ? 'bg-amber-25' : 
                  product.currentStock === 0 ? 'bg-red-25' : ''
                }`}
              >
                <td className="px-4 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {product.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.brand} • {product.size}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 font-mono">
                  {product.sku}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  {product.category}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 text-right font-medium">
                  {product.currentStock.toLocaleString()} {product.unit}
                </td>
                <td className="px-4 py-4 text-sm text-gray-500 text-right">
                  {product.minimumStock ? `${product.minimumStock} ${product.unit}` : '—'}
                </td>
                <td className="px-4 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStockStatusColor(product)}`}>
                    {getStockStatusIcon(product)}
                    <span className="ml-1">{getStockStatusText(product)}</span>
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 text-right font-medium">
                  {product.stockValue > 0 ? `$${product.stockValue.toLocaleString('en-US', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}` : '—'}
                </td>
                <td className="px-4 py-4 text-center">
                  <TouchButton
                    variant="ghost"
                    onClick={() => router.push(`/products/${product.id}/stock-card`)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <HistoryIcon className="h-4 w-4 mr-1" />
                    Stock Card
                  </TouchButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        {products.map((product) => (
          <div 
            key={product.id}
            className={`border-b border-gray-200 p-4 ${
              product.isLowStock ? 'bg-amber-25' : 
              product.currentStock === 0 ? 'bg-red-25' : 'bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-medium text-gray-900 truncate">
                    {product.name}
                  </h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ml-2 ${getStockStatusColor(product)}`}>
                    {getStockStatusIcon(product)}
                    <span className="ml-1">{getStockStatusText(product)}</span>
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  {product.brand} • {product.category} • {product.size}
                </div>
                
                <div className="text-xs text-gray-500 font-mono mb-3">
                  SKU: {product.sku}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Current Stock:</span>
                    <div className="font-medium text-gray-900">
                      {product.currentStock.toLocaleString()} {product.unit}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Min Stock:</span>
                    <div className="font-medium text-gray-900">
                      {product.minimumStock ? `${product.minimumStock} ${product.unit}` : '—'}
                    </div>
                  </div>
                  
                  {product.stockValue > 0 && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Stock Value:</span>
                      <div className="font-medium text-gray-900">
                        ${product.stockValue.toLocaleString('en-US', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Stock Card Button */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <TouchButton
                    variant="outline"
                    onClick={() => router.push(`/products/${product.id}/stock-card`)}
                    className="w-full text-sm"
                  >
                    <HistoryIcon className="h-4 w-4 mr-2" />
                    View Stock Card
                  </TouchButton>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <TouchButton
                variant="outline"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={!pagination.hasPreviousPage}
                className="relative inline-flex items-center"
              >
                Previous
              </TouchButton>
              <TouchButton
                variant="outline"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className="relative inline-flex items-center"
              >
                Next
              </TouchButton>
            </div>
            
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{pagination.page}</span> of{' '}
                  <span className="font-medium">{pagination.totalPages}</span>
                  {' '}({pagination.totalCount} total products)
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <TouchButton
                  variant="outline"
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="relative inline-flex items-center"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                  Previous
                </TouchButton>
                
                <TouchButton
                  variant="outline"
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="relative inline-flex items-center"
                >
                  Next
                  <ChevronRightIcon className="h-5 w-5" />
                </TouchButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}