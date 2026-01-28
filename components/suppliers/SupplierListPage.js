'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SplitView from '@/components/layout/SplitView'
import SupplierList from './SupplierList'
import SupplierDetail from './SupplierDetail'
import SupplierForm from './SupplierForm'
import SupplierFilters from './SupplierFilters'
import TouchButton from '@/components/ui/TouchButton'
import ExportButton from '@/components/ui/ExportButton'
import { PlusIcon, SearchIcon } from 'lucide-react'
import { getSuppliersAction, searchSuppliersAction } from '@/lib/actions/suppliers'

export default function SupplierListPage({
  initialSuppliers,
  initialPagination,
  searchParams
}) {
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  
  // State management
  const [suppliers, setSuppliers] = useState(initialSuppliers)
  const [pagination, setPagination] = useState(initialPagination)
  const [selectedSupplierId, setSelectedSupplierId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams?.search || '')
  const [filters, setFilters] = useState({
    sortBy: searchParams?.sortBy || 'name',
    sortOrder: searchParams?.sortOrder || 'asc'
  })

  // Update URL when filters change
  const updateURL = useCallback((newFilters, newSearch) => {
    const params = new URLSearchParams()
    
    if (newSearch) params.set('search', newSearch)
    if (newFilters.sortBy !== 'name') params.set('sortBy', newFilters.sortBy)
    if (newFilters.sortOrder !== 'asc') params.set('sortOrder', newFilters.sortOrder)
    
    const queryString = params.toString()
    const newURL = queryString ? `/suppliers?${queryString}` : '/suppliers'
    
    router.push(newURL, { scroll: false })
  }, [router])

  // Load suppliers with current filters
  const loadSuppliers = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const searchFilters = {
        search: searchQuery,
        ...filters,
        page,
        limit: 20
      }

      const result = await getSuppliersAction(searchFilters)
      
      if (result.success) {
        setSuppliers(result.suppliers)
        setPagination(result.pagination)
      }
    } catch (error) {
      console.error('Failed to load suppliers:', error)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, filters])

  // Handle search
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query)
    updateURL(filters, query)
    
    if (query.length >= 2) {
      await loadSuppliers(1)
    } else if (query.length === 0) {
      await loadSuppliers(1)
    }
  }, [filters, updateURL, loadSuppliers])

  // Handle filter changes
  const handleFilterChange = useCallback(async (newFilters) => {
    setFilters(newFilters)
    updateURL(newFilters, searchQuery)
    await loadSuppliers(1)
  }, [searchQuery, updateURL, loadSuppliers])

  // Handle pagination
  const handlePageChange = useCallback(async (page) => {
    await loadSuppliers(page)
  }, [loadSuppliers])

  // Handle supplier selection
  const handleSupplierSelect = useCallback((supplierId) => {
    setSelectedSupplierId(supplierId)
    setShowForm(false)
    setEditingSupplier(null)
  }, [])

  // Handle supplier creation
  const handleCreateSupplier = useCallback(() => {
    setShowForm(true)
    setEditingSupplier(null)
    setSelectedSupplierId(null)
  }, [])

  // Handle supplier editing
  const handleEditSupplier = useCallback((supplier) => {
    setEditingSupplier(supplier)
    setShowForm(true)
    setSelectedSupplierId(null)
  }, [])

  // Handle form success
  const handleFormSuccess = useCallback(async (supplier) => {
    setShowForm(false)
    setEditingSupplier(null)
    
    // Refresh suppliers list
    await loadSuppliers(pagination.page)
    
    // Select the created/updated supplier
    if (supplier) {
      setSelectedSupplierId(supplier.id)
    }
  }, [loadSuppliers, pagination.page])

  // Handle form cancel
  const handleFormCancel = useCallback(() => {
    setShowForm(false)
    setEditingSupplier(null)
  }, [])

  // Handle supplier deletion
  const handleSupplierDeleted = useCallback(async () => {
    setSelectedSupplierId(null)
    await loadSuppliers(pagination.page)
  }, [loadSuppliers, pagination.page])

  // Master content - Supplier list with filters
  const masterContent = (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
            <p className="text-gray-600 mt-1">
              {pagination.totalCount} {pagination.totalCount === 1 ? 'supplier' : 'suppliers'}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <ExportButton
              exportType="suppliers"
              filters={{
                search: searchQuery,
                includeTransactionStats: true
              }}
              variant="outline"
            >
              Export Suppliers
            </ExportButton>
            
            <TouchButton
              variant="primary"
              onClick={handleCreateSupplier}
              className="flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Supplier
            </TouchButton>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search suppliers by name or contact..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full h-12 pl-10 pr-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation"
          />
        </div>

        {/* Filters */}
        <SupplierFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Supplier List */}
      <div className="flex-1 overflow-y-auto">
        <SupplierList
          suppliers={suppliers}
          selectedSupplierId={selectedSupplierId}
          onSupplierSelect={handleSupplierSelect}
          onSupplierEdit={handleEditSupplier}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )

  // Detail content - Supplier detail or form
  const detailContent = showForm ? (
    <SupplierForm
      supplier={editingSupplier}
      onSuccess={handleFormSuccess}
      onCancel={handleFormCancel}
    />
  ) : selectedSupplierId ? (
    <SupplierDetail
      supplierId={selectedSupplierId}
      onEdit={handleEditSupplier}
      onDeleted={handleSupplierDeleted}
      onClose={() => setSelectedSupplierId(null)}
    />
  ) : (
    <div className="h-full flex items-center justify-center bg-white">
      <div className="text-center text-gray-500">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <PlusIcon className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Supplier Selected</h3>
        <p className="text-sm mb-4">
          Select a supplier from the list to view details, or create a new supplier.
        </p>
        <TouchButton
          variant="primary"
          onClick={handleCreateSupplier}
        >
          Create New Supplier
        </TouchButton>
      </div>
    </div>
  )

  return (
    <SplitView
      masterContent={masterContent}
      detailContent={detailContent}
      masterWidth="45%"
      showDetail={showForm || selectedSupplierId !== null}
    />
  )
}