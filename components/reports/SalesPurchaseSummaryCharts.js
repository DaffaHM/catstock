'use client'

import { useState } from 'react'
import TouchButton from '@/components/ui/TouchButton'
import { 
  BarChart3Icon,
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  PieChartIcon,
  CalendarIcon,
  InfoIcon
} from 'lucide-react'

export default function SalesPurchaseSummaryCharts({ data, summary, filters, groupBy }) {
  const [activeChart, setActiveChart] = useState('overview')

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

  const formatPeriodDisplay = (period, groupBy) => {
    switch (groupBy) {
      case 'day':
        return new Date(period).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      case 'week':
        return `W${period.split('-W')[1]}`
      case 'month':
        const [year, month] = period.split('-')
        return new Date(year, month - 1).toLocaleDateString('en-US', { 
          month: 'short',
          year: '2-digit'
        })
      case 'year':
        return period
      default:
        return period
    }
  }

  // Simple bar chart component (using CSS for visualization)
  const SimpleBarChart = ({ data, title, valueKey, colorClass }) => {
    if (!data || data.length === 0) return null

    const maxValue = Math.max(...data.map(item => item[valueKey] || 0))
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3">
          {data.slice(0, 10).map((item, index) => {
            const value = item[valueKey] || 0
            const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0
            
            return (
              <div key={item.period} className="flex items-center space-x-3">
                <div className="w-16 text-xs text-gray-600 text-right">
                  {formatPeriodDisplay(item.period, groupBy)}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div 
                    className={`${colorClass} h-6 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2`}
                    style={{ width: `${Math.max(percentage, 2)}%` }}
                  >
                    {percentage > 20 && (
                      <span className="text-white text-xs font-medium">
                        {formatCurrency(value)}
                      </span>
                    )}
                  </div>
                  {percentage <= 20 && (
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-medium text-gray-700">
                      {formatCurrency(value)}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Key metrics cards
  const MetricsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Sales Metrics */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-green-900">Sales Performance</h3>
          <TrendingUpIcon className="h-6 w-6 text-green-600" />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-green-700">Total Sales:</span>
            <span className="text-xl font-bold text-green-600">
              {formatCurrency(summary?.totalSalesValue)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-green-700">Units Sold:</span>
            <span className="font-semibold text-green-600">
              {formatNumber(summary?.totalSalesQuantity)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-green-700">Avg. Transaction:</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(summary?.averageTransactionValue)}
            </span>
          </div>
        </div>
      </div>

      {/* Purchase Metrics */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-blue-900">Purchase Analysis</h3>
          <TrendingDownIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-blue-700">Total Purchases:</span>
            <span className="text-xl font-bold text-blue-600">
              {formatCurrency(summary?.totalPurchaseValue)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-blue-700">Units Purchased:</span>
            <span className="font-semibold text-blue-600">
              {formatNumber(summary?.totalPurchaseQuantity)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-blue-700">Net Profit:</span>
            <span className={`font-semibold ${
              (summary?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(summary?.netProfit)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  // Profit analysis
  const ProfitAnalysis = () => (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-purple-900">Profitability Analysis</h3>
        <DollarSignIcon className="h-6 w-6 text-purple-600" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {formatCurrency(summary?.totalGrossProfit)}
          </div>
          <div className="text-sm text-purple-700">Gross Profit</div>
          <div className="text-xs text-purple-600 mt-1">
            {(summary?.grossProfitMargin || 0).toFixed(1)}% margin
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {formatCurrency(summary?.netProfit)}
          </div>
          <div className="text-sm text-purple-700">Net Profit</div>
          <div className="text-xs text-purple-600 mt-1">
            {(summary?.netProfitMargin || 0).toFixed(1)}% margin
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {((summary?.totalSalesValue || 0) / (summary?.totalPurchaseValue || 1)).toFixed(2)}x
          </div>
          <div className="text-sm text-purple-700">Revenue Multiple</div>
          <div className="text-xs text-purple-600 mt-1">
            Sales vs Purchases
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Financial Analytics</h2>
            <p className="text-gray-600 mt-1">
              Visual insights and performance metrics
            </p>
          </div>
          
          {/* Chart Type Selector */}
          <div className="flex items-center space-x-2">
            <TouchButton
              variant={activeChart === 'overview' ? 'primary' : 'outline'}
              onClick={() => setActiveChart('overview')}
              size="sm"
              className="flex items-center"
            >
              <BarChart3Icon className="h-4 w-4 mr-2" />
              Overview
            </TouchButton>
            <TouchButton
              variant={activeChart === 'trends' ? 'primary' : 'outline'}
              onClick={() => setActiveChart('trends')}
              size="sm"
              className="flex items-center"
            >
              <TrendingUpIcon className="h-4 w-4 mr-2" />
              Trends
            </TouchButton>
          </div>
        </div>

        {/* Key Metrics */}
        <MetricsCards />

        {/* Profit Analysis */}
        <ProfitAnalysis />

        {/* Charts Section */}
        {activeChart === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SimpleBarChart
              data={data}
              title="Sales by Period"
              valueKey="salesValue"
              colorClass="bg-gradient-to-r from-green-500 to-emerald-500"
            />
            <SimpleBarChart
              data={data}
              title="Purchases by Period"
              valueKey="purchaseValue"
              colorClass="bg-gradient-to-r from-blue-500 to-indigo-500"
            />
          </div>
        )}

        {activeChart === 'trends' && (
          <div className="space-y-6">
            <SimpleBarChart
              data={data}
              title="Net Value Trend (Sales - Purchases)"
              valueKey="netValue"
              colorClass="bg-gradient-to-r from-purple-500 to-pink-500"
            />
            
            {/* Trend Analysis */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <InfoIcon className="h-5 w-5 mr-2 text-blue-500" />
                Trend Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Performance Insights</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>
                        Total sales of {formatCurrency(summary?.totalSalesValue)} across {data?.length || 0} periods
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>
                        Total purchases of {formatCurrency(summary?.totalPurchaseValue)} for inventory
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>
                        Net profit margin of {(summary?.netProfitMargin || 0).toFixed(1)}% indicates {
                          (summary?.netProfitMargin || 0) > 20 ? 'excellent' :
                          (summary?.netProfitMargin || 0) > 10 ? 'good' : 'needs improvement'
                        } profitability
                      </span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Recommendations</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {(summary?.grossProfitMargin || 0) < 30 && (
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Consider reviewing pricing strategy to improve gross margins</span>
                      </li>
                    )}
                    {(summary?.totalSalesQuantity || 0) > (summary?.totalPurchaseQuantity || 0) * 1.2 && (
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Strong sales velocity - consider increasing inventory levels</span>
                      </li>
                    )}
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Monitor seasonal trends to optimize purchasing timing</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Period Summary */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span>
                Analysis Period: {filters.startDate} to {filters.endDate} • 
                Grouped by {groupBy} • 
                {data?.length || 0} periods shown
              </span>
            </div>
            <div>
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}