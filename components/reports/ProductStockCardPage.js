'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SplitView from '@/components/layout/SplitView'
import TouchButton from '@/components/ui/TouchButton'
import DatePicker from '@/components/ui/DatePicker'
import { 
  ArrowLeftIcon,
  CalendarIcon,
  FilterIcon,
  DownloadIcon,
  RefreshCwIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  RotateCcwIcon,
  PackageIcon,
  ClockIcon,
  HashIcon
} from 'lucide-react'
import { getProductStockCard } from '@/lib/actions/transactions'

export default function ProductStockCardPage({ product, initialData, searchParams }) {
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  
  // State management
  const [stockCardData, setStockCardData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    startDate: searchParams?.startDate || '',
    endDate: searchParams?.endDate || '',
    transactionType: searchParams?.transactionType || '',
    page: parseInt(searchParams?.page) || 1
  })
  const [showFilters, setShowFilters] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  // Transaction type options for filtering
  const transactionTypes = [
    { value: '', label: 'All Transaction Types' },
    { value: 'IN', label: 'Stock In' },
    { value: 'OUT', label: 'Stock Out' },
    { value: 'ADJUST', label: 'Stock Adjustment' },
    { value: 'RETURN_IN', label: 'Return In' },
    { value: 'RETURN_OUT', label: 'Return Out' }
  ]

  // Update URL when filters change
  const updateURL = useCallback((newFilters) => {
    const params = new URLSearchParams()
    
    if (newFilters.startDate) params.set('startDate', newFilters.startDate)
    if (newFilters.endDate) params.set('endDate', newFilters.endDate)
    if (newFilters.transactionType) params.set('transactionType', newFilters.transactionType)
    if (newFilters.page > 1) params.set('page', newFilters.page.toString())
    
    const queryString = params.toString()
    const newURL = queryString ? 
      `/products/${product.id}/stock-card?${queryString}` : 
      `/products/${product.id}/stock-card`
    
    router.push(newURL, { scroll: false })
  }, [router, product.id])

  // Load stock card data with current filters
  const loadStockCardData = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const filterParams = {
        ...filters,
        page,
        limit: 50
      }

      // Convert date strings to Date objects if provided
      if (filterParams.startDate) {
        filterParams.startDate = new Date(filterParams.startDate)
      }
      if (filterParams.endDate) {
        filterParams.endDate = new Date(filterParams.endDate)
      }

      const result = await getProductStockCard(product.id, filterParams)
      
      if (result.success) {
        setStockCardData(result.data)
        setLastRefresh(new Date())
      }
    } catch (error) {
      console.error('Failed to load stock card data:', error)
    } finally {
      setLoading(false)
    }
  }, [product.id, filters])

  // Handle filter changes
  const handleFilterChange = useCallback(async (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 }
    setFilters(updatedFilters)
    updateURL(updatedFilters)
    await loadStockCardData(1)
  }, [filters, updateURL, loadStockCardData])

  // Handle pagination
  const handlePageChange = useCallback(async (page) => {
    const updatedFilters = { ...filters, page }
    setFilters(updatedFilters)
    updateURL(updatedFilters)
    await loadStockCardData(page)
  }, [filters, updateURL, loadStockCardData])

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await loadStockCardData(filters.page)
  }, [loadStockCardData, filters.page])

  // Clear filters
  const clearFilters = useCallback(async () => {
    const clearedFilters = {
      startDate: '',
      endDate: '',
      transactionType: '',
      page: 1
    }
    setFilters(clearedFilters)
    updateURL(clearedFilters)
    await loadStockCardData(1)
  }, [updateURL, loadStockCardData])

  // Format transaction type for display
  const formatTransactionType = (type) => {
    const typeMap = {
      'IN': 'Stock In',
      'OUT': 'Stock Out',
      'ADJUST': 'Adjustment',
      'RETURN_IN': 'Return In',
      'RETURN_OUT': 'Return Out'
    }
    return typeMap[type] || type
  }

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get transaction type icon and color
  const getTransactionTypeDisplay = (type, quantityChange) => {
    const isIncrease = quantityChange > 0
    
    switch (type) {
      case 'IN':
      case 'RETURN_IN':
        return {
          icon: TrendingUpIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        }
      case 'OUT':
      case 'RETURN_OUT':
        return {
          icon: TrendingDownIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        }
      case 'ADJUST':
        return {
          icon: isIncrease ? TrendingUpIcon : TrendingDownIcon,
          color: isIncrease ? 'text-blue-600' : 'text-orange-600',
          bgColor: isIncrease ? 'bg-blue-50' : 'bg-orange-50',
          borderColor: isIncrease ? 'border-blue-200' : 'border-orange-200'
        }
      default:
        return {
          icon: RotateCcwIcon,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        }
    }
  }

  // Calculate running balance for display
  const calculateRunningBalances = (movements) => {
    // Sort movements by creation date (oldest first) for proper balance calculation
    const sortedMovements = [...movements].sort((a, b) => 
      new Date(a.createdAt) - new Date(b.createdAt)
    )

    return sortedMovements.map((movement) => ({
      ...movement,
      runningBalance: movement.quantityAfter
    }))
  }

  // Master content - Stock card timeline
  const masterContent = (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <TouchButton
              variant="ghost"
              onClick={() => router.back()}
              className="mr-3 p-2"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </TouchButton>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Stock Card</h1>
              <p className="text-gray-600 mt-1">
                {product.brand} {product.name} • SKU: {product.sku}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <TouchButton
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <FilterIcon className="h-5 w-5 mr-2" />
              Filters
            </TouchButton>
            
            <TouchButton
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center"
            >
              <RefreshCwIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </TouchButton>
          </div>
        </div>

        {/* Current Stock Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center">
              <PackageIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h3 className="font-semibold text-blue-900">Current Stock</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {stockCardData.movements[0]?.quantityAfter || 0} {product.unit}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h3 className="font-semibold text-green-900">Total Movements</h3>
                <p className="text-2xl font-bold text-green-600">
                  {stockCardData.pagination.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center">
              <HashIcon className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h3 className="font-semibold text-purple-900">Last Updated</h3>
                <p className="text-sm font-medium text-purple-600">
                  {lastRefresh.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <DatePicker
                  value={filters.startDate}
                  onChange={(date) => handleFilterChange({ startDate: date })}
                  placeholder="Select start date"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <DatePicker
                  value={filters.endDate}
                  onChange={(date) => handleFilterChange({ endDate: date })}
                  placeholder="Select end date"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Type
                </label>
                <select
                  value={filters.transactionType}
                  onChange={(e) => handleFilterChange({ transactionType: e.target.value })}
                  className="w-full h-12 px-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {transactionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <TouchButton
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Clear Filters
                </TouchButton>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stock Movement Timeline */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCwIcon className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Loading stock movements...</p>
            </div>
          </div>
        ) : stockCardData.movements.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <PackageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Stock Movements</h3>
              <p className="text-gray-500">
                {filters.startDate || filters.endDate || filters.transactionType
                  ? 'No movements found for the selected filters.'
                  : 'This product has no stock movement history yet.'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {calculateRunningBalances(stockCardData.movements).map((movement, index) => {
              const typeDisplay = getTransactionTypeDisplay(movement.movementType, movement.quantityChange)
              const IconComponent = typeDisplay.icon

              return (
                <div
                  key={movement.id}
                  className={`bg-white rounded-lg border ${typeDisplay.borderColor} p-4 shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-full ${typeDisplay.bgColor} ${typeDisplay.borderColor} border`}>
                        <IconComponent className={`h-6 w-6 ${typeDisplay.color}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {formatTransactionType(movement.movementType)}
                          </h3>
                          <span className="text-sm text-gray-500">
                            #{movement.transaction.referenceNumber}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">
                              <span className="font-medium">Date:</span> {formatDate(movement.transaction.transactionDate)}
                            </p>
                            {movement.transaction.supplier && (
                              <p className="text-gray-600">
                                <span className="font-medium">Supplier:</span> {movement.transaction.supplier.name}
                              </p>
                            )}
                            {movement.transaction.notes && (
                              <p className="text-gray-600">
                                <span className="font-medium">Notes:</span> {movement.transaction.notes}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <p className="text-gray-600">
                              <span className="font-medium">Quantity Before:</span> {movement.quantityBefore} {product.unit}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Change:</span> 
                              <span className={movement.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}>
                                {movement.quantityChange > 0 ? '+' : ''}{movement.quantityChange} {product.unit}
                              </span>
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Quantity After:</span> 
                              <span className="font-semibold text-gray-900">
                                {movement.quantityAfter} {product.unit}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${typeDisplay.color}`}>
                        {movement.quantityChange > 0 ? '+' : ''}{movement.quantityChange}
                      </div>
                      <div className="text-sm text-gray-500">
                        Balance: {movement.quantityAfter}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Pagination */}
            {stockCardData.pagination.pages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing page {stockCardData.pagination.page} of {stockCardData.pagination.pages}
                  ({stockCardData.pagination.total} total movements)
                </div>
                
                <div className="flex items-center space-x-2">
                  <TouchButton
                    variant="outline"
                    onClick={() => handlePageChange(stockCardData.pagination.page - 1)}
                    disabled={stockCardData.pagination.page <= 1}
                  >
                    Previous
                  </TouchButton>
                  
                  <TouchButton
                    variant="outline"
                    onClick={() => handlePageChange(stockCardData.pagination.page + 1)}
                    disabled={stockCardData.pagination.page >= stockCardData.pagination.pages}
                  >
                    Next
                  </TouchButton>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )

  // Detail content - Stock analysis and insights
  const detailContent = (
    <div className="h-full bg-white p-6">
      <div className="max-w-2xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Stock Analysis</h2>
        
        {/* Product Information */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Product Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">SKU:</span>
              <span className="font-medium">{product.sku}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Brand:</span>
              <span className="font-medium">{product.brand}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span className="font-medium">{product.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Size:</span>
              <span className="font-medium">{product.size}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Unit:</span>
              <span className="font-medium">{product.unit}</span>
            </div>
            {product.minimumStock && (
              <div className="flex justify-between">
                <span className="text-gray-600">Minimum Stock:</span>
                <span className="font-medium">{product.minimumStock} {product.unit}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <TouchButton
              variant="outline"
              onClick={() => router.push(`/transactions/stock-in?productId=${product.id}`)}
              className="w-full justify-start"
            >
              <TrendingUpIcon className="h-5 w-5 mr-3 text-green-500" />
              Add Stock (Stock In)
            </TouchButton>
            
            <TouchButton
              variant="outline"
              onClick={() => router.push(`/transactions/stock-out?productId=${product.id}`)}
              className="w-full justify-start"
            >
              <TrendingDownIcon className="h-5 w-5 mr-3 text-red-500" />
              Remove Stock (Stock Out)
            </TouchButton>
            
            <TouchButton
              variant="outline"
              onClick={() => router.push(`/transactions/stock-adjustment?productId=${product.id}`)}
              className="w-full justify-start"
            >
              <RotateCcwIcon className="h-5 w-5 mr-3 text-blue-500" />
              Adjust Stock
            </TouchButton>
            
            <TouchButton
              variant="outline"
              onClick={() => router.push(`/products/${product.id}`)}
              className="w-full justify-start"
            >
              <PackageIcon className="h-5 w-5 mr-3 text-gray-500" />
              View Product Details
            </TouchButton>
          </div>
        </div>

        {/* Stock Card Information */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">About Stock Cards</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Shows chronological history of all stock movements</li>
            <li>• Displays running balance calculations for each transaction</li>
            <li>• Filter by date range and transaction type</li>
            <li>• Real-time updates when new transactions are processed</li>
            <li>• Helps track inventory flow and identify patterns</li>
          </ul>
        </div>
      </div>
    </div>
  )

  return (
    <SplitView
      masterContent={masterContent}
      detailContent={detailContent}
      masterWidth="65%"
      showDetail={true}
    />
  )
}