'use client'

import { useState, useEffect } from 'react'
import { searchDemoSuppliers, saveDemoSupplier } from '@/lib/utils/demo-suppliers'
import SupplierDropdown from '@/components/ui/SupplierDropdown'
import TouchButton from '@/components/ui/TouchButton'
import TouchInput from '@/components/ui/TouchInput'

export default function TestSupplierConsistency() {
  const [suppliers, setSuppliers] = useState([])
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSupplierName, setNewSupplierName] = useState('')
  const [newSupplierContact, setNewSupplierContact] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const loadSuppliers = () => {
    // Load suppliers using the same method as SupplierListPage
    const result = searchDemoSuppliers('', {
      page: 1,
      limit: 100,
      sortBy: 'name',
      sortOrder: 'asc'
    })
    setSuppliers(result.suppliers)
    console.log('Loaded suppliers:', result.suppliers)
  }

  useEffect(() => {
    loadSuppliers()
  }, [refreshKey])

  const handleAddSupplier = () => {
    if (!newSupplierName.trim()) return

    const newSupplier = {
      id: `demo-supp-${Date.now()}`,
      name: newSupplierName.trim(),
      contact: newSupplierContact.trim() || null,
      notes: 'Added via consistency test',
      transactionCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Save to localStorage
    saveDemoSupplier(newSupplier)
    
    // Reset form
    setNewSupplierName('')
    setNewSupplierContact('')
    setShowAddForm(false)
    
    // Refresh data
    setRefreshKey(prev => prev + 1)
    
    console.log('Added new supplier:', newSupplier)
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    setSelectedSupplier(null)
  }

  const handleClearData = () => {
    localStorage.removeItem('demo-suppliers')
    setRefreshKey(prev => prev + 1)
    setSelectedSupplier(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Supplier Data Consistency Test
          </h1>
          <p className="text-gray-600">
            Testing that supplier dropdown shows the same data as supplier management page
          </p>
          
          <div className="flex gap-2 mt-4">
            <TouchButton
              variant="outline"
              onClick={handleRefresh}
            >
              Refresh Data
            </TouchButton>
            
            <TouchButton
              variant="outline"
              onClick={handleClearData}
              className="text-red-600"
            >
              Clear All Data
            </TouchButton>
            
            <TouchButton
              variant="primary"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Cancel' : 'Add Test Supplier'}
            </TouchButton>
          </div>
        </div>

        {/* Add Supplier Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Add Test Supplier
            </h2>
            
            <div className="space-y-4">
              <TouchInput
                label="Supplier Name"
                value={newSupplierName}
                onChange={(e) => setNewSupplierName(e.target.value)}
                placeholder="Enter supplier name..."
                required
              />
              
              <TouchInput
                label="Contact Info (Optional)"
                value={newSupplierContact}
                onChange={(e) => setNewSupplierContact(e.target.value)}
                placeholder="Phone, email, address..."
                multiline
                rows={3}
              />
              
              <div className="flex gap-2">
                <TouchButton
                  variant="primary"
                  onClick={handleAddSupplier}
                  disabled={!newSupplierName.trim()}
                >
                  Add Supplier
                </TouchButton>
                
                <TouchButton
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </TouchButton>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Management Page Data */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Suppliers from Management Page Method
            </h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Total: <strong>{suppliers.length}</strong> suppliers
              </p>
              <p className="text-xs text-gray-500">
                Using searchDemoSuppliers() - same as SupplierListPage
              </p>
            </div>
            
            <div className="bg-gray-50 rounded p-4 max-h-80 overflow-y-auto">
              {suppliers.length === 0 ? (
                <p className="text-gray-500 text-sm">No suppliers found</p>
              ) : (
                <div className="space-y-3">
                  {suppliers.map(supplier => (
                    <div key={supplier.id} className="bg-white rounded p-3 border">
                      <div className="font-medium text-gray-900">
                        {supplier.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {supplier.id}
                      </div>
                      {supplier.contact && (
                        <div className="text-xs text-gray-600 mt-1">
                          {supplier.contact.split('\n')[0]}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        Created: {new Date(supplier.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Dropdown Data */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Supplier Dropdown Test
            </h2>
            
            <div className="mb-4">
              <p className="text-xs text-gray-500">
                Using SupplierDropdown component - same as transaction pages
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Supplier from Dropdown
                </label>
                <SupplierDropdown
                  value={selectedSupplier}
                  onSupplierSelect={setSelectedSupplier}
                  placeholder="Click to see available suppliers..."
                  isDemoMode={true}
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
                    {selectedSupplier.contact && (
                      <div><strong>Contact:</strong> {selectedSupplier.contact.split('\n')[0]}</div>
                    )}
                    <div><strong>Created:</strong> {new Date(selectedSupplier.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <h3 className="font-medium text-blue-900 mb-2">
                  Test Instructions:
                </h3>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Click the dropdown above to see available suppliers</li>
                  <li>2. Compare with the list on the left - they should match</li>
                  <li>3. Add a new supplier using the form above</li>
                  <li>4. Refresh and verify the new supplier appears in both places</li>
                  <li>5. Select the new supplier from the dropdown to confirm it works</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Information */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Debug Information
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
                Current State
              </h3>
              <div className="bg-gray-50 rounded p-3 text-xs">
                <div><strong>Suppliers loaded:</strong> {suppliers.length}</div>
                <div><strong>Selected supplier:</strong> {selectedSupplier?.name || 'None'}</div>
                <div><strong>Refresh key:</strong> {refreshKey}</div>
                <div><strong>Show add form:</strong> {showAddForm ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <TouchButton
              variant="outline"
              onClick={() => {
                console.log('=== DEBUG INFO ===')
                console.log('Suppliers from searchDemoSuppliers:', suppliers)
                console.log('Selected supplier:', selectedSupplier)
                console.log('localStorage demo-suppliers:', localStorage.getItem('demo-suppliers'))
                console.log('Refresh key:', refreshKey)
              }}
            >
              Log Debug Info to Console
            </TouchButton>
          </div>
        </div>
      </div>
    </div>
  )
}