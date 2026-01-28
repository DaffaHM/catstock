'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function TestNavigation({ children }) {
  const pathname = usePathname()

  const handleClick = (href) => {
    console.log('Navigation clicked:', href)
    console.log('Current pathname:', pathname)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple test navigation */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-xl font-semibold mb-4">CatStock - Test Navigation</h1>
        <nav className="space-y-2">
          <Link 
            href="/test-dashboard" 
            onClick={() => handleClick('/test-dashboard')}
            className="block p-2 text-green-600 hover:bg-green-50 rounded border border-green-200"
          >
            🧪 Test Dashboard (Simple page - should work)
          </Link>
          <Link 
            href="/dashboard" 
            onClick={() => handleClick('/dashboard')}
            className="block p-2 text-blue-600 hover:bg-blue-50 rounded"
          >
            🏠 Dashboard (Current: {pathname === '/dashboard' ? 'Active' : 'Inactive'})
          </Link>
          <Link 
            href="/products" 
            onClick={() => handleClick('/products')}
            className="block p-2 text-blue-600 hover:bg-blue-50 rounded"
          >
            📦 Products (Current: {pathname === '/products' ? 'Active' : 'Inactive'})
          </Link>
          <Link 
            href="/suppliers" 
            onClick={() => handleClick('/suppliers')}
            className="block p-2 text-blue-600 hover:bg-blue-50 rounded"
          >
            🚚 Suppliers (Current: {pathname === '/suppliers' ? 'Active' : 'Inactive'})
          </Link>
        </nav>
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <strong>Current Path:</strong> {pathname}
        </div>
        <div className="mt-2 p-2 bg-yellow-100 rounded">
          <strong>Instructions:</strong> Click on links above and check browser console for logs. 
          If links don't work, there might be a JavaScript error.
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}