'use client'

// Demo products storage utility for client-side only
const DEMO_PRODUCTS_KEY = 'demo-products'
const DELETED_PRODUCTS_KEY = 'deleted-demo-products'

// Base demo products
const BASE_DEMO_PRODUCTS = [
  {
    id: 'demo-prod-1',
    sku: 'CTB-001',
    brand: 'Brand A',
    name: 'Cat Tembok Putih 5L',
    category: 'Cat Tembok',
    size: '5',
    unit: 'Liter',
    purchasePrice: 85000,
    sellingPrice: 120000,
    minimumStock: 10,
    currentStock: 5,
    transactionCount: 0,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString()
  },
  {
    id: 'demo-prod-2',
    sku: 'CTB-002',
    brand: 'Brand A',
    name: 'Cat Tembok Biru 5L',
    category: 'Cat Tembok',
    size: '5',
    unit: 'Liter',
    purchasePrice: 90000,
    sellingPrice: 125000,
    minimumStock: 8,
    currentStock: 12,
    transactionCount: 0,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-18').toISOString()
  },
  {
    id: 'demo-prod-3',
    sku: 'CKY-001',
    brand: 'Brand B',
    name: 'Cat Kayu Coklat 2.5L',
    category: 'Cat Kayu',
    size: '2.5',
    unit: 'Liter',
    purchasePrice: 65000,
    sellingPrice: 95000,
    minimumStock: 8,
    currentStock: 2,
    transactionCount: 0,
    createdAt: new Date('2024-01-16').toISOString(),
    updatedAt: new Date('2024-01-19').toISOString()
  },
  {
    id: 'demo-prod-4',
    sku: 'CKY-002',
    brand: 'Brand B',
    name: 'Cat Kayu Merah 1L',
    category: 'Cat Kayu',
    size: '1',
    unit: 'Liter',
    purchasePrice: 35000,
    sellingPrice: 50000,
    minimumStock: 15,
    currentStock: 18,
    transactionCount: 0,
    createdAt: new Date('2024-01-16').toISOString(),
    updatedAt: new Date('2024-01-21').toISOString()
  },
  {
    id: 'demo-prod-5',
    sku: 'CBS-001',
    brand: 'Brand C',
    name: 'Cat Besi Hitam 1L',
    category: 'Cat Besi',
    size: '1',
    unit: 'Liter',
    purchasePrice: 45000,
    sellingPrice: 65000,
    minimumStock: 12,
    currentStock: 8,
    transactionCount: 0,
    createdAt: new Date('2024-01-17').toISOString(),
    updatedAt: new Date('2024-01-22').toISOString()
  },
  {
    id: 'demo-prod-6',
    sku: 'CBS-002',
    brand: 'Brand C',
    name: 'Cat Besi Silver 1L',
    category: 'Cat Besi',
    size: '1',
    unit: 'Liter',
    purchasePrice: 48000,
    sellingPrice: 68000,
    minimumStock: 10,
    currentStock: 14,
    transactionCount: 0,
    createdAt: new Date('2024-01-17').toISOString(),
    updatedAt: new Date('2024-01-23').toISOString()
  },
  {
    id: 'demo-prod-7',
    sku: 'THN-001',
    brand: 'Brand A',
    name: 'Thinner 1L',
    category: 'Pelarut',
    size: '1',
    unit: 'Liter',
    purchasePrice: 25000,
    sellingPrice: 35000,
    minimumStock: 20,
    currentStock: 25,
    transactionCount: 0,
    createdAt: new Date('2024-01-18').toISOString(),
    updatedAt: new Date('2024-01-24').toISOString()
  },
  {
    id: 'demo-prod-8',
    sku: 'KUS-001',
    brand: 'Brand B',
    name: 'Kuas Cat 2 inch',
    category: 'Alat',
    size: '2',
    unit: 'Inch',
    purchasePrice: 15000,
    sellingPrice: 25000,
    minimumStock: 30,
    currentStock: 45,
    transactionCount: 0,
    createdAt: new Date('2024-01-18').toISOString(),
    updatedAt: new Date('2024-01-25').toISOString()
  }
]

// Get deleted product IDs
function getDeletedProductIds() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const deleted = localStorage.getItem(DELETED_PRODUCTS_KEY)
    return deleted ? JSON.parse(deleted) : []
  } catch (error) {
    console.error('Error loading deleted products:', error)
    return []
  }
}

// Add product ID to deleted list
function addToDeletedProducts(productId) {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const deleted = getDeletedProductIds()
    if (!deleted.includes(productId)) {
      deleted.push(productId)
      localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(deleted))
    }
    return true
  } catch (error) {
    console.error('Error adding to deleted products:', error)
    return false
  }
}

// Get all demo products (base + stored - deleted)
export function getDemoProducts() {
  if (typeof window === 'undefined') {
    return BASE_DEMO_PRODUCTS
  }

  try {
    const stored = localStorage.getItem(DEMO_PRODUCTS_KEY)
    const deletedIds = getDeletedProductIds()
    
    // Start with base products, but exclude deleted ones
    let allProducts = BASE_DEMO_PRODUCTS.filter(product => !deletedIds.includes(product.id))
    
    if (stored) {
      const parsedProducts = JSON.parse(stored)
      // Add stored products that don't already exist and are not deleted
      parsedProducts.forEach(product => {
        if (!allProducts.find(p => p.id === product.id) && !deletedIds.includes(product.id)) {
          allProducts.push(product)
        }
      })
    }
    
    // Sort by creation date, newest first
    allProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    console.log('[getDemoProducts] Total products:', allProducts.length)
    console.log('[getDemoProducts] Deleted IDs:', deletedIds)
    
    return allProducts
  } catch (error) {
    console.error('Error loading demo products:', error)
    return BASE_DEMO_PRODUCTS.filter(product => !getDeletedProductIds().includes(product.id))
  }
}

// Save a new demo product
export function saveDemoProduct(product) {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const stored = localStorage.getItem(DEMO_PRODUCTS_KEY)
    const existingProducts = stored ? JSON.parse(stored) : []
    
    // Add new product if not exists, or update if exists
    const existingIndex = existingProducts.findIndex(p => p.id === product.id)
    if (existingIndex >= 0) {
      existingProducts[existingIndex] = product
    } else {
      existingProducts.push(product)
    }
    
    localStorage.setItem(DEMO_PRODUCTS_KEY, JSON.stringify(existingProducts))
    console.log('Saved demo product:', product)
    return true
  } catch (error) {
    console.error('Error saving demo product:', error)
    return false
  }
}

// Delete a demo product
export function deleteDemoProduct(productId) {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    // Add to deleted list (for base products)
    addToDeletedProducts(productId)
    
    // Remove from stored products (for custom products)
    const stored = localStorage.getItem(DEMO_PRODUCTS_KEY)
    if (stored) {
      const existingProducts = JSON.parse(stored)
      const filteredProducts = existingProducts.filter(p => p.id !== productId)
      localStorage.setItem(DEMO_PRODUCTS_KEY, JSON.stringify(filteredProducts))
    }
    
    console.log('Deleted demo product:', productId)
    return true
  } catch (error) {
    console.error('Error deleting demo product:', error)
    return false
  }
}

// Update a demo product
export function updateDemoProduct(productId, updates) {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = localStorage.getItem(DEMO_PRODUCTS_KEY)
    const existingProducts = stored ? JSON.parse(stored) : []
    
    const existingIndex = existingProducts.findIndex(p => p.id === productId)
    if (existingIndex >= 0) {
      existingProducts[existingIndex] = {
        ...existingProducts[existingIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      localStorage.setItem(DEMO_PRODUCTS_KEY, JSON.stringify(existingProducts))
      return existingProducts[existingIndex]
    }
    
    return null
  } catch (error) {
    console.error('Error updating demo product:', error)
    return null
  }
}

// Search demo products
export function searchDemoProducts(query, options = {}) {
  const {
    page = 1,
    limit = 20,
    category = '',
    brand = '',
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options

  let products = getDemoProducts()
  
  // Filter by search query
  if (query && query.trim()) {
    const searchLower = query.toLowerCase()
    products = products.filter(product =>
      product.name.toLowerCase().includes(searchLower) ||
      product.brand.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower) ||
      product.sku.toLowerCase().includes(searchLower)
    )
  }
  
  // Filter by category
  if (category) {
    products = products.filter(product => product.category === category)
  }
  
  // Filter by brand
  if (brand) {
    products = products.filter(product => 
      product.brand.toLowerCase().includes(brand.toLowerCase())
    )
  }
  
  // Sort products
  products.sort((a, b) => {
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
  const totalCount = products.length
  const skip = (page - 1) * limit
  const paginatedProducts = products.slice(skip, skip + limit)
  
  return {
    products: paginatedProducts,
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

// Get unique categories from demo products
export function getDemoProductCategories() {
  const products = getDemoProducts()
  const categories = [...new Set(products.map(p => p.category))].sort()
  return categories
}

// Get unique brands from demo products
export function getDemoProductBrands() {
  const products = getDemoProducts()
  const brands = [...new Set(products.map(p => p.brand))].sort()
  return brands
}

// Reset all demo data (clear localStorage)
export function resetDemoProducts() {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    localStorage.removeItem(DEMO_PRODUCTS_KEY)
    localStorage.removeItem(DELETED_PRODUCTS_KEY)
    console.log('Reset demo products data')
    return true
  } catch (error) {
    console.error('Error resetting demo products:', error)
    return false
  }
}