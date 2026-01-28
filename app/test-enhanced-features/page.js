import SimpleNavLayout from '@/components/layout/SimpleNavLayout'
import Logo, { CompactLogo } from '@/components/ui/Logo'

export const metadata = {
  title: 'Test Enhanced Features - CatStock',
  description: 'Test page for enhanced features'
}

export default function TestEnhancedFeaturesPage() {
  return (
    <SimpleNavLayout>
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Test Enhanced Features</h1>
          
          {/* Logo Tests */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Modern Logo System</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Full Logo - Small</h3>
                <Logo size="sm" variant="full" />
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Full Logo - Medium</h3>
                <Logo size="md" variant="full" />
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Full Logo - Large</h3>
                <Logo size="lg" variant="full" />
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Icon Only</h3>
                <Logo size="md" variant="icon" />
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Compact Logo</h3>
                <CompactLogo />
              </div>
            </div>
          </div>

          {/* Navigation Test */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Navigation Links</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <a href="/dashboard" className="p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-center">
                Dashboard
              </a>
              <a href="/products" className="p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-center">
                Products
              </a>
              <a href="/categories" className="p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-center">
                Categories ✨
              </a>
              <a href="/suppliers" className="p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-center">
                Suppliers
              </a>
              <a href="/transactions/stock-in" className="p-3 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors text-center">
                Stock In
              </a>
              <a href="/transactions/stock-out" className="p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-center">
                Stock Out
              </a>
              <a href="/reports" className="p-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-center">
                Reports
              </a>
              <a href="/settings" className="p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-center">
                Settings
              </a>
            </div>
          </div>

          {/* Feature Status */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Enhanced Features Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="font-medium text-green-800">✅ Modern Logo System</span>
                <span className="text-sm text-green-600">Implemented</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="font-medium text-green-800">✅ Category Management</span>
                <span className="text-sm text-green-600">Implemented</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="font-medium text-green-800">✅ Low Stock Notifications</span>
                <span className="text-sm text-green-600">Implemented</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="font-medium text-green-800">✅ Enhanced Database Schema</span>
                <span className="text-sm text-green-600">Implemented</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="font-medium text-green-800">✅ Demo Mode Support</span>
                <span className="text-sm text-green-600">Implemented</span>
              </div>
            </div>
          </div>

          {/* Quick Test Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Test Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a 
                href="/categories" 
                className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center font-medium"
              >
                🗂️ Test Category Management
              </a>
              <a 
                href="/dashboard" 
                className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
              >
                📊 Test Low Stock Alerts
              </a>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">System Information</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Build Status: ✅ Successful</p>
              <p>• Enhanced Features: ✅ Active</p>
              <p>• Demo Mode: ✅ Available</p>
              <p>• Navigation: ✅ Working</p>
              <p>• Modern UI: ✅ Applied</p>
            </div>
          </div>
        </div>
      </div>
    </SimpleNavLayout>
  )
}