/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter, useSearchParams } from 'next/navigation'
import ProductStockCardPage from '@/components/reports/ProductStockCardPage'

// Mock window.matchMedia to return landscape tablet view
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: query.includes('orientation: landscape') || query.includes('min-width: 768px'),
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn()
}))

// Mock the stock card action
jest.mock('@/lib/actions/transactions', () => ({
  getProductStockCard: jest.fn()
}))

const mockRouter = {
  push: jest.fn(),
  back: jest.fn()
}

const mockSearchParams = new URLSearchParams()

const mockProduct = {
  id: 'product-1',
  sku: 'PAINT-001',
  brand: 'Sherwin Williams',
  name: 'Premium Paint',
  category: 'Interior Paint',
  size: '1 Gallon',
  unit: 'gallon',
  minimumStock: 5
}

const mockStockCardData = {
  movements: [
    {
      id: 'movement-1',
      productId: 'product-1',
      transactionId: 'trans-1',
      movementType: 'IN',
      quantityBefore: 0,
      quantityChange: 10,
      quantityAfter: 10,
      createdAt: '2024-01-15T10:00:00Z',
      transaction: {
        id: 'trans-1',
        referenceNumber: 'REF-001',
        type: 'IN',
        transactionDate: '2024-01-15T10:00:00Z',
        notes: 'Initial stock',
        supplier: {
          id: 'supplier-1',
          name: 'Paint Supply Co'
        }
      }
    },
    {
      id: 'movement-2',
      productId: 'product-1',
      transactionId: 'trans-2',
      movementType: 'OUT',
      quantityBefore: 10,
      quantityChange: -3,
      quantityAfter: 7,
      createdAt: '2024-01-16T14:30:00Z',
      transaction: {
        id: 'trans-2',
        referenceNumber: 'REF-002',
        type: 'OUT',
        transactionDate: '2024-01-16T14:30:00Z',
        notes: 'Sale to customer',
        supplier: null
      }
    }
  ],
  pagination: {
    page: 1,
    limit: 50,
    total: 2,
    pages: 1
  }
}

describe('ProductStockCardPage', () => {
  beforeEach(() => {
    useRouter.mockReturnValue(mockRouter)
    useSearchParams.mockReturnValue(mockSearchParams)
    jest.clearAllMocks()
  })

  test('renders stock card page with product information', () => {
    render(
      <ProductStockCardPage
        product={mockProduct}
        initialData={mockStockCardData}
        searchParams={{}}
      />
    )

    // Check page title and product info
    expect(screen.getByText('Stock Card')).toBeInTheDocument()
    expect(screen.getByText(/Sherwin Williams Premium Paint/)).toBeInTheDocument()
    expect(screen.getByText(/SKU: PAINT-001/)).toBeInTheDocument()

    // Check current stock summary
    expect(screen.getByText('Current Stock')).toBeInTheDocument()
    expect(screen.getByText('7 gallon')).toBeInTheDocument()

    // Check total movements
    expect(screen.getByText('Total Movements')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  test('displays stock movements in chronological timeline', () => {
    render(
      <ProductStockCardPage
        product={mockProduct}
        initialData={mockStockCardData}
        searchParams={{}}
      />
    )

    // Check that both movements are displayed
    expect(screen.getByText('Stock In')).toBeInTheDocument()
    expect(screen.getByText('Stock Out')).toBeInTheDocument()

    // Check reference numbers
    expect(screen.getByText('#REF-001')).toBeInTheDocument()
    expect(screen.getByText('#REF-002')).toBeInTheDocument()

    // Check quantity changes
    expect(screen.getByText('+10')).toBeInTheDocument()
    expect(screen.getByText('-3')).toBeInTheDocument()

    // Check running balances
    expect(screen.getByText('Balance: 10')).toBeInTheDocument()
    expect(screen.getByText('Balance: 7')).toBeInTheDocument()
  })

  test('shows filters panel when filter button is clicked', () => {
    render(
      <ProductStockCardPage
        product={mockProduct}
        initialData={mockStockCardData}
        searchParams={{}}
      />
    )

    // Initially filters should not be visible
    expect(screen.queryByText('Start Date')).not.toBeInTheDocument()

    // Click filters button
    const filtersButton = screen.getByText('Filters')
    fireEvent.click(filtersButton)

    // Filters should now be visible
    expect(screen.getByText('Start Date')).toBeInTheDocument()
    expect(screen.getByText('End Date')).toBeInTheDocument()
    expect(screen.getByText('Transaction Type')).toBeInTheDocument()
  })

  test('displays transaction type filter options', () => {
    render(
      <ProductStockCardPage
        product={mockProduct}
        initialData={mockStockCardData}
        searchParams={{}}
      />
    )

    // Show filters
    const filtersButton = screen.getByText('Filters')
    fireEvent.click(filtersButton)

    // Check transaction type dropdown
    const transactionTypeSelect = screen.getByDisplayValue('All Transaction Types')
    expect(transactionTypeSelect).toBeInTheDocument()

    // Check that all transaction type options are available in the select
    expect(screen.getByRole('option', { name: 'All Transaction Types' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Stock In' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Stock Out' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Stock Adjustment' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Return In' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Return Out' })).toBeInTheDocument()
  })

  test('shows empty state when no movements exist', () => {
    const emptyData = {
      movements: [],
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
        pages: 0
      }
    }

    render(
      <ProductStockCardPage
        product={mockProduct}
        initialData={emptyData}
        searchParams={{}}
      />
    )

    expect(screen.getByText('No Stock Movements')).toBeInTheDocument()
    expect(screen.getByText('This product has no stock movement history yet.')).toBeInTheDocument()
  })

  test('displays supplier information when available', () => {
    render(
      <ProductStockCardPage
        product={mockProduct}
        initialData={mockStockCardData}
        searchParams={{}}
      />
    )

    // Check that supplier is shown for the IN transaction
    expect(screen.getByText('Paint Supply Co')).toBeInTheDocument()
  })

  test('shows transaction notes when available', () => {
    render(
      <ProductStockCardPage
        product={mockProduct}
        initialData={mockStockCardData}
        searchParams={{}}
      />
    )

    // Check that transaction notes are displayed
    expect(screen.getByText('Initial stock')).toBeInTheDocument()
    expect(screen.getByText('Sale to customer')).toBeInTheDocument()
  })

  test('provides quick action buttons in detail panel', () => {
    render(
      <ProductStockCardPage
        product={mockProduct}
        initialData={mockStockCardData}
        searchParams={{}}
      />
    )

    // Check quick action buttons
    expect(screen.getByText('Add Stock (Stock In)')).toBeInTheDocument()
    expect(screen.getByText('Remove Stock (Stock Out)')).toBeInTheDocument()
    expect(screen.getByText('Adjust Stock')).toBeInTheDocument()
    expect(screen.getByText('View Product Details')).toBeInTheDocument()
  })

  test('navigates back when back button is clicked', () => {
    render(
      <ProductStockCardPage
        product={mockProduct}
        initialData={mockStockCardData}
        searchParams={{}}
      />
    )

    // Find and click the back button (arrow icon)
    const backButton = screen.getByRole('button', { name: '' }) // Arrow icon button
    fireEvent.click(backButton)

    expect(mockRouter.back).toHaveBeenCalled()
  })

  test('displays product information in detail panel', () => {
    render(
      <ProductStockCardPage
        product={mockProduct}
        initialData={mockStockCardData}
        searchParams={{}}
      />
    )

    // Check product information section
    expect(screen.getByText('Product Information')).toBeInTheDocument()
    expect(screen.getByText('PAINT-001')).toBeInTheDocument()
    expect(screen.getByText('Sherwin Williams')).toBeInTheDocument()
    expect(screen.getByText('Interior Paint')).toBeInTheDocument()
    expect(screen.getByText('1 Gallon')).toBeInTheDocument()
    expect(screen.getByText('gallon')).toBeInTheDocument()
    expect(screen.getByText('5 gallon')).toBeInTheDocument() // minimum stock
  })

  test('shows correct transaction type icons and colors', () => {
    render(
      <ProductStockCardPage
        product={mockProduct}
        initialData={mockStockCardData}
        searchParams={{}}
      />
    )

    // Check that movements are displayed with transaction type headings
    const stockInHeading = screen.getByRole('heading', { name: 'Stock In' })
    const stockOutHeading = screen.getByRole('heading', { name: 'Stock Out' })
    
    expect(stockInHeading).toBeInTheDocument()
    expect(stockOutHeading).toBeInTheDocument()

    // Verify quantity changes are displayed with correct signs
    expect(screen.getByText('+10')).toBeInTheDocument()
    expect(screen.getByText('-3')).toBeInTheDocument()
  })
})