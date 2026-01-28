'use client'

import { useState, useEffect } from 'react'
import { getSuppliersAction, deleteSupplierAction, createSupplierAction } from '@/lib/actions/suppliers'
import { getDemoSuppliers, saveDemoSupplier, deleteDemoSupplier, searchDemoSuppliers } from '@/lib/utils/demo-suppliers'
import SupplierForm from './SupplierForm'
import SplitViewDrawer from '@/components/ui/SplitViewDrawer'
import TouchButton from '@/components/ui/TouchButton'
import { PlusIcon, SearchIcon, EditIcon, TrashIcon, TruckIcon } from 'lucide-react'

export default function SupplierListPage({ session, isDemoMode }) {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0
  })

  // Load suppliers - use client-side demo data if in demo mode
  const loadSuppliers = async (page = 1, search = '') => {
    try {
      setLoading(true)
      console.log('Loading suppliers:', { page, search, isDemoMode })
      
      if (isDemoMode) {
        // Use client-side demo data
        const result = searchDemoSuppliers(search, {
          page,
          limit: 20,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        })
        
        console.log('Demo suppliers loaded:', result)
        setSuppliers(result.suppliers)
        setPagination(result.pagination)
        setError(null)
      } else {
        // Use server action for real data
        const result = await getSuppliersAction({
          search,
          page,
          limit: 20,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        })

        console.log('Server suppliers loaded:', result)

        if (result.success) {
          setSuppliers(result.suppliers)
          setPagination(result.pagination)
          setError(null)
        } else {
          setError(result.error)
          console.error('Failed to load suppliers:', result.error)
        }
      }
    } catch (err) {
      console.error('Load suppliers error:', err)
      setError('Gagal memuat data pemasok')
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    loadSuppliers()
  }, [])

  // Search handler with proper debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadSuppliers(1, searchTerm)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)
  }

  // Handle form success
  const handleFormSuccess = (supplier) => {
    console.log('Form success, new supplier:', supplier)
    setShowForm(false)
    setEditingSupplier(null)
    
    if (isDemoMode) {
      // In demo mode, handle client-side
      if (!editingSupplier && supplier) {
        // Save to localStorage
        saveDemoSupplier(supplier)
        
        // Add to current list immediately
        setSuppliers(prevSuppliers => {
          const exists = prevSuppliers.find(s => s.id === supplier.id)
          if (!exists) {
            return [supplier, ...prevSuppliers]
          }
          return prevSuppliers
        })
        
        // Update pagination count
        setPagination(prev => ({
          ...prev,
          totalCount: prev.totalCount + 1
        }))
        
        // Notify other components that suppliers have been updated
        window.dispatchEvent(new CustomEvent('suppliersUpdated', { detail: supplier }))
      }
    } else {
      // In database mode, reload from server
      loadSuppliers(1, searchTerm)
    }
  }

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false)
    setEditingSupplier(null)
  }

  // Handle edit supplier
  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier)
    setShowForm(true)
  }

  // Handle delete supplier
  const handleDeleteSupplier = async (supplier) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pemasok "${supplier.name}"?`)) {
      return
    }

    try {
      if (isDemoMode) {
        // Handle demo mode deletion
        deleteDemoSupplier(supplier.id)
        
        // Remove from current list
        setSuppliers(prevSuppliers => prevSuppliers.filter(s => s.id !== supplier.id))
        setPagination(prev => ({
          ...prev,
          totalCount: Math.max(0, prev.totalCount - 1)
        }))
      } else {
        // Handle database deletion
        const result = await deleteSupplierAction(supplier.id)
        if (result.success) {
          loadSuppliers(pagination.page, searchTerm)
        } else {
          alert(result.error || 'Gagal menghapus pemasok')
        }
      }
    } catch (err) {
      alert('Gagal menghapus pemasok')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pemasok {isDemoMode && <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">Demo</span>}
          </h1>
          <p className="text-gray-600 mt-1">Kelola informasi pemasok</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex gap-2">
              <TouchButton
                variant="primary"
                onClick={() => setShowForm(true)}
                className="flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Tambah Pemasok
              </TouchButton>
            </div>

            {/* Search */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari pemasok..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Memuat pemasok...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && suppliers.length === 0 && !error && (
            <div className="text-center py-12">
              <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada pemasok</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Tidak ada pemasok yang sesuai dengan pencarian.' : 'Mulai dengan menambahkan pemasok pertama.'}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <TouchButton
                    variant="primary"
                    onClick={() => setShowForm(true)}
                    className="flex items-center mx-auto"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Tambah Pemasok
                  </TouchButton>
                </div>
              )}
            </div>
          )}

          {/* Suppliers Grid */}
          {!loading && suppliers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suppliers.map((supplier) => (
                <div key={supplier.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">{supplier.name}</h3>
                    <div className="flex space-x-2 flex-shrink-0">
                      <TouchButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSupplier(supplier)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <EditIcon className="h-4 w-4" />
                      </TouchButton>
                      <TouchButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSupplier(supplier)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </TouchButton>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    {supplier.contact && (
                      <div>
                        <strong>Kontak:</strong>
                        <div className="whitespace-pre-line text-xs mt-1">{supplier.contact}</div>
                      </div>
                    )}
                    {supplier.notes && (
                      <div>
                        <strong>Catatan:</strong>
                        <div className="text-xs mt-1 line-clamp-2">{supplier.notes}</div>
                      </div>
                    )}
                    <div>
                      <strong>Transaksi:</strong> {supplier.transactionCount || 0} transaksi
                    </div>
                    <div>
                      <strong>Dibuat:</strong> {new Date(supplier.createdAt).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <TouchButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSupplier(supplier)}
                      className="w-full"
                    >
                      Lihat Detail
                    </TouchButton>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && suppliers.length > 0 && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.totalCount)} dari {pagination.totalCount} pemasok
              </div>
              
              <div className="flex items-center space-x-2">
                <TouchButton
                  variant="outline"
                  size="sm"
                  onClick={() => loadSuppliers(pagination.page - 1, searchTerm)}
                  disabled={!pagination.hasPreviousPage}
                >
                  Sebelumnya
                </TouchButton>
                
                <span className="text-sm text-gray-700">
                  Halaman {pagination.page} dari {pagination.totalPages}
                </span>
                
                <TouchButton
                  variant="outline"
                  size="sm"
                  onClick={() => loadSuppliers(pagination.page + 1, searchTerm)}
                  disabled={!pagination.hasNextPage}
                >
                  Selanjutnya
                </TouchButton>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Supplier Form Drawer */}
      <SplitViewDrawer
        isOpen={showForm}
        onClose={handleFormCancel}
        title={editingSupplier ? 'Edit Pemasok' : 'Tambah Pemasok'}
      >
        <SupplierForm
          supplier={editingSupplier}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
          isDemoMode={isDemoMode}
        />
      </SplitViewDrawer>
    </div>
  )
}