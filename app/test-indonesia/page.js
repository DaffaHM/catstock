import { getSession } from '@/lib/auth'
import { formatRupiah, formatNumber } from '@/lib/utils/currency'

export const metadata = {
  title: 'Test Indonesia - CatStock',
  description: 'Test bahasa Indonesia dan mata uang Rupiah'
}

export default async function TestIndonesiaPage() {
  const session = await getSession()

  if (!session?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Diperlukan Autentikasi</h2>
          <p className="text-gray-600 mb-6">Silakan masuk untuk mengakses halaman test.</p>
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

  // Sample data untuk test
  const sampleProducts = [
    { name: 'Cat Tembok Putih', price: 125000, stock: 50 },
    { name: 'Cat Kayu Coklat', price: 89000, stock: 25 },
    { name: 'Cat Besi Hitam', price: 156000, stock: 15 },
    { name: 'Kuas Cat 2 inch', price: 25000, stock: 100 },
  ]

  const totalValue = sampleProducts.reduce((sum, product) => sum + (product.price * product.stock), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Test Bahasa Indonesia</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Selamat datang, {session.user.name}</span>
            <a href="/working-test" className="text-blue-600 hover:underline">Kembali ke Test Kerja</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Language Test */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">✅ Test Bahasa Indonesia</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Menu Navigasi</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Dasbor</li>
                  <li>• Produk</li>
                  <li>• Pemasok</li>
                  <li>• Stok Masuk</li>
                  <li>• Stok Keluar</li>
                  <li>• Penyesuaian Stok</li>
                  <li>• Retur</li>
                  <li>• Laporan</li>
                  <li>• Pengaturan</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Istilah Umum</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Masuk / Keluar</li>
                  <li>• Terautentikasi</li>
                  <li>• Diperlukan Autentikasi</li>
                  <li>• Selamat Datang Kembali</li>
                  <li>• Alamat Email</li>
                  <li>• Kata Sandi</li>
                  <li>• Login Aman</li>
                  <li>• Pemilik Toko Cat</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Currency Test */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">💰 Test Mata Uang Rupiah</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Contoh Produk dan Harga</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Nama Produk</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Harga</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Stok</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Total Nilai</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleProducts.map((product, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2">{product.name}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                            {formatRupiah(product.price)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right">
                            {formatNumber(product.stock)} unit
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-mono text-green-600">
                            {formatRupiah(product.price * product.stock)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-100 font-semibold">
                        <td className="border border-gray-300 px-4 py-2" colSpan="3">Total Keseluruhan</td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-mono text-green-700">
                          {formatRupiah(totalValue)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Format Rupiah</h4>
                  <p className="text-2xl font-mono text-green-700">{formatRupiah(1500000)}</p>
                  <p className="text-sm text-green-600 mt-1">Satu juta lima ratus ribu</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Format Angka</h4>
                  <p className="text-2xl font-mono text-blue-700">{formatNumber(25000)} unit</p>
                  <p className="text-sm text-blue-600 mt-1">Dua puluh lima ribu unit</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">Tanggal Indonesia</h4>
                  <p className="text-lg text-purple-700">{new Date().toLocaleDateString('id-ID')}</p>
                  <p className="text-sm text-purple-600 mt-1">Format tanggal Indonesia</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Test */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🧭 Test Navigasi</h2>
            <p className="text-gray-600 mb-4">Klik menu di bawah untuk test navigasi dengan bahasa Indonesia:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/dashboard" className="block p-4 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-center">
                Dasbor
              </a>
              <a href="/products" className="block p-4 bg-green-100 text-green-800 rounded hover:bg-green-200 text-center">
                Produk
              </a>
              <a href="/suppliers" className="block p-4 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 text-center">
                Pemasok
              </a>
              <a href="/reports" className="block p-4 bg-orange-100 text-orange-800 rounded hover:bg-orange-200 text-center">
                Laporan
              </a>
              <a href="/settings" className="block p-4 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-center">
                Pengaturan
              </a>
              <a href="/transactions/stock-in" className="block p-4 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 text-center">
                Stok Masuk
              </a>
              <a href="/transactions/stock-out" className="block p-4 bg-red-100 text-red-800 rounded hover:bg-red-200 text-center">
                Stok Keluar
              </a>
              <a href="/transactions/returns" className="block p-4 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 text-center">
                Retur
              </a>
            </div>
          </div>

          {/* Session Info */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">ℹ️ Informasi Sesi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Pengguna:</strong> {session.user.email}</p>
                <p><strong>Nama:</strong> {session.user.name}</p>
                <p><strong>ID:</strong> {session.user.id}</p>
              </div>
              <div>
                <p><strong>Status:</strong> {session.isAuthenticated ? '✅ Terautentikasi' : '❌ Tidak Terautentikasi'}</p>
                <p><strong>Bahasa:</strong> 🇮🇩 Indonesia</p>
                <p><strong>Mata Uang:</strong> 💰 Rupiah (IDR)</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}