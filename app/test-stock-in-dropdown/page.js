'use client'

import { useState, useEffect } from 'react'
import { searchDemoSuppliers } from '@/lib/utils/demo-suppliers'
import SupplierDropdown from '@/components/ui/SupplierDropdown'
import TouchButton from '@/components/ui/TouchButton'

export default function TestStockInDropdown() {
  const [suppliers, setSuppliers] = useState([])
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const loadSuppliers = () => {
    // Exact same method as SupplierListPage
    const result = searchDemoSuppliers('', {
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
    
    console.log('=== SUPPLIER LIST PAGE METHOD ===')
    console.log('Result:', result)
    console.log('Suppliers:', result.suppliers)
    console.log('Count:', result.suppliers.length)
    
    setSuppliers(result.suppliers)
  }

  useEffect(() => {
    loadSuppliers()
  }, [refreshKey])

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    setSelectedSupplier(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Stock In Dropdown Test
          </h1>
          <p className="text-gray-600">
            Testing supplier dropdown in stock-in context
          </p>
          
          <TouchButton variant="outline" onClick={handleRefresh} className="mt-4">
            Refresh Data
          </TouchButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Supplier List (same as management page) */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Suppliers from Management Page Method
            </h2>
            
            <div className="mb-4">
              <div className="text-2xl font-bold text-blue-600">
                {suppliers.length}
              </div>
              <div className="text-sm text-gray-500">suppliers found</div>
              <div className="text-xs text-gray-400">
                Using searchDemoSuppliers('', {`{page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc'}`})
              </div>
            </div>
            
            <div className="bg-gray-50 rounded p-4 max-h-80 overflow-y-auto">
              {suppliers.length === 0 ? (
                <p className="text-gray-500 text-sm">No suppliers found</p>
              ) : (
                <div className="space-y-2">
                  {suppliers.map((supplier, index) => (
                    <div key={supplier.id} className="bg-white rounded p-3 border">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {index + 1}. {supplier.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {supplier.id}
                          </div>
                          <div className="text-xs text-gray-500">
                            Created: {new Date(supplier.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stock In Dropdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Stock In Supplier Dropdown
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier <span className="text-red-500">*</span>
                </label>
                <SupplierDropdown
                  value={selectedSupplier}
                  onSupplierSelect={setSelectedSupplier}
                  placeholder="Pilih pemasok..."
                  required
                  isDemoMode={true}
                  forceRefresh={refreshKey}
                />
              </div>
              
              {selectedSupplier && (
                <div className="bg-green-50 border border-green-200 rounded p-4">
                  <h3 className="font-medium text-green-900 mb-2">
                    Selected Supplier:
                  </h3>
                  <div className="text-sm text-green-800">
                    <div><strong>Name:</strong> {selectedSupplier.name}</div>
                    <div><strong>ID:</strong> {selectedSupplier.id}</div>
                    <div><strong>Created:</strong> {new Date(selectedSupplier.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <h3 className="font-medium text-blue-900 mb-2">
                  Instructions:
                </h3>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Compare the count on the left with dropdown options</li>
                  <li>2. Click dropdown to see all available suppliers</li>
                  <li>3. Both should show the same suppliers</li>
                  <li>4. Check browser console for debug info</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Console */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Debug Console
          </h2>
          
          <div className="space-y-2">
            <TouchButton
              variant="outline"
              onClick={() => {
                console.log('=== MANUAL DEBUG ===')
                console.log('Suppliers from state:', suppliers)
                console.log('Selected supplier:', selectedSupplier)
                console.log('Refresh key:', refreshKey)
                console.log('localStorage demo-suppliers:', localStorage.getItem('demo-suppliers'))
                
                // Test direct function calls
                const directResult = searchDemoSuppliers('', {
                  page: 1,
                  limit: 20,
                  sortBy: 'createdAt',
                  sortOrder: 'desc'
                })
                console.log('Direct searchDemoSuppliers call:', directResult)
              }}
            >
              Log Debug Info
            </TouchButton>
            
            <TouchButton
              variant="outline"
              onClick={() => {
                localStorage.removeItem('demo-suppliers')
                handleRefresh()
              }}
              className="text-red-600 ml-2"
            >
              Clear localStorage
            </TouchButton>
          </div>
        </div>
      </div>
    </div>
  )
}