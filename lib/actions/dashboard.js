'use server'

import { revalidatePath } from 'next/cache'
import { getDashboardStats, getLowStockAlerts, getDashboardActivity as getDashboardActivityQuery, getQuickStats } from '@/lib/queries/dashboard'
import { getQuickSession } from '@/lib/auth-quick'

// Demo data for when database is not available
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
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      user: 'Store Owner'
    },
    {
      id: 'demo-act-2',
      type: 'stock_out',
      description: 'Penjualan: Cat Kayu Merah 1L (5 unit)',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      user: 'Store Owner'
    },
    {
      id: 'demo-act-3',
      type: 'adjustment',
      description: 'Penyesuaian stok: Cat Besi Hitam 1L',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      user: 'Store Owner'
    }
  ]
}

/**
 * Check if we should use demo data (when quick session is active)
 */
async function shouldUseDemoData() {
  try {
    const quickSession = await getQuickSession()
    return quickSession?.isAuthenticated || false
  } catch (error) {
    return false
  }
}

/**
 * Get dashboard data with caching and demo fallback
 * @returns {Promise<Object>} Dashboard data
 */
export async function getDashboardData() {
  try {
    // Check if we should use demo data
    const useDemoData = await shouldUseDemoData()
    
    if (useDemoData) {
      console.log('[Dashboard] Using demo data')
      return {
        success: true,
        data: DEMO_DASHBOARD_DATA
      }
    }

    // Try to get real data from database
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
    
    // Fallback to demo data if database fails
    console.log('[Dashboard] Database failed, falling back to demo data')
    return {
      success: true,
      data: DEMO_DASHBOARD_DATA
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
    // Check if we should use demo data
    const useDemoData = await shouldUseDemoData()
    
    if (useDemoData) {
      return {
        success: true,
        data: DEMO_DASHBOARD_DATA.stats
      }
    }

    const stats = await getQuickStats()
    
    return {
      success: true,
      data: stats
    }
  } catch (error) {
    console.error('Error fetching quick statistics:', error)
    
    // Fallback to demo data
    return {
      success: true,
      data: DEMO_DASHBOARD_DATA.stats
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
    // Check if we should use demo data
    const useDemoData = await shouldUseDemoData()
    
    if (useDemoData) {
      return {
        success: true,
        data: DEMO_DASHBOARD_DATA.lowStockAlerts.slice(0, limit)
      }
    }

    const alerts = await getLowStockAlerts(limit)
    
    return {
      success: true,
      data: alerts
    }
  } catch (error) {
    console.error('Error fetching low stock alerts:', error)
    
    // Fallback to demo data
    return {
      success: true,
      data: DEMO_DASHBOARD_DATA.lowStockAlerts.slice(0, limit)
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
    // Check if we should use demo data
    const useDemoData = await shouldUseDemoData()
    
    if (useDemoData) {
      return {
        success: true,
        data: DEMO_DASHBOARD_DATA.activity.slice(0, limit)
      }
    }

    const activity = await getDashboardActivityQuery(limit)
    
    return {
      success: true,
      data: activity
    }
  } catch (error) {
    console.error('Error fetching dashboard activity:', error)
    
    // Fallback to demo data
    return {
      success: true,
      data: DEMO_DASHBOARD_DATA.activity.slice(0, limit)
    }
  }
}