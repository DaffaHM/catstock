/**
 * Integration tests for complete CatStock workflows
 * Tests end-to-end functionality from login to transaction completion
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}))

// Mock auth actions
jest.mock('@/lib/actions/auth', () => ({
  loginAction: jest.fn(),
  logoutAction: jest.fn(),
}))

// Mock transaction actions
jest.mock('@/lib/actions/transactions', () => ({
  createTransaction: jest.fn(),
}))

// Mock product queries
jest.mock('@/lib/queries/products', () => ({
  searchProducts: jest.fn(),
}))

// Mock supplier queries
jest.mock('@/lib/queries/suppliers', () => ({
  getSuppliers: jest.fn(),
}))

import LoginForm from '@/components/LoginForm'
import AdaptiveNavigation from '@/components/layout/AdaptiveNavigation'
import StockInPage from '@/components/transactions/StockInPage'
import { loginAction } from '@/lib/actions/auth'
import { createTransaction } from '@/lib/actions/transactions'
import { searchProducts } from '@/lib/queries/products'
import { getSuppliers } from '@/lib/queries/suppliers'

describe('CatStock Integration Workflows', () => {
  const mockPush = jest.fn()
  const mockReplace = jest.fn()

  beforeEach(() => {
    useRouter.mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    })
    usePathname.mockReturnValue('/dashboard')
    
    // Reset all mocks
    jest.clearAllMocks()
  })

  describe('Authentication Workflow', () => {
    test('should handle complete login flow', async () => {
      loginAction.mockResolvedValue({ success: true })

      render(<LoginForm />)

      // Fill in login form
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'owner@paintstore.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(loginAction).toHaveBeenCalledWith(expect.any(FormData))
      })
    })

    test('should handle login errors gracefully', async () => {
      loginAction.mockResolvedValue({ 
        error: 'Invalid credentials' 
      })

      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'wrong@email.com' } })
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })
    })
  })

  describe('Navigation Integration', () => {
    test('should navigate between different sections', () => {
      render(
        <AdaptiveNavigation>
          <div>Test Content</div>
        </AdaptiveNavigation>
      )

      // Test navigation to different sections
      const dashboardLink = screen.getByText('Dashboard')
      const productsLink = screen.getByText('Products')
      const stockInLink = screen.getByText('Stock In')

      expect(dashboardLink).toHaveAttribute('href', '/dashboard')
      expect(productsLink).toHaveAttribute('href', '/products')
      expect(stockInLink).toHaveAttribute('href', '/transactions/stock-in')
    })

    test('should highlight active navigation item', () => {
      usePathname.mockReturnValue('/transactions/stock-in')

      render(
        <AdaptiveNavigation>
          <div>Test Content</div>
        </AdaptiveNavigation>
      )

      const stockInLink = screen.getByText('Stock In')
      expect(stockInLink.closest('a')).toHaveClass('bg-primary-50', 'text-primary-600')
    })
  })

  describe('Stock Transaction Workflow', () => {
    const mockSuppliers = [
      { id: '1', name: 'Paint Supplier Co' },
      { id: '2', name: 'Color Masters Inc' }
    ]

    const mockProducts = [
      {
        id: '1',
        sku: 'PAINT001',
        brand: 'Premium',
        name: 'White Paint',
        size: '1L',
        unit: 'liter',
        purchasePrice: 25.00
      },
      {
        id: '2',
        sku: 'PAINT002',
        brand: 'Premium',
        name: 'Blue Paint',
        size: '1L',
        unit: 'liter',
        purchasePrice: 27.50
      }
    ]

    beforeEach(() => {
      getSuppliers.mockResolvedValue(mockSuppliers)
      searchProducts.mockResolvedValue(mockProducts)
      createTransaction.mockResolvedValue({ 
        success: true, 
        transaction: { id: 'txn_123', referenceNumber: 'REF001' }
      })
    })

    test('should complete stock in transaction workflow', async () => {
      render(<StockInPage />)

      // Wait for suppliers to load
      await waitFor(() => {
        expect(screen.getByText('Supplier')).toBeInTheDocument()
      })

      // Select supplier
      const supplierSelect = screen.getByDisplayValue('')
      fireEvent.change(supplierSelect, { target: { value: '1' } })

      // Set transaction date
      const dateInput = screen.getByLabelText(/date/i)
      fireEvent.change(dateInput, { target: { value: '2024-01-15' } })

      // Add product to transaction
      const selectProductButton = screen.getByTestId('select-product')
      fireEvent.click(selectProductButton)

      // Wait for products to load and select one
      await waitFor(() => {
        const productOption = screen.getByText('Premium - White Paint (1L)')
        fireEvent.click(productOption)
      })

      // Set quantity and price
      const quantityInput = screen.getByLabelText(/quantity/i)
      const priceInput = screen.getByLabelText(/unit cost/i)

      fireEvent.change(quantityInput, { target: { value: '10' } })
      fireEvent.change(priceInput, { target: { value: '25.00' } })

      // Add to cart
      const addToCartButton = screen.getByText('Add to Transaction')
      fireEvent.click(addToCartButton)

      // Verify item appears in cart
      await waitFor(() => {
        expect(screen.getByText('Premium - White Paint')).toBeInTheDocument()
        expect(screen.getByText('Qty: 10')).toBeInTheDocument()
      })

      // Save transaction
      const saveButton = screen.getByText('Save Transaction')
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(createTransaction).toHaveBeenCalledWith(expect.objectContaining({
          type: 'IN',
          supplierId: '1',
          items: expect.arrayContaining([
            expect.objectContaining({
              productId: '1',
              quantity: 10,
              unitCost: 25.00
            })
          ])
        }))
      })
    })

    test('should validate required fields before saving', async () => {
      render(<StockInPage />)

      // Try to save without supplier or items
      const saveButton = screen.getByText('Save Transaction')
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText('Please select a supplier')).toBeInTheDocument()
        expect(screen.getByText('Please add at least one product')).toBeInTheDocument()
      })

      // Should not call createTransaction
      expect(createTransaction).not.toHaveBeenCalled()
    })

    test('should handle transaction creation errors', async () => {
      createTransaction.mockResolvedValue({
        error: 'Failed to create transaction'
      })

      render(<StockInPage />)

      // Set up a valid transaction
      await waitFor(() => {
        expect(screen.getByText('Supplier')).toBeInTheDocument()
      })

      const supplierSelect = screen.getByDisplayValue('')
      fireEvent.change(supplierSelect, { target: { value: '1' } })

      // Add a product (simplified for test)
      const selectProductButton = screen.getByTestId('select-product')
      fireEvent.click(selectProductButton)

      await waitFor(() => {
        const productOption = screen.getByText('Premium - White Paint (1L)')
        fireEvent.click(productOption)
      })

      const quantityInput = screen.getByLabelText(/quantity/i)
      fireEvent.change(quantityInput, { target: { value: '5' } })

      const addToCartButton = screen.getByText('Add to Transaction')
      fireEvent.click(addToCartButton)

      // Try to save
      const saveButton = screen.getByText('Save Transaction')
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to create transaction')).toBeInTheDocument()
      })
    })
  })

  describe('Touch Interface Validation', () => {
    test('should have minimum touch target sizes', () => {
      render(
        <AdaptiveNavigation>
          <div>Test Content</div>
        </AdaptiveNavigation>
      )

      // Check navigation buttons have minimum 44px touch targets
      const navButtons = screen.getAllByRole('link')
      navButtons.forEach(button => {
        const styles = window.getComputedStyle(button)
        const minHeight = styles.getPropertyValue('min-height')
        const minWidth = styles.getPropertyValue('min-width')
        
        // Should have minimum 44px touch targets
        expect(minHeight).toBe('44px')
        expect(minWidth).toBe('44px')
      })
    })

    test('should use appropriate font sizes for readability', () => {
      render(
        <AdaptiveNavigation>
          <div>Test Content</div>
        </AdaptiveNavigation>
      )

      // Check that text elements use 16px or larger font size
      const textElements = screen.getAllByText(/Dashboard|Products|Stock/i)
      textElements.forEach(element => {
        const styles = window.getComputedStyle(element)
        const fontSize = parseFloat(styles.fontSize)
        
        // Should be 16px or larger for iPad readability
        expect(fontSize).toBeGreaterThanOrEqual(16)
      })
    })
  })

  describe('Responsive Layout Behavior', () => {
    test('should adapt navigation based on screen orientation', () => {
      // Mock landscape orientation
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query.includes('landscape') || query.includes('768px'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      })

      render(
        <AdaptiveNavigation>
          <div>Test Content</div>
        </AdaptiveNavigation>
      )

      // In landscape mode, should show sidebar navigation
      expect(screen.getByText('CatStock')).toBeInTheDocument()
      expect(screen.getByLabelText(/collapse sidebar/i)).toBeInTheDocument()
    })

    test('should show bottom navigation in portrait mode', () => {
      // Mock portrait orientation
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: !query.includes('landscape') && !query.includes('768px'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      })

      render(
        <AdaptiveNavigation>
          <div>Test Content</div>
        </AdaptiveNavigation>
      )

      // In portrait mode, should show bottom navigation
      const bottomNav = screen.getByRole('navigation')
      expect(bottomNav).toHaveClass('fixed', 'bottom-0')
    })
  })
})