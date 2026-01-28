import SimpleNavLayout from '@/components/layout/SimpleNavLayout'
import CategoryManagementPage from '@/components/categories/CategoryManagementPage'

export default function CategoriesPage() {
  return (
    <SimpleNavLayout>
      <CategoryManagementPage />
    </SimpleNavLayout>
  )
}