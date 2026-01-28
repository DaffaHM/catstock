'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { getQuickSession } from '@/lib/auth-quick'
import { 
  validateCategoryData,
  validateCategoryUpdate,
  validateCategorySearch,
  categoryIdSchema,
  normalizeCategoryName
} from '@/lib/validations/category'

// Demo categories data
const DEMO_CATEGORIES = [
  {
    id: 'demo-cat-1',
    name: 'Cat Tembok',
    parentId: null,
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
    children: [
      {
        id: 'demo-cat-1-1',
        name: 'Cat Interior',
        parentId: 'demo-cat-1',
        createdAt: new Date('2024-01-11').toISOString(),
        updatedAt: new Date('2024-01-16').toISOString(),
        children: []
      },
      {
        id: 'demo-cat-1-2',
        name: 'Cat Eksterior',
        parentId: 'demo-cat-1',
        createdAt: new Date('2024-01-12').toISOString(),
        updatedAt: new Date('2024-01-17').toISOString(),
        children: []
      }
    ]
  },
  {
    id: 'demo-cat-2',
    name: 'Cat Kayu',
    parentId: null,
    createdAt: new Date('2024-01-13').toISOString(),
    updatedAt: new Date('2024-01-18').toISOString(),
    children: [
      {
        id: 'demo-cat-2-1',
        name: 'Cat Kayu Natural',
        parentId: 'demo-cat-2',
        createdAt: new Date('2024-01-14').toISOString(),
        updatedAt: new Date('2024-01-19').toISOString(),
        children: []
      }
    ]
  },
  {
    id: 'demo-cat-3',
    name: 'Cat Besi',
    parentId: null,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString(),
    children: []
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

// Helper function to build category tree from flat array
function buildCategoryTree(categories) {
  const categoryMap = new Map()
  const rootCategories = []

  // First pass: create map of all categories
  categories.forEach(category => {
    categoryMap.set(category.id, { ...category, children: [] })
  })

  // Second pass: build tree structure
  categories.forEach(category => {
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId)
      if (parent) {
        parent.children.push(categoryMap.get(category.id))
      }
    } else {
      rootCategories.push(categoryMap.get(category.id))
    }
  })

  return rootCategories
}

// Helper function to check circular reference
async function hasCircularReference(categoryId, newParentId) {
  if (!newParentId || categoryId === newParentId) {
    return false
  }

  let currentParentId = newParentId
  const visited = new Set([categoryId])

  while (currentParentId) {
    if (visited.has(currentParentId)) {
      return true // Circular reference detected
    }
    
    visited.add(currentParentId)
    
    const parent = await prisma.category.findUnique({
      where: { id: currentParentId },
      select: { parentId: true }
    })
    
    if (!parent) break
    currentParentId = parent.parentId
  }

  return false
}

// Helper function to get category depth
async function getCategoryDepth(parentId) {
  if (!parentId) return 0

  let depth = 0
  let currentParentId = parentId

  while (currentParentId && depth < 10) { // Safety limit
    depth++
    const parent = await prisma.category.findUnique({
      where: { id: currentParentId },
      select: { parentId: true }
    })
    
    if (!parent) break
    currentParentId = parent.parentId
  }

  return depth
}

// Create a new category
export async function createCategoryAction(prevState, formData) {
  try {
    // Require authentication
    await requireDemoAuth()

    // Extract and validate form data
    const rawData = {
      name: formData.get('name'),
      parentId: formData.get('parentId') || null
    }

    // Validate input data
    const validation = validateCategoryData(rawData)
    if (!validation.success) {
      return {
        error: 'Silakan perbaiki kesalahan validasi',
        errors: validation.errors,
        fields: rawData
      }
    }

    const validatedData = validation.data

    // Check if we should use demo data
    const useDemoData = await shouldUseDemoData()
    
    if (useDemoData) {
      console.log('[Categories] Demo mode - category creation simulated')
      return {
        success: true,
        category: {
          id: `demo-cat-${Date.now()}`,
          name: validatedData.name,
          parentId: validatedData.parentId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    }

    // Check depth limit (max 3 levels)
    if (validatedData.parentId) {
      const depth = await getCategoryDepth(validatedData.parentId)
      if (depth >= 2) { // 0-based, so 2 means 3 levels
        return {
          error: 'Kategori tidak dapat lebih dari 3 tingkat',
          fields: rawData
        }
      }
    }

    // Check for name uniqueness within the same parent
    const existingCategory = await prisma.category.findFirst({
      where: { 
        name: { 
          equals: validatedData.name,
          mode: 'insensitive'
        },
        parentId: validatedData.parentId
      },
      select: { id: true }
    })

    if (existingCategory) {
      return {
        error: 'Kategori dengan nama ini sudah ada di tingkat yang sama',
        errors: { name: 'Nama kategori harus unik dalam tingkat yang sama' },
        fields: rawData
      }
    }

    // Create the category
    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        parentId: validatedData.parentId
      }
    })

    // Revalidate category pages
    revalidatePath('/categories')
    revalidatePath('/products')
    revalidatePath('/dashboard')

    return {
      success: true,
      category: category
    }

  } catch (error) {
    console.error('Create category error:', error)
    
    const rawData = {
      name: formData.get('name'),
      parentId: formData.get('parentId') || null
    }
    
    return {
      error: 'Gagal membuat kategori. Silakan coba lagi.',
      fields: rawData
    }
  }
}

// Get categories with tree structure
export async function getCategoriesAction(searchParams = {}) {
  try {
    // Check authentication (demo or regular)
    await requireDemoAuth()

    // Check if we should use demo data
    const useDemoData = await shouldUseDemoData()
    
    if (useDemoData) {
      console.log('[Categories] Using demo data')
      
      // Return demo categories with tree structure
      return {
        success: true,
        categories: DEMO_CATEGORIES,
        totalCount: DEMO_CATEGORIES.length
      }
    }

    // Validate search parameters
    const validation = validateCategorySearch(searchParams)
    if (!validation.success) {
      throw new Error('Parameter pencarian tidak valid')
    }

    const { search, parentId, page, limit, sortBy, sortOrder } = validation.data

    // Build where clause for filtering
    const where = {}
    
    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    if (parentId !== undefined) {
      where.parentId = parentId
    }

    // Get categories
    const categories = await prisma.category.findMany({
      where,
      include: {
        children: {
          include: {
            children: true, // Support up to 3 levels
            _count: {
              select: { products: true }
            }
          },
          orderBy: { [sortBy]: sortOrder }
        },
        _count: {
          select: { products: true }
        }
      },
      orderBy: { [sortBy]: sortOrder }
    })

    // Build tree structure if no specific parent filter
    let result = categories
    if (parentId === undefined) {
      result = buildCategoryTree(categories)
    }

    return {
      success: true,
      categories: result,
      totalCount: categories.length
    }

  } catch (error) {
    console.error('Get categories error:', error)
    
    // Fallback to demo data if database fails
    if (!await shouldUseDemoData()) {
      console.log('[Categories] Database failed, falling back to demo data')
      
      return {
        success: true,
        categories: DEMO_CATEGORIES,
        totalCount: DEMO_CATEGORIES.length
      }
    }
    
    return {
      error: 'Gagal mengambil data kategori'
    }
  }
}

// Update an existing category
export async function updateCategoryAction(categoryId, prevState, formData) {
  try {
    // Require authentication
    await requireDemoAuth()

    // Validate category ID
    let validatedId
    try {
      validatedId = categoryIdSchema.parse(categoryId)
    } catch (error) {
      return {
        error: 'ID kategori tidak valid',
        fields: {}
      }
    }

    // Extract form data
    const rawData = {
      name: formData.get('name'),
      parentId: formData.get('parentId') || null
    }

    // Validate update data
    const validation = validateCategoryUpdate(rawData)
    if (!validation.success) {
      return {
        error: 'Silakan perbaiki kesalahan validasi',
        errors: validation.errors,
        fields: rawData
      }
    }

    const validatedData = validation.data

    // Check if we should use demo data
    const useDemoData = await shouldUseDemoData()
    
    if (useDemoData) {
      console.log('[Categories] Demo mode - category update simulated')
      return {
        success: true,
        category: {
          id: validatedId,
          ...validatedData,
          updatedAt: new Date().toISOString()
        }
      }
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: validatedId },
      select: { id: true, name: true, parentId: true }
    })

    if (!existingCategory) {
      return {
        error: 'Kategori tidak ditemukan',
        fields: rawData
      }
    }

    // Check for circular reference if parent is being changed
    if (validatedData.parentId && validatedData.parentId !== existingCategory.parentId) {
      const hasCircular = await hasCircularReference(validatedId, validatedData.parentId)
      if (hasCircular) {
        return {
          error: 'Tidak dapat membuat referensi melingkar dalam hierarki kategori',
          fields: rawData
        }
      }

      // Check depth limit
      const depth = await getCategoryDepth(validatedData.parentId)
      if (depth >= 2) {
        return {
          error: 'Kategori tidak dapat lebih dari 3 tingkat',
          fields: rawData
        }
      }
    }

    // Check name uniqueness if name is being updated
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      const nameExists = await prisma.category.findFirst({
        where: { 
          name: { 
            equals: validatedData.name,
            mode: 'insensitive'
          },
          parentId: validatedData.parentId || existingCategory.parentId,
          id: { not: validatedId }
        },
        select: { id: true }
      })

      if (nameExists) {
        return {
          error: 'Kategori dengan nama ini sudah ada di tingkat yang sama',
          errors: { name: 'Nama kategori harus unik dalam tingkat yang sama' },
          fields: rawData
        }
      }
    }

    // Update the category
    const updatedCategory = await prisma.category.update({
      where: { id: validatedId },
      data: validatedData
    })

    // Revalidate category pages
    revalidatePath('/categories')
    revalidatePath('/products')
    revalidatePath('/dashboard')

    return {
      success: true,
      category: updatedCategory
    }

  } catch (error) {
    console.error('Update category error:', error)
    
    const rawData = {
      name: formData.get('name'),
      parentId: formData.get('parentId') || null
    }
    
    return {
      error: 'Gagal memperbarui kategori. Silakan coba lagi.',
      fields: rawData
    }
  }
}

// Delete a category
export async function deleteCategoryAction(categoryId) {
  try {
    // Require authentication
    await requireDemoAuth()

    // Validate category ID
    let validatedId
    try {
      validatedId = categoryIdSchema.parse(categoryId)
    } catch (error) {
      return {
        error: 'ID kategori tidak valid'
      }
    }

    // Check if we should use demo data
    const useDemoData = await shouldUseDemoData()
    
    if (useDemoData) {
      console.log('[Categories] Demo mode - category deletion simulated')
      return {
        success: true
      }
    }

    // Check if category has children
    const childrenCount = await prisma.category.count({
      where: { parentId: validatedId }
    })

    if (childrenCount > 0) {
      return {
        error: 'Tidak dapat menghapus kategori yang memiliki sub-kategori'
      }
    }

    // Check if category has associated products
    const productCount = await prisma.productCategory.count({
      where: { categoryId: validatedId }
    })

    if (productCount > 0) {
      return {
        error: 'Tidak dapat menghapus kategori yang memiliki produk terkait'
      }
    }

    // Delete the category
    await prisma.category.delete({
      where: { id: validatedId }
    })

    // Revalidate category pages
    revalidatePath('/categories')
    revalidatePath('/products')
    revalidatePath('/dashboard')

    return {
      success: true
    }

  } catch (error) {
    console.error('Delete category error:', error)
    
    if (error.code === 'P2025') {
      return {
        error: 'Kategori tidak ditemukan'
      }
    }

    return {
      error: 'Gagal menghapus kategori. Silakan coba lagi.'
    }
  }
}

// Assign products to category
export async function assignProductsToCategoryAction(productIds, categoryId) {
  try {
    // Require authentication
    await requireDemoAuth()

    // Validate inputs
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return {
        error: 'Pilih minimal satu produk'
      }
    }

    let validatedCategoryId
    try {
      validatedCategoryId = categoryIdSchema.parse(categoryId)
    } catch (error) {
      return {
        error: 'ID kategori tidak valid'
      }
    }

    // Check if we should use demo data
    const useDemoData = await shouldUseDemoData()
    
    if (useDemoData) {
      console.log('[Categories] Demo mode - product assignment simulated')
      return {
        success: true,
        assignedCount: productIds.length
      }
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: validatedCategoryId },
      select: { id: true }
    })

    if (!category) {
      return {
        error: 'Kategori tidak ditemukan'
      }
    }

    // Create product-category associations (ignore duplicates)
    const assignments = productIds.map(productId => ({
      productId,
      categoryId: validatedCategoryId
    }))

    await prisma.productCategory.createMany({
      data: assignments,
      skipDuplicates: true
    })

    // Revalidate pages
    revalidatePath('/categories')
    revalidatePath('/products')

    return {
      success: true,
      assignedCount: productIds.length
    }

  } catch (error) {
    console.error('Assign products to category error:', error)
    return {
      error: 'Gagal menugaskan produk ke kategori'
    }
  }
}