import { requireAuth } from '@/lib/auth'
import NavigationTest from '@/components/debug/NavigationTest'

export const metadata = {
  title: 'Navigation Test - CatStock',
  description: 'Debug navigation functionality'
}

export default async function NavigationTestPage() {
  await requireAuth()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Navigation Debug Page</h1>
      <NavigationTest />
    </div>
  )
}