/**
 * CSV Export Queries
 * Optimized queries for CSV export functionality with streaming support
 */

import { prisma } from '@/lib/prisma'
import { CSV_EXPORT_CONFIG } from '@/lib/utils/csv-export'

/**
 * Get products data for CSV export
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Products data formatted for CSV
 */
export async function getProductsForExport(filters = {}) {
  const {
    search,
    category,
    brand,
    includeStockLevels = true,
    limit = CSV_EXPORT_CONFIG.MAX_EXPORT_ROWS
  } = filters

  // Build where clause
  const where = {}
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } }
    ]
  }

  if (category) {
    where.category = category
  }

  if (brand) {
    where.brand = { contains: brand, mode: 'insensitive' }
  }

  // Get products with optional stock levels
  const products = await prisma.product.findMany({
    where,
    select: {
      sku: true,
      brand: true,
      name: true,
      category: true,
      size: true,
      unit: true,
      purchasePrice: true,
      sellingPrice: true,
      minimumStock: true,
      createdAt: true,
      updatedAt: true,
      ...(includeStockLevels && {
        stockMovements: {
          select: {
            quantityAfter: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      })
    },
    orderBy: { name: 'asc' },
    take: limit
  })

  // Transform for CSV export
  return products.map(product => {
    const currentStock = includeStockLevels 
      ? (product.stockMovements?.[0]?.quantityAfter || 0)
      : null
    
    const lastMovementDate = includeStockLevels 
      ? (product.stockMovements?.[0]?.createdAt || null)
      : null

    return {
      'SKU': product.sku,
      'Brand': product.brand,
      'Product Name': product.name,
      'Category': product.category,
      'Size': product.size,
      'Unit': product.unit,
      'Purchase Price': product.purchasePrice || '',
      'Selling Price': product.sellingPrice || '',
      'Minimum Stock': product.minimumStock || '',
      ...(includeStockLevels && {
        'Current Stock': currentStock,
        'Last Movement Date': lastMovementDate ? lastMovementDate.toISOString().split('T')[0] : ''
      }),
      'Created Date': product.createdAt.toISOString().split('T')[0],
      'Updated Date': product.updatedAt.toISOString().split('T')[0],
      'Export Date': new Date().toISOString().split('T')[0]
    }
  })
}

/**
 * Get stock movements data for CSV export
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Stock movements data formatted for CSV
 */
export async function getStockMovementsForExport(filters = {}) {
  const {
    startDate,
    endDate,
    productId,
    movementType,
    limit = CSV_EXPORT_CONFIG.MAX_EXPORT_ROWS
  } = filters

  // Build date filter
  const dateFilter = {}
  if (startDate) {
    dateFilter.gte = new Date(startDate)
  }
  if (endDate) {
    dateFilter.lte = new Date(endDate)
  }

  // Build where clause
  const where = {
    ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
    ...(productId && { productId }),
    ...(movementType && { movementType })
  }

  const movements = await prisma.stockMovement.findMany({
    where,
    include: {
      product: {
        select: {
          sku: true,
          brand: true,
          name: true,
          category: true,
          size: true,
          unit: true
        }
      },
      transaction: {
        select: {
          referenceNumber: true,
          transactionDate: true,
          notes: true,
          supplier: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  })

  return movements.map(movement => ({
    'Movement Date': movement.createdAt.toISOString().split('T')[0],
    'Movement Time': movement.createdAt.toTimeString().split(' ')[0],
    'Reference Number': movement.transaction.referenceNumber,
    'Transaction Date': movement.transaction.transactionDate.toISOString().split('T')[0],
    'Movement Type': movement.movementType,
    'Product SKU': movement.product.sku,
    'Product Brand': movement.product.brand,
    'Product Name': movement.product.name,
    'Category': movement.product.category,
    'Size': movement.product.size,
    'Unit': movement.product.unit,
    'Quantity Before': movement.quantityBefore,
    'Quantity Change': movement.quantityChange,
    'Quantity After': movement.quantityAfter,
    'Supplier': movement.transaction.supplier?.name || '',
    'Notes': movement.transaction.notes || '',
    'Export Date': new Date().toISOString().split('T')[0]
  }))
}

/**
 * Get transactions data for CSV export
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Transactions data formatted for CSV
 */
export async function getTransactionsForExport(filters = {}) {
  const {
    startDate,
    endDate,
    type,
    supplierId,
    includeItems = true,
    limit = CSV_EXPORT_CONFIG.MAX_EXPORT_ROWS
  } = filters

  // Build date filter
  const dateFilter = {}
  if (startDate) {
    dateFilter.gte = new Date(startDate)
  }
  if (endDate) {
    dateFilter.lte = new Date(endDate)
  }

  // Build where clause
  const where = {
    ...(Object.keys(dateFilter).length > 0 && { transactionDate: dateFilter }),
    ...(type && { type }),
    ...(supplierId && { supplierId })
  }

  const transactions = await prisma.stockTransaction.findMany({
    where,
    include: {
      supplier: {
        select: {
          name: true,
          contact: true
        }
      },
      ...(includeItems && {
        items: {
          include: {
            product: {
              select: {
                sku: true,
                brand: true,
                name: true,
                category: true,
                size: true,
                unit: true
              }
            }
          }
        }
      })
    },
    orderBy: { transactionDate: 'desc' },
    take: limit
  })

  // Flatten transactions with items for CSV export
  const exportData = []
  
  transactions.forEach(transaction => {
    if (includeItems && transaction.items.length > 0) {
      // Create one row per transaction item
      transaction.items.forEach(item => {
        exportData.push({
          'Transaction Date': transaction.transactionDate.toISOString().split('T')[0],
          'Reference Number': transaction.referenceNumber,
          'Transaction Type': transaction.type,
          'Supplier': transaction.supplier?.name || '',
          'Supplier Contact': transaction.supplier?.contact || '',
          'Product SKU': item.product.sku,
          'Product Brand': item.product.brand,
          'Product Name': item.product.name,
          'Category': item.product.category,
          'Size': item.product.size,
          'Unit': item.product.unit,
          'Quantity': item.quantity,
          'Unit Cost': item.unitCost || '',
          'Unit Price': item.unitPrice || '',
          'Line Total': item.quantity * (item.unitCost || item.unitPrice || 0),
          'Notes': transaction.notes || '',
          'Created Date': transaction.createdAt.toISOString().split('T')[0],
          'Export Date': new Date().toISOString().split('T')[0]
        })
      })
    } else {
      // Create one row per transaction (summary)
      exportData.push({
        'Transaction Date': transaction.transactionDate.toISOString().split('T')[0],
        'Reference Number': transaction.referenceNumber,
        'Transaction Type': transaction.type,
        'Supplier': transaction.supplier?.name || '',
        'Supplier Contact': transaction.supplier?.contact || '',
        'Total Value': transaction.totalValue || '',
        'Item Count': transaction.items?.length || 0,
        'Notes': transaction.notes || '',
        'Created Date': transaction.createdAt.toISOString().split('T')[0],
        'Export Date': new Date().toISOString().split('T')[0]
      })
    }
  })

  return exportData
}

/**
 * Get suppliers data for CSV export
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Suppliers data formatted for CSV
 */
export async function getSuppliersForExport(filters = {}) {
  const {
    search,
    includeTransactionStats = true,
    limit = CSV_EXPORT_CONFIG.MAX_EXPORT_ROWS
  } = filters

  // Build where clause
  const where = {}
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { contact: { contains: search, mode: 'insensitive' } }
    ]
  }

  const suppliers = await prisma.supplier.findMany({
    where,
    select: {
      name: true,
      contact: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      ...(includeTransactionStats && {
        transactions: {
          select: {
            id: true,
            type: true,
            totalValue: true,
            transactionDate: true
          }
        }
      })
    },
    orderBy: { name: 'asc' },
    take: limit
  })

  return suppliers.map(supplier => {
    let transactionStats = {}
    
    if (includeTransactionStats && supplier.transactions) {
      const transactions = supplier.transactions
      const totalTransactions = transactions.length
      const totalValue = transactions.reduce((sum, t) => sum + (t.totalValue || 0), 0)
      const lastTransactionDate = transactions.length > 0 
        ? Math.max(...transactions.map(t => new Date(t.transactionDate).getTime()))
        : null

      transactionStats = {
        'Total Transactions': totalTransactions,
        'Total Transaction Value': totalValue.toFixed(2),
        'Last Transaction Date': lastTransactionDate 
          ? new Date(lastTransactionDate).toISOString().split('T')[0] 
          : ''
      }
    }

    return {
      'Supplier Name': supplier.name,
      'Contact Information': supplier.contact || '',
      'Notes': supplier.notes || '',
      ...transactionStats,
      'Created Date': supplier.createdAt.toISOString().split('T')[0],
      'Updated Date': supplier.updatedAt.toISOString().split('T')[0],
      'Export Date': new Date().toISOString().split('T')[0]
    }
  })
}

/**
 * Streaming data generator for large exports
 * @param {Function} queryFunction - Function to execute query
 * @param {Object} filters - Query filters
 * @param {number} chunkSize - Size of each chunk
 * @returns {AsyncGenerator} Data chunks
 */
export async function* streamingDataGenerator(queryFunction, filters, chunkSize = CSV_EXPORT_CONFIG.CHUNK_SIZE) {
  let offset = 0
  let hasMore = true
  
  while (hasMore) {
    const chunk = await queryFunction({
      ...filters,
      offset,
      limit: chunkSize
    })
    
    if (chunk && chunk.length > 0) {
      yield chunk
      offset += chunkSize
      hasMore = chunk.length === chunkSize
    } else {
      hasMore = false
    }
  }
}