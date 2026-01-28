'use client'

export default function ProfitCategoryChart({ data, loading }) {
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

  const getColorByIndex = (index) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-pink-500'
    ]
    return colors[index % colors.length]
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Keuntungan per Kategori</h3>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!data || !data.categories || data.categories.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Keuntungan per Kategori</h3>
        <div className="text-center py-8 text-gray-500">
          <p>Tidak ada data kategori tersedia</p>
        </div>
      </div>
    )
  }

  const maxProfit = Math.max(...data.categories.map(cat => cat.totalProfit))

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">📊 Keuntungan per Kategori</h3>
        <span className="text-sm text-gray-500">
          {data.categories.length} kategori
        </span>
      </div>

      <div className="space-y-4">
        {data.categories.map((category, index) => {
          const percentage = (category.totalProfit / maxProfit) * 100
          
          return (
            <div key={category.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded ${getColorByIndex(index)}`}></div>
                  <span className="font-medium text-gray-900">
                    {category.category}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    {formatCurrency(category.totalProfit)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {category.totalProducts} produk
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${getColorByIndex(index)} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>Rata-rata margin: {formatPercentage(category.averageProfitPercentage)}</span>
                <span>{category.totalSold} unit terjual</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {data.categories.reduce((sum, cat) => sum + cat.totalProducts, 0)}
            </div>
            <div className="text-xs text-gray-500">Total Produk</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.categories.reduce((sum, cat) => sum + cat.totalProfit, 0))}
            </div>
            <div className="text-xs text-gray-500">Total Keuntungan</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {data.categories.reduce((sum, cat) => sum + cat.totalSold, 0)}
            </div>
            <div className="text-xs text-gray-500">Total Terjual</div>
          </div>
        </div>
      </div>
    </div>
  )
}