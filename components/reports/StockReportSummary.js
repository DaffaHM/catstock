'use client'

import { 
  PackageIcon, 
  AlertTriangleIcon, 
  TrendingUpIcon, 
  XCircleIcon 
} from 'lucide-react'

export default function StockReportSummary({ summary }) {
  const summaryCards = [
    {
      title: 'Total Products',
      value: summary.totalProducts.toLocaleString(),
      icon: PackageIcon,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900'
    },
    {
      title: 'In Stock',
      value: summary.inStockCount.toLocaleString(),
      icon: TrendingUpIcon,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      textColor: 'text-green-900'
    },
    {
      title: 'Low Stock',
      value: summary.lowStockCount.toLocaleString(),
      icon: AlertTriangleIcon,
      color: 'amber',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      textColor: 'text-amber-900',
      highlight: summary.lowStockCount > 0
    },
    {
      title: 'Out of Stock',
      value: summary.outOfStockCount.toLocaleString(),
      icon: XCircleIcon,
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      textColor: 'text-red-900',
      highlight: summary.outOfStockCount > 0
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {summaryCards.map((card) => {
        const Icon = card.icon
        
        return (
          <div 
            key={card.title}
            className={`${card.bgColor} rounded-lg p-4 border ${
              card.highlight ? `border-${card.color}-200 ring-2 ring-${card.color}-100` : `border-${card.color}-100`
            } transition-all duration-200`}
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${card.iconColor}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className={`text-sm font-medium ${card.textColor} truncate`}>
                  {card.title}
                </p>
                <p className={`text-xl font-bold ${card.iconColor}`}>
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        )
      })}
      
      {/* Stock Value Summary - Full Width */}
      <div className="col-span-2 lg:col-span-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUpIcon className="h-6 w-6 text-indigo-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-indigo-900">Total Stock Value</p>
              <p className="text-2xl font-bold text-indigo-600">
                ${summary.totalStockValue.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-indigo-700">Total Units</p>
            <p className="text-lg font-semibold text-indigo-600">
              {summary.totalStockQuantity.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}