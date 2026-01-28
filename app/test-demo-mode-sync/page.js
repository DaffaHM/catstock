'use client'

import { useState, useEffect } from 'react'
import { searchDemoSuppliers } from '@/lib/utils/demo-suppliers'
import SupplierDropdown from '@/components/ui/SupplierDropdown'
import TouchButton from '@/components/ui/TouchButton'

export default function TestDemoModeSync() {
  const [suppliers, setSuppliers] = useState([])
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [userInfo, setUserInfo] = useState(null)

  const loadData = () => {
    // Load suppliers using same method as SupplierListPage
    const result = searchDemoSuppliers('', {
      page: 1,
      limit: 100,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
    
    setSuppliers(result.suppliers)
    
    console.log('=== DEMO MODE SYNC TEST ===')
    console.log('Suppliers from searchDemoSuppliers:', result.suppliers)
    console.log('Total count:', result.suppliers.length)
  }

  const checkUserSession = async () => {
    try {
      const response = await fetch('/api/session-check')
      const data = await response.json()
      setUserInfo(data)
      console.log('User session info:', data)
    } catch (error) {
      console.error('Failed to check session:', error)
    }
  }

  useEffect(() => {
    loadData()
    checkUserSession()
  }, [refreshKey])

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    setSelectedSupplier(null)
  }

  const handleAddTestSupplier = () => {
    const testSupplier = {
      id: `test-supp-${Date.now()}`,
      name: `Test Supplier ${Date.now()}`,
      contact: 'Test contact info',
      notes: 'Added via sync test',
      transactionCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Save to localStorage
    const stored = localStorage.getItem('demo-suppliers')
    const existingSuppliers = stored ? JSON.parse(stored) : []
    existingSuppliers.push(testSupplier)
    localStorage.setItem('demo-suppliers', JSON.stringify(existingSuppliers))
    
    // Trigger refresh
    handleRefresh()
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('suppliersUpdated', { detail: testSupplier }))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Demo Mode Sync Test
          </h1>
          <p className="text-gray-600">
            Testing data synchronization between supplier page and stock-in dropdown
          </p>
          
          <div className="flex gap-2 mt-4">
            <TouchButton variant="outline" onClick={handleRefresh}>
              Refresh Data
            </TouchButton>
            <TouchButton variant="primary" onClick={handleAddTestSupplier}>
              Add Test Supplier
            </TouchButton>
          </div>
        </div>

        {/* User Session Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            User Session Info
          </h2>
          
          {userInfo ? (
            <div className="bg-gray-50 rounded p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Email:</strong> {userInfo.user?.email || 'Not available'}
                </div>
                <div>
                  <strong>Name:</strong> {userInfo.user?.name || 'Not available'}
                </div>
                <div>
                  <strong>Authenticated:</strong> {userInfo.isAuthenticated ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Should be Demo Mode:</strong> {
                    userInfo.user?.email === 'owner@catstock.com' || userInfo.user?.email === 'demo@catstock.com' 
                      ? 'Yes' : 'No'
                  }
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Loading session info...</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Supplier List (Management Page Method) */}
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
                Using searchDemoSuppliers() - same as SupplierListPage
              </div>
            </div>
            
            <div className="bg-gray-50 rounded p-4 max-h-80 overflow-y-auto">
              {suppliers.length === 0 ? (
                <p className="text-gray-500 text-sm">No suppliers found</p>
              ) : (
                <div className="space-y-2">
                  {suppliers.map((supplier, index) => (
                    <div key={supplier.id} className="bg-white rounded p-3 border">
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
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stock In Dropdown Test */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Stock In Supplier Dropdown
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier Dropdown (Auto-detect Demo Mode)
                </label>
                <SupplierDropdown
                  value={selectedSupplier}
                  onSupplierSelect={setSelectedSupplier}
                  placeholder="Click to see suppliers..."
                  isDemoMode={
                    userInfo?.user?.email === 'owner@catstock.com' || 
                    userInfo?.user?.email === 'demo@catstock.com'
                  }
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
                  </div>
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <h3 className="font-medium text-blue-900 mb-2">
                  Expected Behavior:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Both lists should show same suppliers</li>
                  <li>• Dropdown should show "isDemoMode: true"</li>
                  <li>• Adding supplier should update both</li>
                  <li>• Data should be synchronized</li>
                </ul>
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
                localStorage Data
              </h3>
              <div className="bg-gray-50 rounded p-3 text-xs">
                <div><strong>demo-suppliers:</strong> {localStorage.getItem('demo-suppliers') ? 'exists' : 'empty'}</div>
                <div><strong>deleted-demo-suppliers:</strong> {localStorage.getItem('deleted-demo-suppliers') || 'empty'}</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <TouchButton
                  variant="outline"
                  onClick={() => {
                    console.log('=== MANUAL DEBUG ===')
                    console.log('Suppliers from state:', suppliers)
                    console.log('User info:', userInfo)
                    console.log('localStorage demo-suppliers:', localStorage.getItem('demo-suppliers'))
                    console.log('localStorage deleted-demo-suppliers:', localStorage.getItem('deleted-demo-suppliers'))
                  }}
                  className="w-full text-xs"
                >
                  Log Debug Info
                </TouchButton>
                
                <TouchButton
                  variant="outline"
                  onClick={() => {
                    localStorage.removeItem('demo-suppliers')
                    localStorage.removeItem('deleted-demo-suppliers')
                    handleRefresh()
                  }}
                  className="w-full text-xs text-red-600"
                >
                  Reset All Data
                </TouchButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}