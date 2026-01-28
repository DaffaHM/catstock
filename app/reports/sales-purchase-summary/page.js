import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import SalesPurchaseSummaryPage from '@/components/reports/SalesPurchaseSummaryPage'
import { getSalesPurchaseSummaryData } from '@/lib/queries/reports'

export default async function SalesPurchaseSummaryRoute({ searchParams }) {
  const session = await getSession()
  
  if (!session?.isAuthenticated) {
    redirect('/login')
  }

  // Get default date range (last 12 months)
  const getDefaultStartDate = () => {
    const date = new Date()
    date.setMonth(date.getMonth() - 12)
    return date.toISOString().split('T')[0]
  }

  const getDefaultEndDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  // Get initial data for the sales purchase summary
  const initialData = await getSalesPurchaseSummaryData({
    startDate: searchParams?.startDate || getDefaultStartDate(),
    endDate: searchParams?.endDate || getDefaultEndDate(),
    category: searchParams?.category,
    brand: searchParams?.brand,
    supplierId: searchParams?.supplierId,
    groupBy: searchParams?.groupBy || 'month',
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
        <SalesPurchaseSummaryPage 
          initialData={initialData}
          searchParams={searchParams}
        />
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'Sales & Purchase Summary - CatStock',
  description: 'Sales and purchase performance analysis and reporting'
}