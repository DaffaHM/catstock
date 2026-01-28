'use client'

import { PackageIcon, AlertTriangleIcon, TrendingUpIcon, DollarSignIcon } from 'lucide-react'

export default function DashboardStats({ stats }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: PackageIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Products in catalog'
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockCount,
      icon: AlertTriangleIcon,
      color: stats.lowStockCount > 0 ? 'text-red-600' : 'text-green-600',
      bgColor: stats.lowStockCount > 0 ? 'bg-red-50' : 'bg-green-50',
      description: 'Need attention',
      urgent: stats.lowStockCount > 0
    },
    {
      title: "Today's Transactions",
      value: stats.todayTransactions,
      icon: TrendingUpIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Transactions today'
    },
    {
      title: 'Total Stock Value',
      value: formatCurrency(stats.totalStockValue),
      icon: DollarSignIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Current inventory value',
      isMonetary: true
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        
        return (
          <div key={index} className="card hover:shadow-md transition-shadow duration-200">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                {stat.urgent && (
                  <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
                    <AlertTriangleIcon className="w-4 h-4" />
                    <span>Alert</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  {stat.title}
                </h3>
                <p className={`text-3xl font-bold ${stat.color} ${stat.isMonetary ? 'text-2xl' : ''}`}>
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500">
                  {stat.description}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}