import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import ReturnsPage from '@/components/transactions/ReturnsPage'
import { createTransaction } from '@/lib/actions/transactions'
import { TransactionType } from '@/lib/validations/transaction'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

jest.mock('@/lib/actions/transactions', () => ({
  createTransaction: jest.fn()
}))

// Mock UI components
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
    title, 
    saveButtonText, 
    onSave, 
    onClear, 
    onUpdateItem, 
    onRemoveItem,
    transactionType,
    validationErrors,
    successMessage
  }) {
    return (
      <div data-testid="transaction-cart">
        <h2>{title}</h2>
        <div data-testid="cart-items">
          {items.map((item, index) => (
            <div key={item.id || index} data-testid={`cart-item-${index}`}>
              {item.product?.name} - Qty: {item.quantity}
              <button 
                onClick={() => onRemoveItem(item.id)}
                data-testid={`remove-item-${index}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        {validationErrors?.length > 0 && (
          <div data-testid="validation-errors">
            {validationErrors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}
        {successMessage && (
          <div data-testid="success-message">{successMessage}</div>
        )}
        <button 
          onClick={onSave}
          disabled={items.length === 0}
          data-testid="save-button"
        >
          {saveButtonText}
        </button>
        <button onClick={onClear} data-testid="clear-button">Clear</button>
      </div>
    )
  }
})

jest.mock('@/components/ui/ProductAutocomplete', () => {
  return function MockProductAutocomplete({ onProductSelect, placeholder }) {
    return (
      <div data-testid="product-autocomplete">
        <input placeholder={placeholder} />
        <button 
          onClick={() => onProductSelect({
            id: 'test-product-1',
            name: 'Test Paint',
            brand: 'Test Brand',
            sku: 'TEST-001',
            size: '1L',
            purchasePrice: 10.50,
            sellingPrice: 15.99
          })}
          data-testid="select-product"
        >
          Select Test Product
        </button>
      </div>
    )
  }
})

jest.mock('@/components/ui/SupplierSelect', () => {
  return function MockSupplierSelect({ onSupplierSelect, value, error }) {
    return (
      <div data-testid="supplier-select">
        <button 
          onClick={() => onSupplierSelect({
            id: 'test-supplier-1',
            name: 'Test Supplier'
          })}
          data-testid="select-supplier"
        >
          {value ? value.name : 'Select Supplier'}
        </button>
        {error && <div data-testid="supplier-error">{error}</div>}
      </div>
    )
  }
})

jest.mock('@/components/ui/DatePicker', () => {
  return function MockDatePicker({ label, value, onChange, error }) {
    return (
      <div data-testid="date-picker">
        <label>{label}</label>
        <input 
          type="date" 
          value={value?.toISOString().split('T')[0] || ''}
          onChange={(e) => onChange(new Date(e.target.value))}
        />
        {error && <div data-testid="date-error">{error}</div>}
      </div>
    )
  }
})

jest.mock('@/components/ui/TouchButton', () => {
  return function MockTouchButton({ children, onClick, variant, disabled, className }) {
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

jest.mock('@/components/ui/TouchInput', () => {
  return function MockTouchInput({ label, value, onChange, placeholder, error, multiline, rows }) {
    return (
      <div data-testid="touch-input">
        <label>{label}</label>
        {multiline ? (
          <textarea 
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
          />
        ) : (
          <input 
            value={value}
            onChange={onChange}
            placeholder={placeholder}
          />
        )}
        {error && <div data-testid="input-error">{error}</div>}
      </div>
    )
  }
})

jest.mock('@/components/ui/QuantityStepper', () => {
  return function MockQuantityStepper({ value, onChange, min, max }) {
    return (
      <div data-testid="quantity-stepper">
        <button onClick={() => onChange(Math.max(min, value - 1))}>-</button>
        <input 
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
        />
        <button onClick={() => onChange(Math.min(max, value + 1))}>+</button>
      </div>
    )
  }
})

describe('ReturnsPage', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    useRouter.mockReturnValue({
      push: mockPush
    })
    createTransaction.mockClear()
    mockPush.mockClear()
  })

  describe('Page Rendering', () => {
    test('should render returns page with correct title and return type selection', () => {
      render(<ReturnsPage />)
      
      expect(screen.getByText('Returns')).toBeInTheDocument()
      expect(screen.getByText('Process return transactions')).toBeInTheDocument()
      expect(screen.getByText('Return Type')).toBeInTheDocument()
      expect(screen.getByText('Return to Supplier')).toBeInTheDocument()
      expect(screen.getByText('Customer Return')).toBeInTheDocument()
    })

    test('should render transaction details section', () => {
      render(<ReturnsPage />)
      
      expect(screen.getByText('Transaction Details')).toBeInTheDocument()
      expect(screen.getByText('Return Date')).toBeInTheDocument()
      expect(screen.getByText('Return Reason')).toBeInTheDocument()
      expect(screen.getByText('Additional Notes (Optional)')).toBeInTheDocument()
    })

    test('should render add products section', () => {
      render(<ReturnsPage />)
      
      expect(screen.getByText('Add Products to Return')).toBeInTheDocument()
      expect(screen.getByText('Search Products')).toBeInTheDocument()
    })
  })

  describe('Return Type Selection', () => {
    test('should default to RETURN_IN type', () => {
      render(<ReturnsPage />)
      
      // Should show supplier select for RETURN_IN
      expect(screen.getByTestId('supplier-select')).toBeInTheDocument()
    })

    test('should switch to RETURN_OUT and hide supplier selection', () => {
      render(<ReturnsPage />)
      
      // Click on Customer Return button
      const customerReturnButton = screen.getByText('Customer Return')
      fireEvent.click(customerReturnButton)
      
      // Supplier select should not be visible for RETURN_OUT
      expect(screen.queryByTestId('supplier-select')).not.toBeInTheDocument()
    })

    test('should clear items when switching return types', () => {
      render(<ReturnsPage />)
      
      // Add a product first
      const selectProductButton = screen.getByTestId('select-product')
      fireEvent.click(selectProductButton)
      
      // Switch to RETURN_OUT
      const customerReturnButton = screen.getByText('Customer Return')
      fireEvent.click(customerReturnButton)
      
      // Items should be cleared (cart should show 0 items)
      const cartItems = screen.queryAllByTestId(/cart-item-/)
      expect(cartItems).toHaveLength(0)
    })
  })

  describe('Product Selection and Addition', () => {
    test('should handle product selection and show add product form', () => {
      render(<ReturnsPage />)
      
      const selectProductButton = screen.getByTestId('select-product')
      fireEvent.click(selectProductButton)
      
      // Should show product details
      expect(screen.getByText('Test Paint')).toBeInTheDocument()
      expect(screen.getByText('Test Brand • TEST-001')).toBeInTheDocument()
      expect(screen.getByText('Size: 1L')).toBeInTheDocument()
    })

    test('should populate unit cost for RETURN_IN transactions', () => {
      render(<ReturnsPage />)
      
      const selectProductButton = screen.getByTestId('select-product')
      fireEvent.click(selectProductButton)
      
      // Should show Unit Cost field for RETURN_IN
      expect(screen.getByText('Unit Cost (Optional)')).toBeInTheDocument()
    })

    test('should populate unit price for RETURN_OUT transactions', () => {
      render(<ReturnsPage />)
      
      // Switch to RETURN_OUT
      const customerReturnButton = screen.getByText('Customer Return')
      fireEvent.click(customerReturnButton)
      
      const selectProductButton = screen.getByTestId('select-product')
      fireEvent.click(selectProductButton)
      
      // Should show Unit Price field for RETURN_OUT
      expect(screen.getByText('Unit Price (Optional)')).toBeInTheDocument()
    })

    test('should add product to cart with correct data', async () => {
      render(<ReturnsPage />)
      
      // Select a product
      const selectProductButton = screen.getByTestId('select-product')
      fireEvent.click(selectProductButton)
      
      // Add to cart
      const addButton = screen.getByText('Add to Return')
      fireEvent.click(addButton)
      
      // Should show item in cart
      await waitFor(() => {
        expect(screen.getByTestId('cart-item-0')).toBeInTheDocument()
        expect(screen.getByText('Test Paint - Qty: 1')).toBeInTheDocument()
      })
    })
  })

  describe('Form Validation', () => {
    test('should require supplier for RETURN_IN transactions', async () => {
      render(<ReturnsPage />)
      
      // Try to save without supplier
      const saveButton = screen.getByTestId('save-button')
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('supplier-error')).toBeInTheDocument()
      })
    })

    test('should not require supplier for RETURN_OUT transactions', async () => {
      render(<ReturnsPage />)
      
      // Switch to RETURN_OUT
      const customerReturnButton = screen.getByText('Customer Return')
      fireEvent.click(customerReturnButton)
      
      // Add a product
      const selectProductButton = screen.getByTestId('select-product')
      fireEvent.click(selectProductButton)
      
      const addButton = screen.getByText('Add to Return')
      fireEvent.click(addButton)
      
      // Mock successful transaction
      createTransaction.mockResolvedValue({
        success: true,
        data: { referenceNumber: 'RET-001' }
      })
      
      // Should be able to save without supplier
      const saveButton = screen.getByTestId('save-button')
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(createTransaction).toHaveBeenCalledWith(
          expect.objectContaining({
            type: TransactionType.RETURN_OUT,
            supplierId: null
          })
        )
      })
    })

    test('should require at least one product', async () => {
      render(<ReturnsPage />)
      
      // Select supplier
      const selectSupplierButton = screen.getByTestId('select-supplier')
      fireEvent.click(selectSupplierButton)
      
      // Try to save without products
      const saveButton = screen.getByTestId('save-button')
      fireEvent.click(saveButton)
      
      // Save button should be disabled when no items
      expect(saveButton).toBeDisabled()
    })
  })

  describe('Transaction Submission', () => {
    test('should create RETURN_IN transaction with correct data', async () => {
      render(<ReturnsPage />)
      
      // Select supplier
      const selectSupplierButton = screen.getByTestId('select-supplier')
      fireEvent.click(selectSupplierButton)
      
      // Add return reason
      const reasonInput = screen.getByPlaceholderText(/Enter reason for return/)
      fireEvent.change(reasonInput, { target: { value: 'Damaged goods' } })
      
      // Add a product
      const selectProductButton = screen.getByTestId('select-product')
      fireEvent.click(selectProductButton)
      
      const addButton = screen.getByText('Add to Return')
      fireEvent.click(addButton)
      
      // Mock successful transaction
      createTransaction.mockResolvedValue({
        success: true,
        data: { referenceNumber: 'RET-001' }
      })
      
      // Save transaction
      const saveButton = screen.getByTestId('save-button')
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(createTransaction).toHaveBeenCalledWith(
          expect.objectContaining({
            type: TransactionType.RETURN_IN,
            supplierId: 'test-supplier-1',
            notes: 'Damaged goods',
            items: expect.arrayContaining([
              expect.objectContaining({
                productId: 'test-product-1',
                quantity: 1,
                unitCost: 10.50
              })
            ])
          })
        )
      })
    })

    test('should show success message after successful transaction', async () => {
      render(<ReturnsPage />)
      
      // Select supplier and add product
      const selectSupplierButton = screen.getByTestId('select-supplier')
      fireEvent.click(selectSupplierButton)
      
      const selectProductButton = screen.getByTestId('select-product')
      fireEvent.click(selectProductButton)
      
      const addButton = screen.getByText('Add to Return')
      fireEvent.click(addButton)
      
      // Mock successful transaction
      createTransaction.mockResolvedValue({
        success: true,
        data: { referenceNumber: 'RET-001' }
      })
      
      // Save transaction
      const saveButton = screen.getByTestId('save-button')
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Return In transaction created successfully! Reference: RET-001/)).toBeInTheDocument()
      })
    })

    test('should handle transaction creation errors', async () => {
      render(<ReturnsPage />)
      
      // Select supplier and add product
      const selectSupplierButton = screen.getByTestId('select-supplier')
      fireEvent.click(selectSupplierButton)
      
      const selectProductButton = screen.getByTestId('select-product')
      fireEvent.click(selectProductButton)
      
      const addButton = screen.getByText('Add to Return')
      fireEvent.click(addButton)
      
      // Mock failed transaction
      createTransaction.mockResolvedValue({
        success: false,
        error: 'Transaction failed'
      })
      
      // Save transaction
      const saveButton = screen.getByTestId('save-button')
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(screen.getByText('Transaction failed')).toBeInTheDocument()
      })
    })

    test('should reset form after successful transaction', async () => {
      render(<ReturnsPage />)
      
      // Select supplier and add product
      const selectSupplierButton = screen.getByTestId('select-supplier')
      fireEvent.click(selectSupplierButton)
      
      const selectProductButton = screen.getByTestId('select-product')
      fireEvent.click(selectProductButton)
      
      const addButton = screen.getByText('Add to Return')
      fireEvent.click(addButton)
      
      // Mock successful transaction
      createTransaction.mockResolvedValue({
        success: true,
        data: { referenceNumber: 'RET-001' }
      })
      
      // Save transaction
      const saveButton = screen.getByTestId('save-button')
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        // Cart should be empty after successful transaction
        const cartItems = screen.queryAllByTestId(/cart-item-/)
        expect(cartItems).toHaveLength(0)
      })
    })
  })

  describe('Navigation Integration', () => {
    test('should redirect to transactions page after successful save', async () => {
      render(<ReturnsPage />)
      
      // Select supplier and add product
      const selectSupplierButton = screen.getByTestId('select-supplier')
      fireEvent.click(selectSupplierButton)
      
      const selectProductButton = screen.getByTestId('select-product')
      fireEvent.click(selectProductButton)
      
      const addButton = screen.getByText('Add to Return')
      fireEvent.click(addButton)
      
      // Mock successful transaction
      createTransaction.mockResolvedValue({
        success: true,
        data: { referenceNumber: 'RET-001' }
      })
      
      // Save transaction
      const saveButton = screen.getByTestId('save-button')
      fireEvent.click(saveButton)
      
      // Should redirect after delay
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/transactions')
      }, { timeout: 3000 })
    })
  })
})