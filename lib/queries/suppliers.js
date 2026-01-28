import { prisma } from '@/lib/prisma'

// Get suppliers with transaction summaries
export async function getSuppliersWithTransactionSummary(filters = {}) {
  const { 
    startDate, 
    endDate, 
    page = 1, 
    limit = 50 
  } = filters
  
  const skip = (page - 1) * limit
  
  // Build transaction filter for date range
  const transactionWhere = {}
  if (startDate || endDate) {
    transactionWhere.transactionDate = {}
    if (startDate) transactionWhere.transactionDate.gte = new Date(startDate)
    if (endDate) transactionWhere.transactionDate.lte = new Date(endDate)
  }
  
  const suppliers = await prisma.supplier.findMany({
    select: {
      id: true,
      name: true,
      contact: true,
      notes: true,
      createdAt: true,
      transactions: {
        where: transactionWhere,
        select: {
          id: true,
          type: true,
          transactionDate: true,
          totalValue: true
        }
      }
    },
    skip,
    take: limit,
    orderBy: { name: 'asc' }
  })
  
  // Calculate transaction summaries
  return suppliers.map(supplier => {
    const transactions = supplier.transactions
    const totalTransactions = transactions.length
    const totalValue = transactions.reduce((sum, t) => sum + (t.totalValue || 0), 0)
    const lastTransactionDate = transactions.length > 0 
      ? Math.max(...transactions.map(t => new Date(t.transactionDate).getTime()))
      : null
    
    return {
      ...supplier,
      transactionSummary: {
        totalTransactions,
        totalValue,
        lastTransactionDate: lastTransactionDate ? new Date(lastTransactionDate) : null
      },
      transactions: undefined
    }
  })
}

// Get supplier transaction history
export async function getSupplierTransactionHistory(supplierId, filters = {}) {
  const { startDate, endDate, page = 1, limit = 50 } = filters
  const skip = (page - 1) * limit
  
  const where = { supplierId }
  
  if (startDate || endDate) {
    where.transactionDate = {}
    if (startDate) where.transactionDate.gte = new Date(startDate)
    if (endDate) where.transactionDate.lte = new Date(endDate)
  }
  
  const [transactions, totalCount] = await Promise.all([
    prisma.stockTransaction.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                sku: true,
                name: true,
                brand: true
              }
            }
          }
        }
      },
      skip,
      take: limit,
      orderBy: { transactionDate: 'desc' }
    }),
    prisma.stockTransaction.count({ where })
  ])
  
  return {
    transactions,
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

// Get supplier statistics
export async function getSupplierStats() {
  const [
    totalSuppliers,
    activeSuppliers,
    suppliersThisMonth
  ] = await Promise.all([
    prisma.supplier.count(),
    prisma.supplier.count({
      where: {
        transactions: {
          some: {
            transactionDate: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
            }
          }
        }
      }
    }),
    prisma.supplier.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    })
  ])
  
  return {
    totalSuppliers,
    activeSuppliers,
    suppliersThisMonth,
    inactiveSuppliers: totalSuppliers - activeSuppliers
  }
}

// Search suppliers with advanced filters
export async function searchSuppliersAdvanced(filters = {}) {
  const {
    search,
    hasTransactions,
    page = 1,
    limit = 50,
    sortBy = 'name',
    sortOrder = 'asc'
  } = filters
  
  const skip = (page - 1) * limit
  const where = {}
  
  // Text search
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { contact: { contains: search } }
    ]
  }
  
  // Filter by transaction activity
  if (hasTransactions !== undefined) {
    if (hasTransactions) {
      where.transactions = { some: {} }
    } else {
      where.transactions = { none: {} }
    }
  }
  
  const suppliers = await prisma.supplier.findMany({
    where,
    select: {
      id: true,
      name: true,
      contact: true,
      notes: true,
      createdAt: true,
      _count: {
        select: {
          transactions: true
        }
      }
    },
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder }
  })
  
  return suppliers.map(supplier => ({
    ...supplier,
    transactionCount: supplier._count.transactions,
    _count: undefined
  }))
}

// Get suppliers for CSV export
export async function getSuppliersForExport(filters = {}) {
  const where = {}
  
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { contact: { contains: filters.search } }
    ]
  }
  
  const suppliers = await prisma.supplier.findMany({
    where,
    select: {
      name: true,
      contact: true,
      notes: true,
      createdAt: true,
      _count: {
        select: {
          transactions: true
        }
      }
    },
    orderBy: { name: 'asc' }
  })
  
  // Format for CSV export
  return suppliers.map(supplier => ({
    Name: supplier.name,
    Contact: supplier.contact || '',
    Notes: supplier.notes || '',
    'Transaction Count': supplier._count.transactions,
    'Created Date': supplier.createdAt.toISOString().split('T')[0]
  }))
}