'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SplitView from '@/components/layout/SplitView'
import SalesPurchaseSummaryFilters from './SalesPurchaseSummaryFilters'
import SalesPurchaseSummaryList from './SalesPurchaseSummaryList'
import SalesPurchaseSummaryCharts from './SalesPurchaseSummaryCharts'
import TouchButton from '@/components/ui/TouchButton'
import DatePicker from '@/components/ui/DatePicker'
import { 
  CalendarIcon,
  DownloadIcon, 
  RefreshCwIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  BarChart3Icon
} from 'lucide-react'
import { 
  getSalesPurchaseSummaryAction, 
  exportSalesPurchaseSummaryAction 
} from '@/lib/actions/reports'

export default function SalesPurchaseSummaryPage({ initialData, searchParams }) {
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  
  // State management
  const [reportData, setReportData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [filters, setFilters] = useState({
    startDate: searchParams?.startDate || getDefaultStartDate(),
    endDate: searchParams?.endDate || getDefaultEndDate(),
    category: searchParams?.category || '',
    brand: searchParams?.brand || '',
    supplierId: searchParams?.supplierId || '',
    groupBy: searchParams?.groupBy || 'month'
  })
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [viewMode, setViewMode] = useState('summary') // 'summary' or 'detailed'

  // Get default date range (last 12 months)
  function getDefaultStartDate() {
    const date = new Date()
    date.setMonth(date.getMonth() - 12)
    return date.toISOString().split('T')[0]
  }

  function getDefaultEndDate() {
    return new Date().toISOString().split('T')[0]
  }

  // Update URL when filters change
  const updateURL = useCallback((newFilters) => {
    const params = new URLSearchParams()
    
    if (newFilters.startDate) params.set('startDate', newFilters.startDate)
    if (newFilters.endDate) params.set('endDate', newFilters.endDate)
    if (newFilters.category) params.set('category', newFilters.category)
    if (newFilters.brand) params.set('brand', newFilters.brand)
    if (newFilters.supplierId) params.set('supplierId', newFilters.supplierId)
    if (newFilters.groupBy !== 'month') params.set('groupBy', newFilters.groupBy)
    
    const queryString = params.toString()
    const newURL = queryString ? `/reports/sales-purchase-summary?${queryString}` : '/reports/sales-purchase-summary'
    
    router.push(newURL, { scroll: false })
  }, [router])

  // Load report data with current filters
  const loadReportData = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const searchFilters = {
        ...filters,
        page,
        limit: 50
      }

      const result = await getSalesPurchaseSummaryAction(searchFilters)
      
      if (result.success) {
        setReportData(result.data)
        setLastRefresh(new Date())
      }
    } catch (error) {
      console.error('Failed to load sales purchase summary:', error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Handle filter changes
  const handleFilterChange = useCallback(async (newFilters) => {
    setFilters(newFilters)
    updateURL(newFilters)
    await loadReportData(1)
  }, [updateURL, loadReportData])

  // Handle pagination
  const handlePageChange = useCallback(async (page) => {
    await loadReportData(page)
  }, [loadReportData])

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await loadReportData(reportData.pagination?.page || 1)
  }, [loadReportData, reportData.pagination?.page])

  // Handle CSV export
  const handleExport = useCallback(async () => {
    setExporting(true)
    try {
      const result = await exportSalesPurchaseSummaryAction(filters)
      
      if (result.success) {
        // Create and download CSV file
        const blob = new Blob([result.csvData], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `sales-purchase-summary-${filters.startDate}-to-${filters.endDate}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to export sales purchase summary:', error)
    } finally {
      setExporting(false)
    }
  }, [filters])

  // Auto-refresh every 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh()
    }, 10 * 60 * 1000) // 10 minutes

    return () => clearInterval(interval)
  }, [handleRefresh])

  // Master content - Summary data and filters
  const masterContent = (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales & Purchase Summary</h1>
            <p className="text-gray-600 mt-1">
              Financial performance analysis • Last updated: {lastRefresh.toLocaleTimeString()}
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

        {/* Key Metrics Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center">
              <TrendingUpIcon className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-900">Total Sales</p>
                <p className="text-xl font-bold text-green-600">
                  ${reportData.summary?.totalSalesValue?.toLocaleString('en-US', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  }) || '0.00'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center">
              <TrendingDownIcon className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-900">Total Purchases</p>
                <p className="text-xl font-bold text-blue-600">
                  ${reportData.summary?.totalPurchaseValue?.toLocaleString('en-US', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  }) || '0.00'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center">
              <DollarSignIcon className="h-6 w-6 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-purple-900">Gross Profit</p>
                <p className="text-xl font-bold text-purple-600">
                  ${reportData.summary?.totalGrossProfit?.toLocaleString('en-US', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  }) || '0.00'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center">
              <BarChart3Icon className="h-6 w-6 text-amber-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-amber-900">Profit Margin</p>
                <p className="text-xl font-bold text-amber-600">
                  {reportData.summary?.grossProfitMargin?.toFixed(1) || '0.0'}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
          </div>
          <DatePicker
            value={filters.startDate}
            onChange={(date) => handleFilterChange({ ...filters, startDate: date })}
            placeholder="Start Date"
            className="w-40"
          />
          <span className="text-gray-500">to</span>
          <DatePicker
            value={filters.endDate}
            onChange={(date) => handleFilterChange({ ...filters, endDate: date })}
            placeholder="End Date"
            className="w-40"
          />
        </div>

        {/* Filters */}
        <SalesPurchaseSummaryFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2 mt-4">
          <TouchButton
            variant={viewMode === 'summary' ? 'primary' : 'outline'}
            onClick={() => setViewMode('summary')}
            className="flex items-center"
          >
            <BarChart3Icon className="h-4 w-4 mr-2" />
            Summary View
          </TouchButton>
          <TouchButton
            variant={viewMode === 'detailed' ? 'primary' : 'outline'}
            onClick={() => setViewMode('detailed')}
            className="flex items-center"
          >
            <TrendingUpIcon className="h-4 w-4 mr-2" />
            Detailed View
          </TouchButton>
        </div>
      </div>

      {/* Report Content */}
      <div className="flex-1 overflow-y-auto">
        <SalesPurchaseSummaryList
          data={reportData.summaryData || []}
          loading={loading}
          pagination={reportData.pagination}
          onPageChange={handlePageChange}
          viewMode={viewMode}
          groupBy={filters.groupBy}
        />
      </div>
    </div>
  )

  // Detail content - Charts and insights
  const detailContent = (
    <div className="h-full bg-white">
      <SalesPurchaseSummaryCharts
        data={reportData.summaryData || []}
        summary={reportData.summary}
        filters={filters}
        groupBy={filters.groupBy}
      />
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