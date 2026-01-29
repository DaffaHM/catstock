'use client'

import { useState, useEffect } from 'react'
import SimpleNavLayout from '@/components/layout/SimpleNavLayout'
import ReportsNavigation from '@/components/reports/ReportsNavigation'
import { 
  getDailyReportsData, 
  getWeeklyReportsData, 
  getMonthlyReportsData,
  getTopSellingProducts 
} from '@/lib/utils/demo-daily-reports'
import { formatRupiah } from '@/lib/utils/currency'
import TouchButton from '@/components/ui/TouchButton'
import { 
  CalendarIcon, 
  TrendingUpIcon,
  DollarSignIcon,
  ShoppingCartIcon,
  BarChart3Icon,
  RefreshCwIcon
} from 'lucide-react'

function DailyReportsContent({ isDemoMode }) {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('daily')
  const [dateRange, setDateRange] = useState(30)
  const [dailyData, setDailyData] = useState({ dailyData: [], summary: {} })
  const [weeklyData, setWeeklyData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    loadReportsData()
    setLoading(false)
    
    // Listen for data changes to update reports in real time
    const handleDataUpdate = () => {
      console.log('[Daily Reports] Data updated, refreshing reports...')
      loadReportsData()
    }

    // Listen for various data update events
    window.addEventListener('transactionsUpdated', handleDataUpdate)
    window.addEventListener('productsUpdated', handleDataUpdate)
    window.addEventListener('suppliersUpdated', handleDataUpdate)
    window.addEventListener('storage', handleDataUpdate)

    // Auto-refresh every 30 seconds to ensure real-time data
    const autoRefreshInterval = setInterval(() => {
      console.log('[Daily Reports] Auto-refreshing data...')
      loadReportsData()
    }, 30000) // 30 seconds

    return () => {
      window.removeEventListener('transactionsUpdated', handleDataUpdate)
      window.removeEventListener('productsUpdated', handleDataUpdate)
      window.removeEventListener('suppliersUpdated', handleDataUpdate)
      window.removeEventListener('storage', handleDataUpdate)
      clearInterval(autoRefreshInterval)
    }
  }, [])

  useEffect(() => {
    loadReportsData()
  }, [dateRange])

  const loadReportsData = () => {
    try {
      console.log('[Daily Reports] Loading reports data...')
      
      const daily = getDailyReportsData(dateRange)
      const weekly = getWeeklyReportsData()
      const monthly = getMonthlyReportsData()
      const topSelling = getTopSellingProducts(dateRange)

      setDailyData(daily)
      setWeeklyData(weekly)
      setMonthlyData(monthly)
      setTopProducts(topSelling)
      setLastUpdated(new Date())

      console.log('[Daily Reports] Data loaded:', {
        dailyRecords: daily.dailyData.length,
        weeklyRecords: weekly.length,
        monthlyRecords: monthly.length,
        topProducts: topSelling.length,
        timestamp: new Date().toLocaleTimeString('id-ID')
      })

    } catch (error) {
      console.error('Error loading reports data:', error)
    }
  }

  const handleRefresh = () => {
    loadReportsData()
  }

  const renderDailyTab = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Penjualan</p>
              <p className="text-2xl font-bold text-green-600">
                {formatRupiah(dailyData.summary.totalSales || 0)}
              </p>
            </div>
            <DollarSignIcon className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {dateRange} hari terakhir
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Keuntungan</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatRupiah(dailyData.summary.totalProfit || 0)}
              </p>
            </div>
            <TrendingUpIcon className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {dateRange} hari terakhir
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rata-rata Harian</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatRupiah(dailyData.summary.averageDailySales || 0)}
              </p>
            </div>
            <BarChart3Icon className="h-8 w-8 text-purple-500" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Penjualan per hari
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hari Terbaik</p>
              <p className="text-lg font-bold text-emerald-600">
                {dailyData.summary.bestDay ? 
                  formatRupiah(dailyData.summary.bestDay.sales) : 
                  'Belum ada data'
                }
              </p>
            </div>
            <TrendingUpIcon className="h-8 w-8 text-emerald-500" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {dailyData.summary.bestDay?.dayName || '-'}
          </p>
        </div>
      </div>

      {/* Daily Data Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Data Harian</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Penjualan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Keuntungan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Margin (%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaksi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Terjual
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dailyData.dailyData.map((day, index) => (
                <tr key={day.date} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {day.dayName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(day.date).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatRupiah(day.sales)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      day.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatRupiah(day.profit)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      day.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {day.profitMargin.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {day.transactionCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {day.itemsSold}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderWeeklyTab = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Data Mingguan</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Minggu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Penjualan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Keuntungan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Margin (%)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {weeklyData.map((week, index) => (
              <tr key={week.weekStart} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {week.weekLabel}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatRupiah(week.sales)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${
                    week.profit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatRupiah(week.profit)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${
                    week.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {week.profitMargin.toFixed(1)}%
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {week.transactionCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderMonthlyTab = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Data Bulanan</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bulan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Penjualan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Keuntungan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Margin (%)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {monthlyData.map((month, index) => (
              <tr key={month.month} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {month.month}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatRupiah(month.sales)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${
                    month.profit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatRupiah(month.profit)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${
                    month.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {month.profitMargin.toFixed(1)}%
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {month.transactionCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderTopProductsTab = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Produk Terlaris ({dateRange} hari terakhir)
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ranking
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produk
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Terjual
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pendapatan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Keuntungan
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {topProducts.map((product, index) => (
              <tr key={product.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {product.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.sku} • {product.category}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {product.quantitySold} unit
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatRupiah(product.totalRevenue)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${
                    product.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatRupiah(product.totalProfit)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Loading reports...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ReportsNavigation />
      
      <div className="bg-white rounded-lg shadow p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Laporan Harian {isDemoMode && <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">Demo</span>}
              </h1>
              <p className="text-gray-600">Analisis penjualan dan keuntungan per hari</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Real-time indicator */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Real-time</span>
                <span className="text-xs">
                  Update: {lastUpdated.toLocaleTimeString('id-ID')}
                </span>
              </div>
              
              {/* Date Range Filter */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={7}>7 hari</option>
                <option value={14}>14 hari</option>
                <option value={30}>30 hari</option>
                <option value={60}>60 hari</option>
                <option value={90}>90 hari</option>
              </select>
              
              <TouchButton
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCwIcon className="w-4 h-4" />
                Refresh
              </TouchButton>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'daily', label: 'Harian', icon: CalendarIcon },
                { id: 'weekly', label: 'Mingguan', icon: BarChart3Icon },
                { id: 'monthly', label: 'Bulanan', icon: TrendingUpIcon },
                { id: 'products', label: 'Produk Terlaris', icon: ShoppingCartIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'daily' && renderDailyTab()}
        {activeTab === 'weekly' && renderWeeklyTab()}
        {activeTab === 'monthly' && renderMonthlyTab()}
        {activeTab === 'products' && renderTopProductsTab()}
      </div>
    </div>
  )
}

export default function DailyReportsPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication by making a request to session-check API
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/session-check', {
          method: 'GET',
          credentials: 'include'
        })
        
        const data = await response.json()
        
        if (data.isAuthenticated) {
          setAuthenticated(true)
        } else {
          // Redirect to login if not authenticated
          window.location.href = '/quick-login'
        }
      } catch (error) {
        console.error('Auth check error:', error)
        // Redirect to login on error
        window.location.href = '/quick-login'
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Diperlukan Autentikasi</h2>
          <p className="text-gray-600 mb-6">Silakan masuk untuk mengakses laporan harian.</p>
          <a 
            href="/quick-login" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <SimpleNavLayout>
      <div className="container mx-auto px-4 py-8">
        <DailyReportsContent isDemoMode={true} />
      </div>
    </SimpleNavLayout>
  )
}