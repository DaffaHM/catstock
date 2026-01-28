/**
 * Basic Product Tests
 * Simple tests to verify core product functionality
 */

import { validateProductData, validateSKUFormat } from '@/lib/validations/product'

describe('Basic Product Functionality', () => {
  test('should validate basic product data', () => {
    const productData = {
      sku: 'TEST-001',
      brand: 'Test Brand',
      name: 'Test Product',
      category: 'Interior Paint',
      size: '1 Gallon',
      unit: 'Each'
    }

    const result = validateProductData(productData)
    expect(result.success).toBe(true)
    expect(result.data.sku).toBe('TEST-001')
  })

  test('should validate SKU format', () => {
    expect(validateSKUFormat('ABC123')).toBe(true)
    expect(validateSKUFormat('TEST-001')).toBe(true)
    expect(validateSKUFormat('PROD_456')).toBe(true)
    expect(validateSKUFormat('invalid sku')).toBe(false)
    expect(validateSKUFormat('test@001')).toBe(false)
  })

  test('should handle missing required fields', () => {
    const incompleteData = {
      sku: 'TEST-002',
      brand: 'Test Brand'
      // Missing required fields
    }

    const result = validateProductData(incompleteData)
    expect(result.success).toBe(false)
    expect(result.errors).toBeDefined()
  })

  test('should handle optional fields', () => {
    const productWithOptionals = {
      sku: 'TEST-003',
      brand: 'Test Brand',
      name: 'Test Product',
      category: 'Interior Paint',
      size: '1 Gallon',
      unit: 'Each',
      purchasePrice: 25.99,
      sellingPrice: 39.99,
      minimumStock: 10
    }

    const result = validateProductData(productWithOptionals)
    expect(result.success).toBe(true)
    expect(result.data.purchasePrice).toBe(25.99)
    expect(result.data.sellingPrice).toBe(39.99)
    expect(result.data.minimumStock).toBe(10)
  })
})