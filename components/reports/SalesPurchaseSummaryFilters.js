'use client'

import { useState, useEffect } from 'react'
import TouchButton from '@/components/ui/TouchButton'
import { FilterIcon, XIcon } from 'lucide-react'
import { getStockReportFilterOptionsAction } from '@/lib/actions/reports'

export default function SalesPurchaseSummaryFilters({ filters, onFilterChange }) {
  const [filterOptions, setFilterOptions] = useState({ categories: [], brands: [], suppliers: [] })
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load filter options on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        // Get categories and brands from existing action
        const result = await getStockReportFilterOptionsAction()
        if (result.success) {
          setFilterOptions(prev => ({
            ...prev,
            categories: result.data.categories,
            brands: result.data.brands
          }))
        }

        // TODO: Add supplier options when needed
        // For now, we'll use empty suppliers array
        setFilterOptions(prev => ({
          ...prev,
          suppliers: []
        }))
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
      ...filters,
      category: '',
      brand: '',
      supplierId: ''
    })
  }

  const hasActiveFilters = filters.category || filters.brand || filters.supplierId

  const groupByOptions = [
    { value: 'day', label: 'Daily' },
    { value: 'week', label: 'Weekly' },
    { value: 'month', label: 'Monthly' },
    { value: 'year', label: 'Yearly' }
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
              {[filters.category, filters.brand, filters.supplierId].filter(Boolean).length}
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
            Clear Filters
          </TouchButton>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

            {/* Supplier Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier
              </label>
              <select
                value={filters.supplierId}
                onChange={(e) => handleFilterChange('supplierId', e.target.value)}
                className="w-full h-12 px-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation"
                disabled={loading}
              >
                <option value="">All Suppliers</option>
                {filterOptions.suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Group By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group By
              </label>
              <select
                value={filters.groupBy}
                onChange={(e) => handleFilterChange('groupBy', e.target.value)}
                className="w-full h-12 px-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation"
              >
                {groupByOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Additional Options */}
          <div className="flex items-center space-x-6 pt-2 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <strong>Tip:</strong> Use date range and grouping to analyze trends over different time periods.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}