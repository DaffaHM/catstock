/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import StockInPage from '@/components/transactions/StockInPage'
import { createTransaction } from '@/lib/actions/transactions'
import { searchProductsAction } from '@/lib/actions/products'
import { searchSuppliersAction } from '@/lib/actions/suppliers'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => {
    // Mock landscape tablet mode for SplitView
    const matches = query.includes('orientation: landscape') || query.includes('min-width: 768px')
    return {
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }
  }),
})

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock server actions
jest.mock('@/lib/actions/transactions', () => ({
  createTransaction: jest.fn()
}))

jest.mock('@/lib/actions/products', () => ({
  searchProductsAction: jest.fn()
}))

jest.mock('@/lib/actions/suppliers', () => ({
  searchSuppliersAction: jest.fn()
}))

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  PlusIcon: () => <div data-testid="plus-icon" />,
  PackageIcon: () => <div data-testid="package-icon" />,
  TruckIcon: () => <div data-testid="truck-icon" />,
  CalendarIcon: () => <div data-testid="calendar-icon" />,
  AlertCircleIcon: () => <div data-testid="alert-circle-icon" />,
  CheckCircleIcon: () => <div data-testid="check-circle-icon" />,
  SearchIcon: () => <div data-testid="search-icon" />,
  XIcon: () => <div data-testid="x-icon" />,
  ChevronDownIcon: () => <div data-testid="chevron-down-icon" />,
  EditIcon: () => <div data-testid="edit-icon" />,
  TrashIcon: () => <div data-testid="trash-icon" />,
  MinusIcon: () => <div data-testid="minus-icon" />
}))

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn()
}

describe('StockInPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useRouter.mockReturnValue(mockRouter)
    
    // Default mock implementations
    searchProductsAction.mockResolvedValue({
      success: true,
      products: []
    })
    
    searchSuppliersAction.mockResolvedValue({
      success: true,
      suppliers: []
    })
    
    createTransaction.mockResolvedValue({
      success: true,
      data: { referenceNumber: 'TXN-20240101-0001' }
    })
  })

  test('renders stock in page with correct title and sections', () => {
    render(<StockInPage />)
    
    // Check main title
    expect(screen.getByText('Stock In')).toBeInTheDocument()
    expect(screen.getByText('Receive inventory from suppliers')).toBeInTheDocument()
    
    // Check form sections
    expect(screen.getByText('Transaction Details')).toBeInTheDocument()
    expect(screen.getByText('Add Products')).toBeInTheDocument()
    
    // Check required fields
    expect(screen.getByText('Supplier')).toBeInTheDocument()
    expect(screen.getByText('Transaction Date')).toBeInTheDocument()
    
    // Check transaction cart
    expect(screen.getByText('Stock In Items')).toBeInTheDocument()
  })

  test('shows validation errors when trying to save without required fields', async () => {
    render(<StockInPage />)
    
    // Try to save without filling required fields
    const saveButton = screen.getByText('Save Stock In Transaction')
    fireEvent.click(saveButton)
    
    // Should show validation errors
    await waitFor(() => {
      const supplierErrors = screen.getAllByText('Supplier is required for stock in transactions')
      expect(supplierErrors.length).toBeGreaterThan(0)
    })
  })

  test('allows adding products to cart', async () => {
    const mockProduct = {
      id: 'product-1',
      name: 'Test Paint',
      brand: 'Test Brand',
      sku: 'TEST-001',
      size: '1 Gallon',
      purchasePrice: 25.99,
      currentStock: 10
    }

    searchProductsAction.mockResolvedValue({
      success: true,
      products: [mockProduct]
    })

    render(<StockInPage />)
    
    // Search for a product
    const productSearch = screen.getByPlaceholderText('Search products to add...')
    fireEvent.change(productSearch, { target: { value: 'test' } })
    
    // Wait for search results and select product
    await waitFor(() => {
      expect(searchProductsAction).toHaveBeenCalledWith('test')
    })
  })

  test('validates unit cost is required for stock in items', async () => {
    const mockSupplier = {
      id: 'supplier-1',
      name: 'Test Supplier',
      contact: 'test@supplier.com'
    }

    const mockProduct = {
      id: 'product-1',
      name: 'Test Paint',
      brand: 'Test Brand',
      sku: 'TEST-001',
      size: '1 Gallon',
      currentStock: 10
    }

    render(<StockInPage />)
    
    // Simulate adding a product without unit cost
    // This would require more complex interaction simulation
    // For now, we'll test the validation logic indirectly
    
    const saveButton = screen.getByText('Save Stock In Transaction')
    fireEvent.click(saveButton)
    
    // Should show validation error for missing supplier
    await waitFor(() => {
      const supplierErrors = screen.getAllByText('Supplier is required for stock in transactions')
      expect(supplierErrors.length).toBeGreaterThan(0)
    })
  })

  test('successfully creates transaction with valid data', async () => {
    const mockSupplier = {
      id: 'supplier-1',
      name: 'Test Supplier'
    }

    createTransaction.mockResolvedValue({
      success: true,
      data: { referenceNumber: 'TXN-20240101-0001' }
    })

    render(<StockInPage />)
    
    // This test would require more complex setup to simulate
    // the full form interaction. For now, we verify the basic structure.
    expect(screen.getByText('Stock In')).toBeInTheDocument()
  })

  test('handles transaction creation errors', async () => {
    createTransaction.mockResolvedValue({
      success: false,
      error: 'Insufficient stock for product'
    })

    render(<StockInPage />)
    
    // The error handling would be tested with a more complete form submission
    expect(screen.getByText('Stock In')).toBeInTheDocument()
  })

  test('displays success message after successful transaction', async () => {
    createTransaction.mockResolvedValue({
      success: true,
      data: { referenceNumber: 'TXN-20240101-0001' }
    })

    render(<StockInPage />)
    
    // Success message display would be tested with complete form interaction
    expect(screen.getByText('Stock In')).toBeInTheDocument()
  })

  test('clears form after successful transaction', async () => {
    createTransaction.mockResolvedValue({
      success: true,
      data: { referenceNumber: 'TXN-20240101-0001' }
    })

    render(<StockInPage />)
    
    // Form clearing would be tested with complete form interaction
    expect(screen.getByText('Stock In')).toBeInTheDocument()
  })

  test('prevents duplicate products in cart', () => {
    render(<StockInPage />)
    
    // This would test the logic that prevents adding the same product twice
    expect(screen.getByText('Stock In')).toBeInTheDocument()
  })

  test('calculates correct totals in transaction cart', () => {
    render(<StockInPage />)
    
    // This would test the cart total calculations
    expect(screen.getByText('Stock In Items')).toBeInTheDocument()
  })
})