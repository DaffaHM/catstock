'use client'

import { useState, useEffect } from 'react'
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from 'lucide-react'

export default function PriceTrendAnalysis({ productId, days = 30 }) {
  const [trends, setTrends] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (productId) {
      loadTrends()
    }
  }, [productId, days])

  const loadTrends = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/price-history/${productId}?type=trends&days=${days}`)
      const data = await response.json()

      if (data.success) {
        setTrends(data.trends)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to load price trends')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="text-red-600 text-center">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!trends) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="text-gray-500 text-center">
          <p>No trend data available</p>
        </div>
      </div>
    )
  }

  const getTrendIcon = (change) => {
    if (change > 0) return <TrendingUpIcon className="h-5 w-5 text-green-600" />
    if (change < 0) return <TrendingDownIcon className="h-5 w-5 text-red-600" />
    return <MinusIcon className="h-5 w-5 text-gray-400" />
  }

  const getTrendColor = (change) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Price Trends ({days} days)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Purchase Price Trend */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-700">Purchase Price</h4>
            {getTrendIcon(trends.purchasePriceChange)}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Current:</span>
              <span className="font-medium">{formatCurrency(trends.currentPurchasePrice)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Change:</span>
              <span className={`font-medium ${getTrendColor(trends.purchasePriceChange)}`}>
                {trends.purchasePriceChange >= 0 ? '+' : ''}{formatCurrency(trends.purchasePriceChange)}
                {' '}({trends.purchasePriceChangePercent >= 0 ? '+' : ''}{trends.purchasePriceChangePercent}%)
              </span>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                trends.purchasePriceChangePercent >= 0 ? 'bg-green-600' : 'bg-red-600'
              }`}
              style={{ 
                width: `${Math.min(Math.abs(trends.purchasePriceChangePercent), 100)}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Selling Price Trend */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-700">Selling Price</h4>
            {getTrendIcon(trends.sellingPriceChange)}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Current:</span>
              <span className="font-medium">{formatCurrency(trends.currentSellingPrice)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Change:</span>
              <span className={`font-medium ${getTrendColor(trends.sellingPriceChange)}`}>
                {trends.sellingPriceChange >= 0 ? '+' : ''}{formatCurrency(trends.sellingPriceChange)}
                {' '}({trends.sellingPriceChangePercent >= 0 ? '+' : ''}{trends.sellingPriceChangePercent}%)
              </span>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                trends.sellingPriceChangePercent >= 0 ? 'bg-green-600' : 'bg-red-600'
              }`}
              style={{ 
                width: `${Math.min(Math.abs(trends.sellingPriceChangePercent), 100)}%` 
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Profit Margin Analysis */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Profit Margin</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Current Margin:</span>
            <span className="ml-2 font-medium">
              {formatCurrency(trends.currentSellingPrice - trends.currentPurchasePrice)}
            </span>
          </div>
          <div>
            <span className="text-blue-700">Margin %:</span>
            <span className="ml-2 font-medium">
              {trends.currentPurchasePrice > 0 
                ? ((trends.currentSellingPrice - trends.currentPurchasePrice) / trends.currentPurchasePrice * 100).toFixed(1)
                : 0
              }%
            </span>
          </div>
        </div>
      </div>

      {/* Price History Summary */}
      {trends.priceHistory && trends.priceHistory.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-700 mb-3">Recent Price Changes</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {trends.priceHistory.slice(-5).reverse().map((history, index) => (
              <div key={index} className="flex justify-between items-center text-sm py-1 border-b border-gray-100 last:border-b-0">
                <span className="text-gray-600">
                  {new Date(history.effectiveDate).toLocaleDateString()}
                </span>
                <div className="text-right">
                  <div>{formatCurrency(history.sellingPrice)}</div>
                  <div className="text-xs text-gray-500">
                    Cost: {formatCurrency(history.purchasePrice)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}