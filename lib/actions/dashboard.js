'use server'

import { revalidatePath } from 'next/cache'
import { getDashboardStats, getLowStockAlerts, getDashboardActivity as getDashboardActivityQuery, getQuickStats } from '@/lib/queries/dashboard'

/**
 * Get dashboard data with caching
 * @returns {Promise<Object>} Dashboard data
 */
export async function getDashboardData() {
  try {
    const [stats, lowStockAlerts, activity] = await Promise.all([
      getDashboardStats(),
      getLowStockAlerts(8), // Get top 8 low stock items
      getDashboardActivityQuery(8) // Get last 8 activities
    ])

    return {
      success: true,
      data: {
        stats,
        lowStockAlerts,
        activity
      }
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return {
      success: false,
      error: 'Failed to load dashboard data'
    }
  }
}

/**
 * Refresh dashboard data
 * @returns {Promise<Object>} Refreshed dashboard data
 */
export async function refreshDashboard() {
  try {
    // Revalidate dashboard cache
    revalidatePath('/dashboard')
    
    // Fetch fresh data
    const result = await getDashboardData()
    
    return result
  } catch (error) {
    console.error('Error refreshing dashboard:', error)
    return {
      success: false,
      error: 'Failed to refresh dashboard'
    }
  }
}

/**
 * Get quick statistics for widgets
 * @returns {Promise<Object>} Quick stats
 */
export async function getQuickStatistics() {
  try {
    const stats = await getQuickStats()
    
    return {
      success: true,
      data: stats
    }
  } catch (error) {
    console.error('Error fetching quick statistics:', error)
    return {
      success: false,
      error: 'Failed to load statistics'
    }
  }
}

/**
 * Get low stock alerts for dashboard
 * @param {number} limit - Number of alerts to fetch
 * @returns {Promise<Object>} Low stock alerts
 */
export async function getDashboardLowStockAlerts(limit = 10) {
  try {
    const alerts = await getLowStockAlerts(limit)
    
    return {
      success: true,
      data: alerts
    }
  } catch (error) {
    console.error('Error fetching low stock alerts:', error)
    return {
      success: false,
      error: 'Failed to load low stock alerts'
    }
  }
}

/**
 * Get recent activity for dashboard
 * @param {number} limit - Number of activities to fetch
 * @returns {Promise<Object>} Recent activities
 */
export async function getDashboardActivityAction(limit = 10) {
  try {
    const activity = await getDashboardActivityQuery(limit)
    
    return {
      success: true,
      data: activity
    }
  } catch (error) {
    console.error('Error fetching dashboard activity:', error)
    return {
      success: false,
      error: 'Failed to load recent activity'
    }
  }
}