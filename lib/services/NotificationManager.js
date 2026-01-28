'use server'

import { prisma } from '@/lib/prisma'
import { getQuickSession } from '@/lib/auth-quick'

// Demo notifications data
const DEMO_NOTIFICATIONS = [
  {
    id: 'demo-notif-1',
    type: 'LOW_STOCK',
    title: 'Low Stock Alert',
    message: 'Cat Tembok Putih 5L is running low (5 units remaining)',
    productId: 'demo-prod-1',
    productName: 'Cat Tembok Putih 5L',
    currentStock: 5,
    minimumStock: 10,
    isRead: false,
    isAcknowledged: false,
    priority: 'HIGH',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-notif-2',
    type: 'LOW_STOCK',
    title: 'Low Stock Alert',
    message: 'Cat Kayu Coklat 2.5L is running low (2 units remaining)',
    productId: 'demo-prod-3',
    productName: 'Cat Kayu Coklat 2.5L',
    currentStock: 2,
    minimumStock: 8,
    isRead: false,
    isAcknowledged: false,
    priority: 'CRITICAL',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-notif-3',
    type: 'REORDER_SUGGESTION',
    title: 'Reorder Suggestion',
    message: 'Consider reordering Cat Besi Hitam 1L based on sales pattern',
    productId: 'demo-prod-5',
    productName: 'Cat Besi Hitam 1L',
    currentStock: 8,
    minimumStock: 12,
    suggestedQuantity: 20,
    isRead: true,
    isAcknowledged: false,
    priority: 'MEDIUM',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  }
]

/**
 * Check if we should use demo data
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
 * Get all notifications with filtering and pagination
 */
export async function getNotifications(options = {}) {
  const {
    type = null,
    isRead = null,
    priority = null,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options

  const useDemoData = await shouldUseDemoData()

  if (useDemoData) {
    console.log('[NotificationManager] Using demo notifications')
    
    let filteredNotifications = [...DEMO_NOTIFICATIONS]

    // Apply filters
    if (type) {
      filteredNotifications = filteredNotifications.filter(n => n.type === type)
    }
    if (isRead !== null) {
      filteredNotifications = filteredNotifications.filter(n => n.isRead === isRead)
    }
    if (priority) {
      filteredNotifications = filteredNotifications.filter(n => n.priority === priority)
    }

    // Sort
    filteredNotifications.sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      if (sortOrder === 'desc') {
        return new Date(bVal) - new Date(aVal)
      }
      return new Date(aVal) - new Date(bVal)
    })

    // Paginate
    const totalCount = filteredNotifications.length
    const skip = (page - 1) * limit
    const paginatedNotifications = filteredNotifications.slice(skip, skip + limit)

    return {
      success: true,
      notifications: paginatedNotifications,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1
      }
    }
  }

  // Database implementation would go here
  try {
    const where = {}
    if (type) where.type = type
    if (isRead !== null) where.isRead = isRead
    if (priority) where.priority = priority

    const skip = (page - 1) * limit

    const [notifications, totalCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              minimumStock: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.notification.count({ where })
    ])

    return {
      success: true,
      notifications,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1
      }
    }
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return {
      success: false,
      error: 'Failed to fetch notifications'
    }
  }
}

/**
 * Get low stock notifications
 */
export async function getLowStockNotifications() {
  const useDemoData = await shouldUseDemoData()

  if (useDemoData) {
    const lowStockNotifications = DEMO_NOTIFICATIONS.filter(n => 
      n.type === 'LOW_STOCK' && !n.isAcknowledged
    )
    
    return {
      success: true,
      notifications: lowStockNotifications,
      count: lowStockNotifications.length
    }
  }

  // Database implementation
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        type: 'LOW_STOCK',
        isAcknowledged: false
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            minimumStock: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return {
      success: true,
      notifications,
      count: notifications.length
    }
  } catch (error) {
    console.error('Error fetching low stock notifications:', error)
    return {
      success: false,
      error: 'Failed to fetch low stock notifications'
    }
  }
}

/**
 * Create a new notification
 */
export async function createNotification(data) {
  const {
    type,
    title,
    message,
    productId = null,
    priority = 'MEDIUM',
    metadata = {}
  } = data

  const useDemoData = await shouldUseDemoData()

  if (useDemoData) {
    console.log('[NotificationManager] Demo mode - notification creation simulated')
    const newNotification = {
      id: `demo-notif-${Date.now()}`,
      type,
      title,
      message,
      productId,
      priority,
      metadata,
      isRead: false,
      isAcknowledged: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return {
      success: true,
      notification: newNotification
    }
  }

  // Database implementation
  try {
    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        productId,
        priority,
        metadata,
        isRead: false,
        isAcknowledged: false
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        }
      }
    })

    return {
      success: true,
      notification
    }
  } catch (error) {
    console.error('Error creating notification:', error)
    return {
      success: false,
      error: 'Failed to create notification'
    }
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId) {
  const useDemoData = await shouldUseDemoData()

  if (useDemoData) {
    console.log('[NotificationManager] Demo mode - mark as read simulated')
    return {
      success: true
    }
  }

  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { 
        isRead: true,
        updatedAt: new Date()
      }
    })

    return {
      success: true
    }
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return {
      success: false,
      error: 'Failed to mark notification as read'
    }
  }
}

/**
 * Acknowledge notification
 */
export async function acknowledgeNotification(notificationId) {
  const useDemoData = await shouldUseDemoData()

  if (useDemoData) {
    console.log('[NotificationManager] Demo mode - acknowledge simulated')
    return {
      success: true
    }
  }

  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { 
        isAcknowledged: true,
        isRead: true,
        updatedAt: new Date()
      }
    })

    return {
      success: true
    }
  } catch (error) {
    console.error('Error acknowledging notification:', error)
    return {
      success: false,
      error: 'Failed to acknowledge notification'
    }
  }
}

/**
 * Check for low stock and create notifications
 */
export async function checkLowStock() {
  const useDemoData = await shouldUseDemoData()

  if (useDemoData) {
    console.log('[NotificationManager] Demo mode - low stock check simulated')
    return {
      success: true,
      notificationsCreated: 0
    }
  }

  try {
    // Get products with current stock below minimum
    const lowStockProducts = await prisma.product.findMany({
      where: {
        minimumStock: { gt: 0 }
      },
      include: {
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { quantityAfter: true }
        }
      }
    })

    let notificationsCreated = 0

    for (const product of lowStockProducts) {
      const currentStock = product.stockMovements[0]?.quantityAfter || 0
      
      if (currentStock <= product.minimumStock) {
        // Check if notification already exists
        const existingNotification = await prisma.notification.findFirst({
          where: {
            type: 'LOW_STOCK',
            productId: product.id,
            isAcknowledged: false
          }
        })

        if (!existingNotification) {
          await createNotification({
            type: 'LOW_STOCK',
            title: 'Low Stock Alert',
            message: `${product.name} is running low (${currentStock} units remaining)`,
            productId: product.id,
            priority: currentStock === 0 ? 'CRITICAL' : 'HIGH',
            metadata: {
              currentStock,
              minimumStock: product.minimumStock,
              productName: product.name,
              sku: product.sku
            }
          })
          notificationsCreated++
        }
      }
    }

    return {
      success: true,
      notificationsCreated
    }
  } catch (error) {
    console.error('Error checking low stock:', error)
    return {
      success: false,
      error: 'Failed to check low stock'
    }
  }
}

/**
 * Generate reorder suggestions based on sales patterns
 */
export async function generateReorderSuggestions() {
  const useDemoData = await shouldUseDemoData()

  if (useDemoData) {
    console.log('[NotificationManager] Demo mode - reorder suggestions simulated')
    return {
      success: true,
      suggestionsCreated: 0
    }
  }

  try {
    // This would implement more complex logic based on sales patterns
    // For now, we'll create basic suggestions for products approaching minimum stock
    
    const products = await prisma.product.findMany({
      where: {
        minimumStock: { gt: 0 }
      },
      include: {
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { quantityAfter: true }
        },
        transactionItems: {
          where: {
            transaction: { type: 'OUT' },
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          },
          select: { quantity: true }
        }
      }
    })

    let suggestionsCreated = 0

    for (const product of products) {
      const currentStock = product.stockMovements[0]?.quantityAfter || 0
      const monthlySales = product.transactionItems.reduce((sum, item) => sum + item.quantity, 0)
      
      // If current stock is 1.5x minimum stock and has sales activity
      if (currentStock <= product.minimumStock * 1.5 && monthlySales > 0) {
        const existingSuggestion = await prisma.notification.findFirst({
          where: {
            type: 'REORDER_SUGGESTION',
            productId: product.id,
            isAcknowledged: false,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          }
        })

        if (!existingSuggestion) {
          const suggestedQuantity = Math.max(product.minimumStock * 2, monthlySales)
          
          await createNotification({
            type: 'REORDER_SUGGESTION',
            title: 'Reorder Suggestion',
            message: `Consider reordering ${product.name} based on sales pattern`,
            productId: product.id,
            priority: 'MEDIUM',
            metadata: {
              currentStock,
              minimumStock: product.minimumStock,
              monthlySales,
              suggestedQuantity,
              productName: product.name,
              sku: product.sku
            }
          })
          suggestionsCreated++
        }
      }
    }

    return {
      success: true,
      suggestionsCreated
    }
  } catch (error) {
    console.error('Error generating reorder suggestions:', error)
    return {
      success: false,
      error: 'Failed to generate reorder suggestions'
    }
  }
}

/**
 * Clean up old acknowledged notifications
 */
export async function cleanupOldNotifications(daysOld = 30) {
  const useDemoData = await shouldUseDemoData()

  if (useDemoData) {
    console.log('[NotificationManager] Demo mode - cleanup simulated')
    return {
      success: true,
      deletedCount: 0
    }
  }

  try {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)
    
    const result = await prisma.notification.deleteMany({
      where: {
        isAcknowledged: true,
        updatedAt: {
          lt: cutoffDate
        }
      }
    })

    return {
      success: true,
      deletedCount: result.count
    }
  } catch (error) {
    console.error('Error cleaning up notifications:', error)
    return {
      success: false,
      error: 'Failed to cleanup notifications'
    }
  }
}