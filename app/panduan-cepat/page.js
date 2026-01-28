'use client'

import { useState } from 'react'

export default function PanduanCepatPage() {
  const [activeStep, setActiveStep] = useState(1)

  const steps = [
    {
      id: 1,
      title: "🏠 Mulai dari Dasbor",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">Dasbor adalah halaman utama yang menampilkan ringkasan bisnis Anda.</p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Yang bisa Anda lihat di Dasbor:</h4>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Total produk yang tersedia</li>
              <li>Jumlah pemasok</li>
              <li>Ringkasan transaksi</li>
              <li>Stok yang hampir habis</li>
              <li>Aktivitas terbaru</li>
            </ul>
          </div>
          <a href="/dashboard" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Buka Dasbor
          </a>
        </div>
      )
    },
    {
      id: 2,
      title: "📦 Kelola Produk",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">Kelola semua produk cat di toko Anda.</p>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Cara menambah produk baru:</h4>
            <ol className="list-decimal list-inside space-y-1 text-green-700">
              <li>Klik menu "Produk"</li>
              <li>Klik tombol "Tambah Produk"</li>
              <li>Isi nama produk (contoh: "Cat Tembok Putih")</li>
              <li>Isi harga beli dan harga jual</li>
              <li>Tentukan stok minimum</li>
              <li>Klik "Simpan"</li>
            </ol>
          </div>
          <a href="/products" className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Kelola Produk
          </a>
        </div>
      )
    },
    {
      id: 3,
      title: "🚚 Tambah Pemasok",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">Daftarkan pemasok/supplier untuk memudahkan pembelian.</p>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2">Informasi yang perlu diisi:</h4>
            <ul className="list-disc list-inside space-y-1 text-purple-700">
              <li>Nama pemasok (contoh: "PT Cat Indah")</li>
              <li>Nama kontak person</li>
              <li>Nomor telepon</li>
              <li>Email (opsional)</li>
              <li>Alamat lengkap</li>
            </ul>
          </div>
          <a href="/suppliers" className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Kelola Pemasok
          </a>
        </div>
      )
    },
    {
      id: 4,
      title: "⬆️ Catat Stok Masuk",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">Catat setiap kali ada barang masuk ke toko.</p>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="font-semibold text-indigo-800 mb-2">Kapan menggunakan Stok Masuk:</h4>
            <ul className="list-disc list-inside space-y-1 text-indigo-700">
              <li>Saat menerima barang dari pemasok</li>
              <li>Saat ada penambahan stok</li>
              <li>Saat ada retur dari pelanggan</li>
            </ul>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="font-semibold text-indigo-800 mb-2">Langkah-langkah:</h4>
            <ol className="list-decimal list-inside space-y-1 text-indigo-700">
              <li>Pilih pemasok</li>
              <li>Tambah produk yang diterima</li>
              <li>Input jumlah dan harga beli</li>
              <li>Simpan transaksi</li>
            </ol>
          </div>
          <a href="/transactions/stock-in" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Catat Stok Masuk
          </a>
        </div>
      )
    },
    {
      id: 5,
      title: "⬇️ Catat Penjualan",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">Catat setiap penjualan untuk melacak stok dan omzet.</p>
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">Cara mencatat penjualan:</h4>
            <ol className="list-decimal list-inside space-y-1 text-red-700">
              <li>Buka menu "Stok Keluar"</li>
              <li>Klik "Buat Transaksi Baru"</li>
              <li>Pilih "Penjualan"</li>
              <li>Tambah produk yang dibeli pelanggan</li>
              <li>Input jumlah dan harga jual</li>
              <li>Isi nama pelanggan (opsional)</li>
              <li>Simpan transaksi</li>
            </ol>
          </div>
          <a href="/transactions/stock-out" className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Catat Penjualan
          </a>
        </div>
      )
    },
    {
      id: 6,
      title: "📊 Lihat Laporan",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">Pantau performa bisnis dengan berbagai laporan.</p>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-2">Jenis laporan yang tersedia:</h4>
            <ul className="list-disc list-inside space-y-1 text-orange-700">
              <li>Laporan Stok Saat Ini</li>
              <li>Laporan Penjualan Harian/Bulanan</li>
              <li>Laporan Pembelian</li>
              <li>Laporan Laba Rugi</li>
              <li>Laporan Stok Minimum</li>
            </ul>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-2">Tips menggunakan laporan:</h4>
            <ul className="list-disc list-inside space-y-1 text-orange-700">
              <li>Atur filter tanggal sesuai kebutuhan</li>
              <li>Gunakan filter kategori untuk analisis spesifik</li>
              <li>Export ke CSV untuk analisis lebih lanjut</li>
            </ul>
          </div>
          <a href="/reports" className="inline-block px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            Lihat Laporan
          </a>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">⚡ Panduan Cepat CatStock</h1>
          <div className="flex items-center space-x-4">
            <a href="/tutorial" className="text-blue-600 hover:underline">Tutorial Lengkap</a>
            <a href="/dashboard" className="text-blue-600 hover:underline">Ke Dasbor</a>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Steps */}
        <div className="w-80 bg-white border-r border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Langkah-langkah:</h2>
          <div className="space-y-2">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  activeStep === step.id
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">{step.title}</div>
                <div className="text-sm opacity-75">Langkah {step.id}</div>
              </button>
            ))}
          </div>

          <div className="mt-8 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">💡 Tips Cepat</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Input data segera setelah transaksi</li>
              <li>• Cek stok minimum secara rutin</li>
              <li>• Backup data secara berkala</li>
              <li>• Logout setelah selesai</li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-3xl">
            {steps.find(step => step.id === activeStep) && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  {steps.find(step => step.id === activeStep).title}
                </h2>
                {steps.find(step => step.id === activeStep).content}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                disabled={activeStep === 1}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Sebelumnya
              </button>

              <span className="text-gray-500">
                Langkah {activeStep} dari {steps.length}
              </span>

              <button
                onClick={() => setActiveStep(Math.min(steps.length, activeStep + 1))}
                disabled={activeStep === steps.length}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya →
              </button>
            </div>

            {/* Completion */}
            {activeStep === steps.length && (
              <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-xl font-semibold text-green-800 mb-4">🎉 Selamat!</h3>
                <p className="text-green-700 mb-4">
                  Anda telah menyelesaikan panduan cepat CatStock. Sekarang Anda siap menggunakan aplikasi untuk mengelola inventori toko cat Anda.
                </p>
                <div className="space-x-4">
                  <a href="/dashboard" className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Mulai Menggunakan
                  </a>
                  <a href="/tutorial" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Baca Tutorial Lengkap
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}