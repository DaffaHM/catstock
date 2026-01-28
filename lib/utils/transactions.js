import { TransactionType } from '@/lib/validations/transaction'
import { StockCalculationEngine } from '@/lib/engines/stock-calculation'

// Transaction type display names
export const TRANSACTION_TYPE_LABELS = {
  [TransactionType.IN]: 'Stock In',
  [TransactionType.OUT]: 'Stock Out',
  [TransactionType.ADJUST]: 'Stock Adjustment',
  [TransactionType.RETURN_IN]: 'Return In',
  [TransactionType.RETURN_OUT]: 'Return Out'
}

// Transaction type colors for UI
export const TRANSACTION_TYPE_COLORS = {
  [TransactionType.IN]: 'bg-green-100 text-green-800',
  [TransactionType.OUT]: 'bg-red-100 text-red-800',
  [TransactionType.ADJUST]: 'bg-blue-100 text-blue-800',
  [TransactionType.RETURN_IN]: 'bg-yellow-100 text-yellow-800',
  [TransactionType.RETURN_OUT]: 'bg-orange-100 text-orange-800'
}

// Format transaction reference number
export function formatReferenceNumber(refNumber) {
  if (!refNumber) return 'N/A'
  return refNumber
}

// Format transaction date
export function formatTransactionDate(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Format currency values
export function formatCurrency(amount, currency = 'USD') {
  if (amount === null || amount === undefined) return 'N/A'
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// Format quantity with unit
export function formatQuantity(quantity, unit = '') {
  if (quantity === null || quantity === undefined) return 'N/A'
  
  const formattedQuantity = new Intl.NumberFormat('en-US').format(quantity)
  return unit ? `${formattedQuantity} ${unit}` : formattedQuantity
}

// Calculate transaction totals
export function calculateTransactionTotals(items) {
  const totals = {
    totalItems: items.length,
    totalQuantity: 0,
    totalCost: 0,
    totalPrice: 0,
    hasCosting: false,
    hasPricing: false
  }

  items.forEach(item => {
    totals.totalQuantity += item.quantity || 0
    
    if (item.unitCost) {
      totals.totalCost += (item.unitCost * item.quantity)
      totals.hasCosting = true
    }
    
    if (item.unitPrice) {
      totals.totalPrice += (item.unitPrice * item.quantity)
      totals.hasPricing = true
    }
  })

  return totals
}

// Validate transaction item for specific transaction type
export function validateTransactionItem(item, transactionType) {
  const errors = []

  // Basic validation
  if (!item.productId) {
    errors.push('Product is required')
  }

  if (!item.quantity || item.quantity <= 0) {
    if (transactionType !== TransactionType.ADJUST) {
      errors.push('Quantity must be positive')
    } else if (item.quantity === 0) {
      errors.push('Adjustment quantity cannot be zero')
    }
  }

  // Type-specific validation
  switch (transactionType) {
    case TransactionType.IN:
      if (!item.unitCost || item.unitCost <= 0) {
        errors.push('Unit cost is required for stock in transactions')
      }
      break

    case TransactionType.OUT:
      if (!item.unitPrice || item.unitPrice <= 0) {
        errors.push('Unit price is required for stock out transactions')
      }
      break

    case TransactionType.ADJUST:
      // Adjustments can have negative quantities
      if (item.quantity === 0) {
        errors.push('Adjustment quantity cannot be zero')
      }
      break

    case TransactionType.RETURN_IN:
    case TransactionType.RETURN_OUT:
      // Returns are more flexible with pricing
      break
  }

  return errors
}

// Generate transaction summary text
export function generateTransactionSummary(transaction) {
  const typeLabel = TRANSACTION_TYPE_LABELS[transaction.type] || transaction.type
  const itemCount = transaction.items?.length || 0
  const totalQuantity = transaction.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  
  let summary = `${typeLabel} - ${itemCount} item${itemCount !== 1 ? 's' : ''}`
  
  if (totalQuantity > 0) {
    summary += `, ${totalQuantity} total units`
  }
  
  if (transaction.supplier?.name) {
    summary += ` from ${transaction.supplier.name}`
  }
  
  if (transaction.totalValue) {
    summary += ` (${formatCurrency(transaction.totalValue)})`
  }

  return summary
}

// Check if transaction can be modified
export function canModifyTransaction(transaction) {
  // In a real application, you might have business rules about when
  // transactions can be modified (e.g., only within 24 hours, only by certain users, etc.)
  
  // For now, we'll allow modification of notes and reference numbers only
  // and prevent modification of items and quantities to maintain data integrity
  
  return {
    canEditNotes: true,
    canEditReference: true,
    canEditItems: false,
    canDelete: false, // Generally, transactions should not be deleted once created
    reason: transaction.items?.length > 0 ? 
      'Transactions with items cannot be modified to maintain audit trail' : 
      null
  }
}

// Calculate stock impact for transaction
export function calculateStockImpact(items, transactionType) {
  return items.map(item => {
    const impact = StockCalculationEngine.calculateQuantityChange(transactionType, item.quantity)
    
    return {
      productId: item.productId,
      product: item.product,
      quantity: item.quantity,
      stockImpact: impact,
      unitCost: item.unitCost,
      unitPrice: item.unitPrice
    }
  })
}

// Validate stock availability for OUT transactions
export function validateStockAvailability(items, currentStockLevels, transactionType) {
  if (transactionType !== TransactionType.OUT && transactionType !== TransactionType.RETURN_OUT) {
    return { valid: true, errors: [] }
  }

  const errors = []
  
  items.forEach(item => {
    const currentStock = currentStockLevels[item.productId] || 0
    const requestedQuantity = item.quantity
    
    if (currentStock < requestedQuantity) {
      errors.push({
        productId: item.productId,
        product: item.product,
        requested: requestedQuantity,
        available: currentStock,
        message: `Insufficient stock for ${item.product?.name || 'product'}. Available: ${currentStock}, Requested: ${requestedQuantity}`
      })
    }
  })

  return {
    valid: errors.length === 0,
    errors
  }
}

// Sort transactions by various criteria
export function sortTransactions(transactions, sortBy = 'date', sortOrder = 'desc') {
  const sorted = [...transactions].sort((a, b) => {
    let aValue, bValue

    switch (sortBy) {
      case 'date':
        aValue = new Date(a.transactionDate)
        bValue = new Date(b.transactionDate)
        break
      case 'reference':
        aValue = a.referenceNumber
        bValue = b.referenceNumber
        break
      case 'type':
        aValue = a.type
        bValue = b.type
        break
      case 'value':
        aValue = a.totalValue || 0
        bValue = b.totalValue || 0
        break
      case 'supplier':
        aValue = a.supplier?.name || ''
        bValue = b.supplier?.name || ''
        break
      default:
        aValue = a.createdAt
        bValue = b.createdAt
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  return sorted
}

// Filter transactions by various criteria
export function filterTransactions(transactions, filters) {
  return transactions.filter(transaction => {
    // Type filter
    if (filters.type && transaction.type !== filters.type) {
      return false
    }

    // Supplier filter
    if (filters.supplierId && transaction.supplierId !== filters.supplierId) {
      return false
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
      const transactionDate = new Date(transaction.transactionDate)
      
      if (filters.startDate && transactionDate < new Date(filters.startDate)) {
        return false
      }
      
      if (filters.endDate && transactionDate > new Date(filters.endDate)) {
        return false
      }
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const searchableText = [
        transaction.referenceNumber,
        transaction.notes,
        transaction.supplier?.name,
        ...(transaction.items?.map(item => 
          `${item.product?.brand} ${item.product?.name} ${item.product?.sku}`
        ) || [])
      ].join(' ').toLowerCase()

      if (!searchableText.includes(searchTerm)) {
        return false
      }
    }

    return true
  })
}