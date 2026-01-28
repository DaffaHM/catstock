import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import TransactionCart from '@/components/ui/TransactionCart'

describe('TransactionCart Enhanced Features', () => {
  const mockItems = [
    {
      id: '1',
      quantity: 2,
      unitCost: 10.50,
      unitPrice: 15.00,
      product: {
        name: 'Test Product 1',
        brand: 'Test Brand',
        sku: 'TEST001',
        size: '1L'
      }
    },
    {
      id: '2',
      quantity: 0, // Invalid quantity for testing
      unitCost: 25.00,
      unitPrice: 35.00,
      product: {
        name: 'Test Product 2',
        brand: 'Test Brand',
        sku: 'TEST002',
        size: '5L'
      }
    }
  ]

  describe('Validation Features', () => {
    test('shows validation errors for invalid items', () => {
      render(
        <TransactionCart 
          items={mockItems}
          transactionType="OUT"
        />
      )
      
      // Should show validation error for item with 0 quantity
      expect(screen.getByText('Please fix the following issues:')).toBeInTheDocument()
      expect(screen.getByText('Item 2: Quantity must be greater than 0')).toBeInTheDocument()
    })

    test('disables save button when validation fails', () => {
      render(
        <TransactionCart 
          items={mockItems}
          transactionType="OUT"
          onSave={jest.fn()}
        />
      )
      
      const saveButton = screen.getByText('Save Transaction')
      expect(saveButton).toBeDisabled()
    })

    test('shows external validation errors', () => {
      const externalErrors = ['Supplier is required', 'Date cannot be in the future']
      
      render(
        <TransactionCart 
          items={[mockItems[0]]} // Valid item
          transactionType="IN"
          validationErrors={externalErrors}
        />
      )
      
      expect(screen.getByText('Supplier is required')).toBeInTheDocument()
      expect(screen.getByText('Date cannot be in the future')).toBeInTheDocument()
    })

    test('enables save button when all validation passes', () => {
      const validItems = [{
        id: '1',
        quantity: 2,
        unitPrice: 15.00,
        product: {
          name: 'Valid Product',
          brand: 'Test Brand',
          sku: 'VALID001'
        }
      }]
      
      render(
        <TransactionCart 
          items={validItems}
          transactionType="OUT"
          onSave={jest.fn()}
        />
      )
      
      const saveButton = screen.getByText('Save Transaction')
      expect(saveButton).not.toBeDisabled()
    })
  })

  describe('Transaction Type Specific Features', () => {
    test('shows only unit cost fields for IN transactions', () => {
      render(
        <TransactionCart 
          items={[mockItems[0]]}
          transactionType="IN"
        />
      )
      
      expect(screen.getByDisplayValue('10.5')).toBeInTheDocument() // Unit cost input
      expect(screen.queryByDisplayValue('15')).not.toBeInTheDocument() // Unit price should not exist
    })

    test('shows only unit price fields for OUT transactions', () => {
      render(
        <TransactionCart 
          items={[mockItems[0]]}
          transactionType="OUT"
        />
      )
      
      expect(screen.getByDisplayValue('15')).toBeInTheDocument() // Unit price input
      expect(screen.queryByDisplayValue('10.5')).not.toBeInTheDocument() // Unit cost should not exist
    })

    test('shows no price fields for ADJUST transactions', () => {
      render(
        <TransactionCart 
          items={[mockItems[0]]}
          transactionType="ADJUST"
        />
      )
      
      expect(screen.queryByLabelText('Unit Cost')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Unit Price')).not.toBeInTheDocument()
    })

    test('validates unit cost for IN transactions', () => {
      const itemsWithoutCost = [{
        id: '1',
        quantity: 2,
        unitCost: null, // Missing unit cost
        product: {
          name: 'Test Product',
          brand: 'Test Brand',
          sku: 'TEST001'
        }
      }]
      
      render(
        <TransactionCart 
          items={itemsWithoutCost}
          transactionType="IN"
        />
      )
      
      expect(screen.getByText('Item 1: Unit cost is required for stock in transactions')).toBeInTheDocument()
    })

    test('validates unit price for OUT transactions', () => {
      const itemsWithoutPrice = [{
        id: '1',
        quantity: 2,
        unitPrice: null, // Missing unit price
        product: {
          name: 'Test Product',
          brand: 'Test Brand',
          sku: 'TEST001'
        }
      }]
      
      render(
        <TransactionCart 
          items={itemsWithoutPrice}
          transactionType="OUT"
        />
      )
      
      expect(screen.getByText('Item 1: Unit price is required for stock out transactions')).toBeInTheDocument()
    })
  })

  describe('Success Message Display', () => {
    test('shows success message when provided', () => {
      render(
        <TransactionCart 
          items={[mockItems[0]]}
          successMessage="Transaction saved successfully!"
        />
      )
      
      expect(screen.getByText('Transaction saved successfully!')).toBeInTheDocument()
    })

    test('shows success message with check icon', () => {
      render(
        <TransactionCart 
          items={[mockItems[0]]}
          successMessage="Success!"
        />
      )
      
      // Check for success styling
      const successContainer = screen.getByText('Success!').closest('div')
      expect(successContainer).toHaveClass('bg-green-50', 'border-green-200')
    })
  })

  describe('Item-Level Validation Display', () => {
    test('highlights items with validation errors', () => {
      render(
        <TransactionCart 
          items={mockItems}
          transactionType="OUT"
        />
      )
      
      // Find all item containers
      const itemContainers = screen.getAllByText(/Test Product/).map(el => {
        // Navigate up to find the item container div
        let container = el
        while (container && !container.className.includes('border')) {
          container = container.parentElement
        }
        return container
      })
      
      // The second item should have error styling (red border)
      const invalidItemContainer = itemContainers.find(container => 
        container && container.textContent.includes('Test Product 2')
      )
      
      expect(invalidItemContainer).toHaveClass('border-red-300')
    })

    test('shows item-specific error messages', () => {
      render(
        <TransactionCart 
          items={mockItems}
          transactionType="OUT"
        />
      )
      
      // Should show the error message within the item
      expect(screen.getByText('Quantity must be greater than 0')).toBeInTheDocument()
    })
  })

  describe('Enhanced Save Functionality', () => {
    test('calls onSave only when validation passes', () => {
      const mockOnSave = jest.fn()
      const validItems = [{
        id: '1',
        quantity: 2,
        unitPrice: 15.00,
        product: {
          name: 'Valid Product',
          brand: 'Test Brand',
          sku: 'VALID001'
        }
      }]
      
      render(
        <TransactionCart 
          items={validItems}
          transactionType="OUT"
          onSave={mockOnSave}
        />
      )
      
      const saveButton = screen.getByText('Save Transaction')
      fireEvent.click(saveButton)
      
      expect(mockOnSave).toHaveBeenCalled()
    })

    test('does not call onSave when validation fails', () => {
      const mockOnSave = jest.fn()
      
      render(
        <TransactionCart 
          items={mockItems} // Contains invalid item
          transactionType="OUT"
          onSave={mockOnSave}
        />
      )
      
      const saveButton = screen.getByText('Save Transaction')
      fireEvent.click(saveButton)
      
      expect(mockOnSave).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility and Touch Optimization', () => {
    test('maintains 44px minimum touch targets for all buttons', () => {
      render(
        <TransactionCart 
          items={[mockItems[0]]}
          transactionType="OUT"
        />
      )
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        // TouchButton components should have min-h-[44px] class
        // QuantityStepper buttons have h-12 class (48px > 44px)
        const hasMinHeight = button.className.includes('min-h-[44px]') || 
                           button.className.includes('h-12')
        
        expect(hasMinHeight).toBe(true)
      })
    })

    test('provides proper ARIA labels for interactive elements', () => {
      render(
        <TransactionCart 
          items={[mockItems[0]]}
          transactionType="OUT"
        />
      )
      
      expect(screen.getByLabelText('Remove item')).toBeInTheDocument()
      expect(screen.getByLabelText('Increase quantity')).toBeInTheDocument()
      expect(screen.getByLabelText('Decrease quantity')).toBeInTheDocument()
    })
  })
})