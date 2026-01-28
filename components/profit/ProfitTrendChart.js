'use client'

export default function ProfitTrendChart({ data, loading }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatShortCurrency = (amount) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`
    }
    return amount.toString()
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tren Keuntungan Bulanan</h3>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!data || !data.monthlyData || data.monthlyData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tren Keuntungan Bulanan</h3>
        <div className="text-center py-8 text-gray-500">
          <p>Tidak ada data tren tersedia</p>
        </div>
      </div>
    )
  }

  const maxProfit = Math.max(...data.monthlyData.map(month => month.totalProfit))
  const minProfit = Math.min(...data.monthlyData.map(month => month.totalProfit))
  const avgProfit = data.monthlyData.reduce((sum, month) => sum + month.totalProfit, 0) / data.monthlyData.length

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">📈 Tren Keuntungan Bulanan</h3>
        <span className="text-sm text-gray-500">
          {data.monthlyData.length} bulan terakhir
        </span>
      </div>

      {/* Chart Area */}
      <div className="relative h-64 mb-6">
        <div className="absolute inset-0 flex items-end justify-between space-x-2">
          {data.monthlyData.map((month, index) => {
            const height = ((month.totalProfit - minProfit) / (maxProfit - minProfit)) * 100
            const isHighest = month.totalProfit === maxProfit
            const isLowest = month.totalProfit === minProfit
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="relative w-full group">
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                    <div className="font-medium">{month.month}</div>
                    <div>Keuntungan: {formatCurrency(month.totalProfit)}</div>
                    <div>Penjualan: {formatCurrency(month.totalSales)}</div>
                    <div>Margin: {month.profitMargin.toFixed(1)}%</div>
                  </div>
                  
                  {/* Bar */}
                  <div
                    className={`w-full rounded-t transition-all duration-500 ${
                      isHighest ? 'bg-green-500' : 
                      isLowest ? 'bg-red-400' : 
                      'bg-blue-500'
                    } hover:opacity-80`}
                    style={{ height: `${Math.max(height, 5)}%` }}
                  ></div>
                </div>
                
                {/* Month Label */}
                <div className="mt-2 text-xs text-gray-600 text-center">
                  {month.month.split(' ')[0].substring(0, 3)}
                </div>
                
                {/* Value Label */}
                <div className="text-xs font-medium text-gray-800">
                  {formatShortCurrency(month.totalProfit)}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-12">
          <span>{formatShortCurrency(maxProfit)}</span>
          <span>{formatShortCurrency(avgProfit)}</span>
          <span>{formatShortCurrency(minProfit)}</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">
            {formatCurrency(maxProfit)}
          </div>
          <div className="text-xs text-gray-500">Tertinggi</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">
            {formatCurrency(avgProfit)}
          </div>
          <div className="text-xs text-gray-500">Rata-rata</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-red-600">
            {formatCurrency(minProfit)}
          </div>
          <div className="text-xs text-gray-500">Terendah</div>
        </div>
      </div>

      {/* Growth Indicator */}
      {data.monthlyData.length >= 2 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {(() => {
            const current = data.monthlyData[data.monthlyData.length - 1].totalProfit
            const previous = data.monthlyData[data.monthlyData.length - 2].totalProfit
            const growth = ((current - previous) / previous) * 100
            const isPositive = growth > 0
            
            return (
              <div className="flex items-center justify-center space-x-2">
                <span className="text-sm text-gray-600">Pertumbuhan bulan ini:</span>
                <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? '↗️' : '↘️'} {Math.abs(growth).toFixed(1)}%
                </span>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}