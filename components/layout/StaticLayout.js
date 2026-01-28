'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
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
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Products', href: '/products', icon: PackageIcon },
  { name: 'Suppliers', href: '/suppliers', icon: TruckIcon },
  { name: 'Stock In', href: '/transactions/stock-in', icon: ArrowUpIcon },
  { name: 'Stock Out', href: '/transactions/stock-out', icon: ArrowDownIcon },
  { name: 'Stock Adjustment', href: '/transactions/stock-adjustment', icon: SlidersIcon },
  { name: 'Returns', href: '/transactions/returns', icon: RotateCcwIcon },
  { name: 'Reports', href: '/reports', icon: BarChart3Icon },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
]

// Static component - no conditional hooks, no state changes
export default function StaticLayout({ children }) {
  // Only one hook - usePathname
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Layout - Always rendered, controlled by CSS */}
      <div className="hidden lg:flex lg:h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="h-16 flex items-center px-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">CatStock</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              const handleClick = (e) => {
                console.log(`[Navigation] Clicking ${item.name} -> ${item.href}`)
                // Fallback navigation using window.location if Link doesn't work
                e.preventDefault()
                window.location.href = item.href
              }
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 border border-primary-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={handleClick}
                >
                  <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
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

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Layout - Always rendered, controlled by CSS */}
      <div className="lg:hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">CatStock</h1>
            <div className="flex items-center space-x-2">
              <Link href="/transactions/returns" className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" aria-label="Returns" onClick={(e) => { e.preventDefault(); window.location.href = '/transactions/returns'; }}>
                <RotateCcwIcon className="h-5 w-5 text-gray-600" />
              </Link>
              <Link href="/suppliers" className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" aria-label="Suppliers" onClick={(e) => { e.preventDefault(); window.location.href = '/suppliers'; }}>
                <TruckIcon className="h-5 w-5 text-gray-600" />
              </Link>
              <Link href="/reports" className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" aria-label="Reports" onClick={(e) => { e.preventDefault(); window.location.href = '/reports'; }}>
                <BarChart3Icon className="h-5 w-5 text-gray-600" />
              </Link>
              <Link href="/settings" className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" aria-label="Settings" onClick={(e) => { e.preventDefault(); window.location.href = '/settings'; }}>
                <SettingsIcon className="h-5 w-5 text-gray-600" />
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pb-20">
          {children}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
          <div className="flex items-center justify-around py-2">
            {navigationItems.slice(0, 5).map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              const handleClick = (e) => {
                console.log(`[Mobile Navigation] Clicking ${item.name} -> ${item.href}`)
                // Fallback navigation using window.location if Link doesn't work
                e.preventDefault()
                window.location.href = item.href
              }
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] cursor-pointer ${
                    isActive ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  onClick={handleClick}
                >
                  <Icon className={`h-5 w-5 mb-1 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                  <span className={`text-xs font-medium ${isActive ? 'text-primary-600' : 'text-gray-400'}`}>
                    {item.name === 'Stock Adjustment' ? 'Adjust' : item.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}