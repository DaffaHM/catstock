'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  BarChart3Icon, 
  CalendarIcon, 
  PackageIcon, 
  TrendingUpIcon,
  FileTextIcon 
} from 'lucide-react'

export default function ReportsNavigation() {
  const pathname = usePathname()

  const reportLinks = [
    {
      href: '/reports',
      label: 'Laporan Stok',
      icon: PackageIcon,
      description: 'Stok saat ini dan peringatan'
    },
    {
      href: '/reports/daily-reports',
      label: 'Laporan Harian',
      icon: CalendarIcon,
      description: 'Penjualan dan keuntungan per hari'
    },
    {
      href: '/reports/sales-purchase-summary',
      label: 'Ringkasan Penjualan',
      icon: BarChart3Icon,
      description: 'Ringkasan penjualan dan pembelian'
    },
    {
      href: '/profit-analysis',
      label: 'Analisis Keuntungan',
      icon: TrendingUpIcon,
      description: 'Analisis keuntungan produk'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileTextIcon className="w-5 h-5" />
          Jenis Laporan
        </h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportLinks.map((link) => {
            const isActive = pathname === link.href
            const Icon = link.icon
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  <h3 className="font-medium">{link.label}</h3>
                </div>
                <p className={`text-sm ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                  {link.description}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}