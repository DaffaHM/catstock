import { Suspense } from 'react'
import { getSuppliersAction } from '@/lib/actions/suppliers'
import SupplierListPage from '@/components/suppliers/SupplierListPage'
import { getSession } from '@/lib/auth'

export const metadata = {
  title: 'Pemasok - CatStock',
  description: 'Kelola informasi pemasok Anda',
}

export default async function SuppliersPage({ searchParams }) {
  // Check authentication manually to avoid redirect loops
  const session = await getSession()
  
  if (!session?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Diperlukan Autentikasi</h2>
          <p className="text-gray-600 mb-6">Silakan masuk untuk mengakses pemasok.</p>
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
  const suppliersResult = await getSuppliersAction(searchParams)

  if (suppliersResult.error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">
          Error Memuat Pemasok
        </h2>
        <p className="text-gray-600">{suppliersResult.error}</p>
      </div>
    )
  }

  return (
    <Suspense fallback={<SupplierListSkeleton />}>
      <SupplierListPage
        initialSuppliers={suppliersResult.suppliers}
        initialPagination={suppliersResult.pagination}
        searchParams={searchParams}
      />
    </Suspense>
  )
}

function SupplierListSkeleton() {
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