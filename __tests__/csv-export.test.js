/**
 * CSV Export Functionality Tests
 */

import { 
  escapeCsvField, 
  arrayToCsv, 
  validateExportRequest,
  createExportFilename,
  CSV_EXPORT_CONFIG 
} from '@/lib/utils/csv-export'

describe('CSV Export Utilities', () => {
  describe('escapeCsvField', () => {
    test('should return empty string for null or undefined', () => {
      expect(escapeCsvField(null)).toBe('')
      expect(escapeCsvField(undefined)).toBe('')
    })

    test('should return string as-is if no special characters', () => {
      expect(escapeCsvField('simple text')).toBe('simple text')
      expect(escapeCsvField('123')).toBe('123')
    })

    test('should wrap in quotes and escape quotes for special characters', () => {
      expect(escapeCsvField('text, with comma')).toBe('"text, with comma"')
      expect(escapeCsvField('text "with quotes"')).toBe('"text ""with quotes"""')
      expect(escapeCsvField('text\nwith newline')).toBe('"text\nwith newline"')
    })
  })

  describe('arrayToCsv', () => {
    test('should return empty string for empty array', () => {
      expect(arrayToCsv([])).toBe('')
      expect(arrayToCsv(null)).toBe('')
    })

    test('should convert simple array to CSV', () => {
      const data = [
        { name: 'Product A', price: 10.99, category: 'Paint' },
        { name: 'Product B', price: 15.50, category: 'Primer' }
      ]
      
      const expected = 'name,price,category\nProduct A,10.99,Paint\nProduct B,15.5,Primer'
      expect(arrayToCsv(data)).toBe(expected)
    })

    test('should handle special characters in CSV data', () => {
      const data = [
        { name: 'Product, Special', description: 'Has "quotes"', notes: 'Line\nbreak' }
      ]
      
      const result = arrayToCsv(data)
      expect(result).toContain('"Product, Special"')
      expect(result).toContain('"Has ""quotes"""')
      expect(result).toContain('"Line\nbreak"')
    })

    test('should use custom headers when provided', () => {
      const data = [
        { name: 'Product A', price: 10.99, category: 'Paint' }
      ]
      const headers = ['name', 'price']
      
      const result = arrayToCsv(data, headers)
      expect(result).toBe('name,price\nProduct A,10.99')
    })
  })

  describe('validateExportRequest', () => {
    test('should validate export type', () => {
      const validResult = validateExportRequest(CSV_EXPORT_CONFIG.EXPORT_TYPES.PRODUCTS)
      expect(validResult.isValid).toBe(true)
      expect(validResult.errors).toHaveLength(0)

      const invalidResult = validateExportRequest('invalid_type')
      expect(invalidResult.isValid).toBe(false)
      expect(invalidResult.errors).toContain('Invalid export type: invalid_type')
    })

    test('should validate date ranges', () => {
      const validDateRange = validateExportRequest(
        CSV_EXPORT_CONFIG.EXPORT_TYPES.PRODUCTS,
        { startDate: '2023-01-01', endDate: '2023-12-31' }
      )
      expect(validDateRange.isValid).toBe(true)

      const invalidDateRange = validateExportRequest(
        CSV_EXPORT_CONFIG.EXPORT_TYPES.PRODUCTS,
        { startDate: '2023-12-31', endDate: '2023-01-01' }
      )
      expect(invalidDateRange.isValid).toBe(false)
      expect(invalidDateRange.errors).toContain('Start date must be before end date')
    })

    test('should limit date range to 365 days', () => {
      const tooLongRange = validateExportRequest(
        CSV_EXPORT_CONFIG.EXPORT_TYPES.PRODUCTS,
        { startDate: '2022-01-01', endDate: '2023-12-31' }
      )
      expect(tooLongRange.isValid).toBe(false)
      expect(tooLongRange.errors).toContain('Date range cannot exceed 365 days')
    })
  })

  describe('createExportFilename', () => {
    test('should create basic filename with date', () => {
      const filename = createExportFilename('products')
      const today = new Date().toISOString().split('T')[0]
      expect(filename).toBe(`products-${today}.csv`)
    })

    test('should include date range in filename', () => {
      const filename = createExportFilename('products', {
        startDate: '2023-01-01',
        endDate: '2023-12-31'
      })
      const today = new Date().toISOString().split('T')[0]
      expect(filename).toBe(`products-${today}-2023-01-01-to-2023-12-31.csv`)
    })

    test('should handle single date filters', () => {
      const startOnlyFilename = createExportFilename('products', {
        startDate: '2023-01-01'
      })
      const today = new Date().toISOString().split('T')[0]
      expect(startOnlyFilename).toBe(`products-${today}-from-2023-01-01.csv`)

      const endOnlyFilename = createExportFilename('products', {
        endDate: '2023-12-31'
      })
      expect(endOnlyFilename).toBe(`products-${today}-until-2023-12-31.csv`)
    })
  })

  describe('CSV Export Configuration', () => {
    test('should have valid configuration constants', () => {
      expect(CSV_EXPORT_CONFIG.CHUNK_SIZE).toBeGreaterThan(0)
      expect(CSV_EXPORT_CONFIG.MAX_EXPORT_ROWS).toBeGreaterThan(CSV_EXPORT_CONFIG.CHUNK_SIZE)
      expect(Object.keys(CSV_EXPORT_CONFIG.EXPORT_TYPES)).toHaveLength(6)
    })

    test('should have all required export types', () => {
      const expectedTypes = [
        'PRODUCTS',
        'SUPPLIERS', 
        'STOCK_MOVEMENTS',
        'TRANSACTIONS',
        'STOCK_REPORT',
        'SALES_PURCHASE_SUMMARY'
      ]
      
      expectedTypes.forEach(type => {
        expect(CSV_EXPORT_CONFIG.EXPORT_TYPES[type]).toBeDefined()
      })
    })
  })
})

describe('CSV Export Integration', () => {
  test('should handle realistic product data export', () => {
    const productData = [
      {
        'SKU': 'PAINT-001',
        'Brand': 'Sherwin-Williams',
        'Product Name': 'Premium Interior Paint, Eggshell',
        'Category': 'Interior Paint',
        'Size': '1 Gallon',
        'Unit': 'Each',
        'Purchase Price': 45.99,
        'Selling Price': 65.99,
        'Current Stock': 25,
        'Export Date': '2023-12-01'
      },
      {
        'SKU': 'PRIMER-001',
        'Brand': 'Benjamin Moore',
        'Product Name': 'High-Quality Primer & Sealer',
        'Category': 'Primer',
        'Size': '1 Quart',
        'Unit': 'Each',
        'Purchase Price': 22.50,
        'Selling Price': 32.99,
        'Current Stock': 15,
        'Export Date': '2023-12-01'
      }
    ]

    const csvResult = arrayToCsv(productData)
    
    // Should include headers
    expect(csvResult).toContain('SKU,Brand,Product Name')
    
    // Should include data rows
    expect(csvResult).toContain('PAINT-001,Sherwin-Williams')
    expect(csvResult).toContain('PRIMER-001,Benjamin Moore')
    
    // Should handle product names with commas
    expect(csvResult).toContain('"Premium Interior Paint, Eggshell"')
    expect(csvResult).toContain('High-Quality Primer & Sealer')
    
    // Should have correct number of lines (header + 2 data rows)
    const lines = csvResult.split('\n')
    expect(lines).toHaveLength(3)
  })

  test('should handle transaction data with special characters', () => {
    const transactionData = [
      {
        'Reference Number': 'TXN-001',
        'Product Name': 'Paint, "Premium" Grade',
        'Notes': 'Customer requested\nspecial delivery',
        'Quantity': 5,
        'Total Value': 329.95
      }
    ]

    const csvResult = arrayToCsv(transactionData)
    
    // Should properly escape product name with comma and quotes
    expect(csvResult).toContain('"Paint, ""Premium"" Grade"')
    
    // Should properly escape notes with newline
    expect(csvResult).toContain('"Customer requested\nspecial delivery"')
    
    // Should handle numeric values correctly
    expect(csvResult).toContain('5,329.95')
  })
})