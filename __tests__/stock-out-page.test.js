/**
 * Stock Out Page Tests
 * 
 * Tests the Stock Out transaction page functionality including:
 * - Page rendering and UI elements
 * - Product selection and stock validation
 * - Transaction cart integration
 * - Form validation and submission
 * - Stock availability checking
 * 
 * Requirements: 6.2, 4.8
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import StockOutPage from '@/components/transactions/StockOutPage'
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
    getCurrentStock: jest.fn()
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

jest.mock('@/components/ui/TransactionCart', () => {
  return function MockTransactionCart({ 
    items, 
    onSave, 
    title, 
    saveButtonText, 
    transactionType,
    onUpdateItem,
    onRemoveItem,
    onClear,
    validationErrors = []
  }) {
    return (
      <div data-testid="transaction-cart">
        <h2>{title}</h2>
        <div data-testid="cart-items">
          {items.map((item, index) => (
            <div key={item.id || index} data-testid={`cart-item-${index}`}>
              {item.product?.name} - Qty: {item.quantity} - Price: {item.unitPrice}
              <button 
                onClick={() => onUpdateItem(item.id, { quantity: item.quantity + 1 })}
                data-testid={`update-item-${index}`}
              >
                Update
              </button>
              <button 
                onClick={() => onRemoveItem(item.id)}
                data-testid={`remove-item-${index}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        {validationErrors.length > 0 && (
          <div data-testid="validation-errors">
            {validationErrors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}
        <button onClick={onSave} data-testid="save-transaction">
          {saveButtonText}
        </button>
        <button onClick={onClear} data-testid="clear-items">
          Clear All
        </button>
        <div data-testid="transaction-type">{transactionType}</div>
      </div>
    )
  }
})

jest.mock('@/components/ui/ProductAutocomplete', () => {
  return function MockProductAutocomplete({ onProductSelect, placeholder, disabled, showStock }) {
    const mockProduct = {
      id: 'prod_123',
      name: 'Test Paint',
      brand: 'Test Brand',
      sku: 'TEST001',
      sellingPrice: 25.99,
      size: '1L'
    }
    
    return (
      <div data-testid="product-autocomplete">
        <input 
          placeholder={placeholder}
          disabled={disabled}
          data-testid="product-search"
        />
        <button 
          onClick={() => onProductSelect(mockProduct)}
          data-testid="select-product"
        >
          Select Test Product
        </button>
        {showStock && <span data-testid="show-stock">Show Stock: true</span>}
      </div>
    )
  }
})

jest.mock('@/components/ui/DatePicker', () => {
  return function MockDatePicker({ label, value, onChange, required, error, disabled }) {
    return (
      <div data-testid="date-picker">
        <label>{label} {required && '*'}</label>
        <input 
          type="date"
          value={value && !isNaN(value.getTime()) ? value.toISOString().split('T')[0] : ''}
          onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null)}
          disabled={disabled}
          data-testid="date-input"
        />
        {error && <span data-testid="date-error">{error}</span>}
      </div>
    )
  }
})

jest.mock('@/components/ui/TouchInput', () => {
  return function MockTouchInput({ label, value, onChange, placeholder, disabled, multiline, rows, type, step, min, required, error }) {
    const Component = multiline ? 'textarea' : 'input'
    return (
      <div data-testid="touch-input">
        <label>{label} {required && '*'}</label>
        <Component
          type={type}
          step={step}
          min={min}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          data-testid={`input-${label?.toLowerCase().replace(/\s+/g, '-')}`}
        />
        {error && <span data-testid="input-error">{error}</span>}
      </div>
    )
  }
})

jest.mock('@/components/ui/QuantityStepper', () => {
  return function MockQuantityStepper({ value, onChange, min, max, disabled }) {
    return (
      <div data-testid="quantity-stepper">
        <button 
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={disabled}
          data-testid="quantity-decrease"
        >
          -
        </button>
        <input 
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          disabled={disabled}
          data-testid="quantity-input"
        />
        <button 
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={disabled}
          data-testid="quantity-increase"
        >
          +
        </button>
      </div>
    )
  }
})

jest.mock('@/components/ui/TouchButton', () => {
  return function MockTouchButton({ children, onClick, disabled, variant, className }) {
    return (
      <button 
        onClick={onClick}
        disabled={disabled}
        data-testid="touch-button"
        data-variant={variant}
        className={className}
      >
        {children}
      </button>
    )
  }
})

describe('StockOutPage', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    useRouter.mockReturnValue({ push: mockPush })
    StockCalculationEngine.getCurrentStock.mockResolvedValue(50) // Default stock level
  })

  describe('Page Rendering', () => {
    test('should render stock out page with correct title and description', () => {
      render(<StockOutPage />)
      
      expect(screen.getByText('Stock Out')).toBeInTheDocument()
      expect(screen.getByText('Process outgoing inventory and sales')).toBeInTheDocument()
    })

    test('should render transaction details section', () => {
      render(<StockOutPage />)
      
      expect(screen.getByText('Transaction Details')).toBeInTheDocument()
      expect(screen.getByText('Transaction Date', { exact: false })).toBeInTheDocument()
      expect(screen.getByText('Notes (Optional)')).toBeInTheDocument()
    })

    test('should render add products section', () => {
      render(<StockOutPage />)
      
      expect(screen.getByText('Add Products')).toBeInTheDocument()
      expect(screen.getByText('Search Products')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Search products to sell...')).toBeInTheDocument()
    })

    test('should render transaction cart with correct props', () => {
      render(<StockOutPage />)
      
      expect(screen.getByTestId('transaction-cart')).toBeInTheDocument()
      expect(screen.getByText('Stock Out Items')).toBeInTheDocument()
      expect(screen.getByText('Save Stock Out Transaction')).toBeInTheDocument()
      expect(screen.getByTestId('transaction-type')).toHaveTextContent('OUT')
    })

    test('should show stock information in product autocomplete', () => {
      render(<StockOutPage />)
      
      expect(screen.getByTestId('show-stock')).toHaveTextContent('Show Stock: true')
    })
  })

  describe('Product Selection and Stock Validation', () => {
    test('should handle product selection and show add product form', async () => {
      render(<StockOutPage />)
      
      fireEvent.click(screen.getByTestId('select-product'))
      
      await waitFor(() => {
        expect(screen.getByText('Test Paint')).toBeInTheDocument()
        expect(screen.getByText('Test Brand • TEST001')).toBeInTheDocument()
        expect(screen.getByText('Size: 1L')).toBeInTheDocument()
      })
    })

    test('should validate stock availability when product is selected', async () => {
      StockCalculationEngine.getCurrentStock.mockResolvedValue(25)
      
      render(<StockOutPage />)
      
      fireEvent.click(screen.getByTestId('select-product'))
      
      await waitFor(() => {
        expect(StockCalculationEngine.getCurrentStock).toHaveBeenCalledWith('prod_123')
        expect(screen.getByText('Available Stock: 25')).toBeInTheDocument()
      })
    })

    test('should show stock warning when insufficient stock', async () => {
      StockCalculationEngine.getCurrentStock.mockResolvedValue(5)
      
      render(<StockOutPage />)
      
      fireEvent.click(screen.getByTestId('select-product'))
      
      await waitFor(() => {
        expect(screen.getByText('Available Stock: 5')).toBeInTheDocument()
      })
      
      // Try to set quantity higher than available stock
      const quantityInput = screen.getByTestId('quantity-input')
      fireEvent.change(quantityInput, { target: { value: '10' } })
      
      await waitFor(() => {
        expect(screen.getByText('Insufficient Stock')).toBeInTheDocument()
        expect(screen.getByText(/Only 5 units available/)).toBeInTheDocument()
      })
    })

    test('should populate selling price from product data', async () => {
      render(<StockOutPage />)
      
      fireEvent.click(screen.getByTestId('select-product'))
      
      await waitFor(() => {
        const priceInput = screen.getByTestId('input-unit-price')
        expect(priceInput.value).toBe('25.99')
      })
    })

    test('should limit quantity stepper to available stock', async () => {
      StockCalculationEngine.getCurrentStock.mockResolvedValue(10)
      
      render(<StockOutPage />)
      
      fireEvent.click(screen.getByTestId('select-product'))
      
      await waitFor(() => {
        const quantityStepper = screen.getByTestId('quantity-stepper')
        const increaseButton = screen.getByTestId('quantity-increase')
        const quantityInput = screen.getByTestId('quantity-input')
        
        expect(quantityInput.getAttribute('max')).toBe('10')
      })
    })
  })

  describe('Form Validation', () => {
    test('should require transaction date', async () => {
      render(<StockOutPage />)
      
      // Clear the date by setting it to null
      const dateInput = screen.getByTestId('date-input')
      fireEvent.change(dateInput, { target: { value: '' } })
      
      // Try to save
      fireEvent.click(screen.getByTestId('save-transaction'))
      
      await waitFor(() => {
        expect(screen.getByTestId('date-error')).toHaveTextContent('Transaction date is required')
      })
    })

    test('should require at least one product', async () => {
      render(<StockOutPage />)
      
      fireEvent.click(screen.getByTestId('save-transaction'))
      
      await waitFor(() => {
        expect(screen.getByTestId('validation-errors')).toHaveTextContent('At least one product is required')
      })
    })

    test('should validate quantity is greater than 0', async () => {
      render(<StockOutPage />)
      
      // Add a product
      fireEvent.click(screen.getByTestId('select-product'))
      
      await waitFor(() => {
        // Set quantity to 0
        const quantityInput = screen.getByTestId('quantity-input')
        fireEvent.change(quantityInput, { target: { value: '0' } })
        
        // Try to add to cart
        const addButton = screen.getAllByTestId('touch-button').find(btn => 
          btn.textContent === 'Add to Cart'
        )
        fireEvent.click(addButton)
      })
      
      await waitFor(() => {
        expect(screen.getByText('Quantity must be greater than 0')).toBeInTheDocument()
      })
    })

    test('should validate unit price is greater than 0', async () => {
      render(<StockOutPage />)
      
      // Add a product
      fireEvent.click(screen.getByTestId('select-product'))
      
      await waitFor(() => {
        // Set price to 0
        const priceInput = screen.getByTestId('input-unit-price')
        fireEvent.change(priceInput, { target: { value: '0' } })
        
        // Try to add to cart
        const addButton = screen.getAllByTestId('touch-button').find(btn => 
          btn.textContent === 'Add to Cart'
        )
        fireEvent.click(addButton)
      })
      
      await waitFor(() => {
        expect(screen.getByText('Unit price must be greater than 0')).toBeInTheDocument()
      })
    })
  })

  describe('Transaction Cart Integration', () => {
    test('should add product to cart with correct data', async () => {
      render(<StockOutPage />)
      
      // Add a product
      fireEvent.click(screen.getByTestId('select-product'))
      
      await waitFor(() => {
        // Set quantity and price
        const quantityInput = screen.getByTestId('quantity-input')
        const priceInput = screen.getByTestId('input-unit-price')
        
        fireEvent.change(quantityInput, { target: { value: '5' } })
        fireEvent.change(priceInput, { target: { value: '30.00' } })
        
        // Add to cart
        const addButton = screen.getAllByTestId('touch-button').find(btn => 
          btn.textContent === 'Add to Cart'
        )
        fireEvent.click(addButton)
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('cart-item-0')).toHaveTextContent('Test Paint - Qty: 5 - Price: 30')
      })
    })

    test('should update existing item when same product is added', async () => {
      render(<StockOutPage />)
      
      // Add product first time
      fireEvent.click(screen.getByTestId('select-product'))
      
      await waitFor(() => {
        const addButton = screen.getAllByTestId('touch-button').find(btn => 
          btn.textContent === 'Add to Cart'
        )
        fireEvent.click(addButton)
      })
      
      // Add same product again
      await waitFor(() => {
        fireEvent.click(screen.getByTestId('select-product'))
      })
      
      await waitFor(() => {
        const addButton = screen.getAllByTestId('touch-button').find(btn => 
          btn.textContent === 'Add to Cart'
        )
        fireEvent.click(addButton)
      })
      
      await waitFor(() => {
        // Should have combined quantities
        expect(screen.getByTestId('cart-item-0')).toHaveTextContent('Qty: 2')
      })
    })

    test('should remove item from cart', async () => {
      render(<StockOutPage />)
      
      // Add a product
      fireEvent.click(screen.getByTestId('select-product'))
      
      await waitFor(() => {
        const addButton = screen.getAllByTestId('touch-button').find(btn => 
          btn.textContent === 'Add to Cart'
        )
        fireEvent.click(addButton)
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('cart-item-0')).toBeInTheDocument()
        
        // Remove item
        fireEvent.click(screen.getByTestId('remove-item-0'))
      })
      
      await waitFor(() => {
        expect(screen.queryByTestId('cart-item-0')).not.toBeInTheDocument()
      })
    })

    test('should clear all items from cart', async () => {
      render(<StockOutPage />)
      
      // Add a product
      fireEvent.click(screen.getByTestId('select-product'))
      
      await waitFor(() => {
        const addButton = screen.getAllByTestId('touch-button').find(btn => 
          btn.textContent === 'Add to Cart'
        )
        fireEvent.click(addButton)
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('cart-item-0')).toBeInTheDocument()
        
        // Clear all items
        fireEvent.click(screen.getByTestId('clear-items'))
      })
      
      await waitFor(() => {
        expect(screen.queryByTestId('cart-item-0')).not.toBeInTheDocument()
      })
    })
  })

  describe('Transaction Submission', () => {
    test('should create stock out transaction with correct data', async () => {
      createTransaction.mockResolvedValue({
        success: true,
        data: { referenceNumber: 'OUT-001' }
      })
      
      render(<StockOutPage />)
      
      // Add a product
      fireEvent.click(screen.getByTestId('select-product'))
      
      await waitFor(() => {
        const addButton = screen.getAllByTestId('touch-button').find(btn => 
          btn.textContent === 'Add to Cart'
        )
        fireEvent.click(addButton)
      })
      
      // Save transaction
      await waitFor(() => {
        fireEvent.click(screen.getByTestId('save-transaction'))
      })
      
      await waitFor(() => {
        expect(createTransaction).toHaveBeenCalledWith({
          type: 'OUT',
          transactionDate: expect.any(Date),
          notes: null,
          items: [{
            productId: 'prod_123',
            quantity: 1,
            unitPrice: 25.99
          }]
        })
      })
    })

    test('should show success message after successful transaction', async () => {
      createTransaction.mockResolvedValue({
        success: true,
        data: { referenceNumber: 'OUT-001' }
      })
      
      render(<StockOutPage />)
      
      // Add a product and save
      fireEvent.click(screen.getByTestId('select-product'))
      
      await waitFor(() => {
        const addButton = screen.getAllByTestId('touch-button').find(btn => 
          btn.textContent === 'Add to Cart'
        )
        fireEvent.click(addButton)
      })
      
      await waitFor(() => {
        fireEvent.click(screen.getByTestId('save-transaction'))
      })
      
      await waitFor(() => {
        expect(screen.getByText(/Stock out transaction created successfully! Reference: OUT-001/)).toBeInTheDocument()
      })
    })

    test('should handle transaction creation errors', async () => {
      createTransaction.mockResolvedValue({
        success: false,
        error: 'Transaction failed'
      })
      
      render(<StockOutPage />)
      
      // Add a product and save
      fireEvent.click(screen.getByTestId('select-product'))
      
      await waitFor(() => {
        const addButton = screen.getAllByTestId('touch-button').find(btn => 
          btn.textContent === 'Add to Cart'
        )
        fireEvent.click(addButton)
      })
      
      await waitFor(() => {
        fireEvent.click(screen.getByTestId('save-transaction'))
      })
      
      await waitFor(() => {
        expect(screen.getAllByText('Transaction failed')[0]).toBeInTheDocument()
      })
    })

    test('should reset form after successful transaction', async () => {
      createTransaction.mockResolvedValue({
        success: true,
        data: { referenceNumber: 'OUT-001' }
      })
      
      render(<StockOutPage />)
      
      // Add notes
      const notesInput = screen.getByTestId('input-notes-(optional)')
      fireEvent.change(notesInput, { target: { value: 'Test notes' } })
      
      // Add a product and save
      fireEvent.click(screen.getByTestId('select-product'))
      
      await waitFor(() => {
        const addButton = screen.getAllByTestId('touch-button').find(btn => 
          btn.textContent === 'Add to Cart'
        )
        fireEvent.click(addButton)
      })
      
      await waitFor(() => {
        fireEvent.click(screen.getByTestId('save-transaction'))
      })
      
      await waitFor(() => {
        // Form should be reset
        expect(notesInput.value).toBe('')
        expect(screen.queryByTestId('cart-item-0')).not.toBeInTheDocument()
      })
    })
  })

  describe('Stock Availability Validation', () => {
    test('should prevent adding product when stock is insufficient', async () => {
      StockCalculationEngine.getCurrentStock.mockResolvedValue(3)
      
      render(<StockOutPage />)
      
      fireEvent.click(screen.getByTestId('select-product'))
      
      await waitFor(() => {
        // Try to set quantity higher than available
        const quantityInput = screen.getByTestId('quantity-input')
        fireEvent.change(quantityInput, { target: { value: '5' } })
        
        const addButton = screen.getAllByTestId('touch-button').find(btn => 
          btn.textContent === 'Add to Cart'
        )
        fireEvent.click(addButton)
      })
      
      await waitFor(() => {
        expect(screen.getByText(/Insufficient stock. Available: 3, Requested: 5/)).toBeInTheDocument()
      })
    })

    test('should validate total quantity when updating existing cart item', async () => {
      StockCalculationEngine.getCurrentStock.mockResolvedValue(5)
      
      render(<StockOutPage />)
      
      // Add product with quantity 3
      fireEvent.click(screen.getByTestId('select-product'))
      
      await waitFor(() => {
        const quantityInput = screen.getByTestId('quantity-input')
        fireEvent.change(quantityInput, { target: { value: '3' } })
        
        const addButton = screen.getAllByTestId('touch-button').find(btn => 
          btn.textContent === 'Add to Cart'
        )
        fireEvent.click(addButton)
      })
      
      // Try to add same product with quantity 3 again (total would be 6, but only 5 available)
      await waitFor(() => {
        fireEvent.click(screen.getByTestId('select-product'))
      })
      
      await waitFor(() => {
        const quantityInput = screen.getByTestId('quantity-input')
        fireEvent.change(quantityInput, { target: { value: '3' } })
        
        const addButton = screen.getAllByTestId('touch-button').find(btn => 
          btn.textContent === 'Add to Cart'
        )
        fireEvent.click(addButton)
      })
      
      await waitFor(() => {
        expect(screen.getByText(/Insufficient stock for total quantity. Available: 5, Total requested: 6/)).toBeInTheDocument()
      })
    })
  })

  describe('Navigation Integration', () => {
    test('should redirect to transactions page after successful save', async () => {
      createTransaction.mockResolvedValue({
        success: true,
        data: { referenceNumber: 'OUT-001' }
      })
      
      render(<StockOutPage />)
      
      // Add a product and save
      fireEvent.click(screen.getByTestId('select-product'))
      
      await waitFor(() => {
        const addButton = screen.getAllByTestId('touch-button').find(btn => 
          btn.textContent === 'Add to Cart'
        )
        fireEvent.click(addButton)
      })
      
      await waitFor(() => {
        fireEvent.click(screen.getByTestId('save-transaction'))
      })
      
      // Wait for redirect (mocked with setTimeout)
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/transactions')
      }, { timeout: 3000 })
    })
  })
})