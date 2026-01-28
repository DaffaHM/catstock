/**
 * @jest-environment node
 */

import { createSupplierAction, getSuppliersAction, updateSupplierAction, deleteSupplierAction } from '@/lib/actions/suppliers'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

// Mock authentication
jest.mock('@/lib/auth', () => ({
  ...jest.requireActual('@/lib/auth'),
  requireAuth: jest.fn().mockResolvedValue({
    user: { id: 'test-user-id', email: 'test@example.com', name: 'Test User' },
    isAuthenticated: true
  })
}))

// Mock revalidatePath
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}))

describe('Supplier Actions', () => {
  let testUser
  let testSupplier

  beforeAll(async () => {
    // Create a test user
    const passwordHash = await hashPassword('testpassword')
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        passwordHash
      }
    })
  })

  afterAll(async () => {
    // Clean up test data
    await prisma.supplier.deleteMany({
      where: { name: { contains: 'Test Supplier' } }
    })
    await prisma.user.deleteMany({
      where: { email: 'test@example.com' }
    })
  })

  afterEach(async () => {
    // Clean up suppliers created in tests
    if (testSupplier) {
      try {
        await prisma.supplier.delete({
          where: { id: testSupplier.id }
        })
      } catch (error) {
        // Supplier might already be deleted
      }
      testSupplier = null
    }
  })

  describe('createSupplierAction', () => {
    test('should create supplier with valid data', async () => {
      const formData = new FormData()
      formData.append('name', 'Test Supplier Co.')
      formData.append('contact', 'Phone: (555) 123-4567\nEmail: test@supplier.com')
      formData.append('notes', 'Reliable supplier for paint products')

      const result = await createSupplierAction({}, formData)

      expect(result.success).toBe(true)
      expect(result.supplier).toBeDefined()
      expect(result.supplier.name).toBe('Test Supplier Co.')
      expect(result.supplier.contact).toBe('Phone: (555) 123-4567\nEmail: test@supplier.com')
      expect(result.supplier.notes).toBe('Reliable supplier for paint products')

      testSupplier = result.supplier
    })

    test('should reject supplier with missing name', async () => {
      const formData = new FormData()
      formData.append('contact', 'Some contact info')

      const result = await createSupplierAction({}, formData)

      expect(result.success).toBeFalsy()
      expect(result.error).toBeDefined()
      expect(result.errors?.name).toBeDefined()
    })

    test('should reject supplier with duplicate name', async () => {
      // Create first supplier
      const supplier1 = await prisma.supplier.create({
        data: {
          name: 'Duplicate Supplier',
          contact: 'Contact 1'
        }
      })

      const formData = new FormData()
      formData.append('name', 'Duplicate Supplier')
      formData.append('contact', 'Contact 2')

      const result = await createSupplierAction({}, formData)

      expect(result.success).toBeFalsy()
      expect(result.error).toContain('already exists')
      expect(result.errors?.name).toBeDefined()

      // Clean up
      await prisma.supplier.delete({ where: { id: supplier1.id } })
    })

    test('should create supplier with only required fields', async () => {
      const formData = new FormData()
      formData.append('name', 'Minimal Supplier')

      const result = await createSupplierAction({}, formData)

      expect(result.success).toBe(true)
      expect(result.supplier.name).toBe('Minimal Supplier')
      expect(result.supplier.contact).toBeNull()
      expect(result.supplier.notes).toBeNull()

      testSupplier = result.supplier
    })
  })

  describe('getSuppliersAction', () => {
    beforeEach(async () => {
      // Create test suppliers
      await prisma.supplier.createMany({
        data: [
          { name: 'Alpha Supplier', contact: 'alpha@test.com' },
          { name: 'Beta Supplier', contact: 'beta@test.com' },
          { name: 'Gamma Supplier', contact: 'gamma@test.com' }
        ]
      })
    })

    afterEach(async () => {
      // Clean up test suppliers
      await prisma.supplier.deleteMany({
        where: {
          name: { in: ['Alpha Supplier', 'Beta Supplier', 'Gamma Supplier'] }
        }
      })
    })

    test('should get suppliers with default parameters', async () => {
      const result = await getSuppliersAction()

      expect(result.success).toBe(true)
      expect(result.suppliers).toBeDefined()
      expect(result.pagination).toBeDefined()
      expect(result.pagination.page).toBe(1)
      expect(result.pagination.limit).toBe(50)
    })

    test('should search suppliers by name', async () => {
      const result = await getSuppliersAction({ search: 'Alpha' })

      expect(result.success).toBe(true)
      expect(result.suppliers.length).toBeGreaterThan(0)
      expect(result.suppliers[0].name).toContain('Alpha')
    })

    test('should sort suppliers correctly', async () => {
      const result = await getSuppliersAction({ 
        sortBy: 'name', 
        sortOrder: 'asc' 
      })

      expect(result.success).toBe(true)
      expect(result.suppliers.length).toBeGreaterThan(1)
      
      // Check if sorted alphabetically
      for (let i = 1; i < result.suppliers.length; i++) {
        expect(result.suppliers[i].name >= result.suppliers[i-1].name).toBe(true)
      }
    })

    test('should paginate suppliers correctly', async () => {
      const result = await getSuppliersAction({ 
        page: 1, 
        limit: 2 
      })

      expect(result.success).toBe(true)
      expect(result.suppliers.length).toBeLessThanOrEqual(2)
      expect(result.pagination.page).toBe(1)
      expect(result.pagination.limit).toBe(2)
    })
  })

  describe('updateSupplierAction', () => {
    beforeEach(async () => {
      testSupplier = await prisma.supplier.create({
        data: {
          name: 'Update Test Supplier',
          contact: 'Original contact',
          notes: 'Original notes'
        }
      })
    })

    test('should update supplier with valid data', async () => {
      const formData = new FormData()
      formData.append('name', 'Updated Supplier Name')
      formData.append('contact', 'Updated contact info')

      const result = await updateSupplierAction(testSupplier.id, {}, formData)

      expect(result.success).toBe(true)
      expect(result.supplier.name).toBe('Updated Supplier Name')
      expect(result.supplier.contact).toBe('Updated contact info')
      expect(result.supplier.notes).toBe('Original notes') // Should remain unchanged
    })

    test('should update only specified fields', async () => {
      const formData = new FormData()
      formData.append('notes', 'Updated notes only')

      const result = await updateSupplierAction(testSupplier.id, {}, formData)

      expect(result.success).toBe(true)
      expect(result.supplier.name).toBe('Update Test Supplier') // Should remain unchanged
      expect(result.supplier.notes).toBe('Updated notes only')
    })

    test('should reject update with invalid supplier ID', async () => {
      const formData = new FormData()
      formData.append('name', 'New Name')

      const result = await updateSupplierAction('invalid-id', {}, formData)

      expect(result.success).toBeFalsy()
      expect(result.error).toBeDefined()
    })
  })

  describe('deleteSupplierAction', () => {
    test('should delete supplier without transactions', async () => {
      const supplier = await prisma.supplier.create({
        data: {
          name: 'Delete Test Supplier',
          contact: 'delete@test.com'
        }
      })

      const result = await deleteSupplierAction(supplier.id)

      expect(result.success).toBe(true)

      // Verify supplier is deleted
      const deletedSupplier = await prisma.supplier.findUnique({
        where: { id: supplier.id }
      })
      expect(deletedSupplier).toBeNull()
    })

    test('should reject deletion of supplier with transactions', async () => {
      const supplier = await prisma.supplier.create({
        data: {
          name: 'Supplier With Transactions',
          contact: 'transactions@test.com'
        }
      })

      // Create a transaction for this supplier
      const transaction = await prisma.stockTransaction.create({
        data: {
          referenceNumber: 'TEST-REF-001',
          type: 'IN',
          transactionDate: new Date(),
          supplierId: supplier.id,
          userId: testUser.id
        }
      })

      const result = await deleteSupplierAction(supplier.id)

      expect(result.success).toBeFalsy()
      expect(result.error).toContain('associated stock transactions')

      // Clean up
      await prisma.stockTransaction.delete({ where: { id: transaction.id } })
      await prisma.supplier.delete({ where: { id: supplier.id } })
    })

    test('should reject deletion with invalid supplier ID', async () => {
      const result = await deleteSupplierAction('invalid-id')

      expect(result.success).toBeFalsy()
      expect(result.error).toBeDefined()
    })
  })
})