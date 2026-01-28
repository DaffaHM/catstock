'use client'

import { useState, useEffect } from 'react'
import { searchDemoSuppliers, getDemoSuppliers } from '@/lib/utils/demo-suppliers'
import SupplierDropdown from '@/components/ui/SupplierDropdown'
import TouchButton from '@/components/ui/TouchButton'

export default function TestSupplierCount() {
  const [suppliersFromSearch, setSuppliersFromSearch] = useState([])
  const [suppliersFromGet, setSuppliersFromGet] = useState([])
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const loadData = () => {
    // Method 1: searchDemoSuppliers (used by SupplierListPage)
    const searchResult = searchDemoSuppliers('', {
      page: 1,
      limit: 100,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
    setSuppliersFromSearch(searchResult.suppliers)

    // Method 2: getDemoSuppliers (old method)
    const getResult = getDemoSuppliers()
    setSuppliersFromGet(getResult)

    console.log('=== SUPPLIER COUNT DEBUG ===')
    console.log('searchDemoSuppliers result:', searchResult)
    console.log('getDemoSuppliers result:', getResult)
    console.log('localStorage demo-suppliers:', localStorage.getItem('demo-suppliers'))
  }

  useEffect(() => {
    loadData()
  }, [refreshKey])

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    setSelectedSupplier(null)
  }

  const handleClearStorage = () => {
    localStorage.removeItem('demo-suppliers')
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Supplier Count Debug Test
          </h1>
          <p className="text-gray-600">
            Debugging why dropdown shows different count than supplier page
          </p>
          
          <div className="flex gap-2 mt-4">
            <TouchButton variant="outline" onClick={handleRefresh}>
              Refresh Data
            </TouchButton>
            <TouchButton variant="outline" onClick={handleClearStorage} className="text-red-600">
              Clear localStorage
            </TouchButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Method 1: searchDemoSuppliers */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              searchDemoSuppliers()
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Used by SupplierListPage and SupplierDropdown
            </p>
            
            <div className="mb-4">
              <div className="text-2xl font-bold text-blue-600">
                {suppliersFromSearch.length}
              </div>
              <div className="text-sm text-gray-500">suppliers found</div>
            </div>
            
            <div className="bg-gray-50 rounded p-3 max-h-60 overflow-y-auto">
              {suppliersFromSearch.map(supplier => (
                <div key={supplier.id} className="text-sm mb-2 p-2 bg-white rounded">
                  <div className="font-medium">{supplier.name}</div>
                  <div className="text-xs text-gray-500">ID: {supplier.id}</div>
                  <div className="text-xs text-gray-500">
                    Created: {new Date(supplier.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Method 2: getDemoSuppliers */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              getDemoSuppliers()
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Old method (should not be used)
            </p>
            
            <div className="mb-4">
              <div className="text-2xl font-bold text-orange-600">
                {suppliersFromGet.length}
              </div>
              <div className="text-sm text-gray-500">suppliers found</div>
            </div>
            
            <div className="bg-gray-50 rounded p-3 max-h-60 overflow-y-auto">
              {suppliersFromGet.map(supplier => (
                <div key={supplier.id} className="text-sm mb-2 p-2 bg-white rounded">
                  <div className="font-medium">{supplier.name}</div>
                  <div className="text-xs text-gray-500">ID: {supplier.id}</div>
                  <div className="text-xs text-gray-500">
                    Created: {new Date(supplier.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dropdown Test */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              SupplierDropdown Test
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Actual dropdown component
            </p>
            
            <div className="space-y-4">
              <SupplierDropdown
                value={selectedSupplier}
                onSupplierSelect={setSelectedSupplier}
                placeholder="Click to see suppliers..."
                isDemoMode={true}
              />
              
              {selectedSupplier && (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <div className="text-sm">
                    <div><strong>Selected:</strong> {selectedSupplier.name}</div>
                    <div><strong>ID:</strong> {selectedSupplier.id}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Raw Data Comparison */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Raw Data Comparison
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                localStorage Content
              </h3>
              <pre className="bg-gray-50 rounded p-3 text-xs overflow-x-auto max-h-40">
                {JSON.stringify(JSON.parse(localStorage.getItem('demo-suppliers') || '[]'), null, 2)}
              </pre>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Base Demo Suppliers (from file)
              </h3>
              <pre className="bg-gray-50 rounded p-3 text-xs overflow-x-auto max-h-40">
                {JSON.stringify([
                  { id: 'demo-supp-1', name: 'PT Supplier A' },
                  { id: 'demo-supp-2', name: 'PT Supplier B' }
                ], null, 2)}
              </pre>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-medium text-yellow-900 mb-2">Expected Behavior:</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Both methods should return the same number of suppliers</li>
              <li>• Dropdown should show all suppliers from supplier management page</li>
              <li>• Base suppliers (2) + localStorage suppliers = total count</li>
              <li>• If supplier page shows 4, dropdown should also show 4</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}