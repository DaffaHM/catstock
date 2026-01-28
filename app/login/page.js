import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LoginForm from '@/components/LoginForm'

export const metadata = {
  title: 'Masuk - CatStock',
  description: 'Masuk ke sistem manajemen inventori CatStock Anda',
}

export default async function LoginPage() {
  const session = await getSession()
  
  // If already authenticated, redirect immediately using server-side redirect
  if (session?.isAuthenticated) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg tablet:max-w-xl">
        <div className="text-center mb-8 tablet:mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 tablet:w-24 tablet:h-24 bg-primary-600 rounded-2xl mb-6 tablet:mb-8">
            <svg className="w-10 h-10 tablet:w-12 tablet:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-4xl tablet:text-5xl font-bold text-gray-900 mb-3 tablet:mb-4">
            CatStock
          </h1>
          <p className="text-lg tablet:text-xl text-gray-600 font-medium">
            Sistem Manajemen Inventori Toko Cat
          </p>
        </div>
        
        <div className="bg-white rounded-2xl tablet:rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-10 tablet:px-12 tablet:py-14">
            <div className="mb-8 tablet:mb-10">
              <h2 className="text-2xl tablet:text-3xl font-semibold text-gray-900 mb-2">
                Selamat Datang Kembali
              </h2>
              <p className="text-base tablet:text-lg text-gray-600">
                Masuk untuk mengakses sistem inventori Anda
              </p>
            </div>
            
            <LoginForm />
          </div>
        </div>
        
        <div className="text-center mt-8 tablet:mt-12 space-y-2">
          <p className="text-sm tablet:text-base text-gray-500">
            Dioptimalkan untuk iPad Pro 11&quot; • Antarmuka ramah sentuh
          </p>
          <p className="text-xs tablet:text-sm text-gray-400">
            Test: owner@catstock.com / admin123
          </p>
        </div>
      </div>
    </div>
  )
}