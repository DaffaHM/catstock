import { getSession } from '@/lib/auth'
import SimpleNavLayout from './SimpleNavLayout'

export default async function ResponsiveLayout({ children }) {
  const session = await getSession()
  
  // If not authenticated, render children without navigation
  if (!session?.isAuthenticated) {
    return <div className="min-h-screen bg-gray-50">{children}</div>
  }

  // Render with simple navigation for authenticated users (using anchor tags for reliability)
  return (
    <SimpleNavLayout>
      {children}
    </SimpleNavLayout>
  )
}