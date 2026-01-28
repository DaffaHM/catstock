'use client'

// Demo suppliers storage utility for client-side only
const DEMO_SUPPLIERS_KEY = 'demo-suppliers'
const DELETED_SUPPLIERS_KEY = 'deleted-demo-suppliers'

// Base demo suppliers
const BASE_DEMO_SUPPLIERS = [
  {
    id: 'demo-supp-1',
    name: 'PT Supplier A',
    contact: 'Jl. Industri No. 123, Jakarta\nTelp: 021-1234567\nEmail: info@suppliera.com',
    notes: 'Supplier utama untuk cat tembok dan cat kayu. Kualitas bagus, pengiriman tepat waktu.',
    transactionCount: 2,
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString()
  },
  {
    id: 'demo-supp-2',
    name: 'PT Supplier B',
    contact: 'Jl. Perdagangan No. 456, Surabaya\nTelp: 031-7654321\nEmail: sales@supplierb.com',
    notes: 'Spesialis cat besi dan peralatan cat. Harga kompetitif, stok selalu tersedia.',
    transactionCount: 1,
    createdAt: new Date('2024-01-12').toISOString(),
    updatedAt: new Date('2024-01-18').toISOString()
  }
]

// Get deleted supplier IDs
function getDeletedSupplierIds() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const deleted = localStorage.getItem(DELETED_SUPPLIERS_KEY)
    return deleted ? JSON.parse(deleted) : []
  } catch (error) {
    console.error('Error loading deleted suppliers:', error)
    return []
  }
}

// Add supplier ID to deleted list
function addToDeletedSuppliers(supplierId) {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const deleted = getDeletedSupplierIds()
    if (!deleted.includes(supplierId)) {
      deleted.push(supplierId)
      localStorage.setItem(DELETED_SUPPLIERS_KEY, JSON.stringify(deleted))
    }
    return true
  } catch (error) {
    console.error('Error adding to deleted suppliers:', error)
    return false
  }
}

// Get all demo suppliers (base + stored - deleted)
export function getDemoSuppliers() {
  if (typeof window === 'undefined') {
    return BASE_DEMO_SUPPLIERS
  }

  try {
    const stored = localStorage.getItem(DEMO_SUPPLIERS_KEY)
    const deletedIds = getDeletedSupplierIds()
    
    // Start with base suppliers, but exclude deleted ones
    let allSuppliers = BASE_DEMO_SUPPLIERS.filter(supplier => !deletedIds.includes(supplier.id))
    
    if (stored) {
      const parsedSuppliers = JSON.parse(stored)
      // Add stored suppliers that don't already exist and are not deleted
      parsedSuppliers.forEach(supplier => {
        if (!allSuppliers.find(s => s.id === supplier.id) && !deletedIds.includes(supplier.id)) {
          allSuppliers.push(supplier)
        }
      })
    }
    
    // Sort by creation date, newest first
    allSuppliers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    console.log('[getDemoSuppliers] Total suppliers:', allSuppliers.length)
    console.log('[getDemoSuppliers] Deleted IDs:', deletedIds)
    console.log('[getDemoSuppliers] Supplier IDs:', allSuppliers.map(s => s.id))
    
    return allSuppliers
  } catch (error) {
    console.error('Error loading demo suppliers:', error)
    return BASE_DEMO_SUPPLIERS.filter(supplier => !getDeletedSupplierIds().includes(supplier.id))
  }
}

// Save a new demo supplier
export function saveDemoSupplier(supplier) {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const stored = localStorage.getItem(DEMO_SUPPLIERS_KEY)
    const existingSuppliers = stored ? JSON.parse(stored) : []
    
    // Add new supplier if not exists, or update if exists
    const existingIndex = existingSuppliers.findIndex(s => s.id === supplier.id)
    if (existingIndex >= 0) {
      existingSuppliers[existingIndex] = supplier
    } else {
      existingSuppliers.push(supplier)
    }
    
    localStorage.setItem(DEMO_SUPPLIERS_KEY, JSON.stringify(existingSuppliers))
    console.log('Saved demo supplier:', supplier)
    return true
  } catch (error) {
    console.error('Error saving demo supplier:', error)
    return false
  }
}

// Delete a demo supplier
export function deleteDemoSupplier(supplierId) {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    // Add to deleted list (for base suppliers)
    addToDeletedSuppliers(supplierId)
    
    // Remove from stored suppliers (for custom suppliers)
    const stored = localStorage.getItem(DEMO_SUPPLIERS_KEY)
    if (stored) {
      const existingSuppliers = JSON.parse(stored)
      const filteredSuppliers = existingSuppliers.filter(s => s.id !== supplierId)
      localStorage.setItem(DEMO_SUPPLIERS_KEY, JSON.stringify(filteredSuppliers))
    }
    
    console.log('Deleted demo supplier:', supplierId)
    return true
  } catch (error) {
    console.error('Error deleting demo supplier:', error)
    return false
  }
}

// Update a demo supplier
export function updateDemoSupplier(supplierId, updates) {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = localStorage.getItem(DEMO_SUPPLIERS_KEY)
    const existingSuppliers = stored ? JSON.parse(stored) : []
    
    const existingIndex = existingSuppliers.findIndex(s => s.id === supplierId)
    if (existingIndex >= 0) {
      existingSuppliers[existingIndex] = {
        ...existingSuppliers[existingIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      localStorage.setItem(DEMO_SUPPLIERS_KEY, JSON.stringify(existingSuppliers))
      return existingSuppliers[existingIndex]
    }
    
    return null
  } catch (error) {
    console.error('Error updating demo supplier:', error)
    return null
  }
}

// Search demo suppliers
export function searchDemoSuppliers(query, options = {}) {
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options

  let suppliers = getDemoSuppliers()
  
  // Filter by search query
  if (query && query.trim()) {
    const searchLower = query.toLowerCase()
    suppliers = suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(searchLower) ||
      (supplier.contact && supplier.contact.toLowerCase().includes(searchLower)) ||
      (supplier.notes && supplier.notes.toLowerCase().includes(searchLower))
    )
  }
  
  // Sort suppliers
  suppliers.sort((a, b) => {
    let aVal = a[sortBy]
    let bVal = b[sortBy]
    
    // Handle date sorting
    if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      aVal = new Date(aVal)
      bVal = new Date(bVal)
    }
    
    if (sortOrder === 'desc') {
      return bVal > aVal ? 1 : -1
    }
    return aVal > bVal ? 1 : -1
  })
  
  // Paginate
  const totalCount = suppliers.length
  const skip = (page - 1) * limit
  const paginatedSuppliers = suppliers.slice(skip, skip + limit)
  
  return {
    suppliers: paginatedSuppliers,
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

// Reset all demo data (clear localStorage)
export function resetDemoSuppliers() {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    localStorage.removeItem(DEMO_SUPPLIERS_KEY)
    localStorage.removeItem(DELETED_SUPPLIERS_KEY)
    console.log('Reset demo suppliers data')
    return true
  } catch (error) {
    console.error('Error resetting demo suppliers:', error)
    return false
  }
}