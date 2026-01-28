import { Suspense } from 'react'
import { getProductsAction, getProductCategoriesAction, getProductBrandsAction } from '@/lib/actions/products'
import ProductListPage from '@/components/products/ProductListPage'
import { getSession } from '@/lib/auth'

export const metadata = {
  title: 'Produk - CatStock',
  description: 'Kelola katalog produk Anda',
}

export default async function ProductsPage({ searchParams }) {
  // Check authentication manually
  const session = await getSession()
  
  if (!session?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Diperlukan Autentikasi</h2>
          <p className="text-gray-600 mb-6">Silakan masuk untuk mengakses produk.</p>
          <a 
            href="/login" 
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Ke Halaman Masuk
          </a>
        </div>
      </div>
    )
  }

  // Get initial data
  const [productsResult, categoriesResult, brandsResult] = await Promise.all([
    getProductsAction(searchParams),
    getProductCategoriesAction(),
    getProductBrandsAction()
  ])

  if (productsResult.error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">
          Error Memuat Produk
        </h2>
        <p className="text-gray-600">{productsResult.error}</p>
      </div>
    )
  }

  return (
    <Suspense fallback={<ProductListSkeleton />}>
      <ProductListPage
        initialProducts={productsResult.products}
        initialPagination={productsResult.pagination}
        categories={categoriesResult.categories || []}
        brands={brandsResult.brands || []}
        searchParams={searchParams}
      />
    </Suspense>
  )
}

function ProductListSkeleton() {
  return (
    <div className="h-full bg-gray-50">
      <div className="p-4 border-b border-gray-200">
        <div className="h-8 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
      </div>
      
      <div className="p-4 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-lg border animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    </div>
  )
}