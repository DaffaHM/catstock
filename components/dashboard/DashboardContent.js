'use client'

import { useState, useEffect } from 'react'
import { getDashboardData, refreshDashboard } from '@/lib/actions/dashboard'
import { getLowStockNotifications } from '@/lib/services/NotificationManager'
import { getDemoDashboardData } from '@/lib/utils/demo-dashboard'
import { resetDemoProducts } from '@/lib/utils/demo-products'
import { resetDemoSuppliers } from '@/lib/utils/demo-suppliers'
import { resetDemoTransactions } from '@/lib/utils/demo-transactions'
import DashboardStats from './DashboardStats'
import QuickActions from './QuickActions'
import LowStockAlerts from './LowStockAlerts'
import RecentActivity from './RecentActivity'
import TouchButton from '@/components/ui/TouchButton'
import { RefreshCwIcon, BellIcon, TrendingUpIcon, AlertTriangleIcon, TrashIcon } from 'lucide-react'

export default function DashboardContent({ session, isDemoMode = false }) {
  const [dashboardData, setDashboardData] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [resetting, setResetting] = useState(false)

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboardData()
    loadNotifications()
    
    // Listen for data changes in demo mode
    if (isDemoMode) {
      const handleDataUpdate = () => {
        console.log('[Dashboard] Data updated, refreshing dashboard')
        loadDashboardData()
      }

      // Listen for various data update events
      window.addEventListener('suppliersUpdated', handleDataUpdate)
      window.addEventListener('productsUpdated', handleDataUpdate)
      window.addEventListener('transactionsUpdated', handleDataUpdate)
      window.addEventListener('storage', handleDataUpdate)

      return () => {
        window.removeEventListener('suppliersUpdated', handleDataUpdate)
        window.removeEventListener('productsUpdated', handleDataUpdate)
        window.removeEventListener('transactionsUpdated', handleDataUpdate)
        window.removeEventListener('storage', handleDataUpdate)
      }
    }
  }, [isDemoMode])

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
      
      // If in demo mode, use real demo data from localStorage
      if (isDemoMode) {
        console.log('[Dashboard] Loading synchronized demo data')
        // Get real-time data from localStorage
        const demoData = getDemoDashboardData()
        setDashboardData(demoData)
        return
      }
      
      // Try to load real data
      const result = await getDashboardData()
      
      if (result.success) {
        setDashboardData(result.data)
      } else {
        // Fallback to demo data if real data fails
        console.log('[Dashboard] Real data failed, using demo data fallback')
        const demoData = getDemoDashboardData()
        setDashboardData(demoData)
      }
    } catch (err) {
      console.error('Error loading dashboard:', err)
      // Always fallback to demo data on error
      console.log('[Dashboard] Error occurred, using demo data fallback')
      const demoData = getDemoDashboardData()
      setDashboardData(demoData)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      
      // If in demo mode, refresh with real demo data
      if (isDemoMode) {
        console.log('[Dashboard] Refreshing synchronized demo data')
        const demoData = getDemoDashboardData()
        setDashboardData(demoData)
        return
      }
      
      const result = await refreshDashboard()
      
      if (result.success) {
        setDashboardData(result.data)
      } else {
        // Fallback to demo data
        const demoData = getDemoDashboardData()
        setDashboardData(demoData)
      }
    } catch (err) {
      console.error('Error refreshing dashboard:', err)
      // Always fallback to demo data
      const demoData = getDemoDashboardData()
      setDashboardData(demoData)
    } finally {
      setRefreshing(false)
    }
  }

  const handleResetAllData = async () => {
    try {
      setResetting(true)
      console.log('[Dashboard] Resetting all demo data')
      
      // Reset all localStorage data
      resetDemoProducts()
      resetDemoSuppliers()
      resetDemoTransactions()
      
      // Clear any other localStorage keys
      const keysToRemove = [
        'demo-products',
        'demo-suppliers', 
        'demo-transactions',
        'deleted-demo-products',
        'deleted-demo-suppliers'
      ]
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key)
        } catch (error) {
          console.warn(`Failed to remove ${key}:`, error)
        }
      })
      
      console.log('[Dashboard] All demo data cleared')
      
      // Refresh dashboard data
      const demoData = getDemoDashboardData()
      setDashboardData(demoData)
      
      // Notify other components
      window.dispatchEvent(new CustomEvent('productsUpdated'))
      window.dispatchEvent(new CustomEvent('suppliersUpdated'))
      window.dispatchEvent(new CustomEvent('transactionsUpdated'))
      
      setShowResetConfirm(false)
      
      // Show success message
      alert('Semua data berhasil direset! Aplikasi kembali ke kondisi awal.')
      
    } catch (error) {
      console.error('Error resetting data:', error)
      alert('Terjadi kesalahan saat mereset data: ' + error.message)
    } finally {
      setResetting(false)
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
          {/* Reset Button - Only show in demo mode */}
          {isDemoMode && (
            <TouchButton
              onClick={() => setShowResetConfirm(true)}
              disabled={resetting}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50"
            >
              <TrashIcon className="w-4 h-4" />
              {resetting ? 'Resetting...' : 'Reset Data'}
            </TouchButton>
          )}
          
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

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <TrashIcon className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Reset Semua Data</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Apakah Anda yakin ingin mereset semua data? Tindakan ini akan menghapus:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Semua produk yang ditambahkan</li>
                <li>Semua supplier yang ditambahkan</li>
                <li>Semua transaksi (stok masuk, keluar, penyesuaian)</li>
                <li>Data keuntungan dan laporan</li>
              </ul>
              <p className="text-red-600 text-sm mt-4 font-medium">
                ⚠️ Tindakan ini tidak dapat dibatalkan!
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <TouchButton
                onClick={() => setShowResetConfirm(false)}
                variant="outline"
                disabled={resetting}
              >
                Batal
              </TouchButton>
              <TouchButton
                onClick={handleResetAllData}
                disabled={resetting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {resetting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Mereset...
                  </div>
                ) : (
                  'Ya, Reset Semua'
                )}
              </TouchButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}