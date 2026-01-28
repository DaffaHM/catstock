'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SplitView from '@/components/layout/SplitView'
import StockReportList from './StockReportList'
import StockReportFilters from './StockReportFilters'
import StockReportSummary from './StockReportSummary'
import TouchButton from '@/components/ui/TouchButton'
import { 
  SearchIcon, 
  DownloadIcon, 
  RefreshCwIcon,
  AlertTriangleIcon,
  PackageIcon,
  TrendingUpIcon
} from 'lucide-react'
import { getStockReportAction, exportStockReportAction } from '@/lib/actions/reports'

export default function CurrentStockReportPage({ initialData, searchParams }) {
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  
  // State management
  const [reportData, setReportData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams?.search || '')
  const [filters, setFilters] = useState({
    category: searchParams?.category || '',
    brand: searchParams?.brand || '',
    lowStockOnly: searchParams?.lowStock === 'true',
    sortBy: searchParams?.sortBy || 'name',
    sortOrder: searchParams?.sortOrder || 'asc'
  })
  const [lastRefresh, setLastRefresh] = useState(new Date())

  // Update URL when filters change
  const updateURL = useCallback((newFilters, newSearch) => {
    const params = new URLSearchParams()
    
    if (newSearch) params.set('search', newSearch)
    if (newFilters.category) params.set('category', newFilters.category)
    if (newFilters.brand) params.set('brand', newFilters.brand)
    if (newFilters.lowStockOnly) params.set('lowStock', 'true')
    if (newFilters.sortBy !== 'name') params.set('sortBy', newFilters.sortBy)
    if (newFilters.sortOrder !== 'asc') params.set('sortOrder', newFilters.sortOrder)
    
    const queryString = params.toString()
    const newURL = queryString ? `/reports?${queryString}` : '/reports'
    
    router.push(newURL, { scroll: false })
  }, [router])

  // Load report data with current filters
  const loadReportData = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const searchFilters = {
        search: searchQuery,
        ...filters,
        page,
        limit: 50
      }

      const result = await getStockReportAction(searchFilters)
      
      if (result.success) {
        setReportData(result.data)
        setLastRefresh(new Date())
      }
    } catch (error) {
      console.error('Failed to load stock report:', error)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, filters])

  // Handle search
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query)
    updateURL(filters, query)
    await loadReportData(1)
  }, [filters, updateURL, loadReportData])

  // Handle filter changes
  const handleFilterChange = useCallback(async (newFilters) => {
    setFilters(newFilters)
    updateURL(newFilters, searchQuery)
    await loadReportData(1)
  }, [searchQuery, updateURL, loadReportData])

  // Handle pagination
  const handlePageChange = useCallback(async (page) => {
    await loadReportData(page)
  }, [loadReportData])

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await loadReportData(reportData.pagination.page)
  }, [loadReportData, reportData.pagination.page])

  // Handle CSV export
  const handleExport = useCallback(async () => {
    setExporting(true)
    try {
      const exportFilters = {
        search: searchQuery,
        ...filters
      }

      const result = await exportStockReportAction(exportFilters)
      
      if (result.success) {
        // Create and download CSV file
        const blob = new Blob([result.csvData], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `stock-report-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to export stock report:', error)
    } finally {
      setExporting(false)
    }
  }, [searchQuery, filters])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [handleRefresh])

  // Master content - Report list with filters and summary
  const masterContent = (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Current Stock Report</h1>
            <p className="text-gray-600 mt-1">
              Real-time inventory levels • Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <TouchButton
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center"
            >
              <RefreshCwIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </TouchButton>
            
            <TouchButton
              variant="secondary"
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center"
            >
              <DownloadIcon className="h-5 w-5 mr-2" />
              {exporting ? 'Exporting...' : 'Export CSV'}
            </TouchButton>
          </div>
        </div>

        {/* Summary Cards */}
        <StockReportSummary summary={reportData.summary} />

        {/* Search Bar */}
        <div className="relative mb-4 mt-4">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name, brand, SKU, or category..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full h-12 pl-10 pr-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation"
          />
        </div>

        {/* Filters */}
        <StockReportFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Stock Report List */}
      <div className="flex-1 overflow-y-auto">
        <StockReportList
          products={reportData.products}
          loading={loading}
          pagination={reportData.pagination}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )

  // Detail content - Summary and insights
  const detailContent = (
    <div className="h-full bg-white p-6">
      <div className="max-w-2xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Stock Report Insights</h2>
        
        {/* Key Metrics */}
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center">
              <PackageIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h3 className="font-semibold text-blue-900">Total Products</h3>
                <p className="text-2xl font-bold text-blue-600">{reportData.summary.totalProducts}</p>
                <p className="text-sm text-blue-700">
                  {reportData.summary.inStockCount} in stock • {reportData.summary.outOfStockCount} out of stock
                </p>
              </div>
            </div>
          </div>

          {reportData.summary.lowStockCount > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
              <div className="flex items-center">
                <AlertTriangleIcon className="h-8 w-8 text-amber-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-amber-900">Low Stock Alert</h3>
                  <p className="text-2xl font-bold text-amber-600">{reportData.summary.lowStockCount}</p>
                  <p className="text-sm text-amber-700">
                    Products below minimum stock level
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center">
              <TrendingUpIcon className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h3 className="font-semibold text-green-900">Total Stock Value</h3>
                <p className="text-2xl font-bold text-green-600">
                  ${reportData.summary.totalStockValue.toLocaleString('en-US', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </p>
                <p className="text-sm text-green-700">
                  {reportData.summary.totalStockQuantity.toLocaleString()} total units
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <TouchButton
              variant="outline"
              onClick={() => handleFilterChange({ ...filters, lowStockOnly: true })}
              className="w-full justify-start"
            >
              <AlertTriangleIcon className="h-5 w-5 mr-3 text-amber-500" />
              View Low Stock Items Only
            </TouchButton>
            
            <TouchButton
              variant="outline"
              onClick={() => router.push('/transactions/stock-adjustment')}
              className="w-full justify-start"
            >
              <PackageIcon className="h-5 w-5 mr-3 text-blue-500" />
              Perform Stock Adjustment
            </TouchButton>
            
            <TouchButton
              variant="outline"
              onClick={() => router.push('/transactions/stock-in')}
              className="w-full justify-start"
            >
              <TrendingUpIcon className="h-5 w-5 mr-3 text-green-500" />
              Add Stock (Stock In)
            </TouchButton>
          </div>
        </div>

        {/* Report Navigation */}
        <div className="mt-8">
          <h3 className="font-semibold text-gray-900 mb-4">Other Reports</h3>
          <div className="space-y-3">
            <TouchButton
              variant="outline"
              onClick={() => router.push('/reports/sales-purchase-summary')}
              className="w-full justify-start"
            >
              <TrendingUpIcon className="h-5 w-5 mr-3 text-purple-500" />
              Sales & Purchase Summary
            </TouchButton>
          </div>
        </div>

        {/* Report Information */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">About This Report</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Shows real-time stock levels for all products</li>
            <li>• Highlights items below minimum stock levels</li>
            <li>• Updates automatically every 5 minutes</li>
            <li>• Supports filtering by category, brand, and stock status</li>
            <li>• Export functionality for external analysis</li>
          </ul>
        </div>
      </div>
    </div>
  )

  return (
    <SplitView
      masterContent={masterContent}
      detailContent={detailContent}
      masterWidth="60%"
      showDetail={true}
    />
  )
}