/**
 * Login Page Tests
 * Tests for the touch-optimized login page functionality
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import LoginForm from '@/components/LoginForm'
import { loginAction } from '@/lib/actions/auth'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock the login action
jest.mock('@/lib/actions/auth', () => ({
  loginAction: jest.fn()
}))

// Mock useFormState and useFormStatus
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  useFormState: jest.fn(),
  useFormStatus: jest.fn()
}))

const mockPush = jest.fn()
const mockRefresh = jest.fn()

beforeEach(() => {
  useRouter.mockReturnValue({
    push: mockPush,
    refresh: mockRefresh
  })
  
  require('react-dom').useFormState.mockReturnValue([{}, jest.fn()])
  require('react-dom').useFormStatus.mockReturnValue({ pending: false })
  
  jest.clearAllMocks()
})

describe('LoginForm Component', () => {
  test('renders touch-optimized form elements', () => {
    render(<LoginForm csrfToken="test-csrf-token" />)
    
    // Check for required form elements
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    
    // Check for touch-friendly sizing (minimum 44px height)
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    // These elements should have touch-friendly classes
    expect(emailInput).toHaveClass('h-14', 'tablet:h-16')
    expect(passwordInput).toHaveClass('h-14', 'tablet:h-16')
    expect(submitButton).toHaveClass('h-14', 'tablet:h-16')
  })
  
  test('displays error messages with proper styling', () => {
    const errorState = {
      error: 'Invalid credentials',
      fields: { email: 'test@example.com', password: '' }
    }
    
    require('react-dom').useFormState.mockReturnValue([errorState, jest.fn()])
    
    render(<LoginForm csrfToken="test-csrf-token" />)
    
    // Check error message is displayed
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    
    // Find the error message container - it should be in the ErrorMessage component
    const errorText = screen.getByText('Invalid credentials')
    expect(errorText).toBeInTheDocument()
    
    // The error should be styled with red colors
    const errorContainer = errorText.closest('[class*="bg-red"]')
    expect(errorContainer).toBeInTheDocument()
  })
  
  test('shows loading state during form submission', () => {
    require('react-dom').useFormStatus.mockReturnValue({ pending: true })
    
    render(<LoginForm csrfToken="test-csrf-token" />)
    
    const submitButton = screen.getByRole('button')
    expect(submitButton).toHaveTextContent('Signing in...')
    expect(submitButton).toBeDisabled()
    expect(screen.getByRole('button')).toHaveClass('disabled:bg-primary-400')
  })
  
  test('handles successful login redirect', async () => {
    const successState = { success: true }
    require('react-dom').useFormState.mockReturnValue([successState, jest.fn()])
    
    render(<LoginForm csrfToken="test-csrf-token" />)
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })
  
  test('displays rate limiting information', () => {
    render(<LoginForm csrfToken="test-csrf-token" />)
    
    expect(screen.getByText(/secure login with rate limiting protection/i)).toBeInTheDocument()
    expect(screen.getByText(/maximum 5 attempts per 15 minutes/i)).toBeInTheDocument()
  })
  
  test('form inputs have proper accessibility attributes', () => {
    render(<LoginForm csrfToken="test-csrf-token" />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    // Check required attributes
    expect(emailInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('required')
    
    // Check autocomplete attributes
    expect(emailInput).toHaveAttribute('autoComplete', 'email')
    expect(passwordInput).toHaveAttribute('autoComplete', 'current-password')
    
    // Check input types
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(passwordInput).toHaveAttribute('type', 'password')
  })
  
  test('prevents zoom on iPad by setting font-size to 16px', () => {
    render(<LoginForm csrfToken="test-csrf-token" />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    // Check inline style to prevent zoom
    expect(emailInput).toHaveStyle('font-size: 16px')
    expect(passwordInput).toHaveStyle('font-size: 16px')
  })

  test('includes CSRF token in form', () => {
    render(<LoginForm csrfToken="test-csrf-token" />)
    
    const csrfInput = document.querySelector('input[name="_csrf"]')
    expect(csrfInput).toBeInTheDocument()
    expect(csrfInput).toHaveValue('test-csrf-token')
    expect(csrfInput).toHaveAttribute('type', 'hidden')
  })
})

describe('Touch Target Requirements', () => {
  test('all interactive elements meet 44px minimum touch target', () => {
    render(<LoginForm csrfToken="test-csrf-token" />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    // Button should have minimum 44px height (h-14 = 56px, h-16 = 64px)
    expect(submitButton).toHaveClass('h-14', 'tablet:h-16')
    
    // Inputs should also meet touch target requirements
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    expect(emailInput).toHaveClass('h-14', 'tablet:h-16')
    expect(passwordInput).toHaveClass('h-14', 'tablet:h-16')
  })
})