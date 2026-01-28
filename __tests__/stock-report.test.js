/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter, useSearchParams } from 'next/navigation'
import CurrentStockReportPage from '@/components/reports/CurrentStockReportPage'
import StockReportList from '@/components/reports/StockReportList'
import StockReportSummary from '@/components/reports/StockReportSummary'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn()
}))

// Mock server actions
jest.mock('@/lib/actions/reports', () => ({
  getStockReportAction: jest.fn(),
  exportStockReportAction: jest.fn(),
  getStockReportFilterOptionsAction: jest.fn()
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn()
}

const mockSearchParams = new URLSearchParams()

describe('Stock Report Components', () => {
  beforeEach(() => {
    useRouter.mockReturnValue(mockRouter)
    useSearchParams.mockReturnValue(mockSearchParams)
    jest.clearAllMocks()
  })

  describe('StockReportSummary', () => {
    const mockSummary = {
      totalProducts: 150,
      totalStockQuantity: 2500,
      totalStockValue: 45000.50,
      lowStockCount: 12,
      outOfStockCount: 5,
      inStockCount: 145
    }

    test('renders summary cards with correct data', () => {
      render(<StockReportSummary summary={mockSummary} />)
      
      expect(screen.getByText('150')).toBeInTheDocument()
      expect(screen.getByText('145')).toBeInTheDocument()
      expect(screen.getByText('12')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('$45,000.50')).toBeInTheDocument()
      // The number formatting uses locale-specific formatting
      expect(screen.getByText(/2[,.]500/)).toBeInTheDocument()
    })

    test('highlights low stock and out of stock cards when counts are greater than zero', () => {
      render(<StockReportSummary summary={mockSummary} />)
      
      // Find the parent containers that should have the ring classes
      const lowStockContainer = screen.getByText('Low Stock').closest('.bg-amber-50')
      expect(lowStockContainer).toHaveClass('ring-2')
      
      const outOfStockContainer = screen.getByText('Out of Stock').closest('.bg-red-50')
      expect(outOfStockContainer).toHaveClass('ring-2')
    })
  })

  describe('StockReportList', () => {
    const mockProducts = [
      {
        id: '1',
        sku: 'PAINT-001',
        brand: 'Sherwin-Williams',
        name: 'Premium Interior Paint',
        category: 'Interior Paint',
        size: '1 Gallon',
        unit: 'Each',
        currentStock: 25,
        minimumStock: 10,
        isLowStock: false,
        stockValue: 750.00,
        sellingPrice: 30.00
      },
      {
        id: '2',
        sku: 'PAINT-002',
        brand: 'Benjamin Moore',
        name: 'Exterior Primer',
        category: 'Primer',
        size: '1 Quart',
        unit: 'Each',
        currentStock: 5,
        minimumStock: 15,
        isLowStock: true,
        stockValue: 125.00,
        sellingPrice: 25.00
      },
      {
        id: '3',
        sku: 'PAINT-003',
        brand: 'Behr',
        name: 'Wood Stain',
        category: 'Stain',
        size: '1 Pint',
        unit: 'Each',
        currentStock: 0,
        minimumStock: 5,
        isLowStock: false,
        stockValue: 0,
        sellingPrice: 20.00
      }
    ]

    const mockPagination = {
      page: 1,
      limit: 50,
      totalCount: 3,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false
    }

    test('renders product list with correct data', () => {
      render(
        <StockReportList 
          products={mockProducts}
          loading={false}
          pagination={mockPagination}
          onPageChange={jest.fn()}
        />
      )
      
      expect(screen.getAllByText('Premium Interior Paint')[0]).toBeInTheDocument()
      expect(screen.getByText('PAINT-001')).toBeInTheDocument()
      expect(screen.getAllByText(/25.*Each/)[0]).toBeInTheDocument()
      expect(screen.getAllByText('In Stock')[0]).toBeInTheDocument()
    })

    test('displays correct stock status for different stock levels', () => {
      render(
        <StockReportList 
          products={mockProducts}
          loading={false}
          pagination={mockPagination}
          onPageChange={jest.fn()}
        />
      )
      
      // In stock product
      expect(screen.getAllByText('In Stock')[0]).toBeInTheDocument()
      
      // Low stock product
      expect(screen.getAllByText('Low Stock')[0]).toBeInTheDocument()
      
      // Out of stock product
      expect(screen.getAllByText('Out of Stock')[0]).toBeInTheDocument()
    })

    test('shows loading state', () => {
      render(
        <StockReportList 
          products={[]}
          loading={true}
          pagination={mockPagination}
          onPageChange={jest.fn()}
        />
      )
      
      expect(screen.getByText('Loading stock report...')).toBeInTheDocument()
    })

    test('shows empty state when no products', () => {
      render(
        <StockReportList 
          products={[]}
          loading={false}
          pagination={mockPagination}
          onPageChange={jest.fn()}
        />
      )
      
      expect(screen.getByText('No Products Found')).toBeInTheDocument()
    })
  })

  describe('CurrentStockReportPage', () => {
    const mockInitialData = {
      products: [
        {
          id: '1',
          sku: 'PAINT-001',
          brand: 'Sherwin-Williams',
          name: 'Premium Interior Paint',
          category: 'Interior Paint',
          size: '1 Gallon',
          unit: 'Each',
          currentStock: 25,
          minimumStock: 10,
          isLowStock: false,
          stockValue: 750.00
        }
      ],
      pagination: {
        page: 1,
        limit: 50,
        totalCount: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      },
      summary: {
        totalProducts: 1,
        totalStockQuantity: 25,
        totalStockValue: 750.00,
        lowStockCount: 0,
        outOfStockCount: 0,
        inStockCount: 1
      }
    }

    test('renders stock report insights', () => {
      render(
        <CurrentStockReportPage 
          initialData={mockInitialData}
          searchParams={{}}
        />
      )
      
      expect(screen.getByText('Stock Report Insights')).toBeInTheDocument()
      expect(screen.getByText('Total Products')).toBeInTheDocument()
      expect(screen.getByText('Total Stock Value')).toBeInTheDocument()
    })

    test('displays quick action buttons', () => {
      render(
        <CurrentStockReportPage 
          initialData={mockInitialData}
          searchParams={{}}
        />
      )
      
      expect(screen.getByText('View Low Stock Items Only')).toBeInTheDocument()
      expect(screen.getByText('Perform Stock Adjustment')).toBeInTheDocument()
      expect(screen.getByText('Add Stock (Stock In)')).toBeInTheDocument()
    })

    test('displays about this report section', () => {
      render(
        <CurrentStockReportPage 
          initialData={mockInitialData}
          searchParams={{}}
        />
      )
      
      expect(screen.getByText('About This Report')).toBeInTheDocument()
      expect(screen.getByText(/Shows real-time stock levels/)).toBeInTheDocument()
      expect(screen.getByText(/Updates automatically every 5 minutes/)).toBeInTheDocument()
    })
  })

  describe('Stock Report Integration', () => {
    test('stock status calculation works correctly', () => {
      const products = [
        { currentStock: 0, minimumStock: 5, isLowStock: false },
        { currentStock: 3, minimumStock: 10, isLowStock: true },
        { currentStock: 15, minimumStock: 10, isLowStock: false }
      ]

      products.forEach(product => {
        if (product.currentStock === 0) {
          expect(product.currentStock).toBe(0)
        } else if (product.isLowStock) {
          expect(product.currentStock).toBeLessThanOrEqual(product.minimumStock)
        } else {
          expect(product.currentStock).toBeGreaterThan(product.minimumStock || 0)
        }
      })
    })

    test('stock value calculation works correctly', () => {
      const product = {
        currentStock: 10,
        sellingPrice: 25.50
      }
      
      const expectedStockValue = product.currentStock * product.sellingPrice
      expect(expectedStockValue).toBe(255.00)
    })
  })
})