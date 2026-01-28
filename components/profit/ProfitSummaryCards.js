'use client'

import { DollarSignIcon, TrendingUpIcon, PackageIcon, ShoppingCartIcon } from 'lucide-react'

export default function ProfitSummaryCards({ summary }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (percentage) => {
    return `${percentage.toFixed(1)}%`
  }

  const cards = [
    {
      title: 'Total Keuntungan',
      value: formatCurrency(summary.totalProfitAmount),
      icon: DollarSignIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Rata-rata Margin',
      value: formatPercentage(summary.averageProfitPercentage),
      icon: TrendingUpIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Total Produk',
      value: summary.totalProducts.toString(),
      icon: PackageIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Total Terjual',
      value: summary.totalItemsSold.toString(),
      icon: ShoppingCartIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div
            key={index}
            className={`${card.bgColor} ${card.borderColor} border rounded-lg p-6`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className={`text-2xl font-bold ${card.color} mt-2`}>
                  {card.value}
                </p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-full`}>
                <Icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </div>
        )
      })}
      
      {/* Best and Worst Performers */}
      <div className="md:col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Highest Profit Product */}
        {summary.highestProfitProduct && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-800">🏆 Produk Teruntung</h3>
              <span className="text-2xl">📈</span>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-green-900">
                {summary.highestProfitProduct.name}
              </p>
              <p className="text-sm text-green-700">
                SKU: {summary.highestProfitProduct.sku}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-600">Margin:</span>
                <span className="font-bold text-green-800">
                  {formatPercentage(summary.highestProfitProduct.profitPercentage)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-600">Keuntungan per unit:</span>
                <span className="font-bold text-green-800">
                  {formatCurrency(summary.highestProfitProduct.profitAmount)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Lowest Profit Product */}
        {summary.lowestProfitProduct && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-yellow-800">⚠️ Perlu Perhatian</h3>
              <span className="text-2xl">📉</span>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-yellow-900">
                {summary.lowestProfitProduct.name}
              </p>
              <p className="text-sm text-yellow-700">
                SKU: {summary.lowestProfitProduct.sku}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-yellow-600">Margin:</span>
                <span className="font-bold text-yellow-800">
                  {formatPercentage(summary.lowestProfitProduct.profitPercentage)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-yellow-600">Keuntungan per unit:</span>
                <span className="font-bold text-yellow-800">
                  {formatCurrency(summary.lowestProfitProduct.profitAmount)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}