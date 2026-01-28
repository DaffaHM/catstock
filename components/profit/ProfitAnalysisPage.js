'use client'

import { useState, useEffect } from 'react'
import { getProfitAnalysisAction, getProfitByCategoryAction, getMonthlyProfitTrendAction } from '@/lib/actions/profit-analysis'
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

  // Load profit analysis data
  const loadProfitData = async () => {
    try {
      setLoading(true)
      const result = await getProfitAnalysisAction(filters)
      
      if (result.success) {
        setProfitData(result)
        setError(null)
      } else {
        setError(result.error)
      }
    } catch (err) {
      console.error('Error loading profit data:', err)
      setError('Terjadi kesalahan saat memuat data keuntungan')
    } finally {
      setLoading(false)
    }
  }

  // Load category data
  const loadCategoryData = async () => {
    try {
      const result = await getProfitByCategoryAction()
      if (result.success) {
        setCategoryData(result)
      }
    } catch (err) {
      console.error('Error loading category data:', err)
    }
  }

  // Load trend data
  const loadTrendData = async () => {
    try {
      const result = await getMonthlyProfitTrendAction(6)
      if (result.success) {
        setTrendData(result)
      }
    } catch (err) {
      console.error('Error loading trend data:', err)
    }
  }

  useEffect(() => {
    loadProfitData()
    loadCategoryData()
    loadTrendData()
  }, [])

  useEffect(() => {
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
          <p className="text-gray-600">Memuat analisis keuntungan...</p>
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
    </div>
  )
}