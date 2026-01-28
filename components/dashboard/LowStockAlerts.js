'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TouchButton from '@/components/ui/TouchButton'
import { 
  AlertTriangleIcon, 
  AlertCircleIcon, 
  ArrowRightIcon,
  PackageIcon,
  PlusIcon
} from 'lucide-react'

export default function LowStockAlerts({ alerts }) {
  const router = useRouter()
  const [showAll, setShowAll] = useState(false)

  const displayAlerts = showAll ? alerts : alerts.slice(0, 5)
  const hasMoreAlerts = alerts.length > 5

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'critical':
        return <AlertCircleIcon className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertTriangleIcon className="w-5 h-5 text-orange-500" />
      default:
        return <PackageIcon className="w-5 h-5 text-gray-400" />
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical':
        return 'border-l-red-500 bg-red-50'
      case 'warning':
        return 'border-l-orange-500 bg-orange-50'
      default:
        return 'border-l-gray-300 bg-gray-50'
    }
  }

  const handleStockIn = (productId) => {
    router.push(`/transactions/stock-in?product=${productId}`)
  }

  const handleViewProduct = (productId) => {
    router.push(`/products/${productId}`)
  }

  const handleViewAllReports = () => {
    router.push('/reports?filter=lowStock')
  }

  if (alerts.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <PackageIcon className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Stock Status
            </h3>
          </div>
        </div>
        <div className="card-body">
          <div className="text-center py-8">
            <div className="text-green-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              All Stock Levels Good
            </h4>
            <p className="text-gray-600">
              No products are currently below minimum stock levels
            </p>
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
            <AlertTriangleIcon className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Low Stock Alerts
            </h3>
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {alerts.length}
            </span>
          </div>
          
          <TouchButton
            onClick={handleViewAllReports}
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
          {displayAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border-l-4 p-4 rounded-r-lg ${getUrgencyColor(alert.urgency)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getUrgencyIcon(alert.urgency)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 truncate">
                        {alert.brand} {alert.name}
                      </h4>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {alert.sku}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">
                        Current: <span className="font-medium">{alert.currentStock} {alert.unit}</span>
                      </span>
                      <span className="text-gray-600">
                        Minimum: <span className="font-medium">{alert.minimumStock} {alert.unit}</span>
                      </span>
                      {alert.urgency === 'critical' && (
                        <span className="text-red-600 font-medium">
                          Out of Stock
                        </span>
                      )}
                      {alert.urgency === 'warning' && (
                        <span className="text-orange-600 font-medium">
                          Need {alert.deficit} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <TouchButton
                    onClick={() => handleViewProduct(alert.id)}
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                  >
                    View
                  </TouchButton>
                  <TouchButton
                    onClick={() => handleStockIn(alert.id)}
                    variant="primary"
                    size="sm"
                    className="flex items-center gap-1 text-xs"
                  >
                    <PlusIcon className="w-3 h-3" />
                    Stock In
                  </TouchButton>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {hasMoreAlerts && !showAll && (
          <div className="mt-4 text-center">
            <TouchButton
              onClick={() => setShowAll(true)}
              variant="ghost"
              size="sm"
              className="text-sm"
            >
              Show {alerts.length - 5} more alerts
            </TouchButton>
          </div>
        )}
        
        {showAll && hasMoreAlerts && (
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