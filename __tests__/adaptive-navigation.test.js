/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import SidebarNavigation from '@/components/layout/SidebarNavigation'
import BottomNavigation from '@/components/layout/BottomNavigation'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/dashboard'),
}))

// Mock the auth actions
jest.mock('@/lib/actions/auth', () => ({
  logoutAction: jest.fn(),
}))

// Mock useFormStatus
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  useFormStatus: () => ({ pending: false }),
}))

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

describe('Adaptive Navigation Components', () => {
  beforeEach(() => {
    usePathname.mockReturnValue('/dashboard')
  })

  describe('SidebarNavigation Component', () => {
    test('renders navigation items with proper touch targets', () => {
      render(
        <SidebarNavigation>
          <div>Test Content</div>
        </SidebarNavigation>
      )
      
      // Check that navigation items are present
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Products')).toBeInTheDocument()
      expect(screen.getByText('Suppliers')).toBeInTheDocument()
      expect(screen.getByText('Stock In')).toBeInTheDocument()
      expect(screen.getByText('Stock Out')).toBeInTheDocument()
      expect(screen.getByText('Reports')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    test('highlights active navigation item', () => {
      usePathname.mockReturnValue('/dashboard')
      
      render(
        <SidebarNavigation>
          <div>Test Content</div>
        </SidebarNavigation>
      )
      
      const dashboardLink = screen.getByText('Dashboard').closest('a')
      expect(dashboardLink).toHaveClass('bg-primary-50', 'text-primary-600')
    })

    test('can be collapsed and expanded', () => {
      render(
        <SidebarNavigation>
          <div>Test Content</div>
        </SidebarNavigation>
      )
      
      const toggleButton = screen.getByLabelText('Collapse sidebar')
      expect(toggleButton).toBeInTheDocument()
      
      // Initially expanded - should show CatStock title
      expect(screen.getByText('CatStock')).toBeInTheDocument()
      
      // Click to collapse
      fireEvent.click(toggleButton)
      
      // After collapse, button should change to expand
      expect(screen.getByLabelText('Expand sidebar')).toBeInTheDocument()
    })

    test('renders main content area', () => {
      render(
        <SidebarNavigation>
          <div data-testid="main-content">Test Content</div>
        </SidebarNavigation>
      )
      
      expect(screen.getByTestId('main-content')).toBeInTheDocument()
    })

    test('navigation items have minimum touch target size', () => {
      render(
        <SidebarNavigation>
          <div>Test Content</div>
        </SidebarNavigation>
      )
      
      const dashboardLink = screen.getByText('Dashboard').closest('a')
      expect(dashboardLink).toHaveClass('min-h-[44px]')
    })
  })

  describe('BottomNavigation Component', () => {
    test('renders navigation items with icons and labels', () => {
      render(
        <BottomNavigation>
          <div>Test Content</div>
        </BottomNavigation>
      )
      
      // Check that navigation items are present
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Products')).toBeInTheDocument()
      expect(screen.getByText('Stock In')).toBeInTheDocument()
      expect(screen.getByText('Stock Out')).toBeInTheDocument()
      expect(screen.getByText('Adjust')).toBeInTheDocument()
      
      // Check that header items are present (by aria-label since they don't have text)
      expect(screen.getByLabelText('Returns')).toBeInTheDocument()
      expect(screen.getByLabelText('Suppliers')).toBeInTheDocument()
      expect(screen.getByLabelText('Reports')).toBeInTheDocument()
      expect(screen.getByLabelText('Settings')).toBeInTheDocument()
    })

    test('highlights active navigation item', () => {
      usePathname.mockReturnValue('/dashboard')
      
      render(
        <BottomNavigation>
          <div>Test Content</div>
        </BottomNavigation>
      )
      
      const dashboardLink = screen.getByText('Dashboard').closest('a')
      expect(dashboardLink).toHaveClass('text-primary-600')
    })

    test('renders header with app title', () => {
      render(
        <BottomNavigation>
          <div>Test Content</div>
        </BottomNavigation>
      )
      
      expect(screen.getByText('CatStock')).toBeInTheDocument()
    })

    test('renders main content with proper spacing for bottom nav', () => {
      render(
        <BottomNavigation>
          <div data-testid="main-content">Test Content</div>
        </BottomNavigation>
      )
      
      const mainContent = screen.getByTestId('main-content').closest('main')
      expect(mainContent).toHaveClass('pb-20') // Space for bottom navigation
    })

    test('navigation items have minimum touch target size', () => {
      render(
        <BottomNavigation>
          <div>Test Content</div>
        </BottomNavigation>
      )
      
      const dashboardLink = screen.getByText('Dashboard').closest('a')
      expect(dashboardLink).toHaveClass('min-h-[44px]', 'min-w-[44px]')
    })

    test('bottom navigation is fixed at bottom', () => {
      render(
        <BottomNavigation>
          <div>Test Content</div>
        </BottomNavigation>
      )
      
      const bottomNav = screen.getByRole('navigation')
      expect(bottomNav).toHaveClass('fixed', 'bottom-0')
    })
  })

  describe('Navigation Accessibility', () => {
    test('sidebar navigation has proper ARIA labels', () => {
      render(
        <SidebarNavigation>
          <div>Test Content</div>
        </SidebarNavigation>
      )
      
      const collapseButton = screen.getByLabelText('Collapse sidebar')
      expect(collapseButton).toBeInTheDocument()
    })

    test('bottom navigation links have proper accessibility', () => {
      render(
        <BottomNavigation>
          <div>Test Content</div>
        </BottomNavigation>
      )
      
      const supplierLink = screen.getByLabelText('Suppliers')
      expect(supplierLink).toBeInTheDocument()
    })
  })

  describe('Typography Requirements', () => {
    test('sidebar navigation uses appropriate font sizes', () => {
      render(
        <SidebarNavigation>
          <div>Test Content</div>
        </SidebarNavigation>
      )
      
      const dashboardText = screen.getByText('Dashboard')
      expect(dashboardText).toHaveClass('text-base') // 16px minimum
    })

    test('bottom navigation uses appropriate font sizes', () => {
      render(
        <BottomNavigation>
          <div>Test Content</div>
        </BottomNavigation>
      )
      
      const headerTitle = screen.getByText('CatStock')
      expect(headerTitle).toHaveClass('text-xl') // Larger than 16px
    })
  })
})