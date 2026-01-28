'use client'

export default function QuickActions() {
  const actions = [
    {
      title: 'Stok Masuk',
      description: 'Tambah stok produk',
      href: '/transactions/stock-in',
      icon: '📥',
      color: 'green'
    },
    {
      title: 'Stok Keluar',
      description: 'Catat penjualan',
      href: '/transactions/stock-out',
      icon: '📤',
      color: 'red'
    },
    {
      title: 'Produk Baru',
      description: 'Tambah produk',
      href: '/products',
      icon: '➕',
      color: 'blue'
    },
    {
      title: 'Laporan',
      description: 'Lihat laporan',
      href: '/reports',
      icon: '📊',
      color: 'purple'
    }
  ]

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <a
            key={index}
            href={action.href}
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow text-center"
          >
            <div className="text-2xl mb-2">{action.icon}</div>
            <h3 className="font-medium text-gray-900 text-sm">{action.title}</h3>
            <p className="text-xs text-gray-600 mt-1">{action.description}</p>
          </a>
        ))}
      </div>
    </div>
  )
}