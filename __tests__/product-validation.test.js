/**
 * Product Validation Tests
 * Tests for product data models and validation schemas
 */

import {
  productSchema,
  productUpdateSchema,
  productSearchSchema,
  productIdSchema,
  validateProductData,
  validateProductUpdate,
  validateProductSearch,
  validateSKUFormat,
  validatePriceConsistency,
  PRODUCT_CATEGORIES,
  PRODUCT_UNITS
} from '@/lib/validations/product'

describe('Product Validation', () => {
  describe('Product Schema Validation', () => {
    const validProductData = {
      sku: 'TEST-001',
      brand: 'Test Brand',
      name: 'Test Product',
      category: 'Interior Paint',
      size: '1 Gallon',
      unit: 'Each',
      purchasePrice: 25.99,
      sellingPrice: 39.99,
      minimumStock: 10
    }

    test('should validate complete product data', () => {
      const result = productSchema.safeParse(validProductData)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(validProductData)
    })

    test('should validate required fields only', () => {
      const minimalData = {
        sku: 'MIN-001',
        brand: 'Minimal Brand',
        name: 'Minimal Product',
        category: 'Primer',
        size: '1 Quart',
        unit: 'Each'
      }

      const result = productSchema.safeParse(minimalData)
      expect(result.success).toBe(true)
      expect(result.data.purchasePrice).toBeUndefined()
      expect(result.data.sellingPrice).toBeUndefined()
      expect(result.data.minimumStock).toBeUndefined()
    })

    test('should reject missing required fields', () => {
      const incompleteData = {
        sku: 'INC-001',
        brand: 'Incomplete Brand'
        // Missing name, category, size, unit
      }

      const result = productSchema.safeParse(incompleteData)
      expect(result.success).toBe(false)
      expect(result.error.errors).toHaveLength(4) // name, category, size, unit
    })

    test('should validate SKU format', () => {
      const validSKUs = ['ABC123', 'TEST-001', 'PROD_456', 'X1Y2Z3']
      const invalidSKUs = ['abc 123', 'test@001', 'prod#456', '']

      validSKUs.forEach(sku => {
        const result = productSchema.safeParse({ ...validProductData, sku })
        expect(result.success).toBe(true)
      })

      invalidSKUs.forEach(sku => {
        const result = productSchema.safeParse({ ...validProductData, sku })
        expect(result.success).toBe(false)
      })
    })

    test('should validate price constraints', () => {
      // Valid prices
      const validPrices = [0.01, 1.00, 999.99, 9999.99]
      validPrices.forEach(price => {
        const result = productSchema.safeParse({
          ...validProductData,
          purchasePrice: price,
          sellingPrice: price
        })
        expect(result.success).toBe(true)
      })

      // Invalid prices
      const invalidPrices = [0, -1, 100000]
      invalidPrices.forEach(price => {
        const result = productSchema.safeParse({
          ...validProductData,
          purchasePrice: price
        })
        expect(result.success).toBe(false)
      })
    })

    test('should validate minimum stock constraints', () => {
      // Valid minimum stock values
      const validStocks = [0, 1, 100, 999999]
      validStocks.forEach(stock => {
        const result = productSchema.safeParse({
          ...validProductData,
          minimumStock: stock
        })
        expect(result.success).toBe(true)
      })

      // Invalid minimum stock values
      const invalidStocks = [-1, 1.5, 1000000]
      invalidStocks.forEach(stock => {
        const result = productSchema.safeParse({
          ...validProductData,
          minimumStock: stock
        })
        expect(result.success).toBe(false)
      })
    })

    test('should trim whitespace from string fields', () => {
      const dataWithWhitespace = {
        sku: '  TEST-002  ',
        brand: '  Test Brand  ',
        name: '  Test Product  ',
        category: '  Interior Paint  ',
        size: '  1 Gallon  ',
        unit: '  Each  '
      }

      const result = productSchema.safeParse(dataWithWhitespace)
      expect(result.success).toBe(true)
      expect(result.data.sku).toBe('TEST-002')
      expect(result.data.brand).toBe('Test Brand')
      expect(result.data.name).toBe('Test Product')
    })
  })

  describe('Product Update Schema Validation', () => {
    test('should validate partial updates', () => {
      const partialUpdate = {
        name: 'Updated Product Name',
        sellingPrice: 45.99
      }

      const result = productUpdateSchema.safeParse(partialUpdate)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(partialUpdate)
    })

    test('should reject empty updates', () => {
      const result = productUpdateSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    test('should validate single field updates', () => {
      const singleFieldUpdates = [
        { sku: 'NEW-SKU' },
        { brand: 'New Brand' },
        { purchasePrice: 30.00 },
        { minimumStock: 5 }
      ]

      singleFieldUpdates.forEach(update => {
        const result = productUpdateSchema.safeParse(update)
        expect(result.success).toBe(true)
      })
    })
  })

  describe('Product Search Schema Validation', () => {
    test('should validate search parameters with defaults', () => {
      const result = productSearchSchema.safeParse({})
      expect(result.success).toBe(true)
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(50)
      expect(result.data.sortBy).toBe('name')
      expect(result.data.sortOrder).toBe('asc')
    })

    test('should validate custom search parameters', () => {
      const searchParams = {
        search: 'paint',
        category: 'Interior Paint',
        brand: 'Sherwin',
        page: 2,
        limit: 25,
        sortBy: 'brand',
        sortOrder: 'desc'
      }

      const result = productSearchSchema.safeParse(searchParams)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(searchParams)
    })

    test('should enforce pagination constraints', () => {
      // Invalid page numbers
      const invalidPages = [0, -1, 'invalid']
      invalidPages.forEach(page => {
        const result = productSearchSchema.safeParse({ page })
        expect(result.success).toBe(false)
      })

      // Invalid limits
      const invalidLimits = [0, -1, 101, 'invalid']
      invalidLimits.forEach(limit => {
        const result = productSearchSchema.safeParse({ limit })
        expect(result.success).toBe(false)
      })
    })

    test('should validate sort parameters', () => {
      const validSortBy = ['name', 'brand', 'category', 'sku', 'createdAt']
      const validSortOrder = ['asc', 'desc']

      validSortBy.forEach(sortBy => {
        const result = productSearchSchema.safeParse({ sortBy })
        expect(result.success).toBe(true)
      })

      validSortOrder.forEach(sortOrder => {
        const result = productSearchSchema.safeParse({ sortOrder })
        expect(result.success).toBe(true)
      })

      // Invalid sort parameters
      const result1 = productSearchSchema.safeParse({ sortBy: 'invalid' })
      expect(result1.success).toBe(false)

      const result2 = productSearchSchema.safeParse({ sortOrder: 'invalid' })
      expect(result2.success).toBe(false)
    })
  })

  describe('Product ID Schema Validation', () => {
    test('should validate CUID format', () => {
      const validCUIDs = [
        'cl9ebqhxk00008eqt5l8fq5u6',
        'ckx1234567890abcdefghijk',
        'cm1a2b3c4d5e6f7g8h9i0j1k'
      ]

      validCUIDs.forEach(id => {
        const result = productIdSchema.safeParse(id)
        expect(result.success).toBe(true)
      })
    })

    test('should reject invalid ID formats', () => {
      const invalidIDs = ['', '123', 'invalid-id', 'too-short']

      invalidIDs.forEach(id => {
        const result = productIdSchema.safeParse(id)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('Validation Helper Functions', () => {
    test('validateProductData should return success for valid data', () => {
      const validData = {
        sku: 'HELPER-001',
        brand: 'Helper Brand',
        name: 'Helper Product',
        category: 'Test Category',
        size: '1 Unit',
        unit: 'Each'
      }

      const result = validateProductData(validData)
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.errors).toBeUndefined()
    })

    test('validateProductData should return errors for invalid data', () => {
      const invalidData = {
        sku: '', // Empty SKU
        brand: 'Helper Brand'
        // Missing required fields
      }

      const result = validateProductData(invalidData)
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors.sku).toBeDefined()
      expect(result.data).toBeUndefined()
    })

    test('validateProductUpdate should work correctly', () => {
      const validUpdate = { name: 'Updated Name' }
      const result = validateProductUpdate(validUpdate)
      expect(result.success).toBe(true)

      const invalidUpdate = {}
      const result2 = validateProductUpdate(invalidUpdate)
      expect(result2.success).toBe(false)
    })

    test('validateProductSearch should work correctly', () => {
      const validSearch = { search: 'paint', page: 1 }
      const result = validateProductSearch(validSearch)
      expect(result.success).toBe(true)

      const invalidSearch = { page: -1 }
      const result2 = validateProductSearch(invalidSearch)
      expect(result2.success).toBe(false)
    })

    test('validateSKUFormat should validate SKU patterns', () => {
      const validSKUs = ['ABC123', 'TEST-001', 'PROD_456']
      const invalidSKUs = ['abc 123', 'test@001', '']

      validSKUs.forEach(sku => {
        expect(validateSKUFormat(sku)).toBe(true)
      })

      invalidSKUs.forEach(sku => {
        expect(validateSKUFormat(sku)).toBe(false)
      })
    })

    test('validatePriceConsistency should check price relationships', () => {
      // Valid price relationships
      expect(validatePriceConsistency(20, 30).valid).toBe(true)
      expect(validatePriceConsistency(25, 25).valid).toBe(true)
      expect(validatePriceConsistency(null, 30).valid).toBe(true)
      expect(validatePriceConsistency(20, null).valid).toBe(true)

      // Invalid price relationship
      const result = validatePriceConsistency(40, 30)
      expect(result.valid).toBe(false)
      expect(result.message).toContain('Purchase price should not exceed selling price')
    })
  })

  describe('Constants and Enums', () => {
    test('PRODUCT_CATEGORIES should contain expected categories', () => {
      expect(PRODUCT_CATEGORIES).toContain('Interior Paint')
      expect(PRODUCT_CATEGORIES).toContain('Exterior Paint')
      expect(PRODUCT_CATEGORIES).toContain('Primer')
      expect(PRODUCT_CATEGORIES).toContain('Stain')
      expect(Array.isArray(PRODUCT_CATEGORIES)).toBe(true)
    })

    test('PRODUCT_UNITS should contain expected units', () => {
      expect(PRODUCT_UNITS).toContain('Each')
      expect(PRODUCT_UNITS).toContain('Gallon')
      expect(PRODUCT_UNITS).toContain('Quart')
      expect(PRODUCT_UNITS).toContain('Liter')
      expect(Array.isArray(PRODUCT_UNITS)).toBe(true)
    })
  })

  describe('Edge Cases and Security', () => {
    test('should handle extremely long strings', () => {
      const longString = 'a'.repeat(1000)
      const result = productSchema.safeParse({
        sku: longString,
        brand: 'Test',
        name: 'Test',
        category: 'Test',
        size: 'Test',
        unit: 'Test'
      })
      expect(result.success).toBe(false)
    })

    test('should handle special characters safely', () => {
      const specialChars = {
        sku: 'TEST-001',
        brand: 'Brand & Co.',
        name: 'Product "Special"',
        category: "Cat's Paint",
        size: '1" Brush',
        unit: 'Each'
      }

      const result = productSchema.safeParse(specialChars)
      expect(result.success).toBe(true)
    })

    test('should handle numeric strings for prices', () => {
      const numericStrings = {
        sku: 'NUM-001',
        brand: 'Test',
        name: 'Test',
        category: 'Test',
        size: 'Test',
        unit: 'Test',
        purchasePrice: '25.99', // String that should be coerced
        sellingPrice: '39.99',
        minimumStock: '10'
      }

      const result = productSchema.safeParse(numericStrings)
      expect(result.success).toBe(true)
      expect(typeof result.data.purchasePrice).toBe('number')
      expect(result.data.purchasePrice).toBe(25.99)
    })
  })
})