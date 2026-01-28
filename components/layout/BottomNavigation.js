'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  PackageIcon, 
  TruckIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  BarChart3Icon,
  SlidersIcon,
  RotateCcwIcon,
  SettingsIcon
} from 'lucide-react'

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
    name: 'Adjust',
    href: '/transactions/stock-adjustment',
    icon: SlidersIcon,
  },
]

export default function BottomNavigation({ children }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 safe-area-inset-top">
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
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom">
        <div className="flex items-center justify-around py-2">
          {navigationItems.map((item) => {
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
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}