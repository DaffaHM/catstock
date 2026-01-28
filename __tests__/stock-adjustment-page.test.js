/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import StockAdjustmentPage from '@/components/transactions/StockAdjustmentPage'
import { createTransaction } from '@/lib/actions/transactions'
import { StockCalculationEngine } from '@/lib/engines/stock-calculation'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

jest.mock('@/lib/actions/transactions', () => ({
  createTransaction: jest.fn()
}))

jest.mock('@/lib/engines/stock-calculation', () => ({
  StockCalculationEngine: {
    getCurrentStock: jest.fn(),
    calculateStockAdjustment: jest.fn()
  }
}))

// Mock child components
jest.mock('@/components/layout/SplitView', () => {
  return function MockSplitView({ masterContent, detailContent }) {
    return (
      <div data-testid="split-view">
        <div data-testid="master-content">{masterContent}</div>
        <div data-testid="detail-content">{detailContent}</div>
      </div>
    )
  }
})

jest.mock('@/components/ui/ProductAutocomplete', () => {
  return function MockProductAutocomplete({ onProductSelect, placeholder }) {
    return (
      <div data-testid="product-autocomplete">
        <input 
          placeholder={placeholder}
          onChange={(e) => {
            if (e.target.value === 'test-product') {
              onProductSelect({
                id: 'prod-1',
                name: 'Test Paint',
                brand: 'Test Brand',
                sku: 'TEST-001',
                size: '1 Gallon'
              })
            }
          }}
        />
      </div>
    )
  }
})

jest.mock('@/components/ui/DatePicker', () => {
  return function MockDatePicker({ label, value, onChange }) {
    return (
      <div data-testid="date-picker">
        <label>{label}</label>
        <input 
          type="date"
          value={value?.toISOString().split('T')[0] || ''}
          onChange={(e) => onChange(new Date(e.target.value))}
        />
      </div>
    )
  }
})

jest.mock('@/components/ui/TouchInput', () => {
  return function MockTouchInput({ label, value, onChange, placeholder, type = 'text' }) {
    return (
      <div data-testid="touch-input">
        <label>{label}</label>
        <input 
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      </div>
    )
  }
})

jest.mock('@/components/ui/TouchButton', () => {
  return function MockTouchButton({ children, onClick, disabled, variant }) {
    return (
      <button 
        onClick={onClick}
        disabled={disabled}
        data-variant={variant}
        data-testid="touch-button"
      >
        {children}
      </button>
    )
  }
})

describe('StockAdjustmentPage', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    useRouter.mockReturnValue({
      push: mockPush
    })
  })

  test('renders stock adjustment page with correct title and description', () => {
    render(<StockAdjustmentPage />)
    
    expect(screen.getByText('Stock Adjustment')).toBeInTheDocument()
    expect(screen.getByText('Adjust inventory levels based on physical counts')).toBeInTheDocument()
  })

  test('displays adjustment date picker and notes input', () => {
    render(<StockAdjustmentPage />)
    
    expect(screen.getByText('Adjustment Date')).toBeInTheDocument()
    expect(screen.getByText('Notes (Optional)')).toBeInTheDocument()
  })

  test('shows product search when no product is being added', () => {
    render(<StockAdjustmentPage />)
    
    expect(screen.getByText('Search Products to Adjust')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search products for stock adjustment...')).toBeInTheDocument()
  })

  test('calculates stock adjustment when product is selected and actual stock is entered', async () => {
    // Mock stock calculation
    StockCalculationEngine.getCurrentStock.mockResolvedValue(10)
    StockCalculationEngine.calculateStockAdjustment.mockResolvedValue({
      productId: 'prod-1',
      currentStock: 10,
      actualStock: 15,
      difference: 5,
      adjustmentType: 'INCREASE',
      adjustmentQuantity: 5
    })

    render(<StockAdjustmentPage />)
    
    // Select a product
    const productInput = screen.getByPlaceholderText('Search products for stock adjustment...')
    fireEvent.change(productInput, { target: { value: 'test-product' } })
    
    await waitFor(() => {
      expect(screen.getByText('Test Paint')).toBeInTheDocument()
    })

    // Enter actual stock count
    const actualStockInput = screen.getByPlaceholderText('Enter counted stock quantity...')
    fireEvent.change(actualStockInput, { target: { value: '15' } })

    await waitFor(() => {
      expect(StockCalculationEngine.calculateStockAdjustment).toHaveBeenCalledWith('prod-1', 15)
    })
  })

  test('displays adjustment calculation results', async () => {
    StockCalculationEngine.getCurrentStock.mockResolvedValue(10)
    StockCalculationEngine.calculateStockAdjustment.mockResolvedValue({
      productId: 'prod-1',
      currentStock: 10,
      actualStock: 15,
      difference: 5,
      adjustmentType: 'INCREASE',
      adjustmentQuantity: 5
    })

    render(<StockAdjustmentPage />)
    
    // Select product and enter actual stock
    const productInput = screen.getByPlaceholderText('Search products for stock adjustment...')
    fireEvent.change(productInput, { target: { value: 'test-product' } })
    
    await waitFor(() => {
      const actualStockInput = screen.getByPlaceholderText('Enter counted stock quantity...')
      fireEvent.change(actualStockInput, { target: { value: '15' } })
    })

    await waitFor(() => {
      expect(screen.getByText('Adjustment Calculation:')).toBeInTheDocument()
      expect(screen.getByText('Current Stock: 10')).toBeInTheDocument()
      expect(screen.getByText('Actual Count: 15')).toBeInTheDocument()
      expect(screen.getByText('Difference: 5')).toBeInTheDocument()
    })
  })

  test('prevents adding adjustment when no change is needed', async () => {
    StockCalculationEngine.getCurrentStock.mockResolvedValue(10)
    StockCalculationEngine.calculateStockAdjustment.mockResolvedValue({
      productId: 'prod-1',
      currentStock: 10,
      actualStock: 10,
      difference: 0,
      adjustmentType: 'NO_CHANGE',
      adjustmentQuantity: 0
    })

    render(<StockAdjustmentPage />)
    
    // Select product and enter same stock count
    const productInput = screen.getByPlaceholderText('Search products for stock adjustment...')
    fireEvent.change(productInput, { target: { value: 'test-product' } })
    
    await waitFor(() => {
      const actualStockInput = screen.getByPlaceholderText('Enter counted stock quantity...')
      fireEvent.change(actualStockInput, { target: { value: '10' } })
    })

    await waitFor(() => {
      expect(screen.getByText('No Adjustment Needed')).toBeInTheDocument()
    })

    // Try to add adjustment - button should be disabled
    const addButton = screen.getByText('Add Adjustment')
    expect(addButton).toBeDisabled()
  })

  test('creates stock adjustment transaction successfully', async () => {
    createTransaction.mockResolvedValue({
      success: true,
      data: { referenceNumber: 'ADJ-001' }
    })

    StockCalculationEngine.getCurrentStock.mockResolvedValue(10)
    StockCalculationEngine.calculateStockAdjustment.mockResolvedValue({
      productId: 'prod-1',
      currentStock: 10,
      actualStock: 15,
      difference: 5,
      adjustmentType: 'INCREASE',
      adjustmentQuantity: 5
    })

    render(<StockAdjustmentPage />)
    
    // Add a product adjustment
    const productInput = screen.getByPlaceholderText('Search products for stock adjustment...')
    fireEvent.change(productInput, { target: { value: 'test-product' } })
    
    await waitFor(() => {
      const actualStockInput = screen.getByPlaceholderText('Enter counted stock quantity...')
      fireEvent.change(actualStockInput, { target: { value: '15' } })
    })

    await waitFor(() => {
      const addButton = screen.getByText('Add Adjustment')
      fireEvent.click(addButton)
    })

    // Save the transaction
    await waitFor(() => {
      const saveButton = screen.getByText('Save Stock Adjustment')
      fireEvent.click(saveButton)
    })

    await waitFor(() => {
      expect(createTransaction).toHaveBeenCalledWith({
        type: 'ADJUST',
        transactionDate: expect.any(Date),
        notes: null,
        items: [{
          productId: 'prod-1',
          quantity: 5 // The adjustment difference
        }]
      })
    })

    await waitFor(() => {
      expect(screen.getByText(/Stock adjustment transaction created successfully/)).toBeInTheDocument()
    })
  })

  test('displays adjustment summary when items are added', async () => {
    StockCalculationEngine.getCurrentStock.mockResolvedValue(10)
    StockCalculationEngine.calculateStockAdjustment.mockResolvedValue({
      productId: 'prod-1',
      currentStock: 10,
      actualStock: 15,
      difference: 5,
      adjustmentType: 'INCREASE',
      adjustmentQuantity: 5
    })

    render(<StockAdjustmentPage />)
    
    // Add a product adjustment
    const productInput = screen.getByPlaceholderText('Search products for stock adjustment...')
    fireEvent.change(productInput, { target: { value: 'test-product' } })
    
    await waitFor(() => {
      const actualStockInput = screen.getByPlaceholderText('Enter counted stock quantity...')
      fireEvent.change(actualStockInput, { target: { value: '15' } })
    })

    await waitFor(() => {
      const addButton = screen.getByText('Add Adjustment')
      fireEvent.click(addButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Adjustment Summary')).toBeInTheDocument()
      expect(screen.getByText('Increases: 1')).toBeInTheDocument()
      expect(screen.getByText('(+5)')).toBeInTheDocument()
    })
  })

  test('handles validation errors appropriately', async () => {
    render(<StockAdjustmentPage />)
    
    // Try to save without any items
    const saveButton = screen.getByText('Save Stock Adjustment')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText('At least one product adjustment is required')).toBeInTheDocument()
    })
  })

  test('handles server errors gracefully', async () => {
    createTransaction.mockResolvedValue({
      success: false,
      error: 'Database connection failed'
    })

    StockCalculationEngine.getCurrentStock.mockResolvedValue(10)
    StockCalculationEngine.calculateStockAdjustment.mockResolvedValue({
      productId: 'prod-1',
      currentStock: 10,
      actualStock: 15,
      difference: 5,
      adjustmentType: 'INCREASE',
      adjustmentQuantity: 5
    })

    render(<StockAdjustmentPage />)
    
    // Add a product adjustment
    const productInput = screen.getByPlaceholderText('Search products for stock adjustment...')
    fireEvent.change(productInput, { target: { value: 'test-product' } })
    
    await waitFor(() => {
      const actualStockInput = screen.getByPlaceholderText('Enter counted stock quantity...')
      fireEvent.change(actualStockInput, { target: { value: '15' } })
    })

    await waitFor(() => {
      const addButton = screen.getByText('Add Adjustment')
      fireEvent.click(addButton)
    })

    // Save the transaction
    await waitFor(() => {
      const saveButton = screen.getByText('Save Stock Adjustment')
      fireEvent.click(saveButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Database connection failed')).toBeInTheDocument()
    })
  })
})