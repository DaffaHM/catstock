'use client'

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
  RotateCcwIcon,
  FolderIcon
} from 'lucide-react'
import LogoutButton from '../LogoutButton'
import Logo, { CompactLogo } from '../ui/Logo'

const navigationItems = [
  { name: 'Dasbor', href: '/dashboard', icon: HomeIcon },
  { name: 'Produk', href: '/products', icon: PackageIcon },
  { name: 'Kategori', href: '/categories', icon: FolderIcon },
  { name: 'Pemasok', href: '/suppliers', icon: TruckIcon },
  { name: 'Stok Masuk', href: '/transactions/stock-in', icon: ArrowUpIcon },
  { name: 'Stok Keluar', href: '/transactions/stock-out', icon: ArrowDownIcon },
  { name: 'Penyesuaian Stok', href: '/transactions/stock-adjustment', icon: SlidersIcon },
  { name: 'Retur', href: '/transactions/returns', icon: RotateCcwIcon },
  { name: 'Laporan', href: '/reports', icon: BarChart3Icon },
  { name: 'Pengaturan', href: '/settings', icon: SettingsIcon },
]

export default function SimpleNavLayout({ children }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Layout */}
      <div className="hidden lg:flex lg:h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="h-16 flex items-center px-4 border-b border-gray-200">
            <Logo size="md" variant="full" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  {item.name}
                </a>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                <p className="font-medium">Pemilik Toko Cat</p>
                <p className="text-xs">Sudah masuk</p>
              </div>
              <a 
                href="/tutorial" 
                className="block w-full px-3 py-2 text-sm text-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                📚 Tutorial
              </a>
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

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <CompactLogo />
            <div className="flex items-center space-x-2">
              <a href="/tutorial" className="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Tutorial">
                <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </a>
              <a href="/transactions/returns" className="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Retur">
                <RotateCcwIcon className="h-5 w-5 text-gray-600" />
              </a>
              <a href="/suppliers" className="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Pemasok">
                <TruckIcon className="h-5 w-5 text-gray-600" />
              </a>
              <a href="/reports" className="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Laporan">
                <BarChart3Icon className="h-5 w-5 text-gray-600" />
              </a>
              <a href="/settings" className="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Pengaturan">
                <SettingsIcon className="h-5 w-5 text-gray-600" />
              </a>
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
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] ${
                    isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Icon className={`h-5 w-5 mb-1 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                    {item.name === 'Penyesuaian Stok' ? 'Sesuaikan' : item.name}
                  </span>
                </a>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}