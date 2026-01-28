'use client'

import { useState, useEffect } from 'react'
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
  MenuIcon,
  XIcon,
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

export default function UnifiedLayout({ children }) {
  const [mounted, setMounted] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className="min-h-screen bg-gray-50">{children}</div>
  }

  return (
    <>
      {/* Desktop/Tablet Sidebar Layout */}
      <div className="hidden md:flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {!sidebarCollapsed && (
              <h1 className="text-xl font-semibold text-gray-900">
                CatStock
              </h1>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <MenuIcon className="h-5 w-5 text-gray-600" />
              ) : (
                <XIcon className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-3 rounded-lg transition-colors min-h-[44px] group ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 border border-primary-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'} ${
                    isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`} />
                  {!sidebarCollapsed && (
                    <span className="text-base font-medium">
                      {item.name}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            {!sidebarCollapsed ? (
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Paint Store Owner</p>
                  <p className="text-xs">Logged in</p>
                </div>
                <LogoutButton className="w-full" />
              </div>
            ) : (
              <div className="flex justify-center">
                <LogoutButton className="p-2 min-h-[44px] min-w-[44px]" iconOnly />
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Layout */}
      <div className="md:hidden flex flex-col h-screen bg-gray-50">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              CatStock
            </h1>
            <div className="flex items-center space-x-2">
              <Link
                href="/transactions/returns"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Returns"
              >
                <RotateCcwIcon className="h-5 w-5 text-gray-600" />
              </Link>
              <Link
                href="/suppliers"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Suppliers"
              >
                <TruckIcon className="h-5 w-5 text-gray-600" />
              </Link>
              <Link
                href="/reports"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Reports"
              >
                <BarChart3Icon className="h-5 w-5 text-gray-600" />
              </Link>
              <Link
                href="/settings"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Settings"
              >
                <SettingsIcon className="h-5 w-5 text-gray-600" />
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-20">
          {children}
        </main>

        {/* Bottom Navigation */}
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
    </>
  )
}