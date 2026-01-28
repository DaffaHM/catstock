'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getProductAction, deleteProductAction } from '@/lib/actions/products'
import DetailPanel from '@/components/ui/DetailPanel'
import TouchButton from '@/components/ui/TouchButton'
import { 
  PackageIcon, 
  AlertTriangleIcon, 
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
  DollarSignIcon
} from 'lucide-react'

export default function ProductDetail({ productId, onEdit, onDeleted, onClose }) {
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadProduct()
  }, [productId])

  const loadProduct = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await getProductAction(productId)
      
      if (result.success) {
        setProduct(result.product)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to load product details')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    if (product) {
      onEdit(product)
    }
  }

  const handleDelete = async () => {
    if (!product) return
    
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?\n\nThis action cannot be undone.`
    )
    
    if (!confirmed) return
    
    setDeleting(true)
    
    try {
      const result = await deleteProductAction(product.id)
      
      if (result.success) {
        onDeleted()
      } else {
        alert(result.error || 'Failed to delete product')
      }
    } catch (err) {
      alert('Failed to delete product')
    } finally {
      setDeleting(false)
    }
  }

  const formatCurrency = (amount) => {
    if (!amount) return '—'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isLowStock = () => {
    return product?.minimumStock && product.currentStock < product.minimumStock
  }

  const getStockStatus = () => {
    if (!product) return { status: 'unknown', color: 'gray', icon: PackageIcon }
    
    if (product.currentStock === 0) {
      return { status: 'Out of Stock', color: 'red', icon: AlertTriangleIcon }
    }
    
    if (isLowStock()) {
      return { status: 'Low Stock', color: 'amber', icon: TrendingDownIcon }
    }
    
    return { status: 'In Stock', color: 'green', icon: TrendingUpIcon }
  }

  if (loading) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center text-red-600">
          <AlertTriangleIcon className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Error Loading Product</h3>
          <p className="text-sm mb-4">{error}</p>
          <TouchButton variant="outline" onClick={loadProduct}>
            Try Again
          </TouchButton>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center text-gray-500">
          <PackageIcon className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Product Not Found</h3>
          <p className="text-sm">The requested product could not be found.</p>
        </div>
      </div>
    )
  }

  const stockStatus = getStockStatus()
  const StatusIcon = stockStatus.icon

  return (
    <DetailPanel
      title={product.name}
      subtitle={`${product.brand} • ${product.sku}`}
      onEdit={handleEdit}
      onDelete={product.transactionCount === 0 ? handleDelete : undefined}
      onClose={onClose}
    >
      <div className="p-6 space-y-6">
        {/* Stock Status Alert */}
        {(product.currentStock === 0 || isLowStock()) && (
          <div className={`p-4 rounded-lg border ${
            product.currentStock === 0 
              ? 'bg-red-50 border-red-200' 
              : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-center">
              <StatusIcon className={`h-5 w-5 mr-3 ${
                product.currentStock === 0 ? 'text-red-500' : 'text-amber-500'
              }`} />
              <div>
                <h4 className={`font-medium ${
                  product.currentStock === 0 ? 'text-red-800' : 'text-amber-800'
                }`}>
                  {stockStatus.status}
                </h4>
                <p className={`text-sm ${
                  product.currentStock === 0 ? 'text-red-600' : 'text-amber-600'
                }`}>
                  {product.currentStock === 0 
                    ? 'This product is out of stock'
                    : `Only ${product.currentStock} units remaining (minimum: ${product.minimumStock})`
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Product Information
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">SKU</label>
                <p className="text-base text-gray-900 font-mono">{product.sku}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Brand</label>
                <p className="text-base text-gray-900">{product.brand}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Category</label>
                <p className="text-base text-gray-900">{product.category}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Size</label>
                <p className="text-base text-gray-900">{product.size}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Unit</label>
                <p className="text-base text-gray-900">{product.unit}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Stock & Pricing
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Current Stock</label>
                <div className="flex items-center">
                  <p className={`text-xl font-bold ${
                    product.currentStock === 0 ? 'text-red-600' :
                    isLowStock() ? 'text-amber-600' : 'text-green-600'
                  }`}>
                    {product.currentStock} {product.unit}
                  </p>
                  <StatusIcon className={`h-5 w-5 ml-2 text-${stockStatus.color}-500`} />
                </div>
              </div>
              
              {product.minimumStock && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Minimum Stock</label>
                  <p className="text-base text-gray-900">{product.minimumStock} {product.unit}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-500">Purchase Price</label>
                <div className="flex items-center">
                  <DollarSignIcon className="h-4 w-4 text-gray-400 mr-1" />
                  <p className="text-base text-gray-900 font-medium">
                    {formatCurrency(product.purchasePrice)}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Selling Price</label>
                <div className="flex items-center">
                  <DollarSignIcon className="h-4 w-4 text-gray-400 mr-1" />
                  <p className="text-base text-gray-900 font-medium">
                    {formatCurrency(product.sellingPrice)}
                  </p>
                </div>
              </div>

              {product.purchasePrice && product.sellingPrice && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Profit Margin</label>
                  <p className="text-base text-green-600 font-medium">
                    {formatCurrency(product.sellingPrice - product.purchasePrice)}
                    <span className="text-sm text-gray-500 ml-1">
                      ({Math.round(((product.sellingPrice - product.purchasePrice) / product.purchasePrice) * 100)}%)
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transaction History Summary */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Transaction History
          </h3>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{product.transactionCount}</p>
              </div>
              
              <TouchButton
                variant="outline"
                onClick={() => {
                  router.push(`/products/${product.id}/stock-card`)
                }}
              >
                View Stock Card
              </TouchButton>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Product Details
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-500">Created:</span>
              <span className="ml-2 text-gray-900">{formatDate(product.createdAt)}</span>
            </div>
            
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-500">Updated:</span>
              <span className="ml-2 text-gray-900">{formatDate(product.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Delete Warning */}
        {product.transactionCount > 0 && (
          <div className="border-t pt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangleIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-800">Cannot Delete Product</h4>
                  <p className="text-sm text-blue-600 mt-1">
                    This product has {product.transactionCount} associated transaction{product.transactionCount !== 1 ? 's' : ''} 
                    and cannot be deleted to maintain data integrity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DetailPanel>
  )
}