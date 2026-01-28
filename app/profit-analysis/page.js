import { Suspense } from 'react'
import SimpleNavLayout from '@/components/layout/SimpleNavLayout'
import ProfitAnalysisPage from '@/components/profit/ProfitAnalysisPage'

export const metadata = {
  title: 'Analisis Keuntungan - CatStock',
  description: 'Analisis keuntungan produk dan laporan profit margin'
}

export default function ProfitAnalysisPageRoute() {
  return (
    <SimpleNavLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">💰 Analisis Keuntungan</h1>
            <p className="text-gray-600 mt-1">
              Lihat keuntungan dari setiap produk dan analisis profit margin
            </p>
          </div>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }>
          <ProfitAnalysisPage />
        </Suspense>
      </div>
    </SimpleNavLayout>
  )
}