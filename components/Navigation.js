import { getSession } from '@/lib/auth'
import LogoutButton from './LogoutButton'

export default async function Navigation() {
  const session = await getSession()
  
  if (!session?.isAuthenticated) {
    return null
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              CatStock
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, {session.user.name}
            </span>
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  )
}