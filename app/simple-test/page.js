export default function SimpleTestPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Simple Test Page</h1>
      <p className="mb-4">This page should load without any authentication.</p>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Navigation Test</h2>
          <div className="space-y-2">
            <a href="/dashboard" className="block p-3 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
              Go to Dashboard (should redirect to login if not authenticated)
            </a>
            <a href="/login" className="block p-3 bg-green-100 text-green-800 rounded hover:bg-green-200">
              Go to Login
            </a>
            <a href="/test-dashboard" className="block p-3 bg-purple-100 text-purple-800 rounded hover:bg-purple-200">
              Go to Test Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}