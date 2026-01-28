'use client'

import { useState } from 'react'
import TouchButton from '@/components/ui/TouchButton'
import { FilterIcon, XIcon } from 'lucide-react'

export default function ProductFilters({
  filters,
  categories,
  brands,
  onFilterChange
}) {
  const [showFilters, setShowFilters] = useState(false)

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      brand: '',
      sortBy: 'name',
      sortOrder: 'asc'
    }
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters = filters.category || filters.brand || 
    filters.sortBy !== 'name' || filters.sortOrder !== 'asc'

  return (
    <div className="space-y-3">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <TouchButton
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center"
        >
          <FilterIcon className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </TouchButton>

        {hasActiveFilters && (
          <TouchButton
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <XIcon className="h-4 w-4 mr-1" />
            Clear
          </TouchButton>
        )}
      </div>

      {/* Filter Controls */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full h-12 px-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
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
                className="w-full h-12 px-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation bg-white"
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full h-12 px-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation bg-white"
              >
                <option value="name">Product Name</option>
                <option value="brand">Brand</option>
                <option value="category">Category</option>
                <option value="sku">SKU</option>
                <option value="createdAt">Date Created</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="w-full h-12 px-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation bg-white"
              >
                <option value="asc">Ascending (A-Z)</option>
                <option value="desc">Descending (Z-A)</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
            <span className="text-sm font-medium text-gray-700 mr-2">Quick filters:</span>
            
            <TouchButton
              variant={filters.category === 'Interior Paint' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('category', 
                filters.category === 'Interior Paint' ? '' : 'Interior Paint'
              )}
            >
              Interior Paint
            </TouchButton>
            
            <TouchButton
              variant={filters.category === 'Exterior Paint' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('category', 
                filters.category === 'Exterior Paint' ? '' : 'Exterior Paint'
              )}
            >
              Exterior Paint
            </TouchButton>
            
            <TouchButton
              variant={filters.category === 'Primer' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('category', 
                filters.category === 'Primer' ? '' : 'Primer'
              )}
            >
              Primer
            </TouchButton>
          </div>
        </div>
      )}
    </div>
  )
}