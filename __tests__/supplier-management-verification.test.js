/**
 * Comprehensive Supplier Management System Verification Test
 * 
 * This test verifies that the supplier management system is fully functional
 * according to the requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { prisma } from '@/lib/prisma'
import { 
  createSupplierAction, 
  updateSupplierAction, 
  deleteSupplierAction,
  getSuppliersAction,
  getSupplierAction,
  searchSuppliersAction
} from '@/lib/actions/suppliers'
import { 
  validateSupplierData,
  validateSupplierUpdate,
  validateSupplierSearch,
  normalizeSupplierName
} from '@/lib/validations/supplier'

// Mock authentication
jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn().mockResolvedValue({ id: 'user_test_123' })
}))

describe('Supplier Management System Verification', () => {
  const mockUser = {
    id: 'user_test_123',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: 'hashed_password'
  }

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.stockTransaction.deleteMany({
      where: {
        OR: [
          { referenceNumber: { contains: 'TEST-' } },
          { notes: { contains: 'Test supplier' } }
        ]
      }
    })
    
    await prisma.supplier.deleteMany({
      where: {
        OR: [
          { name: { contains: 'Test Supplier' } },
          { name: { contains: 'ABC Paint Supply' } },
          { name: { contains: 'XYZ Materials' } }
        ]
      }
    })
    
    await prisma.user.deleteMany({
      where: { id: mockUser.id }
    })
    
    // Create test user
    await prisma.user.create({ data: mockUser })
  })

  afterAll(async () => {
    // Clean up test data
    await prisma.stockTransaction.deleteMany({
      where: {
        OR: [
          { referenceNumber: { contains: 'TEST-' } },
          { notes: { contains: 'Test supplier' } }
        ]
      }
    })
    
    await prisma.supplier.deleteMany({
      where: {
        OR: [
          { name: { contains: 'Test Supplier' } },
          { name: { contains: 'ABC Paint Supply' } },
          { name: { contains: 'XYZ Materials' } }
        ]
      }
    })
    
    await prisma.user.deleteMany({
      where: { id: mockUser.id }
    })
  })

  describe('Requirement 3.1: Supplier Creation with Required and Optional Fields', () => {
    test('should create supplier with required name field only', async () => {
      const formData = new FormData()
      formData.append('name', 'Test Supplier Basic')
      
      const result = await createSupplierAction({}, formData)
      
      expect(result.success).toBe(true)
      expect(result.supplier).toBeDefined()
      expect(result.supplier.name).toBe('Test Supplier Basic')
      expect(result.supplier.contact).toBeNull()
      expect(result.supplier.notes).toBeNull()
    })

    test('should create supplier with all optional fields', async () => {
      const formData = new FormData()
      formData.append('name', 'ABC Paint Supply Co.')
      formData.append('contact', 'Phone: (555) 123-4567\nEmail: contact@abcpaint.com\nAddress: 123 Paint St, Color City, CC 12345')
      formData.append('notes', 'Preferred supplier for premium paints. Net 30 payment terms. Delivers on Tuesdays and Fridays.')
      
      const result = await createSupplierAction({}, formData)
      
      expect(result.success).toBe(true)
      expect(result.supplier).toBeDefined()
      expect(result.supplier.name).toBe('ABC Paint Supply Co.')
      expect(result.supplier.contact).toContain('(555) 123-4567')
      expect(result.supplier.notes).toContain('Net 30 payment terms')
    })

    test('should reject supplier creation without required name', async () => {
      const formData = new FormData()
      formData.append('contact', 'Some contact info')
      
      const result = await createSupplierAction({}, formData)
      
      expect(result.success).toBeFalsy()
      expect(result.error).toBeDefined()
      expect(result.errors?.name).toBeDefined()
    })

    test('should validate supplier name length limits', async () => {
      const longName = 'A'.repeat(201) // Exceeds 200 character limit
      
      const validation = validateSupplierData({ name: longName })
      
      expect(validation.success).toBe(false)
      expect(validation.errors.name).toContain('200 characters')
    })
  })

  describe('Requirement 3.2: Supplier Search Functionality', () => {
    let testSuppliers = []

    beforeAll(async () => {
      // Create test suppliers for search
      const suppliers = [
        { name: 'XYZ Materials Inc', contact: 'xyz@materials.com' },
        { name: 'Premium Paint Distributors', contact: 'Phone: (555) 999-8888' },
        { name: 'Local Hardware Supply', contact: 'localhardware@email.com' }
      ]

      for (const supplier of suppliers) {
        const formData = new FormData()
        formData.append('name', supplier.name)
        formData.append('contact', supplier.contact)
        
        const result = await createSupplierAction({}, formData)
        if (result.success) {
          testSuppliers.push(result.supplier)
        }
      }
    })

    test('should search suppliers by name', async () => {
      const result = await getSuppliersAction({ search: 'XYZ' })
      
      expect(result.success).toBe(true)
      expect(result.suppliers).toBeDefined()
      expect(result.suppliers.some(s => s.name.includes('XYZ'))).toBe(true)
    })

    test('should search suppliers by contact information', async () => {
      const result = await getSuppliersAction({ search: 'xyz@materials.com' })
      
      expect(result.success).toBe(true)
      expect(result.suppliers).toBeDefined()
      expect(result.suppliers.some(s => s.contact?.includes('xyz@materials.com'))).toBe(true)
    })

    test('should perform server-side search with case insensitivity', async () => {
      const result = await getSuppliersAction({ search: 'premium paint' })
      
      expect(result.success).toBe(true)
      expect(result.suppliers).toBeDefined()
      expect(result.suppliers.some(s => s.name.toLowerCase().includes('premium paint'))).toBe(true)
    })

    test('should use searchSuppliersAction for autocomplete', async () => {
      const result = await searchSuppliersAction('Local')
      
      expect(result.success).toBe(true)
      expect(result.suppliers).toBeDefined()
      expect(result.suppliers.some(s => s.name.includes('Local'))).toBe(true)
    })
  })

  describe('Requirement 3.3: Full CRUD Operations', () => {
    let testSupplierId

    test('CREATE: should create new supplier', async () => {
      const formData = new FormData()
      formData.append('name', 'CRUD Test Supplier')
      formData.append('contact', 'crud@test.com')
      formData.append('notes', 'Created for CRUD testing')
      
      const result = await createSupplierAction({}, formData)
      
      expect(result.success).toBe(true)
      expect(result.supplier).toBeDefined()
      testSupplierId = result.supplier.id
    })

    test('READ: should retrieve supplier by ID', async () => {
      const result = await getSupplierAction(testSupplierId)
      
      expect(result.success).toBe(true)
      expect(result.supplier).toBeDefined()
      expect(result.supplier.id).toBe(testSupplierId)
      expect(result.supplier.name).toBe('CRUD Test Supplier')
    })

    test('UPDATE: should update supplier information', async () => {
      const formData = new FormData()
      formData.append('name', 'CRUD Test Supplier Updated')
      formData.append('contact', 'updated@test.com')
      formData.append('notes', 'Updated for CRUD testing')
      
      const result = await updateSupplierAction(testSupplierId, {}, formData)
      
      expect(result.success).toBe(true)
      expect(result.supplier.name).toBe('CRUD Test Supplier Updated')
      expect(result.supplier.contact).toBe('updated@test.com')
    })

    test('UPDATE: should allow partial updates', async () => {
      const formData = new FormData()
      formData.append('notes', 'Only notes updated')
      
      const result = await updateSupplierAction(testSupplierId, {}, formData)
      
      expect(result.success).toBe(true)
      expect(result.supplier.notes).toBe('Only notes updated')
      // Name should remain unchanged
      expect(result.supplier.name).toBe('CRUD Test Supplier Updated')
    })

    test('DELETE: should delete supplier without transactions', async () => {
      const result = await deleteSupplierAction(testSupplierId)
      
      expect(result.success).toBe(true)
      
      // Verify supplier is deleted
      const getResult = await getSupplierAction(testSupplierId)
      expect(getResult.error).toBeDefined()
    })
  })

  describe('Requirement 3.4: Referential Integrity - Prevent Deletion with Transactions', () => {
    let supplierWithTransactions

    beforeAll(async () => {
      // Create a supplier
      const formData = new FormData()
      formData.append('name', 'Supplier With Transactions')
      formData.append('contact', 'transactions@supplier.com')
      
      const supplierResult = await createSupplierAction({}, formData)
      supplierWithTransactions = supplierResult.supplier

      // Create a product for the transaction
      const product = await prisma.product.create({
        data: {
          sku: 'TEST-PRODUCT-001',
          brand: 'Test Brand',
          name: 'Test Product',
          category: 'Test Category',
          size: '1 Gallon',
          unit: 'Each'
        }
      })

      // Create a stock transaction associated with this supplier
      await prisma.stockTransaction.create({
        data: {
          referenceNumber: 'TEST-TXN-001',
          type: 'IN',
          transactionDate: new Date(),
          supplierId: supplierWithTransactions.id,
          userId: mockUser.id,
          notes: 'Test supplier transaction',
          items: {
            create: [{
              productId: product.id,
              quantity: 10,
              unitCost: 25.50
            }]
          }
        }
      })
    })

    test('should prevent deletion of supplier with associated transactions', async () => {
      const result = await deleteSupplierAction(supplierWithTransactions.id)
      
      expect(result.success).toBeFalsy()
      expect(result.error).toBeDefined()
      expect(result.error).toContain('associated stock transactions')
    })

    test('should maintain supplier data integrity', async () => {
      // Verify supplier still exists after failed deletion attempt
      const getResult = await getSupplierAction(supplierWithTransactions.id)
      
      expect(getResult.success).toBe(true)
      expect(getResult.supplier).toBeDefined()
      expect(getResult.supplier.name).toBe('Supplier With Transactions')
    })
  })

  describe('Requirement 3.5: Data Integrity Across Related Transactions', () => {
    test('should maintain supplier data integrity during updates', async () => {
      // Get a supplier with transactions
      const suppliers = await getSuppliersAction({ limit: 10 })
      const supplierWithTxns = suppliers.suppliers.find(s => s.transactionCount > 0)
      
      if (supplierWithTxns) {
        const originalName = supplierWithTxns.name
        
        // Update supplier
        const formData = new FormData()
        formData.append('name', `${originalName} - Updated`)
        formData.append('contact', 'updated-integrity@test.com')
        
        const updateResult = await updateSupplierAction(supplierWithTxns.id, {}, formData)
        expect(updateResult.success).toBe(true)
        
        // Verify transactions still reference the correct supplier
        const transactions = await prisma.stockTransaction.findMany({
          where: { supplierId: supplierWithTxns.id },
          include: { supplier: true }
        })
        
        transactions.forEach(transaction => {
          expect(transaction.supplier.id).toBe(supplierWithTxns.id)
          expect(transaction.supplier.name).toBe(`${originalName} - Updated`)
        })
      }
    })

    test('should enforce unique supplier names', async () => {
      // Create first supplier
      const formData1 = new FormData()
      formData1.append('name', 'Unique Name Test Supplier')
      
      const result1 = await createSupplierAction({}, formData1)
      expect(result1.success).toBe(true)
      
      // Try to create second supplier with same name
      const formData2 = new FormData()
      formData2.append('name', 'Unique Name Test Supplier')
      
      const result2 = await createSupplierAction({}, formData2)
      expect(result2.success).toBeFalsy()
      expect(result2.error).toContain('already exists')
    })

    test('should maintain referential integrity in supplier queries', async () => {
      const result = await getSuppliersAction({ limit: 50 })
      
      expect(result.success).toBe(true)
      expect(result.suppliers).toBeDefined()
      expect(result.pagination).toBeDefined()
      
      // Verify each supplier has valid transaction count
      result.suppliers.forEach(supplier => {
        expect(typeof supplier.transactionCount).toBe('number')
        expect(supplier.transactionCount).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('Additional Verification Tests', () => {
    test('should handle pagination correctly', async () => {
      const result = await getSuppliersAction({ page: 1, limit: 5 })
      
      expect(result.success).toBe(true)
      expect(result.suppliers.length).toBeLessThanOrEqual(5)
      expect(result.pagination.page).toBe(1)
      expect(result.pagination.limit).toBe(5)
    })

    test('should sort suppliers correctly', async () => {
      const result = await getSuppliersAction({ 
        sortBy: 'name', 
        sortOrder: 'asc',
        limit: 10 
      })
      
      expect(result.success).toBe(true)
      
      if (result.suppliers.length > 1) {
        for (let i = 1; i < result.suppliers.length; i++) {
          expect(result.suppliers[i].name >= result.suppliers[i-1].name).toBe(true)
        }
      }
    })

    test('should validate contact format appropriately', async () => {
      const validContacts = [
        'phone: (555) 123-4567',
        'email@example.com',
        'Phone: 555-123-4567\nEmail: test@example.com',
        null,
        ''
      ]

      validContacts.forEach(contact => {
        const validation = validateSupplierData({ 
          name: 'Test Supplier',
          contact: contact 
        })
        expect(validation.success).toBe(true)
      })
    })

    test('should normalize supplier names correctly', async () => {
      expect(normalizeSupplierName('  Test Supplier  ')).toBe('test supplier')
      expect(normalizeSupplierName('ABC Paint Supply')).toBe('abc paint supply')
      expect(normalizeSupplierName('XYZ-Materials Inc.')).toBe('xyz-materials inc.')
    })
  })
})