export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🎨 CatStock</h1>
        <p className="text-xl text-gray-600 mb-8">Sistem Manajemen Inventori Toko Cat</p>
        <div className="space-y-4">
          <a 
            href="/quick-login" 
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
          >
            Masuk ke Aplikasi
          </a>
          <div className="text-sm text-gray-500">
            <p>Demo: owner@catstock.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  )
}