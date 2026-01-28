'use client'

export default function RecentActivity({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</h2>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <p>Belum ada aktivitas</p>
          </div>
        </div>
      </div>
    )
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'stock_in': return '📥'
      case 'stock_out': return '📤'
      case 'adjustment': return '⚖️'
      case 'return_in': return '↩️'
      case 'return_out': return '↪️'
      default: return '📝'
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60))
      return `${diffMins} menit yang lalu`
    } else if (diffHours < 24) {
      return `${diffHours} jam yang lalu`
    } else {
      return date.toLocaleDateString('id-ID')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="text-xl">{getActivityIcon(activity.type)}</div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500">{formatTime(activity.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}