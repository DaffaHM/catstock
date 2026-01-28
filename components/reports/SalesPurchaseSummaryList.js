'use client'

import React, { useState } from 'react'
import TouchButton from '@/components/ui/TouchButton'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  CalendarIcon,
  PackageIcon
} from 'lucide-react'

export default function SalesPurchaseSummaryList({ 
  data, 
  loading, 
  pagination, 
  onPageChange, 
  viewMode, 
  groupBy 
}) {
  const [expandedRows, setExpandedRows] = useState(new Set())

  const toggleRowExpansion = (period) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(period)) {
      newExpanded.delete(period)
    } else {
      newExpanded.add(period)
    }
    setExpandedRows(newExpanded)
  }

  const formatPeriodDisplay = (period, groupBy) => {
    switch (groupBy) {
      case 'day':
        return new Date(period).toLocaleDateString('en-US', { 
          weekday: 'short',
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
      case 'week':
        return `Week ${period.split('-W')[1]}, ${period.split('-')[0]}`
      case 'month':
        const [year, month] = period.split('-')
        return new Date(year, month - 1).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        })
      case 'year':
        return period
      default:
        return period
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0)
  }

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US').format(number || 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <CalendarIcon className="h-12 w-12 mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">No Data Available</h3>
        <p className="text-sm text-center max-w-md">
          No sales or purchase transactions found for the selected date range and filters. 
          Try adjusting your date range or clearing filters.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Summary Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sales
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Purchases
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Net Value
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transactions
              </th>
              {viewMode === 'detailed' && (
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <React.Fragment key={item.period}>
                <tr 
                  className={`hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                  }`}
                >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatPeriodDisplay(item.period, groupBy)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.period}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center text-sm font-medium text-green-600">
                      <TrendingUpIcon className="h-4 w-4 mr-1" />
                      {formatCurrency(item.salesValue)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatNumber(item.salesQuantity)} units
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center text-sm font-medium text-blue-600">
                      <TrendingDownIcon className="h-4 w-4 mr-1" />
                      {formatCurrency(item.purchaseValue)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatNumber(item.purchaseQuantity)} units
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className={`flex items-center justify-end text-sm font-medium ${
                    item.netValue >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <DollarSignIcon className="h-4 w-4 mr-1" />
                    {formatCurrency(item.netValue)}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex flex-col items-end">
                    <div className="text-sm text-gray-900">
                      {formatNumber(item.salesTransactions + item.purchaseTransactions)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.salesTransactions}S / {item.purchaseTransactions}P
                    </div>
                  </div>
                </td>
                
                {viewMode === 'detailed' && (
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <TouchButton
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRowExpansion(item.period)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      {expandedRows.has(item.period) ? 'Hide' : 'Show'}
                    </TouchButton>
                  </td>
                )}
              </tr>
              
              {/* Expanded Row Details */}
              {viewMode === 'detailed' && expandedRows.has(item.period) && (
                <tr className="bg-gray-50">
                  <td colSpan="6" className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Sales Details */}
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <h4 className="font-medium text-green-900 mb-3 flex items-center">
                          <TrendingUpIcon className="h-5 w-5 mr-2" />
                          Sales Summary
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-green-700">Total Value:</span>
                            <span className="font-medium text-green-900">
                              {formatCurrency(item.salesValue)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">Total Quantity:</span>
                            <span className="font-medium text-green-900">
                              {formatNumber(item.salesQuantity)} units
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">Transactions:</span>
                            <span className="font-medium text-green-900">
                              {formatNumber(item.salesTransactions)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">Avg. Transaction:</span>
                            <span className="font-medium text-green-900">
                              {formatCurrency(item.salesTransactions > 0 ? item.salesValue / item.salesTransactions : 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Purchase Details */}
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                          <TrendingDownIcon className="h-5 w-5 mr-2" />
                          Purchase Summary
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-700">Total Value:</span>
                            <span className="font-medium text-blue-900">
                              {formatCurrency(item.purchaseValue)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Total Quantity:</span>
                            <span className="font-medium text-blue-900">
                              {formatNumber(item.purchaseQuantity)} units
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Transactions:</span>
                            <span className="font-medium text-blue-900">
                              {formatNumber(item.purchaseTransactions)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Avg. Transaction:</span>
                            <span className="font-medium text-blue-900">
                              {formatCurrency(item.purchaseTransactions > 0 ? item.purchaseValue / item.purchaseTransactions : 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <TouchButton
                variant="outline"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={!pagination.hasPreviousPage}
              >
                Previous
              </TouchButton>
              <TouchButton
                variant="outline"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
              >
                Next
              </TouchButton>
            </div>
            
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{pagination.page}</span> of{' '}
                  <span className="font-medium">{pagination.totalPages}</span>
                </p>
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
          </div>
        </div>
      )}
    </div>
  )
}