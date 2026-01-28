'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { getQuickSession } from '@/lib/auth-quick'
import { 
  supplierSchema, 
  supplierUpdateSchema, 
  supplierSearchSchema,
  supplierIdSchema,
  validateSupplierData,
  validateSupplierUpdate,
  validateSupplierSearch,
  normalizeSupplierName
} from '@/lib/validations/supplier'

// Demo suppliers data
const DEMO_SUPPLIERS = [
  {
    id: 'demo-supp-1',
    name: 'PT Supplier A',
    contact: 'Jl. Industri No. 123, Jakarta\nTelp: 021-1234567\nEmail: info@suppliera.com',
    notes: 'Supplier utama untuk cat tembok dan cat kayu. Kualitas bagus, pengiriman tepat waktu.',
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString()
  },
  {
    id: 'demo-supp-2',
    name: 'PT Supplier B',
    contact: 'Jl. Perdagangan No. 456, Surabaya\nTelp: 031-7654321\nEmail: sales@supplierb.com',
    notes: 'Spesialis cat besi dan peralatan cat. Harga kompetitif, stok selalu tersedia.',
    createdAt: new Date('2024-01-12').toISOString(),
    updatedAt: new Date('2024-01-18').toISOString()
  }
]

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
 * Demo authentication check
 */
async function requireDemoAuth() {
  const useDemoData = await shouldUseDemoData()
  if (useDemoData) {
    return true // Demo mode, always authenticated
  }
  
  // Use regular auth for database mode
  return await requireAuth()
}

// Create a new supplier
export async function createSupplierAction(prevState, formData) {
  try {
    // Require authentication
    await requireAuth()

    // Extract and validate form data
    const rawData = {
      name: formData.get('name'),
      contact: formData.get('contact') || null,
      notes: formData.get('notes') || null
    }

    // Validate input data
    const validation = validateSupplierData(rawData)
    if (!validation.success) {
      return {
        error: 'Please correct the validation errors',
        errors: validation.errors,
        fields: rawData
      }
    }

    const validatedData = validation.data

    // Check for name uniqueness (case-insensitive)
    const normalizedName = normalizeSupplierName(validatedData.name)
    const existingSupplier = await prisma.supplier.findFirst({
      where: { 
        name: { 
          equals: validatedData.name
        }
      },
      select: { id: true }
    })

    if (existingSupplier) {
      return {
        error: 'A supplier with this name already exists',
        errors: { name: 'Supplier name must be unique' },
        fields: rawData
      }
    }

    // Create the supplier
    const supplier = await prisma.supplier.create({
      data: {
        name: validatedData.name,
        contact: validatedData.contact,
        notes: validatedData.notes
      }
    })

    // Revalidate supplier pages
    revalidatePath('/suppliers')
    revalidatePath('/dashboard')

    return {
      success: true,
      supplier: supplier
    }

  } catch (error) {
    console.error('Create supplier error:', error)
    
    const rawData = {
      name: formData.get('name'),
      contact: formData.get('contact') || null,
      notes: formData.get('notes') || null
    }
    
    return {
      error: 'Failed to create supplier. Please try again.',
      fields: rawData
    }
  }
}

// Update an existing supplier
export async function updateSupplierAction(supplierId, prevState, formData) {
  try {
    // Require authentication
    await requireAuth()

    // Validate supplier ID
    let validatedId
    try {
      validatedId = supplierIdSchema.parse(supplierId)
    } catch (error) {
      return {
        error: 'Invalid supplier ID',
        fields: {}
      }
    }

    // Extract form data (only include non-empty values)
    const rawData = {}
    const fields = ['name', 'contact', 'notes']
    
    fields.forEach(field => {
      const value = formData.get(field)
      if (value !== null && value !== '') {
        rawData[field] = value
      }
    })

    // Validate update data
    const validation = validateSupplierUpdate(rawData)
    if (!validation.success) {
      return {
        error: 'Please correct the validation errors',
        errors: validation.errors,
        fields: rawData
      }
    }

    const validatedData = validation.data

    // Check if supplier exists
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id: validatedId },
      select: { id: true, name: true }
    })

    if (!existingSupplier) {
      return {
        error: 'Supplier not found',
        fields: rawData
      }
    }

    // Check name uniqueness if name is being updated
    if (validatedData.name && validatedData.name.toLowerCase() !== existingSupplier.name.toLowerCase()) {
      const nameExists = await prisma.supplier.findFirst({
        where: { 
          name: { 
            equals: validatedData.name
          },
          id: { not: validatedId }
        },
        select: { id: true }
      })

      if (nameExists) {
        return {
          error: 'A supplier with this name already exists',
          errors: { name: 'Supplier name must be unique' },
          fields: rawData
        }
      }
    }

    // Update the supplier
    const updatedSupplier = await prisma.supplier.update({
      where: { id: validatedId },
      data: validatedData
    })

    // Revalidate supplier pages
    revalidatePath('/suppliers')
    revalidatePath(`/suppliers/${validatedId}`)
    revalidatePath('/dashboard')

    return {
      success: true,
      supplier: updatedSupplier
    }

  } catch (error) {
    console.error('Update supplier error:', error)
    
    const rawData = {}
    const fields = ['name', 'contact', 'notes']
    
    fields.forEach(field => {
      const value = formData.get(field)
      if (value !== null && value !== '') {
        rawData[field] = value
      }
    })
    
    return {
      error: 'Failed to update supplier. Please try again.',
      fields: rawData
    }
  }
}

// Delete a supplier
export async function deleteSupplierAction(supplierId) {
  try {
    // Require authentication
    await requireAuth()

    // Validate supplier ID
    let validatedId
    try {
      validatedId = supplierIdSchema.parse(supplierId)
    } catch (error) {
      return {
        error: 'Invalid supplier ID'
      }
    }

    // Check if supplier has associated transactions
    const transactionCount = await prisma.stockTransaction.count({
      where: { supplierId: validatedId }
    })

    if (transactionCount > 0) {
      return {
        error: 'Cannot delete supplier with associated stock transactions'
      }
    }

    // Delete the supplier
    await prisma.supplier.delete({
      where: { id: validatedId }
    })

    // Revalidate supplier pages
    revalidatePath('/suppliers')
    revalidatePath('/dashboard')

    return {
      success: true
    }

  } catch (error) {
    console.error('Delete supplier error:', error)
    
    if (error.code === 'P2025') {
      return {
        error: 'Supplier not found'
      }
    }

    return {
      error: 'Failed to delete supplier. Please try again.'
    }
  }
}

// Get suppliers with search, filtering, and pagination
export async function getSuppliersAction(searchParams = {}) {
  try {
    // Check authentication (demo or regular)
    await requireDemoAuth()

    // Check if we should use demo data
    const useDemoData = await shouldUseDemoData()
    
    if (useDemoData) {
      console.log('[Suppliers] Using demo data')
      
      // Validate search parameters
      const validation = validateSupplierSearch(searchParams)
      if (!validation.success) {
        throw new Error('Invalid search parameters')
      }

      const { search, page, limit, sortBy, sortOrder } = validation.data
      
      // Filter demo suppliers
      let filteredSuppliers = [...DEMO_SUPPLIERS]
      
      if (search) {
        const searchLower = search.toLowerCase()
        filteredSuppliers = filteredSuppliers.filter(supplier =>
          supplier.name.toLowerCase().includes(searchLower) ||
          (supplier.contact && supplier.contact.toLowerCase().includes(searchLower))
        )
      }
      
      // Sort suppliers
      filteredSuppliers.sort((a, b) => {
        const aVal = a[sortBy]
        const bVal = b[sortBy]
        if (sortOrder === 'desc') {
          return bVal > aVal ? 1 : -1
        }
        return aVal > bVal ? 1 : -1
      })
      
      // Add transaction count (demo)
      const suppliersWithCounts = filteredSuppliers.map(supplier => ({
        ...supplier,
        transactionCount: supplier.id === 'demo-supp-1' ? 2 : 1 // Demo transaction counts
      }))
      
      // Paginate
      const totalCount = suppliersWithCounts.length
      const skip = (page - 1) * limit
      const paginatedSuppliers = suppliersWithCounts.slice(skip, skip + limit)
      
      return {
        success: true,
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

    // Regular database logic
    const validation = validateSupplierSearch(searchParams)
    if (!validation.success) {
      throw new Error('Invalid search parameters')
    }

    const { search, page, limit, sortBy, sortOrder } = validation.data

    // Build where clause for filtering
    const where = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { contact: { contains: search } }
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get suppliers with optimized query
    const [suppliers, totalCount] = await Promise.all([
      prisma.supplier.findMany({
        where,
        select: {
          id: true,
          name: true,
          contact: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          // Get transaction count for each supplier
          _count: {
            select: {
              transactions: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.supplier.count({ where })
    ])

    // Add transaction count to each supplier
    const suppliersWithCounts = suppliers.map(supplier => ({
      ...supplier,
      transactionCount: supplier._count.transactions,
      _count: undefined // Remove from response
    }))

    return {
      success: true,
      suppliers: suppliersWithCounts,
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
    console.error('Get suppliers error:', error)
    
    // Fallback to demo data if database fails
    if (!await shouldUseDemoData()) {
      console.log('[Suppliers] Database failed, falling back to demo data')
      
      const { page = 1, limit = 20 } = searchParams
      const suppliersWithCounts = DEMO_SUPPLIERS.map(supplier => ({
        ...supplier,
        transactionCount: supplier.id === 'demo-supp-1' ? 2 : 1
      }))
      
      const totalCount = suppliersWithCounts.length
      const skip = (page - 1) * limit
      const paginatedSuppliers = suppliersWithCounts.slice(skip, skip + limit)
      
      return {
        success: true,
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
    
    return {
      error: 'Failed to fetch suppliers'
    }
  }
}
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1
      }
    }

  } catch (error) {
    console.error('Get suppliers error:', error)
    return {
      error: 'Failed to fetch suppliers'
    }
  }
}

// Get a single supplier by ID
export async function getSupplierAction(supplierId) {
  try {
    // Require authentication
    await requireAuth()

    // Validate supplier ID
    let validatedId
    try {
      validatedId = supplierIdSchema.parse(supplierId)
    } catch (error) {
      return {
        error: 'Invalid supplier ID'
      }
    }

    // Get supplier with transaction count and recent transactions
    const supplier = await prisma.supplier.findUnique({
      where: { id: validatedId },
      include: {
        _count: {
          select: {
            transactions: true
          }
        },
        transactions: {
          select: {
            id: true,
            referenceNumber: true,
            type: true,
            transactionDate: true,
            totalValue: true
          },
          orderBy: { transactionDate: 'desc' },
          take: 10 // Get last 10 transactions
        }
      }
    })

    if (!supplier) {
      return {
        error: 'Supplier not found'
      }
    }

    // Format supplier data
    const supplierWithDetails = {
      ...supplier,
      transactionCount: supplier._count.transactions,
      recentTransactions: supplier.transactions,
      _count: undefined,
      transactions: undefined
    }

    return {
      success: true,
      supplier: supplierWithDetails
    }

  } catch (error) {
    console.error('Get supplier error:', error)
    return {
      error: 'Failed to fetch supplier'
    }
  }
}

// Search suppliers for autocomplete
export async function searchSuppliersAction(query) {
  try {
    // Require authentication
    await requireAuth()

    if (!query || query.length < 2) {
      return {
        success: true,
        suppliers: []
      }
    }

    // Search suppliers with minimal data for autocomplete
    const suppliers = await prisma.supplier.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { contact: { contains: query } }
        ]
      },
      select: {
        id: true,
        name: true,
        contact: true
      },
      take: 20,
      orderBy: { name: 'asc' }
    })

    return {
      success: true,
      suppliers: suppliers
    }

  } catch (error) {
    console.error('Search suppliers error:', error)
    return {
      error: 'Failed to search suppliers'
    }
  }
}

// Get supplier statistics
export async function getSupplierStatsAction() {
  try {
    // Require authentication
    await requireAuth()

    const [
      totalSuppliers,
      suppliersWithTransactions,
      recentSuppliers
    ] = await Promise.all([
      prisma.supplier.count(),
      prisma.supplier.count({
        where: {
          transactions: {
            some: {}
          }
        }
      }),
      prisma.supplier.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      })
    ])

    return {
      success: true,
      stats: {
        totalSuppliers,
        suppliersWithTransactions,
        recentSuppliers,
        suppliersWithoutTransactions: totalSuppliers - suppliersWithTransactions
      }
    }

  } catch (error) {
    console.error('Get supplier stats error:', error)
    return {
      error: 'Failed to fetch supplier statistics'
    }
  }
}

// Get suppliers for transaction selection
export async function getSuppliersForTransactionAction() {
  try {
    // Require authentication
    await requireAuth()

    const suppliers = await prisma.supplier.findMany({
      select: {
        id: true,
        name: true,
        contact: true
      },
      orderBy: { name: 'asc' }
    })

    return {
      success: true,
      suppliers: suppliers
    }

  } catch (error) {
    console.error('Get suppliers for transaction error:', error)
    return {
      error: 'Failed to fetch suppliers'
    }
  }
}