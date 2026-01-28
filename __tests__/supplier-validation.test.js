import { 
  validateSupplierData, 
  validateSupplierUpdate, 
  validateSupplierSearch,
  validateContactFormat,
  normalizeSupplierName
} from '@/lib/validations/supplier'

describe('Supplier Validation', () => {
  describe('validateSupplierData', () => {
    test('should validate valid supplier data', () => {
      const validData = {
        name: 'ABC Paint Supply Co.',
        contact: 'Phone: (555) 123-4567\nEmail: contact@abcpaint.com',
        notes: 'Reliable supplier with good prices'
      }

      const result = validateSupplierData(validData)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(validData)
    })

    test('should require supplier name', () => {
      const invalidData = {
        contact: 'Some contact info',
        notes: 'Some notes'
      }

      const result = validateSupplierData(invalidData)
      expect(result.success).toBe(false)
      expect(result.errors.name).toBeDefined()
    })

    test('should reject empty supplier name', () => {
      const invalidData = {
        name: '',
        contact: 'Some contact info'
      }

      const result = validateSupplierData(invalidData)
      expect(result.success).toBe(false)
      expect(result.errors.name).toBeDefined()
    })

    test('should reject supplier name that is too long', () => {
      const invalidData = {
        name: 'A'.repeat(201), // 201 characters
        contact: 'Some contact info'
      }

      const result = validateSupplierData(invalidData)
      expect(result.success).toBe(false)
      expect(result.errors.name).toBeDefined()
    })

    test('should allow optional contact and notes', () => {
      const validData = {
        name: 'Simple Supplier'
      }

      const result = validateSupplierData(validData)
      expect(result.success).toBe(true)
      expect(result.data.name).toBe('Simple Supplier')
      expect(result.data.contact).toBeUndefined()
      expect(result.data.notes).toBeUndefined()
    })

    test('should reject contact that is too long', () => {
      const invalidData = {
        name: 'Valid Supplier',
        contact: 'A'.repeat(501) // 501 characters
      }

      const result = validateSupplierData(invalidData)
      expect(result.success).toBe(false)
      expect(result.errors.contact).toBeDefined()
    })

    test('should reject notes that are too long', () => {
      const invalidData = {
        name: 'Valid Supplier',
        notes: 'A'.repeat(2001) // 2001 characters
      }

      const result = validateSupplierData(invalidData)
      expect(result.success).toBe(false)
      expect(result.errors.notes).toBeDefined()
    })
  })

  describe('validateSupplierUpdate', () => {
    test('should validate partial updates', () => {
      const updateData = {
        name: 'Updated Supplier Name'
      }

      const result = validateSupplierUpdate(updateData)
      expect(result.success).toBe(true)
      expect(result.data.name).toBe('Updated Supplier Name')
    })

    test('should reject empty update data', () => {
      const result = validateSupplierUpdate({})
      expect(result.success).toBe(false)
    })

    test('should validate contact-only update', () => {
      const updateData = {
        contact: 'New contact information'
      }

      const result = validateSupplierUpdate(updateData)
      expect(result.success).toBe(true)
      expect(result.data.contact).toBe('New contact information')
    })
  })

  describe('validateSupplierSearch', () => {
    test('should validate search parameters with defaults', () => {
      const result = validateSupplierSearch({})
      expect(result.success).toBe(true)
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(50)
      expect(result.data.sortBy).toBe('name')
      expect(result.data.sortOrder).toBe('asc')
    })

    test('should validate custom search parameters', () => {
      const searchParams = {
        search: 'ABC',
        page: 2,
        limit: 25,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }

      const result = validateSupplierSearch(searchParams)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(searchParams)
    })

    test('should coerce string numbers to integers', () => {
      const searchParams = {
        page: '3',
        limit: '10'
      }

      const result = validateSupplierSearch(searchParams)
      expect(result.success).toBe(true)
      expect(result.data.page).toBe(3)
      expect(result.data.limit).toBe(10)
    })

    test('should reject invalid sort fields', () => {
      const searchParams = {
        sortBy: 'invalidField'
      }

      const result = validateSupplierSearch(searchParams)
      expect(result.success).toBe(false)
    })
  })

  describe('validateContactFormat', () => {
    test('should validate empty contact', () => {
      const result = validateContactFormat('')
      expect(result.valid).toBe(true)
    })

    test('should validate null contact', () => {
      const result = validateContactFormat(null)
      expect(result.valid).toBe(true)
    })

    test('should validate proper email format', () => {
      const contact = 'Email: contact@example.com\nPhone: 555-1234'
      const result = validateContactFormat(contact)
      expect(result.valid).toBe(true)
    })

    test('should be permissive with contact format', () => {
      // Contact validation should be permissive since it's free-form text
      const contact = 'Email: contact@example.com\nPhone: 555-1234\nAddress: 123 Main St'
      const result = validateContactFormat(contact)
      expect(result.valid).toBe(true)
    })

    test('should reject phone numbers that are too long', () => {
      const contact = '12345678901234567890' // 20 digits, too long
      const result = validateContactFormat(contact)
      expect(result.valid).toBe(false)
      expect(result.message).toContain('Phone number appears too long')
    })
  })

  describe('normalizeSupplierName', () => {
    test('should normalize supplier name to lowercase', () => {
      const result = normalizeSupplierName('ABC Paint Supply Co.')
      expect(result).toBe('abc paint supply co.')
    })

    test('should trim whitespace', () => {
      const result = normalizeSupplierName('  Supplier Name  ')
      expect(result).toBe('supplier name')
    })

    test('should handle mixed case', () => {
      const result = normalizeSupplierName('MiXeD CaSe SuPpLiEr')
      expect(result).toBe('mixed case supplier')
    })
  })
})