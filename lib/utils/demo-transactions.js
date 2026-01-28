'use client'

// Demo transactions storage utility for client-side only
const DEMO_TRANSACTIONS_KEY = 'demo-transactions'

// Generate unique reference number for demo
function generateDemoReferenceNumber() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  
  // Get existing transactions to find next sequence
  const stored = localStorage.getItem(DEMO_TRANSACTIONS_KEY)
  const existingTransactions = stored ? JSON.parse(stored) : []
  
  const prefix = `TXN-${year}${month}${day}`
  const todayTransactions = existingTransactions.filter(t => 
    t.referenceNumber.startsWith(prefix)
  )
  
  const sequence = todayTransactions.length + 1
  return `${prefix}-${String(sequence).padStart(4, '0')}`
}

// Create a demo transaction
export function createDemoTransaction(transactionData) {
  if (typeof window === 'undefined') {
    return { error: 'Not available on server side' }
  }

  try {
    // Validate stock for OUT transactions
    if (transactionData.type === 'OUT') {
      const storedProducts = localStorage.getItem('demo-products')
      if (storedProducts) {
        const products = JSON.parse(storedProducts)
        
        for (const item of transactionData.items) {
          const product = products.find(p => p.id === item.productId)
          const currentStock = product ? (product.currentStock || 0) : 0
          
          if (currentStock < item.quantity) {
            return { 
              success: false, 
              error: `Insufficient stock for ${product?.name || 'product'}. Available: ${currentStock}, Requested: ${item.quantity}` 
            }
          }
        }
      }
    }
    
    // Generate reference number
    const referenceNumber = generateDemoReferenceNumber()
    
    // Calculate total value
    let totalValue = 0
    if (transactionData.items && transactionData.items.length > 0) {
      totalValue = transactionData.items.reduce((sum, item) => {
        const price = item.unitCost || item.unitPrice || 0
        return sum + (price * item.quantity)
      }, 0)
    }
    
    // Create transaction object
    const transaction = {
      id: `demo-txn-${Date.now()}`,
      referenceNumber,
      type: transactionData.type,
      transactionDate: transactionData.transactionDate,
      supplierId: transactionData.supplierId,
      userId: 'demo-user',
      notes: transactionData.notes,
      totalValue,
      items: transactionData.items.map((item, index) => ({
        id: `demo-item-${Date.now()}-${index}`,
        productId: item.productId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        unitPrice: item.unitPrice,
        product: item.product // Include product details for display
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Save to localStorage
    const stored = localStorage.getItem(DEMO_TRANSACTIONS_KEY)
    const existingTransactions = stored ? JSON.parse(stored) : []
    existingTransactions.push(transaction)
    localStorage.setItem(DEMO_TRANSACTIONS_KEY, JSON.stringify(existingTransactions))
    
    console.log('Demo transaction created:', transaction)
    
    // Update product stock in demo mode (simplified)
    updateDemoProductStock(transactionData.items, transactionData.type)
    
    // Notify dashboard and other components
    window.dispatchEvent(new CustomEvent('transactionsUpdated', { detail: transaction }))
    
    return { success: true, data: transaction }
    
  } catch (error) {
    console.error('Error creating demo transaction:', error)
    return { error: 'Failed to create demo transaction' }
  }
}

// Update product stock for demo mode
function updateDemoProductStock(items, transactionType) {
  try {
    const storedProducts = localStorage.getItem('demo-products')
    if (!storedProducts) return
    
    const products = JSON.parse(storedProducts)
    let updated = false
    
    items.forEach(item => {
      const productIndex = products.findIndex(p => p.id === item.productId)
      if (productIndex >= 0) {
        const currentStock = products[productIndex].currentStock || 0
        
        // Update stock based on transaction type
        switch (transactionType) {
          case 'IN':
            products[productIndex].currentStock = currentStock + item.quantity
            updated = true
            break
          case 'OUT':
            products[productIndex].currentStock = Math.max(0, currentStock - item.quantity)
            updated = true
            break
          case 'ADJUST':
            products[productIndex].currentStock = item.quantity // Direct adjustment
            updated = true
            break
        }
      }
    })
    
    if (updated) {
      localStorage.setItem('demo-products', JSON.stringify(products))
      // Notify other components that products have been updated
      window.dispatchEvent(new CustomEvent('productsUpdated'))
    }
    
  } catch (error) {
    console.error('Error updating demo product stock:', error)
  }
}

// Get demo transactions
export function getDemoTransactions(filters = {}) {
  if (typeof window === 'undefined') {
    return { transactions: [], pagination: { page: 1, limit: 20, totalCount: 0, totalPages: 0 } }
  }

  try {
    const stored = localStorage.getItem(DEMO_TRANSACTIONS_KEY)
    let transactions = stored ? JSON.parse(stored) : []
    
    // Apply filters
    if (filters.type) {
      transactions = transactions.filter(t => t.type === filters.type)
    }
    
    if (filters.supplierId) {
      transactions = transactions.filter(t => t.supplierId === filters.supplierId)
    }
    
    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate)
      const endDate = new Date(filters.endDate)
      transactions = transactions.filter(t => {
        const txnDate = new Date(t.transactionDate)
        return txnDate >= startDate && txnDate <= endDate
      })
    }
    
    // Sort by date, newest first
    transactions.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))
    
    // Paginate
    const page = filters.page || 1
    const limit = filters.limit || 20
    const totalCount = transactions.length
    const skip = (page - 1) * limit
    const paginatedTransactions = transactions.slice(skip, skip + limit)
    
    return {
      transactions: paginatedTransactions,
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
    console.error('Error loading demo transactions:', error)
    return { transactions: [], pagination: { page: 1, limit: 20, totalCount: 0, totalPages: 0 } }
  }
}

// Reset demo transactions
export function resetDemoTransactions() {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    localStorage.removeItem(DEMO_TRANSACTIONS_KEY)
    console.log('Reset demo transactions data')
    return true
  } catch (error) {
    console.error('Error resetting demo transactions:', error)
    return false
  }
}