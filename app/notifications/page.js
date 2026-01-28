'use client'

import { useState, useEffect } from 'react'
import { 
  getNotifications,
  markAsRead,
  acknowledgeNotification
} from '@/lib/services/NotificationManager'
import SimpleNavLayout from '@/components/layout/SimpleNavLayout'
import TouchButton from '@/components/ui/TouchButton'
import { 
  BellIcon, 
  CheckIcon, 
  AlertTriangleIcon,
  InfoIcon,
  XIcon,
  FilterIcon
} from 'lucide-react'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, unread, low_stock, reorder
  const [error, setError] = useState(null)

  useEffect(() => {
    loadNotifications()
  }, [filter])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      setError(null)

      const options = {
        isRead: filter === 'unread' ? false : null,
        type: filter === 'low_stock' ? 'LOW_STOCK' : filter === 'reorder' ? 'REORDER_SUGGESTION' : null,
        limit: 50
      }

      const result = await getNotifications(options)
      
      if (result.success) {
        setNotifications(result.notifications)
      } else {
        setError(result.error || 'Failed to load notifications')
      }
    } catch (err) {
      console.error('Error loading notifications:', err)
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      const result = await markAsRead(notificationId)
      if (result.success) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, isRead: true }
              : n
          )
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const acknowledgeNotification = async (notificationId) => {
    try {
      const result = await acknowledgeNotification(notificationId)
      if (result.success) {
        setNotifications(prev => 
          prev.filter(n => n.id !== notificationId)
        )
      }
    } catch (error) {
      console.error('Error acknowledging notification:', error)
    }
  }

  const getNotificationIcon = (type, priority) => {
    if (type === 'LOW_STOCK') {
      return priority === 'CRITICAL' 
        ? <AlertTriangleIcon className="w-5 h-5 text-red-500" />
        : <AlertTriangleIcon className="w-5 h-5 text-orange-500" />
    }
    if (type === 'REORDER_SUGGESTION') {
      return <InfoIcon className="w-5 h-5 text-blue-500" />
    }
    return <BellIcon className="w-5 h-5 text-gray-500" />
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <SimpleNavLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="card">
                  <div className="card-body">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SimpleNavLayout>
    )
  }

  return (
    <SimpleNavLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">
              Manage your system notifications and alerts
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <TouchButton
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
            className="flex items-center gap-2"
          >
            <FilterIcon className="w-4 h-4" />
            All
          </TouchButton>
          <TouchButton
            onClick={() => setFilter('unread')}
            variant={filter === 'unread' ? 'primary' : 'outline'}
            size="sm"
          >
            Unread
          </TouchButton>
          <TouchButton
            onClick={() => setFilter('low_stock')}
            variant={filter === 'low_stock' ? 'primary' : 'outline'}
            size="sm"
          >
            Low Stock
          </TouchButton>
          <TouchButton
            onClick={() => setFilter('reorder')}
            variant={filter === 'reorder' ? 'primary' : 'outline'}
            size="sm"
          >
            Reorder Suggestions
          </TouchButton>
        </div>

        {/* Error State */}
        {error && (
          <div className="card border-red-200 bg-red-50">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <AlertTriangleIcon className="w-5 h-5 text-red-500" />
                <p className="text-red-700">{error}</p>
                <TouchButton
                  onClick={loadNotifications}
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                >
                  Retry
                </TouchButton>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-12">
              <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notifications
              </h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? "You're all caught up! No notifications to show."
                  : `No ${filter.replace('_', ' ')} notifications found.`
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`card transition-all duration-200 ${
                  notification.isRead 
                    ? 'bg-white border-gray-200' 
                    : 'bg-blue-50 border-blue-200 shadow-sm'
                }`}
              >
                <div className="card-body">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {notification.title}
                          </h3>
                          <p className="text-gray-700 mb-2">
                            {notification.message}
                          </p>
                          
                          {/* Product info for stock notifications */}
                          {notification.productName && (
                            <div className="text-sm text-gray-600 mb-2">
                              Product: <span className="font-medium">{notification.productName}</span>
                              {notification.currentStock !== undefined && (
                                <span className="ml-2">
                                  Current Stock: <span className="font-medium">{notification.currentStock}</span>
                                </span>
                              )}
                              {notification.minimumStock && (
                                <span className="ml-2">
                                  Minimum: <span className="font-medium">{notification.minimumStock}</span>
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>
                              {new Date(notification.createdAt).toLocaleString('id-ID')}
                            </span>
                            {!notification.isRead && (
                              <span className="text-blue-600 font-medium">New</span>
                            )}
                          </div>
                        </div>

                        {/* Priority Badge */}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-4">
                        {!notification.isRead && (
                          <TouchButton
                            onClick={() => markAsRead(notification.id)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <CheckIcon className="w-4 h-4" />
                            Mark as Read
                          </TouchButton>
                        )}
                        
                        {!notification.isAcknowledged && (
                          <TouchButton
                            onClick={() => acknowledgeNotification(notification.id)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <XIcon className="w-4 h-4" />
                            Dismiss
                          </TouchButton>
                        )}

                        {/* Quick action for stock notifications */}
                        {notification.type === 'LOW_STOCK' && notification.productId && (
                          <TouchButton
                            onClick={() => window.location.href = `/products/${notification.productId}`}
                            variant="primary"
                            size="sm"
                          >
                            View Product
                          </TouchButton>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SimpleNavLayout>
  )
}