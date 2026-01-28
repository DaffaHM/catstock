'use client'

import { useState, useEffect } from 'react'
import { getDemoProfitData } from '@/lib/utils/demo-dashboard'
import ProfitSummaryCards from './ProfitSummaryCards'
import ProfitProductTable from './ProfitProductTable'
import ProfitCategoryChart from './ProfitCategoryChart'
import ProfitTrendChart from './ProfitTrendChart'
import { TrendingUpIcon, DollarSignIcon, BarChart3Icon, PieChartIcon } from 'lucide-react'

export default function ProfitAnalysisPage() {
  const [activeTab, setActiveTab] = useState('products')
  const [profitData, setProfitData] = useState(null)
  const [categoryData, setCategoryData] = useState(null)
  const [trendData, setTrendData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    sortBy: 'profitAmount',
    sortOrder: 'desc'
  })

  // Force use localStorage data - no server actions
  const loadProfitData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('[Profit Analysis] FORCED localStorage data loading')
      
      // Always use localStorage data - no demo mode check needed
      const demoProfitData = getDemoProfitData()
      console.log('[Profit Analysis] Raw profit data:', demoProfitData)
      
      if (!demoProfitData || !demoProfitData.profitByProduct) {
        console.error('[Profit Analysis] No profit data available')
        setError('Tidak ada data keuntungan tersedia')
        setLoading(false)
        return
      }
      
      // Apply filters to demo data
      let filteredProducts = [...demoProfitData.profitByProduct]
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredProducts = filteredProducts.filter(item =>
          item.name.toLowerCase().includes(searchLower) ||
          item.brand.toLowerCase().includes(searchLower) ||
          item.sku.toLowerCase().includes(searchLower)
        )
      }
      
      if (filters.category) {
        filteredProducts = filteredProducts.filter(item => item.category === filters.category)
      }
      
      // Sort data
      filteredProducts.sort((a, b) => {
        const aVal = a[filters.sortBy] || 0
        const bVal = b[filters.sortBy] || 0
        if (filters.sortOrder === 'desc') {
          return bVal - aVal
        }
        return aVal - bVal
      })
      
      // Calculate summary
      const summary = {
        totalProducts: filteredProducts.length,
        totalProfitAmount: filteredProducts.reduce((sum, item) => sum + (item.totalProfit || 0), 0),
        averageProfitPercentage: filteredProducts.length > 0 ? 
          filteredProducts.reduce((sum, item) => sum + (item.profitPercentage || 0), 0) / filteredProducts.length : 0,
        totalItemsSold: filteredProducts.reduce((sum, item) => sum + (item.totalSold || 0), 0),
        highestProfitProduct: filteredProducts.length > 0 ? 
          filteredProducts.reduce((max, item) => 
            (item.profitPercentage || 0) > (max.profitPercentage || 0) ? item : max, filteredProducts[0]
          ) : null,
        lowestProfitProduct: filteredProducts.length > 0 ? 
          filteredProducts.reduce((min, item) => 
            (item.profitPercentage || 0) < (min.profitPercentage || 0) ? item : min, filteredProducts[0]
          ) : null
      }
      
      console.log('[Profit Analysis] Processed data:', { 
        products: filteredProducts.length, 
        summary,
        totalProfit: summary.totalProfitAmount 
      })
      
      setProfitData({
        success: true,
        products: filteredProducts,
        summary
      })
      
      // Set category data
      setCategoryData({
        success: true,
        categories: demoProfitData.profitByCategory || []
      })
      
      // Set trend data
      setTrendData({
        success: true,
        monthlyData: demoProfitData.monthlyProfit || []
      })
      
    } catch (err) {
      console.error('Error loading profit data:', err)
      setError('Terjadi kesalahan saat memuat data keuntungan: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('[Profit Analysis] Component mounted, loading data')
    loadProfitData()
    
    // Listen for data changes
    const handleDataUpdate = () => {
      console.log('[Profit Analysis] Data updated, refreshing')
      loadProfitData()
    }

    window.addEventListener('transactionsUpdated', handleDataUpdate)
    window.addEventListener('productsUpdated', handleDataUpdate)
    
    return () => {
      window.removeEventListener('transactionsUpdated', handleDataUpdate)
      window.removeEventListener('productsUpdated', handleDataUpdate)
    }
  }, [])

  useEffect(() => {
    console.log('[Profit Analysis] Filters changed, reloading data')
    loadProfitData()
  }, [filters])

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const tabs = [
    { id: 'products', name: 'Produk', icon: DollarSignIcon },
    { id: 'categories', name: 'Kategori', icon: PieChartIcon },
    { id: 'trends', name: 'Tren', icon: TrendingUpIcon },
    { id: 'summary', name: 'Ringkasan', icon: BarChart3Icon }
  ]

  if (loading && !profitData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat analisis keuntungan dari localStorage...</p>
        </div>
      </div>
    )
  }

  if (error && !profitData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <TrendingUpIcon className="h-5 w-5 text-red-500 mr-3" />
          <div>
            <h3 className="text-red-800 font-medium">Gagal Memuat Data Keuntungan</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={loadProfitData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* LocalStorage Data Indicator */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <TrendingUpIcon className="h-5 w-5 text-green-500 mr-3" />
          <div>
            <h3 className="text-green-800 font-medium">Data Tersinkronisasi dari localStorage</h3>
            <p className="text-green-600 text-sm mt-1">
              Data keuntungan dihitung real-time dari transaksi dan produk yang tersimpan di localStorage
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {profitData?.summary && (
        <ProfitSummaryCards summary={profitData.summary} />
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'products' && (
          <ProfitProductTable
            data={profitData}
            filters={filters}
            onFilterChange={handleFilterChange}
            loading={loading}
          />
        )}

        {activeTab === 'categories' && (
          <ProfitCategoryChart
            data={categoryData}
            loading={!categoryData}
          />
        )}

        {activeTab === 'trends' && (
          <ProfitTrendChart
            data={trendData}
            loading={!trendData}
          />
        )}

        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProfitCategoryChart
              data={categoryData}
              loading={!categoryData}
            />
            <ProfitTrendChart
              data={trendData}
              loading={!trendData}
            />
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs">
        <p><strong>Debug:</strong> Products: {profitData?.products?.length || 0}, Total Profit: {profitData?.summary?.totalProfitAmount || 0}</p>
      </div>
    </div>
  )
}