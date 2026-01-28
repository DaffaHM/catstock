'use client'

import { useState, useEffect } from 'react'
import { searchDemoSuppliers, getDemoSuppliers } from '@/lib/utils/demo-suppliers'
import TouchButton from '@/components/ui/TouchButton'

export default function DebugSuppliers() {
  const [debugInfo, setDebugInfo] = useState({})

  const runDebug = () => {
    console.log('=== DEBUGGING SUPPLIERS ===')
    
    // Get raw localStorage data
    const rawStorage = localStorage.getItem('demo-suppliers')
    console.log('Raw localStorage:', rawStorage)
    
    // Get suppliers using getDemoSuppliers
    const allSuppliers = getDemoSuppliers()
    console.log('getDemoSuppliers result:', allSuppliers)
    
    // Get suppliers using searchDemoSuppliers with different limits
    const search20 = searchDemoSuppliers('', { page: 1, limit: 20 })
    console.log('searchDemoSuppliers (limit 20):', search20)
    
    const search100 = searchDemoSuppliers('', { page: 1, limit: 100 })
    console.log('searchDemoSuppliers (limit 100):', search100)
    
    const searchAll = searchDemoSuppliers('', { page: 1, limit: 1000 })
    console.log('searchDemoSuppliers (limit 1000):', searchAll)
    
    setDebugInfo({
      rawStorage: rawStorage ? JSON.parse(rawStorage) : null,
      allSuppliers,
      search20: search20.suppliers,
      search100: search100.suppliers,
      searchAll: searchAll.suppliers,
      search20Count: search20.suppliers.length,
      search100Count: search100.suppliers.length,
      searchAllCount: searchAll.suppliers.length
    })
  }

  useEffect(() => {
    runDebug()
  }, [])

  const clearStorage = () => {
    localStorage.removeItem('demo-suppliers')
    runDebug()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Debug Suppliers Data
        </h1>
        
        <div className="flex gap-2 mb-6">
          <TouchButton variant="primary" onClick={runDebug}>
            Run Debug
          </TouchButton>
          <TouchButton variant="outline" onClick={clearStorage} className="text-red-600">
            Clear Storage
          </TouchButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Raw Data</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700">localStorage Content:</h3>
                <pre className="bg-gray-50 rounded p-3 text-xs overflow-x-auto">
                  {JSON.stringify(debugInfo.rawStorage, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">getDemoSuppliers() - {debugInfo.allSuppliers?.length || 0} suppliers:</h3>
                <div className="bg-gray-50 rounded p-3 max-h-40 overflow-y-auto">
                  {debugInfo.allSuppliers?.map(supplier => (
                    <div key={supplier.id} className="text-sm mb-1">
                      {supplier.name} (ID: {supplier.id})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Search Results</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700">searchDemoSuppliers (limit 20) - {debugInfo.search20Count || 0} suppliers:</h3>
                <div className="bg-gray-50 rounded p-3 max-h-32 overflow-y-auto">
                  {debugInfo.search20?.map(supplier => (
                    <div key={supplier.id} className="text-sm mb-1">
                      {supplier.name} (ID: {supplier.id})
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">searchDemoSuppliers (limit 100) - {debugInfo.search100Count || 0} suppliers:</h3>
                <div className="bg-gray-50 rounded p-3 max-h-32 overflow-y-auto">
                  {debugInfo.search100?.map(supplier => (
                    <div key={supplier.id} className="text-sm mb-1">
                      {supplier.name} (ID: {supplier.id})
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">searchDemoSuppliers (limit 1000) - {debugInfo.searchAllCount || 0} suppliers:</h3>
                <div className="bg-gray-50 rounded p-3 max-h-32 overflow-y-auto">
                  {debugInfo.searchAll?.map(supplier => (
                    <div key={supplier.id} className="text-sm mb-1">
                      {supplier.name} (ID: {supplier.id})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Analysis</h2>
          
          <div className="space-y-2 text-sm">
            <div>
              <strong>Expected:</strong> All methods should return the same suppliers
            </div>
            <div>
              <strong>Base suppliers:</strong> 2 (PT Supplier A, PT Supplier B)
            </div>
            <div>
              <strong>localStorage suppliers:</strong> {debugInfo.rawStorage?.length || 0}
            </div>
            <div>
              <strong>Total expected:</strong> 2 + {debugInfo.rawStorage?.length || 0} = {2 + (debugInfo.rawStorage?.length || 0)}
            </div>
            <div className={`font-medium ${
              debugInfo.search20Count === debugInfo.searchAllCount ? 'text-green-600' : 'text-red-600'
            }`}>
              <strong>Status:</strong> {
                debugInfo.search20Count === debugInfo.searchAllCount 
                  ? '✅ All methods return same count' 
                  : '❌ Different counts detected'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}