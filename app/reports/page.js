import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import CurrentStockReportPage from '@/components/reports/CurrentStockReportPage'
import { getStockReportData } from '@/lib/queries/reports'

export default async function ReportsPage({ searchParams }) {
  const session = await getSession()
  
  if (!session?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Diperlukan Autentikasi</h2>
          <p className="text-gray-600 mb-6">Silakan masuk untuk mengakses laporan.</p>
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

  // Get initial data for the stock report
  const initialData = await getStockReportData({
    search: searchParams?.search,
    category: searchParams?.category,
    brand: searchParams?.brand,
    lowStockOnly: searchParams?.lowStock === 'true',
    sortBy: searchParams?.sortBy || 'name',
    sortOrder: searchParams?.sortOrder || 'asc',
    page: parseInt(searchParams?.page) || 1,
    limit: 50
  })

  return (
    <div className="h-full">
      <Suspense fallback={
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      }>
        <CurrentStockReportPage 
          initialData={initialData}
          searchParams={searchParams}
        />
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'Laporan Stok - CatStock',
  description: 'Tingkat stok saat ini dan laporan inventori'
}