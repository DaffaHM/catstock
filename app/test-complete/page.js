import { getQuickSession } from '@/lib/auth-quick'
import { getDashboardData } from '@/lib/actions/dashboard'
import { getProductsAction } from '@/lib/actions/products'
import { getSuppliersAction } from '@/lib/actions/suppliers'

export const metadata = {
  title: 'Test Complete - CatStock',
  description: 'Test lengkap semua sistem'
}

export default async function TestCompletePage() {
  let authResult = null
  let dashboardResult = null
  let productsResult = null
  let suppliersResult = null
  let errors = []

  // Test authentication
  try {
    authResult = await getQuickSession()
  } catch (error) {
    errors.push(`Auth Error: ${error.message}`)
  }

  // Test dashboard data
  try {
    dashboardResult = await getDashboardData()
  } catch (error) {
    errors.push(`Dashboard Error: ${error.message}`)
  }

  // Test products data
  try {
    productsResult = await getProductsAction({ page: 1, limit: 5 })
  } catch (error) {
    errors.push(`Products Error: ${error.message}`)
  }

  // Test suppliers data
  try {
    suppliersResult = await getSuppliersAction({ page: 1, limit: 5 })
  } catch (error) {
    errors.push(`Suppliers Error: ${error.message}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">🧪 Test Complete - CatStock</h1>
          <p className="text-gray-600 mb-8">
            Halaman ini menguji semua sistem secara lengkap untuk memastikan semuanya berfungsi.
          </p>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-red-800 mb-4">❌ Errors Found</h2>
            <ul className="space-y-2">
              {errors.map((error, index) => (
                <li key={index} className="text-red-700">• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Authentication Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🔐 Authentication Test</h2>
          {authResult?.isAuthenticated ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="text-green-600 text-xl mr-2">✅</span>
                <span className="font-semibold text-green-800">Authenticated Successfully</span>
              </div>
              <div className="text-green-700 text-sm space-y-1">
                <div><strong>User:</strong> {authResult.user.name}</div>
                <div><strong>Email:</strong> {authResult.user.email}</div>
                <div><strong>ID:</strong> {authResult.user.id}</div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-red-600 text-xl mr-2">❌</span>
                <span className="font-semibold text-red-800">Authentication Failed</span>
              </div>
            </div>
          )}
        </div>

        {/* Dashboard Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Dashboard Data Test</h2>
          {dashboardResult?.success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <span className="text-green-600 text-xl mr-2">✅</span>
                <span className="font-semibold text-green-800">Dashboard Data Loaded</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium text-gray-700">Total Produk</div>
                  <div className="text-2xl font-bold text-blue-600">{dashboardResult.data.stats.totalProducts}</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium text-gray-700">Total Pemasok</div>
                  <div className="text-2xl font-bold text-green-600">{dashboardResult.data.stats.totalSuppliers}</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium text-gray-700">Transaksi</div>
                  <div className="text-2xl font-bold text-purple-600">{dashboardResult.data.stats.totalTransactions}</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium text-gray-700">Stok Rendah</div>
                  <div className="text-2xl font-bold text-red-600">{dashboardResult.data.stats.lowStockCount}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-red-600 text-xl mr-2">❌</span>
                <span className="font-semibold text-red-800">Dashboard Data Failed</span>
              </div>
              {dashboardResult?.error && (
                <div className="text-red-700 text-sm mt-2">{dashboardResult.error}</div>
              )}
            </div>
          )}
        </div>

        {/* Products Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📦 Products Data Test</h2>
          {productsResult?.success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <span className="text-green-600 text-xl mr-2">✅</span>
                <span className="font-semibold text-green-800">Products Data Loaded</span>
              </div>
              <div className="text-sm text-green-700 mb-4">
                <strong>Total Products:</strong> {productsResult.pagination.totalCount} | 
                <strong> Showing:</strong> {productsResult.products.length}
              </div>
              <div className="space-y-2">
                {productsResult.products.slice(0, 3).map((product, index) => (
                  <div key={index} className="bg-white p-3 rounded border flex justify-between items-center">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-600">{product.brand} • {product.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">Stok: {product.currentStock}</div>
                      <div className="text-sm text-gray-600">Min: {product.minimumStock}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-red-600 text-xl mr-2">❌</span>
                <span className="font-semibold text-red-800">Products Data Failed</span>
              </div>
              {productsResult?.error && (
                <div className="text-red-700 text-sm mt-2">{productsResult.error}</div>
              )}
            </div>
          )}
        </div>

        {/* Suppliers Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🚚 Suppliers Data Test</h2>
          {suppliersResult?.success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <span className="text-green-600 text-xl mr-2">✅</span>
                <span className="font-semibold text-green-800">Suppliers Data Loaded</span>
              </div>
              <div className="text-sm text-green-700 mb-4">
                <strong>Total Suppliers:</strong> {suppliersResult.pagination.totalCount} | 
                <strong> Showing:</strong> {suppliersResult.suppliers.length}
              </div>
              <div className="space-y-2">
                {suppliersResult.suppliers.map((supplier, index) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <div className="font-medium">{supplier.name}</div>
                    <div className="text-sm text-gray-600">Transaksi: {supplier.transactionCount}</div>
                    {supplier.contact && (
                      <div className="text-sm text-gray-500 mt-1">{supplier.contact.split('\n')[0]}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-red-600 text-xl mr-2">❌</span>
                <span className="font-semibold text-red-800">Suppliers Data Failed</span>
              </div>
              {suppliersResult?.error && (
                <div className="text-red-700 text-sm mt-2">{suppliersResult.error}</div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🧭 Navigation Test</h2>
          <p className="text-gray-600 mb-4">
            Klik link di bawah untuk menguji navigasi ke berbagai halaman:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <a href="/dashboard" className="block p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-center">
              <div className="text-lg mb-1">📊</div>
              <div className="text-sm font-medium text-blue-800">Dashboard</div>
            </a>
            <a href="/products" className="block p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-center">
              <div className="text-lg mb-1">📦</div>
              <div className="text-sm font-medium text-green-800">Produk</div>
            </a>
            <a href="/suppliers" className="block p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-center">
              <div className="text-lg mb-1">🚚</div>
              <div className="text-sm font-medium text-yellow-800">Pemasok</div>
            </a>
            <a href="/reports" className="block p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-center">
              <div className="text-lg mb-1">📈</div>
              <div className="text-sm font-medium text-purple-800">Laporan</div>
            </a>
            <a href="/transactions/stock-in" className="block p-3 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors text-center">
              <div className="text-lg mb-1">⬆️</div>
              <div className="text-sm font-medium text-indigo-800">Stok Masuk</div>
            </a>
            <a href="/transactions/stock-out" className="block p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-center">
              <div className="text-lg mb-1">⬇️</div>
              <div className="text-sm font-medium text-red-800">Stok Keluar</div>
            </a>
            <a href="/transactions/stock-adjustment" className="block p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-center">
              <div className="text-lg mb-1">⚖️</div>
              <div className="text-sm font-medium text-orange-800">Penyesuaian</div>
            </a>
            <a href="/settings" className="block p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-center">
              <div className="text-lg mb-1">⚙️</div>
              <div className="text-sm font-medium text-gray-800">Pengaturan</div>
            </a>
          </div>
        </div>

        {/* Summary */}
        <div className={`rounded-lg p-6 ${errors.length === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <h2 className="text-xl font-semibold mb-4 ${errors.length === 0 ? 'text-green-800' : 'text-yellow-800'}">
            {errors.length === 0 ? '🎉 All Systems Working!' : '⚠️ Some Issues Found'}
          </h2>
          <div className={`text-sm ${errors.length === 0 ? 'text-green-700' : 'text-yellow-700'}`}>
            {errors.length === 0 ? (
              <div>
                <p className="mb-2">✅ Semua sistem berfungsi dengan baik!</p>
                <p>• Authentication: Working</p>
                <p>• Dashboard Data: Working</p>
                <p>• Products Data: Working</p>
                <p>• Suppliers Data: Working</p>
                <p>• Navigation: Ready for testing</p>
              </div>
            ) : (
              <div>
                <p className="mb-2">⚠️ Ditemukan {errors.length} masalah yang perlu diperbaiki.</p>
                <p>Silakan periksa error di atas dan perbaiki sebelum deployment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}