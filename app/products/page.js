import { getSession } from '@/lib/auth'
import { getQuickSession } from '@/lib/auth-quick'
import SimpleNavLayout from '@/components/layout/SimpleNavLayout'
import ProductListPage from '@/components/products/ProductListPage'

export const metadata = {
  title: 'Produk - CatStock',
  description: 'Manajemen produk inventori CatStock',
}

export default async function ProductsPage() {
  let session = null
  let isDemoMode = false
  
  // Try authentication
  try {
    session = await getQuickSession()
    if (session?.isAuthenticated) {
      isDemoMode = true
    }
  } catch (error) {
    try {
      session = await getSession()
    } catch (authError) {
      console.log('[Products] Auth failed:', authError.message)
    }
  }

  if (!session?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Diperlukan Autentikasi</h2>
          <p className="text-gray-600 mb-6">Silakan masuk untuk mengakses halaman produk.</p>
          <a 
            href="/quick-login" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <SimpleNavLayout>
      <ProductListPage session={session} isDemoMode={isDemoMode} />
    </SimpleNavLayout>
  )
}