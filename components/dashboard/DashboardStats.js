'use client'

import { formatRupiah } from '@/lib/utils/currency'

export default function DashboardStats({ stats }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Produk',
      value: stats.totalProducts,
      icon: '📦',
      color: 'blue'
    },
    {
      title: 'Pemasok',
      value: stats.totalSuppliers,
      icon: '🏢',
      color: 'green'
    },
    {
      title: 'Transaksi',
      value: stats.totalTransactions,
      icon: '📊',
      color: 'purple'
    },
    {
      title: 'Nilai Total',
      value: formatRupiah(stats.totalValue),
      icon: '💰',
      color: 'yellow'
    },
    {
      title: 'Total Keuntungan',
      value: formatRupiah(stats.totalProfit || 0),
      icon: '💎',
      color: 'emerald'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {statCards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
            <div className="text-3xl">{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  )
}