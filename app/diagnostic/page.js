import { getSession } from '@/lib/auth'
import DiagnosticComponent from '@/components/debug/DiagnosticComponent'

export const metadata = {
  title: 'Diagnostic - CatStock',
  description: 'System diagnostic page'
}

export default async function DiagnosticPage() {
  const session = await getSession()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">System Diagnostic</h1>
      
      <div className="space-y-6">
        {/* Session Info */}
        <div className="bg-white p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        {/* Environment Info */}
        <div className="bg-white p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Environment</h2>
          <div className="text-sm space-y-1">
            <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
            <p><strong>Next.js Version:</strong> 14.2.5</p>
            <p><strong>Database URL:</strong> {process.env.DATABASE_URL ? 'Set' : 'Not set'}</p>
          </div>
        </div>

        {/* Client-side Diagnostic */}
        <DiagnosticComponent />
      </div>
    </div>
  )
}