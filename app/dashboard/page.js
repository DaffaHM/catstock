import { getSession } from '@/lib/auth'
import DashboardContent from '@/components/dashboard/DashboardContent'

export const metadata = {
  title: 'Dasbor - CatStock',
  description: 'Dasbor manajemen inventori CatStock',
}

export default async function DashboardPage() {
  const session = await getSession()

  // Handle authentication manually to avoid redirect loops
  if (!session?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Diperlukan Autentikasi</h2>
          <p className="text-gray-600 mb-6">Silakan masuk untuk mengakses dasbor.</p>
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

  return <DashboardContent session={session} />
}