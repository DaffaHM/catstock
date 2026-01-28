import { render, screen, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import DashboardContent from '@/components/dashboard/DashboardContent'

// Mock the dashboard actions
jest.mock('@/lib/actions/dashboard', () => ({
  getDashboardData: jest.fn(),
  refreshDashboard: jest.fn()
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: jest.fn()
  }))
}))

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  RefreshCwIcon: () => <div data-testid="refresh-icon">RefreshIcon</div>,
  PackageIcon: () => <div data-testid="package-icon">PackageIcon</div>,
  AlertTriangleIcon: () => <div data-testid="alert-icon">AlertIcon</div>,
  TrendingUpIcon: () => <div data-testid="trending-icon">TrendingIcon</div>,
  DollarSignIcon: () => <div data-testid="dollar-icon">DollarIcon</div>,
  ArrowDownIcon: () => <div data-testid="arrow-down-icon">ArrowDownIcon</div>,
  ArrowUpIcon: () => <div data-testid="arrow-up-icon">ArrowUpIcon</div>,
  PlusIcon: () => <div data-testid="plus-icon">PlusIcon</div>,
  BarChart3Icon: () => <div data-testid="chart-icon">ChartIcon</div>,
  UsersIcon: () => <div data-testid="users-icon">UsersIcon</div>,
  SettingsIcon: () => <div data-testid="settings-icon">SettingsIcon</div>,
  FileTextIcon: () => <div data-testid="file-icon">FileIcon</div>,
  ActivityIcon: () => <div data-testid="activity-icon">ActivityIcon</div>,
  ArrowRightIcon: () => <div data-testid="arrow-right-icon">ArrowRightIcon</div>,
  ClockIcon: () => <div data-testid="clock-icon">ClockIcon</div>,
  AlertCircleIcon: () => <div data-testid="alert-circle-icon">AlertCircleIcon</div>
}))

const mockSession = {
  user: {
    name: 'Test User',
    email: 'test@example.com'
  }
}

const mockDashboardData = {
  stats: {
    totalProducts: 150,
    lowStockCount: 5,
    todayTransactions: 12,
    totalStockValue: 250000
  },
  lowStockAlerts: [
    {
      id: '1',
      sku: 'PAINT001',
      brand: 'Sherwin-Williams',
      name: 'Premium Paint',
      unit: 'Gallon',
      currentStock: 2,
      minimumStock: 10,
      deficit: 8,
      urgency: 'warning'
    },
    {
      id: '2',
      sku: 'PAINT002',
      brand: 'Benjamin Moore',
      name: 'Interior Paint',
      unit: 'Gallon',
      currentStock: 0,
      minimumStock: 5,
      deficit: 5,
      urgency: 'critical'
    }
  ],
  activity: [
    {
      id: '1',
      type: 'IN',
      referenceNumber: 'TXN001',
      date: new Date('2024-01-15'),
      createdAt: new Date('2024-01-15T10:30:00Z'),
      supplier: 'Paint Supplier Co',
      itemCount: 3,
      displayItems: [
        {
          quantity: 10,
          product: {
            name: 'Premium Paint',
            brand: 'Sherwin-Williams'
          }
        }
      ],
      hasMoreItems: false,
      description: 'Received 3 items from Paint Supplier Co'
    }
  ]
}

describe('Dashboard Page', () => {
  let mockGetDashboardData

  beforeEach(() => {
    // Get the mocked function
    mockGetDashboardData = require('@/lib/actions/dashboard').getDashboardData
    
    // Set default successful response
    mockGetDashboardData.mockResolvedValue({
      success: true,
      data: mockDashboardData
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('renders dashboard header with user name', async () => {
    render(<DashboardContent session={mockSession} />)
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Welcome back, Test User')).toBeInTheDocument()
    })
  })

  test('displays loading state initially', () => {
    render(<DashboardContent session={mockSession} />)
    
    // Should show loading skeleton
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  test('displays dashboard stats after loading', async () => {
    render(<DashboardContent session={mockSession} />)
    
    await waitFor(() => {
      expect(screen.getByText('Total Products')).toBeInTheDocument()
      expect(screen.getByText('150')).toBeInTheDocument()
      expect(screen.getByText('Low Stock Items')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText("Today's Transactions")).toBeInTheDocument()
      expect(screen.getByText('12')).toBeInTheDocument()
    })
  })

  test('displays quick action buttons', async () => {
    render(<DashboardContent session={mockSession} />)
    
    await waitFor(() => {
      expect(screen.getByText('Stock In')).toBeInTheDocument()
      expect(screen.getByText('Stock Out')).toBeInTheDocument()
      expect(screen.getByText('Add Product')).toBeInTheDocument()
      expect(screen.getByText('View Reports')).toBeInTheDocument()
    })
  })

  test('displays low stock alerts', async () => {
    render(<DashboardContent session={mockSession} />)
    
    await waitFor(() => {
      expect(screen.getByText('Low Stock Alerts')).toBeInTheDocument()
      expect(screen.getByText('Sherwin-Williams Premium Paint')).toBeInTheDocument()
      expect(screen.getByText('Benjamin Moore Interior Paint')).toBeInTheDocument()
    })
  })

  test('displays recent activity', async () => {
    render(<DashboardContent session={mockSession} />)
    
    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
      expect(screen.getByText('TXN001')).toBeInTheDocument()
      expect(screen.getByText('Received 3 items from Paint Supplier Co')).toBeInTheDocument()
    })
  })

  test('handles error state', async () => {
    mockGetDashboardData.mockResolvedValue({
      success: false,
      error: 'Failed to load dashboard data'
    })

    render(<DashboardContent session={mockSession} />)
    
    await waitFor(() => {
      expect(screen.getByText('Unable to Load Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument()
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })
  })

  test('displays empty state when no low stock alerts', async () => {
    mockGetDashboardData.mockResolvedValue({
      success: true,
      data: {
        ...mockDashboardData,
        lowStockAlerts: []
      }
    })

    render(<DashboardContent session={mockSession} />)
    
    await waitFor(() => {
      expect(screen.getByText('All Stock Levels Good')).toBeInTheDocument()
      expect(screen.getByText('No products are currently below minimum stock levels')).toBeInTheDocument()
    })
  })

  test('displays empty state when no recent activity', async () => {
    mockGetDashboardData.mockResolvedValue({
      success: true,
      data: {
        ...mockDashboardData,
        activity: []
      }
    })

    render(<DashboardContent session={mockSession} />)
    
    await waitFor(() => {
      expect(screen.getByText('No Recent Activity')).toBeInTheDocument()
      expect(screen.getByText('No transactions have been recorded yet')).toBeInTheDocument()
      expect(screen.getByText('Create First Transaction')).toBeInTheDocument()
    })
  })

  test('has proper touch targets for iPad', async () => {
    render(<DashboardContent session={mockSession} />)
    
    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        // TouchButton component should have min-h-[44px] class
        expect(button.className).toMatch(/min-h-\[44px\]/)
      })
    })
  })

  test('displays currency values correctly', async () => {
    render(<DashboardContent session={mockSession} />)
    
    await waitFor(() => {
      // Should format Indonesian Rupiah
      expect(screen.getByText(/Rp/)).toBeInTheDocument()
    })
  })
})