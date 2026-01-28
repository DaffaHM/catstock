'use client'

import { useState, useEffect } from 'react'
import TouchButton from '@/components/ui/TouchButton'
import { FilterIcon, XIcon, AlertTriangleIcon } from 'lucide-react'
import { getStockReportFilterOptionsAction } from '@/lib/actions/reports'

export default function StockReportFilters({ filters, onFilterChange }) {
  const [filterOptions, setFilterOptions] = useState({ categories: [], brands: [] })
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load filter options on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const result = await getStockReportFilterOptionsAction()
        if (result.success) {
          setFilterOptions(result.data)
        }
      } catch (error) {
        console.error('Failed to load filter options:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFilterOptions()
  }, [])

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    onFilterChange({
      category: '',
      brand: '',
      lowStockOnly: false,
      sortBy: 'name',
      sortOrder: 'asc'
    })
  }

  const hasActiveFilters = filters.category || filters.brand || filters.lowStockOnly

  const sortOptions = [
    { value: 'name', label: 'Product Name' },
    { value: 'brand', label: 'Brand' },
    { value: 'category', label: 'Category' },
    { value: 'currentStock', label: 'Current Stock' },
    { value: 'stockValue', label: 'Stock Value' }
  ]

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <TouchButton
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center"
        >
          <FilterIcon className="h-5 w-5 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">
              {[filters.category, filters.brand, filters.lowStockOnly].filter(Boolean).length}
            </span>
          )}
        </TouchButton>

        {hasActiveFilters && (
          <TouchButton
            variant="ghost"
            onClick={clearFilters}
            className="flex items-center text-sm"
          >
            <XIcon className="h-4 w-4 mr-1" />
            Clear All
          </TouchButton>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full h-12 px-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation"
                disabled={loading}
              >
                <option value="">All Categories</option>
                {filterOptions.categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <select
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="w-full h-12 px-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation"
                disabled={loading}
              >
                <option value="">All Brands</option>
                {filterOptions.brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="flex space-x-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="flex-1 h-12 px-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  className="w-24 h-12 px-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation"
                >
                  <option value="asc">A-Z</option>
                  <option value="desc">Z-A</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stock Status Filter */}
          <div className="flex items-center space-x-4 pt-2 border-t border-gray-200">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.lowStockOnly}
                onChange={(e) => handleFilterChange('lowStockOnly', e.target.checked)}
                className="h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 touch-manipulation"
              />
              <span className="flex items-center text-sm font-medium text-gray-700">
                <AlertTriangleIcon className="h-4 w-4 text-amber-500 mr-1" />
                Show Low Stock Items Only
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}