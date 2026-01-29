'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { getQuickSession } from '@/lib/auth-quick'

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
 * Demo authentication check
 */
async function requireDemoAuth() {
  const useDemoData = await shouldUseDemoData()
  if (useDemoData) {
    return true
  }
  return await requireAuth()
}

// Get current stock levels for all products
async function getCurrentStockLevels() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      sku: true,
      brand: true,
      name: true,
      category: true,
      unit: true,
      reorderPoint: true,
      minimumStock: true,
      stockMovements: {
        select: {
          quantityAfter: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      }
    }
  })

  return products.map(product => {
    const latestMovement = product.stockMovements[0]
    const currentStock = latestMovement?.quantityAfter || 0
    const reorderPoint = product.reorderPoint || product.minimumStock || 0

    return {
      ...product,
      currentStock,
      reorderPoint,
      stockMovements: undefined // Remove from response
    }
  })
}

// Calculate urgency level based on stock ratio
function calculateUrgencyLevel(currentStock, reorderPoint) {
  if (currentStock === 0) return 'critical'
  if (reorderPoint === 0) return 'low'
  
  const ratio = currentStock / reorderPoint
  
  if (ratio <= 0.2) return 'critical'  // 20% or less
  if (ratio <= 0.5) return 'high'      // 50% or less
  if (ratio <= 0.8) return 'medium'    // 80% or less
  return 'low'
}

// Estimate days until empty based on recent usage
async function estimateDaysUntilEmpty(productId, currentStock) {
  // Get stock movements from last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const movements = await prisma.stockMovement.findMany({
    where: {
      productId,
      movementType: 'OUT',
      createdAt: {
        gte: thirtyDaysAgo
      }
    },
    select: {
      quantityChange: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  if (movements.length === 0) return null

  // Calculate average daily usage
  const totalUsage = movements.reduce((sum, movement) => sum + Math.abs(movement.quantityChange), 0)
  const daysWithMovements = movements.length
  const averageDailyUsage = totalUsage / daysWithMovements

  if (averageDailyUsage === 0) return null

  return Math.ceil(currentStock / averageDailyUsage)
}

// Get low stock products
export async function getLowStockProductsAction() {
  try {
    await requireDemoAuth()

    const useDemoData = await shouldUseDemoData()
    
    if (useDemoData) {
      console.log('[Notifications] Using demo mode - returning client-side generated alerts')
      // In demo mode, return empty array since client-side will generate real-time alerts
      return {
        success: true,
        products: [],
        totalCount: 0,
        criticalCount: 0,
        highCount: 0,
        isDemoMode: true
      }
    }

    // Get all products with current stock levels
    const products = await getCurrentStockLevels()

    // Filter products that are at or below reorder point
    const lowStockProducts = []

    for (const product of products) {
      if (product.currentStock <= product.reorderPoint && product.reorderPoint > 0) {
        const urgencyLevel = calculateUrgencyLevel(product.currentStock, product.reorderPoint)
        const daysUntilEmpty = await estimateDaysUntilEmpty(product.id, product.currentStock)

        lowStockProducts.push({
          ...product,
          urgencyLevel,
          daysUntilEmpty,
          lastRestocked: null // Could be calculated from stock movements
        })
      }
    }

    // Sort by urgency (critical first, then by stock ratio)
    lowStockProducts.sort((a, b) => {
      const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      const aUrgency = urgencyOrder[a.urgencyLevel]
      const bUrgency = urgencyOrder[b.urgencyLevel]
      
      if (aUrgency !== bUrgency) {
        return aUrgency - bUrgency
      }
      
      // If same urgency, sort by stock ratio (lower first)
      const aRatio = a.reorderPoint > 0 ? a.currentStock / a.reorderPoint : 1
      const bRatio = b.reorderPoint > 0 ? b.currentStock / b.reorderPoint : 1
      return aRatio - bRatio
    })

    const criticalCount = lowStockProducts.filter(p => p.urgencyLevel === 'critical').length
    const highCount = lowStockProducts.filter(p => p.urgencyLevel === 'high').length

    return {
      success: true,
      products: lowStockProducts,
      totalCount: lowStockProducts.length,
      criticalCount,
      highCount
    }

  } catch (error) {
    console.error('Get low stock products error:', error)
    
    // Fallback to empty array for demo mode
    if (await shouldUseDemoData()) {
      console.log('[Notifications] Database failed, using demo mode')
      return {
        success: true,
        products: [],
        totalCount: 0,
        criticalCount: 0,
        highCount: 0,
        isDemoMode: true
      }
    }
    
    return {
      error: 'Gagal mengambil data stok rendah'
    }
  }
}

// Update reorder point for a product
export async function updateReorderPointAction(productId, reorderPoint) {
  try {
    await requireDemoAuth()

    const useDemoData = await shouldUseDemoData()
    
    if (useDemoData) {
      console.log('[Notifications] Demo mode - reorder point update simulated')
      return {
        success: true,
        message: 'Reorder point berhasil diperbarui'
      }
    }

    // Validate inputs
    if (!productId || typeof reorderPoint !== 'number' || reorderPoint < 0) {
      return {
        error: 'Data tidak valid'
      }
    }

    // Update product reorder point
    await prisma.product.update({
      where: { id: productId },
      data: { reorderPoint }
    })

    return {
      success: true,
      message: 'Reorder point berhasil diperbarui'
    }

  } catch (error) {
    console.error('Update reorder point error:', error)
    return {
      error: 'Gagal memperbarui reorder point'
    }
  }
}

// Bulk update reorder points
export async function bulkUpdateReorderPointsAction(updates) {
  try {
    await requireDemoAuth()

    const useDemoData = await shouldUseDemoData()
    
    if (useDemoData) {
      console.log('[Notifications] Demo mode - bulk reorder point update simulated')
      return {
        success: true,
        updatedCount: updates.length,
        message: `${updates.length} reorder point berhasil diperbarui`
      }
    }

    // Validate inputs
    if (!Array.isArray(updates) || updates.length === 0) {
      return {
        error: 'Data update tidak valid'
      }
    }

    let updatedCount = 0

    // Update each product
    for (const update of updates) {
      if (update.productId && typeof update.reorderPoint === 'number' && update.reorderPoint >= 0) {
        try {
          await prisma.product.update({
            where: { id: update.productId },
            data: { reorderPoint: update.reorderPoint }
          })
          updatedCount++
        } catch (err) {
          console.error(`Failed to update product ${update.productId}:`, err)
        }
      }
    }

    return {
      success: true,
      updatedCount,
      message: `${updatedCount} reorder point berhasil diperbarui`
    }

  } catch (error) {
    console.error('Bulk update reorder points error:', error)
    return {
      error: 'Gagal memperbarui reorder points'
    }
  }
}