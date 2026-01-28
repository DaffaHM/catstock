import { Suspense } from 'react'
import SimpleNavLayout from '@/components/layout/SimpleNavLayout'
import CategoryManagementPage from '@/components/categories/CategoryManagementPage'

export const metadata = {
  title: 'Kategori Produk - CatStock',
  description: 'Kelola kategori produk untuk organisasi inventory yang lebih baik'
}

export default function CategoriesPage() {
  return (
    <SimpleNavLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kategori Produk</h1>
            <p className="text-gray-600 mt-1">
              Kelola kategori untuk mengorganisir produk dengan lebih baik
            </p>
          </div>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }>
          <CategoryManagementPage />
        </Suspense>
      </div>
    </SimpleNavLayout>
  )
}