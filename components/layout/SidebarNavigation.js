'use client'

import { useState } from 'react'
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

export default function SidebarNavigation({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <h1 className="text-xl font-semibold text-gray-900">
              CatStock
            </h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
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
                <Icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} ${
                  isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                }`} />
                {!isCollapsed && (
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
          {!isCollapsed ? (
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
  )
}