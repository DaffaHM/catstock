'use client'

import { useState } from 'react'
import TouchButton from '@/components/ui/TouchButton'
import { FilterIcon, XIcon } from 'lucide-react'

export default function SupplierFilters({ filters, onFilterChange }) {
  const [showFilters, setShowFilters] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)

  const handleFilterUpdate = (key, value) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      sortBy: 'name',
      sortOrder: 'asc'
    }
    setLocalFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters = localFilters.sortBy !== 'name' || localFilters.sortOrder !== 'asc'

  return (
    <div className="space-y-4">
      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <TouchButton
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center"
        >
          <FilterIcon className="h-4 w-4 mr-2" />
          Filters & Sort
          {hasActiveFilters && (
            <span className="ml-2 bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </TouchButton>

        {hasActiveFilters && (
          <TouchButton
            variant="ghost"
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700 flex items-center"
          >
            <XIcon className="h-4 w-4 mr-1" />
            Clear
          </TouchButton>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          {/* Sort Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Sort By
              </label>
              <select
                value={localFilters.sortBy}
                onChange={(e) => handleFilterUpdate('sortBy', e.target.value)}
                className="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation"
              >
                <option value="name">Name</option>
                <option value="createdAt">Date Created</option>
                <option value="updatedAt">Last Updated</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Sort Order
              </label>
              <select
                value={localFilters.sortOrder}
                onChange={(e) => handleFilterUpdate('sortOrder', e.target.value)}
                className="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          {/* Quick Sort Buttons */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            <TouchButton
              variant="ghost"
              size="sm"
              onClick={() => {
                handleFilterUpdate('sortBy', 'name')
                handleFilterUpdate('sortOrder', 'asc')
              }}
              className={`${
                localFilters.sortBy === 'name' && localFilters.sortOrder === 'asc'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600'
              }`}
            >
              Name A-Z
            </TouchButton>
            
            <TouchButton
              variant="ghost"
              size="sm"
              onClick={() => {
                handleFilterUpdate('sortBy', 'createdAt')
                handleFilterUpdate('sortOrder', 'desc')
              }}
              className={`${
                localFilters.sortBy === 'createdAt' && localFilters.sortOrder === 'desc'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600'
              }`}
            >
              Newest First
            </TouchButton>
            
            <TouchButton
              variant="ghost"
              size="sm"
              onClick={() => {
                handleFilterUpdate('sortBy', 'updatedAt')
                handleFilterUpdate('sortOrder', 'desc')
              }}
              className={`${
                localFilters.sortBy === 'updatedAt' && localFilters.sortOrder === 'desc'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600'
              }`}
            >
              Recently Updated
            </TouchButton>
          </div>
        </div>
      )}
    </div>
  )
}