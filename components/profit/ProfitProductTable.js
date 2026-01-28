'use client'

import { useState } from 'react'
import { SearchIcon, FilterIcon, ArrowUpIcon, ArrowDownIcon } from 'lucide-react'

export default function ProfitProductTable({ data, filters, onFilterChange, loading }) {
  const [showFilters, setShowFilters] = useState(false)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (percentage) => {
    return `${percentage.toFixed(1)}%`
  }

  const getProfitColor = (percentage) => {
    if (percentage >= 50) return 'text-green-600 bg-green-50'
    if (percentage >= 30) return 'text-blue-600 bg-blue-50'
    if (percentage >= 15) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const handleSort = (sortBy) => {
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'desc' ? 'asc' : 'desc'
    onFilterChange({ sortBy, sortOrder: newSortOrder })
  }

  const SortIcon = ({ column }) => {
    if (filters.sortBy !== column) return null
    return filters.sortOrder === 'desc' ? 
      <ArrowDownIcon className="h-4 w-4 ml-1" /> : 
      <ArrowUpIcon className="h-4 w-4 ml-1" />
  }

  if (!data) return null

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari produk..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FilterIcon className="h-4 w-4 mr-2" />
          Filter
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori
              </label>
              <select
                value={filters.category}
                onChange={(e) => onFilterChange({ category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Semua Kategori</option>
                <option value="Cat Tembok">Cat Tembok</option>
                <option value="Cat Kayu">Cat Kayu</option>
                <option value="Cat Besi">Cat Besi</option>
                <option value="Pelarut">Pelarut</option>
                <option value="Alat">Alat</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urutkan Berdasarkan
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => onFilterChange({ sortBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="profitAmount">Keuntungan (Rp)</option>
                <option value="profitPercentage">Margin (%)</option>
                <option value="totalProfit">Total Keuntungan</option>
                <option value="totalSold">Total Terjual</option>
                <option value="name">Nama Produk</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urutan
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => onFilterChange({ sortOrder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="desc">Tertinggi ke Terendah</option>
                <option value="asc">Terendah ke Tertinggi</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Produk
                    <SortIcon column="name" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('profitAmount')}
                >
                  <div className="flex items-center">
                    Harga Beli/Jual
                    <SortIcon column="profitAmount" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('profitPercentage')}
                >
                  <div className="flex items-center">
                    Margin
                    <SortIcon column="profitPercentage" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalSold')}
                >
                  <div className="flex items-center">
                    Terjual
                    <SortIcon column="totalSold" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalProfit')}
                >
                  <div className="flex items-center">
                    Total Keuntungan
                    <SortIcon column="totalProfit" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : data.products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    Tidak ada data produk yang ditemukan
                  </td>
                </tr>
              ) : (
                data.products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.brand} • {product.sku}
                        </div>
                        <div className="text-xs text-gray-400">
                          {product.category}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-red-600">
                          Beli: {formatCurrency(product.purchasePrice)}
                        </div>
                        <div className="text-green-600">
                          Jual: {formatCurrency(product.sellingPrice)}
                        </div>
                        <div className="text-blue-600 font-medium">
                          Untung: {formatCurrency(product.profitAmount)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProfitColor(product.profitPercentage)}`}>
                        {formatPercentage(product.profitPercentage)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-gray-900 font-medium">
                          {product.totalSold} unit
                        </div>
                        <div className="text-gray-500 text-xs">
                          Stok: {product.currentStock}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        {formatCurrency(product.totalProfit)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}