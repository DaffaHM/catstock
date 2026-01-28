'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TouchButton from '@/components/ui/TouchButton'
import { 
  ActivityIcon, 
  ArrowDownIcon, 
  ArrowUpIcon, 
  SettingsIcon,
  RotateCcwIcon,
  ArrowRightIcon,
  ClockIcon,
  PackageIcon
} from 'lucide-react'

export default function RecentActivity({ activities }) {
  const router = useRouter()
  const [showAll, setShowAll] = useState(false)

  const displayActivities = showAll ? activities : activities.slice(0, 5)
  const hasMoreActivities = activities.length > 5

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'IN':
        return <ArrowDownIcon className="w-4 h-4 text-green-600" />
      case 'OUT':
        return <ArrowUpIcon className="w-4 h-4 text-blue-600" />
      case 'ADJUST':
        return <SettingsIcon className="w-4 h-4 text-orange-600" />
      case 'RETURN_IN':
      case 'RETURN_OUT':
        return <RotateCcwIcon className="w-4 h-4 text-purple-600" />
      default:
        return <PackageIcon className="w-4 h-4 text-gray-600" />
    }
  }

  const getTransactionColor = (type) => {
    switch (type) {
      case 'IN':
        return 'bg-green-50 border-green-200'
      case 'OUT':
        return 'bg-blue-50 border-blue-200'
      case 'ADJUST':
        return 'bg-orange-50 border-orange-200'
      case 'RETURN_IN':
      case 'RETURN_OUT':
        return 'bg-purple-50 border-purple-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const formatDate = (date) => {
    const now = new Date()
    const activityDate = new Date(date)
    const diffInHours = Math.floor((now - activityDate) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - activityDate) / (1000 * 60))
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      return activityDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const handleViewTransaction = (transactionId) => {
    router.push(`/transactions/${transactionId}`)
  }

  const handleViewAllTransactions = () => {
    router.push('/transactions')
  }

  if (activities.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <ActivityIcon className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h3>
          </div>
        </div>
        <div className="card-body">
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <ActivityIcon className="w-16 h-16 mx-auto" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              No Recent Activity
            </h4>
            <p className="text-gray-600 mb-4">
              No transactions have been recorded yet
            </p>
            <TouchButton
              onClick={() => router.push('/transactions/stock-in')}
              variant="primary"
              size="sm"
            >
              Create First Transaction
            </TouchButton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ActivityIcon className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h3>
          </div>
          
          <TouchButton
            onClick={handleViewAllTransactions}
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
          >
            View All
            <ArrowRightIcon className="w-4 h-4" />
          </TouchButton>
        </div>
      </div>
      
      <div className="card-body">
        <div className="space-y-3">
          {displayActivities.map((activity) => (
            <div
              key={activity.id}
              className={`border rounded-lg p-4 ${getTransactionColor(activity.type)} hover:shadow-sm transition-shadow cursor-pointer`}
              onClick={() => handleViewTransaction(activity.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getTransactionIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {activity.referenceNumber}
                      </span>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                        {activity.type}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <ClockIcon className="w-3 h-3" />
                      {formatDate(activity.createdAt)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2">
                    {activity.description}
                  </p>
                  
                  {activity.supplier && (
                    <p className="text-xs text-gray-600 mb-2">
                      Supplier: {activity.supplier}
                    </p>
                  )}
                  
                  {activity.displayItems.length > 0 && (
                    <div className="space-y-1">
                      {activity.displayItems.map((item, index) => (
                        <div key={index} className="text-xs text-gray-600 flex items-center gap-2">
                          <PackageIcon className="w-3 h-3" />
                          <span>
                            {item.quantity}x {item.product.brand} {item.product.name}
                          </span>
                        </div>
                      ))}
                      
                      {activity.hasMoreItems && (
                        <div className="text-xs text-gray-500 italic">
                          +{activity.itemCount - 2} more items
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {hasMoreActivities && !showAll && (
          <div className="mt-4 text-center">
            <TouchButton
              onClick={() => setShowAll(true)}
              variant="ghost"
              size="sm"
              className="text-sm"
            >
              Show {activities.length - 5} more activities
            </TouchButton>
          </div>
        )}
        
        {showAll && hasMoreActivities && (
          <div className="mt-4 text-center">
            <TouchButton
              onClick={() => setShowAll(false)}
              variant="ghost"
              size="sm"
              className="text-sm"
            >
              Show less
            </TouchButton>
          </div>
        )}
      </div>
    </div>
  )
}