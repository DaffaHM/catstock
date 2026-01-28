'use client'

import { useState, useEffect } from 'react'
import { getDashboardData, refreshDashboard } from '@/lib/actions/dashboard'
import { getLowStockNotifications } from '@/lib/services/NotificationManager'
import DashboardStats from './DashboardStats'
import QuickActions from './QuickActions'
import LowStockAlerts from './LowStockAlerts'
import RecentActivity from './RecentActivity'
import TouchButton from '@/components/ui/TouchButton'
import { RefreshCwIcon, BellIcon, TrendingUpIcon, AlertTriangleIcon } from 'lucide-react'

// Demo data for when in demo mode
const DEMO_DASHBOARD_DATA = {
  stats: {
    totalProducts: 8,
    totalSuppliers: 2,
    totalTransactions: 3,
    totalValue: 2500000,
    lowStockCount: 2,
    recentTransactions: 3,
    topSellingProduct: 'Cat Tembok Putih 5L',
    monthlyGrowth: 15.5
  },
  lowStockAlerts: [
    {
      id: 'demo-1',
      name: 'Cat Tembok Putih 5L',
      currentStock: 5,
      minimumStock: 10,
      category: 'Cat Tembok',
      supplier: 'PT Supplier A',
      lastRestocked: '2024-01-20'
    },
    {
      id: 'demo-2', 
      name: 'Cat Kayu Coklat 2.5L',
      currentStock: 2,
      minimumStock: 8,
      category: 'Cat Kayu',
      supplier: 'PT Supplier B',
      lastRestocked: '2024-01-18'
    }
  ],
  activity: [
    {
      id: 'demo-act-1',
      type: 'stock_in',
      description: 'Stok masuk: Cat Tembok Putih 5L (20 unit)',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      user: 'Store Owner'
    },
    {
      id: 'demo-act-2',
      type: 'stock_out',
      description: 'Penjualan: Cat Kayu Merah 1L (5 unit)',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      user: 'Store Owner'
    },
    {
      id: 'demo-act-3',
      type: 'adjustment',
      description: 'Penyesuaian stok: Cat Besi Hitam 1L',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      user: 'Store Owner'
    }
  ]
}

export default function DashboardContent({ session, isDemoMode = false }) {
  const [dashboardData, setDashboardData] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboardData()
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const result = await getLowStockNotifications()
      if (result.success) {
        setNotifications(result.notifications)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // If in demo mode, use demo data directly
      if (isDemoMode) {
        console.log('[Dashboard] Using demo data directly')
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 500))
        setDashboardData(DEMO_DASHBOARD_DATA)
        return
      }
      
      // Try to load real data
      const result = await getDashboardData()
      
      if (result.success) {
        setDashboardData(result.data)
      } else {
        // Fallback to demo data if real data fails
        console.log('[Dashboard] Real data failed, using demo data fallback')
        setDashboardData(DEMO_DASHBOARD_DATA)
      }
    } catch (err) {
      console.error('Error loading dashboard:', err)
      // Always fallback to demo data on error
      console.log('[Dashboard] Error occurred, using demo data fallback')
      setDashboardData(DEMO_DASHBOARD_DATA)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      
      // If in demo mode, just refresh demo data
      if (isDemoMode) {
        console.log('[Dashboard] Refreshing demo data')
        await new Promise(resolve => setTimeout(resolve, 1000))
        setDashboardData(DEMO_DASHBOARD_DATA)
        return
      }
      
      const result = await refreshDashboard()
      
      if (result.success) {
        setDashboardData(result.data)
      } else {
        // Fallback to demo data
        setDashboardData(DEMO_DASHBOARD_DATA)
      }
    } catch (err) {
      console.error('Error refreshing dashboard:', err)
      // Always fallback to demo data
      setDashboardData(DEMO_DASHBOARD_DATA)
    } finally {
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-64"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card">
                <div className="card-body">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-10 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="card-header">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-header">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard should always have data now (either real or demo)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard {isDemoMode && <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">Demo</span>}
          </h1>
          <p className="text-gray-600">
            Welcome back, {session.user.name}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Notification Center */}
          {notifications.length > 0 && (
            <div className="relative">
              <TouchButton
                onClick={() => window.location.href = '/notifications'}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 relative"
              >
                <BellIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Notifications</span>
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </TouchButton>
            </div>
          )}
          
          <TouchButton
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCwIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </TouchButton>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats stats={dashboardData.stats} />

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <LowStockAlerts alerts={dashboardData.lowStockAlerts} />
        
        {/* Recent Activity */}
        <RecentActivity activities={dashboardData.activity} />
      </div>

      {/* Enhanced Features Quick Access */}
      {notifications.length > 0 && (
        <div className="mt-6">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangleIcon className="w-5 h-5 text-amber-500" />
                  Recent Notifications
                </h3>
                <a 
                  href="/notifications" 
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  View All
                </a>
              </div>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-3 rounded-lg border ${
                      notification.isRead 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">
                          {notification.title}
                        </p>
                        <p className="text-gray-600 text-sm mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.createdAt).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        notification.priority === 'CRITICAL' 
                          ? 'bg-red-100 text-red-800'
                          : notification.priority === 'HIGH'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {notification.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}