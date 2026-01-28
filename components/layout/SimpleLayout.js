'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  PackageIcon, 
  TruckIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  SettingsIcon,
  BarChart3Icon,
  SlidersIcon,
  RotateCcwIcon
} from 'lucide-react'
import LogoutButton from '../LogoutButton'

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
  },
  {
    name: 'Products',
    href: '/products',
    icon: PackageIcon,
  },
  {
    name: 'Suppliers',
    href: '/suppliers',
    icon: TruckIcon,
  },
  {
    name: 'Stock In',
    href: '/transactions/stock-in',
    icon: ArrowUpIcon,
  },
  {
    name: 'Stock Out',
    href: '/transactions/stock-out',
    icon: ArrowDownIcon,
  },
  {
    name: 'Stock Adjustment',
    href: '/transactions/stock-adjustment',
    icon: SlidersIcon,
  },
  {
    name: 'Returns',
    href: '/transactions/returns',
    icon: RotateCcwIcon,
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3Icon,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: SettingsIcon,
  },
]

export default function SimpleLayout({ children }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar - Always rendered, hidden with CSS on mobile */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
          {/* Sidebar Header */}
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">CatStock</h1>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 border border-primary-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`h-5 w-5 mr-3 ${
                    isActive ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                <p className="font-medium">Paint Store Owner</p>
                <p className="text-xs">Logged in</p>
              </div>
              <LogoutButton className="w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">CatStock</h1>
            <div className="flex items-center space-x-2">
              <Link
                href="/transactions/returns"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Returns"
              >
                <RotateCcwIcon className="h-5 w-5 text-gray-600" />
              </Link>
              <Link
                href="/suppliers"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Suppliers"
              >
                <TruckIcon className="h-5 w-5 text-gray-600" />
              </Link>
              <Link
                href="/reports"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Reports"
              >
                <BarChart3Icon className="h-5 w-5 text-gray-600" />
              </Link>
              <Link
                href="/settings"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Settings"
              >
                <SettingsIcon className="h-5 w-5 text-gray-600" />
              </Link>
            </div>
          </div>
        </header>

        {/* Mobile Main Content */}
        <main className="pb-20">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
          <div className="flex items-center justify-around py-2">
            {navigationItems.slice(0, 5).map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] ${
                    isActive
                      ? 'text-primary-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Icon className={`h-5 w-5 mb-1 ${
                    isActive ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                  <span className={`text-xs font-medium ${
                    isActive ? 'text-primary-600' : 'text-gray-400'
                  }`}>
                    {item.name === 'Stock Adjustment' ? 'Adjust' : item.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>

      {/* Desktop Main Content */}
      <div className="hidden lg:block lg:pl-64">
        <main className="py-6">
          {children}
        </main>
      </div>
    </div>
  )
}