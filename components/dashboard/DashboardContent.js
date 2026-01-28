'use client'

import { useState, useEffect } from 'react'
import { getDashboardData, refreshDashboard } from '@/lib/actions/dashboard'
import DashboardStats from './DashboardStats'
import QuickActions from './QuickActions'
import LowStockAlerts from './LowStockAlerts'
import RecentActivity from './RecentActivity'
import TouchButton from '@/components/ui/TouchButton'
import { RefreshCwIcon } from 'lucide-react'

export default function DashboardContent({ session }) {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getDashboardData()
      
      if (result.success) {
        setDashboardData(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      console.error('Error loading dashboard:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      const result = await refreshDashboard()
      
      if (result.success) {
        setDashboardData(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      console.error('Error refreshing dashboard:', err)
      setError('Failed to refresh dashboard')
    } finally {
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
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

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {session.user.name}
          </p>
        </div>

        <div className="card">
          <div className="card-body text-center py-12">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unable to Load Dashboard
            </h3>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            <TouchButton onClick={loadDashboardData} variant="primary">
              Try Again
            </TouchButton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {session.user.name}
          </p>
        </div>
        
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
    </div>
  )
}