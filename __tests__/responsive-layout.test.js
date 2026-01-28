/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import TouchButton from '@/components/ui/TouchButton'
import TouchInput from '@/components/ui/TouchInput'
import QuantityStepper from '@/components/ui/QuantityStepper'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/dashboard'),
}))

// Mock window.matchMedia for responsive tests
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

describe('Responsive Layout Components', () => {
  beforeEach(() => {
    useRouter.mockReturnValue({
      push: jest.fn(),
      refresh: jest.fn(),
    })
  })

  describe('TouchButton Component', () => {
    test('renders with minimum 44px touch target', () => {
      render(<TouchButton>Test Button</TouchButton>)
      const button = screen.getByRole('button', { name: /test button/i })
      
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('min-h-[44px]')
      expect(button).toHaveClass('min-w-[44px]')
    })

    test('applies correct variant styles', () => {
      const { rerender } = render(<TouchButton variant="primary">Primary</TouchButton>)
      let button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary-600')

      rerender(<TouchButton variant="secondary">Secondary</TouchButton>)
      button = screen.getByRole('button')
      expect(button).toHaveClass('bg-secondary-100')

      rerender(<TouchButton variant="danger">Danger</TouchButton>)
      button = screen.getByRole('button')
      expect(button).toHaveClass('bg-red-600')
    })

    test('includes touch manipulation class', () => {
      render(<TouchButton>Touch Button</TouchButton>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('touch-manipulation')
    })
  })

  describe('TouchInput Component', () => {
    test('renders with minimum 44px height', () => {
      render(<TouchInput label="Test Input" />)
      const input = screen.getByRole('textbox')
      
      expect(input).toBeInTheDocument()
      expect(input).toHaveClass('h-12') // 48px, which is > 44px minimum
    })

    test('displays label and required indicator', () => {
      render(<TouchInput label="Required Field" required />)
      
      expect(screen.getByText('Required Field')).toBeInTheDocument()
      expect(screen.getByText('*')).toBeInTheDocument()
    })

    test('shows error message when provided', () => {
      render(<TouchInput label="Test" error="This field is required" />)
      
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    test('applies error styling when error is present', () => {
      render(<TouchInput label="Test" error="Error message" />)
      const input = screen.getByRole('textbox')
      
      expect(input).toHaveClass('border-red-500')
    })

    test('includes touch manipulation class', () => {
      render(<TouchInput label="Test Input" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('touch-manipulation')
    })
  })

  describe('QuantityStepper Component', () => {
    test('renders with touch-friendly buttons', () => {
      const mockOnChange = jest.fn()
      render(<QuantityStepper value={5} onChange={mockOnChange} />)
      
      const decrementButton = screen.getByLabelText('Decrease quantity')
      const incrementButton = screen.getByLabelText('Increase quantity')
      
      expect(decrementButton).toBeInTheDocument()
      expect(incrementButton).toBeInTheDocument()
      
      // Check minimum touch target size (48px = 12 * 4px)
      expect(decrementButton).toHaveClass('w-12', 'h-12')
      expect(incrementButton).toHaveClass('w-12', 'h-12')
    })

    test('displays current value', () => {
      const mockOnChange = jest.fn()
      render(<QuantityStepper value={10} onChange={mockOnChange} />)
      
      const input = screen.getByDisplayValue('10')
      expect(input).toBeInTheDocument()
    })

    test('includes touch manipulation class on buttons', () => {
      const mockOnChange = jest.fn()
      render(<QuantityStepper value={5} onChange={mockOnChange} />)
      
      const decrementButton = screen.getByLabelText('Decrease quantity')
      const incrementButton = screen.getByLabelText('Increase quantity')
      
      expect(decrementButton).toHaveClass('touch-manipulation')
      expect(incrementButton).toHaveClass('touch-manipulation')
    })
  })

  describe('Typography and Font Size Requirements', () => {
    test('TouchButton uses minimum 16px font size', () => {
      render(<TouchButton>Test Button</TouchButton>)
      const button = screen.getByRole('button')
      
      // text-base in Tailwind is 16px
      expect(button).toHaveClass('text-base')
    })

    test('TouchInput uses minimum 16px font size', () => {
      render(<TouchInput label="Test Input" />)
      const input = screen.getByRole('textbox')
      
      // text-base in Tailwind is 16px
      expect(input).toHaveClass('text-base')
    })
  })

  describe('Accessibility Features', () => {
    test('TouchButton has proper focus styles', () => {
      render(<TouchButton>Accessible Button</TouchButton>)
      const button = screen.getByRole('button')
      
      expect(button).toHaveClass('focus:outline-none')
      expect(button).toHaveClass('focus:ring-2')
    })

    test('TouchInput has proper focus styles', () => {
      render(<TouchInput label="Accessible Input" />)
      const input = screen.getByRole('textbox')
      
      expect(input).toHaveClass('focus:outline-none')
      expect(input).toHaveClass('focus:ring-2')
    })

    test('QuantityStepper buttons have aria-labels', () => {
      const mockOnChange = jest.fn()
      render(<QuantityStepper value={5} onChange={mockOnChange} />)
      
      expect(screen.getByLabelText('Decrease quantity')).toBeInTheDocument()
      expect(screen.getByLabelText('Increase quantity')).toBeInTheDocument()
    })
  })
})