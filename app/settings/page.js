import { getSession } from '@/lib/auth'
import { getQuickSession } from '@/lib/auth-quick'
import SimpleNavLayout from '@/components/layout/SimpleNavLayout'
import SettingsClient from '@/components/settings/SettingsClient'

export const metadata = {
  title: 'Pengaturan - CatStock',
  description: 'Pengaturan aplikasi CatStock',
}

export default async function SettingsPage() {
  let session = null
  let isDemoMode = false
  
  // Try authentication
  try {
    const quickSession = await getQuickSession()
    if (quickSession?.isAuthenticated) {
      session = quickSession
      isDemoMode = true
    }
  } catch (error) {
    try {
      session = await getSession()
    } catch (authError) {
      console.log('[Settings] Auth failed:', authError.message)
    }
  }

  if (!session?.isAuthenticated) {
    return (
      <SimpleNavLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Diperlukan Autentikasi</h2>
            <p className="text-gray-600 mb-6">Silakan masuk untuk mengakses pengaturan.</p>
            <a 
              href="/quick-login" 
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login
            </a>
          </div>
        </div>
      </SimpleNavLayout>
    )
  }

  return (
    <SimpleNavLayout>
      <SettingsClient session={session} isDemoMode={isDemoMode} />
    </SimpleNavLayout>
  )
}