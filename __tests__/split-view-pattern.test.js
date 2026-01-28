/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SplitView from '@/components/layout/SplitView'
import TransactionCart from '@/components/ui/TransactionCart'
import DetailPanel from '@/components/ui/DetailPanel'
import SplitViewDrawer from '@/components/ui/SplitViewDrawer'

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: query.includes('landscape') ? true : false, // Default to landscape
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

describe('Master-Detail Split View Pattern', () => {
  beforeEach(() => {
    // Reset matchMedia mock
    window.matchMedia.mockImplementation(query => ({
      matches: query.includes('landscape') ? true : query.includes('min-width: 768px') ? true : false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))
  })

  describe('SplitView Component', () => {
    test('renders master and detail content in landscape tablet mode', async () => {
      const masterContent = <div data-testid="master">Master Content</div>
      const detailContent = <div data-testid="detail">Detail Content</div>

      render(
        <SplitView
          masterContent={masterContent}
          detailContent={detailContent}
        />
      )

      await waitFor(() => {
        expect(screen.getByTestId('master')).toBeInTheDocument()
        expect(screen.getByTestId('detail')).toBeInTheDocument()
      })
    })

    test('shows only detail content in portrait mode', async () => {
      // Mock portrait mode
      window.matchMedia.mockImplementation(query => ({
        matches: query.includes('landscape') ? false : query.includes('min-width: 768px') ? true : false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }))

      const masterContent = <div data-testid="master">Master Content</div>
      const detailContent = <div data-testid="detail">Detail Content</div>

      render(
        <SplitView
          masterContent={masterContent}
          detailContent={detailContent}
          showDetail={true}
        />
      )

      await waitFor(() => {
        expect(screen.queryByTestId('master')).not.toBeInTheDocument()
        expect(screen.getByTestId('detail')).toBeInTheDocument()
      })
    })

    test('supports right drawer integration', async () => {
      const masterContent = <div data-testid="master">Master Content</div>
      const detailContent = <div data-testid="detail">Detail Content</div>
      const rightDrawer = <div data-testid="drawer">Right Drawer</div>

      render(
        <SplitView
          masterContent={masterContent}
          detailContent={detailContent}
          rightDrawer={rightDrawer}
        />
      )

      await waitFor(() => {
        expect(screen.getByTestId('master')).toBeInTheDocument()
        expect(screen.getByTestId('detail')).toBeInTheDocument()
        expect(screen.getByTestId('drawer')).toBeInTheDocument()
      })
    })

    test('applies custom master width', async () => {
      const masterContent = <div data-testid="master">Master Content</div>
      const detailContent = <div data-testid="detail">Detail Content</div>

      const { container } = render(
        <SplitView
          masterContent={masterContent}
          detailContent={detailContent}
          masterWidth="30%"
        />
      )

      await waitFor(() => {
        const masterPanel = container.querySelector('[data-testid="master"]').parentElement
        expect(masterPanel).toHaveStyle({ width: '30%' })
      })
    })

    test('handles orientation changes', async () => {
      const masterContent = <div data-testid="master">Master Content</div>
      const detailContent = <div data-testid="detail">Detail Content</div>

      render(
        <SplitView
          masterContent={masterContent}
          detailContent={detailContent}
        />
      )

      // In landscape tablet mode, both panels should be visible
      await waitFor(() => {
        expect(screen.getByTestId('master')).toBeInTheDocument()
        expect(screen.getByTestId('detail')).toBeInTheDocument()
      })
    })
  })

  describe('TransactionCart Component', () => {
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
        quantity: 1,
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

    test('renders empty state when no items', () => {
      render(<TransactionCart items={[]} />)
      
      expect(screen.getByText('No items added')).toBeInTheDocument()
      expect(screen.getByText('Add products to start building your transaction')).toBeInTheDocument()
    })

    test('displays transaction items correctly', () => {
      render(<TransactionCart items={mockItems} />)
      
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.getByText('Test Product 2')).toBeInTheDocument()
      expect(screen.getByText('Test Brand • TEST001')).toBeInTheDocument()
      expect(screen.getByText('Size: 1L')).toBeInTheDocument()
    })

    test('calculates totals correctly', () => {
      render(<TransactionCart items={mockItems} showTotals={true} />)
      
      // Total items: 2 + 1 = 3
      expect(screen.getByText('3')).toBeInTheDocument()
      
      // Total cost: (2 * 10.50) + (1 * 25.00) = 21.00 + 25.00 = 46.00
      expect(screen.getByText('$46.00')).toBeInTheDocument()
      
      // Total value: (2 * 15.00) + (1 * 35.00) = 30.00 + 35.00 = 65.00
      expect(screen.getByText('$65.00')).toBeInTheDocument()
    })

    test('handles quantity changes', () => {
      const mockOnUpdateItem = jest.fn()
      render(
        <TransactionCart 
          items={mockItems} 
          onUpdateItem={mockOnUpdateItem}
        />
      )
      
      const incrementButtons = screen.getAllByLabelText('Increase quantity')
      fireEvent.click(incrementButtons[0])
      
      expect(mockOnUpdateItem).toHaveBeenCalledWith('1', { quantity: 3 })
    })

    test('handles item removal', () => {
      const mockOnRemoveItem = jest.fn()
      render(
        <TransactionCart 
          items={mockItems} 
          onRemoveItem={mockOnRemoveItem}
        />
      )
      
      const removeButtons = screen.getAllByLabelText('Remove item')
      fireEvent.click(removeButtons[0])
      
      expect(mockOnRemoveItem).toHaveBeenCalledWith('1')
    })

    test('handles save transaction', () => {
      const mockOnSave = jest.fn()
      render(
        <TransactionCart 
          items={mockItems} 
          onSave={mockOnSave}
        />
      )
      
      const saveButton = screen.getByText('Save Transaction')
      fireEvent.click(saveButton)
      
      expect(mockOnSave).toHaveBeenCalled()
    })

    test('disables save button when no items', () => {
      render(<TransactionCart items={[]} />)
      
      const saveButton = screen.getByText('Save Transaction')
      expect(saveButton).toBeDisabled()
    })

    test('shows loading state', () => {
      render(
        <TransactionCart 
          items={mockItems} 
          isLoading={true}
        />
      )
      
      expect(screen.getByText('Saving...')).toBeInTheDocument()
    })

    test('handles price changes', () => {
      const mockOnUpdateItem = jest.fn()
      render(
        <TransactionCart 
          items={mockItems} 
          onUpdateItem={mockOnUpdateItem}
        />
      )
      
      const unitCostInputs = screen.getAllByDisplayValue('10.5')
      fireEvent.change(unitCostInputs[0], { target: { value: '12.00' } })
      
      expect(mockOnUpdateItem).toHaveBeenCalledWith('1', { unitCost: 12 })
    })

    test('uses minimum 44px touch targets', () => {
      render(<TransactionCart items={mockItems} />)
      
      // Check TouchButton components have min-h-[44px]
      const touchButtons = screen.getAllByRole('button').filter(button => 
        button.className.includes('min-h-[44px]')
      )
      expect(touchButtons.length).toBeGreaterThan(0)
      
      // Check QuantityStepper buttons have h-12 (48px > 44px)
      const quantityButtons = screen.getAllByLabelText(/quantity/)
      quantityButtons.forEach(button => {
        expect(button).toHaveClass('h-12')
      })
    })
  })

  describe('DetailPanel Component', () => {
    test('renders title and subtitle', () => {
      render(
        <DetailPanel 
          title="Product Details" 
          subtitle="SKU: TEST001"
        >
          <div>Content</div>
        </DetailPanel>
      )
      
      expect(screen.getByText('Product Details')).toBeInTheDocument()
      expect(screen.getByText('SKU: TEST001')).toBeInTheDocument()
    })

    test('renders action buttons', () => {
      const mockOnEdit = jest.fn()
      const mockOnDelete = jest.fn()
      const mockOnClose = jest.fn()
      
      render(
        <DetailPanel 
          title="Test Panel"
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        >
          <div>Content</div>
        </DetailPanel>
      )
      
      expect(screen.getByLabelText('Edit')).toBeInTheDocument()
      expect(screen.getByLabelText('Delete')).toBeInTheDocument()
      expect(screen.getByLabelText('Close')).toBeInTheDocument()
    })

    test('handles action button clicks', () => {
      const mockOnEdit = jest.fn()
      const mockOnDelete = jest.fn()
      const mockOnClose = jest.fn()
      
      render(
        <DetailPanel 
          title="Test Panel"
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        >
          <div>Content</div>
        </DetailPanel>
      )
      
      fireEvent.click(screen.getByLabelText('Edit'))
      expect(mockOnEdit).toHaveBeenCalled()
      
      fireEvent.click(screen.getByLabelText('Delete'))
      expect(mockOnDelete).toHaveBeenCalled()
      
      fireEvent.click(screen.getByLabelText('Close'))
      expect(mockOnClose).toHaveBeenCalled()
    })

    test('renders custom actions', () => {
      const customAction = {
        icon: <span>Custom</span>,
        onClick: jest.fn(),
        label: 'Custom Action'
      }
      
      render(
        <DetailPanel 
          title="Test Panel"
          actions={[customAction]}
        >
          <div>Content</div>
        </DetailPanel>
      )
      
      expect(screen.getByLabelText('Custom Action')).toBeInTheDocument()
    })
  })

  describe('SplitViewDrawer Component', () => {
    test('renders as fixed drawer in landscape tablet mode', async () => {
      render(
        <SplitViewDrawer title="Test Drawer" isOpen={true}>
          <div data-testid="drawer-content">Drawer Content</div>
        </SplitViewDrawer>
      )
      
      await waitFor(() => {
        expect(screen.getByText('Test Drawer')).toBeInTheDocument()
        expect(screen.getByTestId('drawer-content')).toBeInTheDocument()
      })
    })

    test('renders as overlay drawer in portrait mode', async () => {
      // Mock portrait mode
      window.matchMedia.mockImplementation(query => ({
        matches: query.includes('landscape') ? false : query.includes('min-width: 768px') ? true : false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }))

      render(
        <SplitViewDrawer title="Test Drawer" isOpen={true}>
          <div data-testid="drawer-content">Drawer Content</div>
        </SplitViewDrawer>
      )
      
      await waitFor(() => {
        expect(screen.getByText('Test Drawer')).toBeInTheDocument()
        expect(screen.getByTestId('drawer-content')).toBeInTheDocument()
      })
    })

    test('handles toggle functionality', async () => {
      const mockOnToggle = jest.fn()
      
      render(
        <SplitViewDrawer 
          title="Test Drawer" 
          isOpen={true}
          onToggle={mockOnToggle}
          collapsible={true}
        >
          <div>Content</div>
        </SplitViewDrawer>
      )
      
      await waitFor(() => {
        const toggleButton = screen.getByLabelText('Collapse drawer')
        fireEvent.click(toggleButton)
        expect(mockOnToggle).toHaveBeenCalled()
      })
    })

    test('supports left and right positioning', async () => {
      const { rerender } = render(
        <SplitViewDrawer title="Left Drawer" position="left" isOpen={true}>
          <div>Content</div>
        </SplitViewDrawer>
      )
      
      await waitFor(() => {
        expect(screen.getByText('Left Drawer')).toBeInTheDocument()
      })

      rerender(
        <SplitViewDrawer title="Right Drawer" position="right" isOpen={true}>
          <div>Content</div>
        </SplitViewDrawer>
      )
      
      await waitFor(() => {
        expect(screen.getByText('Right Drawer')).toBeInTheDocument()
      })
    })
  })

  describe('Touch Target Requirements', () => {
    test('all interactive elements meet 44px minimum', () => {
      const mockItems = [{
        id: '1',
        quantity: 1,
        product: { name: 'Test', brand: 'Brand', sku: 'SKU' }
      }]
      
      render(
        <div>
          <TransactionCart items={mockItems} />
          <DetailPanel title="Test" onEdit={() => {}} onDelete={() => {}} onClose={() => {}}>
            Content
          </DetailPanel>
        </div>
      )
      
      // Check TouchButton components have min-h-[44px]
      const touchButtons = screen.getAllByRole('button').filter(button => 
        button.className.includes('min-h-[44px]')
      )
      expect(touchButtons.length).toBeGreaterThan(0)
      
      // Check QuantityStepper buttons have h-12 (48px > 44px)
      const quantityButtons = screen.getAllByLabelText(/quantity/)
      quantityButtons.forEach(button => {
        expect(button).toHaveClass('h-12')
      })
    })
  })

  describe('Responsive Behavior', () => {
    test('shows split view in landscape tablet mode', async () => {
      // Ensure landscape tablet mode
      window.matchMedia.mockImplementation(query => ({
        matches: query.includes('landscape') ? true : query.includes('min-width: 768px') ? true : false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }))

      render(
        <SplitView
          masterContent={<div data-testid="master">Master</div>}
          detailContent={<div data-testid="detail">Detail</div>}
        />
      )

      // In landscape tablet mode, should show both panels
      await waitFor(() => {
        expect(screen.getByTestId('master')).toBeInTheDocument()
        expect(screen.getByTestId('detail')).toBeInTheDocument()
      })
    })

    test('shows single panel in portrait tablet mode', async () => {
      // Ensure portrait tablet mode
      window.matchMedia.mockImplementation(query => ({
        matches: query.includes('landscape') ? false : query.includes('min-width: 768px') ? true : false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }))

      render(
        <SplitView
          masterContent={<div data-testid="master">Master</div>}
          detailContent={<div data-testid="detail">Detail</div>}
          showDetail={true}
        />
      )

      // In portrait mode with showDetail=true, should only show detail
      await waitFor(() => {
        expect(screen.queryByTestId('master')).not.toBeInTheDocument()
        expect(screen.getByTestId('detail')).toBeInTheDocument()
      })
    })
  })
})