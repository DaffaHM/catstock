'use client'

import { useState, useEffect } from 'react'
import { getDemoProducts, saveDemoProduct } from '@/lib/utils/demo-products'
import { getDemoSuppliers, saveDemoSupplier } from '@/lib/utils/demo-suppliers'
import { createDemoTransaction, getDemoTransactions } from '@/lib/utils/demo-transactions'
import { formatRupiah } from '@/lib/utils/currency'
import TouchButton from '@/components/ui/TouchButton'

export default function TestStockOutFix() {
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [testLog, setTestLog] = useState([])
  const [isRunning, setIsRunning] = useState(false)

  const addLog = (message, type = 'info') => {
    const logEntry = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleString('id-ID')
    }
    setTestLog(prev => [logEntry, ...prev])
    console.log(`[${type.toUpperCase()}] ${message}`)
  }

  const loadData = () => {
    const productsData = getDemoProducts()
    const suppliersData = getDemoSuppliers()
    const transactionsData = getDemoTransactions()
    
    setProducts(productsData)
    setSuppliers(suppliersData)
    setTransactions(transactionsData.transactions)
    
    addLog(`Data loaded: ${productsData.length} products, ${suppliersData.length} suppliers, ${transactionsData.transactions.length} transactions`)
  }

  useEffect(() => {
    loadData()
    
    // Listen for data changes
    const handleDataUpdate = () => {
      addLog('Data updated, reloading...')
      loadData()
    }

    window.addEventListener('suppliersUpdated', handleDataUpdate)
    window.addEventListener('productsUpdated', handleDataUpdate)
    window.addEventListener('transactionsUpdated', handleDataUpdate)

    return () => {
      window.removeEventListener('suppliersUpdated', handleDataUpdate)
      window.removeEventListener('productsUpdated', handleDataUpdate)
      window.removeEventListener('transactionsUpdated', handleDataUpdate)
    }
  }, [])

  const runStockOutTest = async () => {
    setIsRunning(true)
    setTestLog([])
    
    try {
      addLog('Starting Stock Out Test...', 'info')
      
      // Step 1: Create test supplier
      const testSupplier = {
        id: `test-stock-supp-${Date.now()}`,
        name: 'Test Stock Supplier',
        contact: 'Test contact',
        notes: 'Test supplier for stock out',
        transactionCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      addLog('Creating test supplier...', 'info')
      saveDemoSupplier(testSupplier)
      window.dispatchEvent(new CustomEvent('suppliersUpdated', { detail: testSupplier }))
      
      // Step 2: Create test product with initial stock
      const testProduct = {
        id: `test-stock-prod-${Date.now()}`,
        sku: `TST-${Date.now()}`,
        brand: 'Test Brand',
        name: 'Test Stock Product',
        category: 'Test',
        size: '1',
        unit: 'Unit',
        purchasePrice: 10000,
        sellingPrice: 15000,
        minimumStock: 5,
        currentStock: 0, // Start with 0 stock
        transactionCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      addLog('Creating test product with 0 stock...', 'info')
      saveDemoProduct(testProduct)
      window.dispatchEvent(new CustomEvent('productsUpdated', { detail: testProduct }))
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Step 3: Add stock via Stock IN transaction
      const stockInData = {
        type: 'IN',
        transactionDate: new Date(),
        supplierId: testSupplier.id,
        notes: 'Test stock in for stock out test',
        items: [
          {
            productId: testProduct.id,
            quantity: 20,
            unitCost: 10000,
            product: {
              id: testProduct.id,
              name: testProduct.name,
              sku: testProduct.sku,
              brand: testProduct.brand
            }
          }
        ]
      }
      
      addLog('Creating Stock IN transaction (20 units)...', 'info')
      const stockInResult = createDemoTransaction(stockInData)
      
      if (stockInResult.success) {
        addLog('✅ Stock IN transaction created successfully', 'success')
      } else {
        addLog('❌ Stock IN transaction failed', 'error')
        return
      }
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Step 4: Check product stock after Stock IN
      const updatedProducts = getDemoProducts()
      const productAfterStockIn = updatedProducts.find(p => p.id === testProduct.id)
      
      if (productAfterStockIn && productAfterStockIn.currentStock === 20) {
        addLog('✅ Product stock updated correctly after Stock IN: 20 units', 'success')
      } else {
        addLog(`❌ Product stock not updated correctly. Expected: 20, Got: ${productAfterStockIn?.currentStock}`, 'error')
        return
      }
      
      // Step 5: Try Stock OUT transaction (should work now)
      const stockOutData = {
        type: 'OUT',
        transactionDate: new Date(),
        supplierId: testSupplier.id,
        notes: 'Test stock out transaction',
        items: [
          {
            productId: testProduct.id,
            quantity: 8,
            unitPrice: 15000,
            product: {
              id: testProduct.id,
              name: testProduct.name,
              sku: testProduct.sku,
              brand: testProduct.brand
            }
          }
        ]
      }
      
      addLog('Creating Stock OUT transaction (8 units)...', 'info')
      const stockOutResult = createDemoTransaction(stockOutData)
      
      if (stockOutResult.success) {
        addLog('✅ Stock OUT transaction created successfully', 'success')
      } else {
        addLog('❌ Stock OUT transaction failed', 'error')
        return
      }
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Step 6: Check final stock
      const finalProducts = getDemoProducts()
      const finalProduct = finalProducts.find(p => p.id === testProduct.id)
      
      if (finalProduct && finalProduct.currentStock === 12) { // 20 - 8 = 12
        addLog('✅ Product stock updated correctly after Stock OUT: 12 units', 'success')
      } else {
        addLog(`❌ Product stock not updated correctly after Stock OUT. Expected: 12, Got: ${finalProduct?.currentStock}`, 'error')
      }
      
      // Step 7: Try Stock OUT with insufficient stock (should fail)
      const insufficientStockOutData = {
        type: 'OUT',
        transactionDate: new Date(),
        supplierId: testSupplier.id,
        notes: 'Test insufficient stock out',
        items: [
          {
            productId: testProduct.id,
            quantity: 15, // More than available (12)
            unitPrice: 15000,
            product: {
              id: testProduct.id,
              name: testProduct.name,
              sku: testProduct.sku,
              brand: testProduct.brand
            }
          }
        ]
      }
      
      addLog('Testing Stock OUT with insufficient stock (15 units when only 12 available)...', 'info')
      const insufficientResult = createDemoTransaction(insufficientStockOutData)
      
      if (!insufficientResult.success) {
        addLog('✅ Stock OUT correctly rejected for insufficient stock', 'success')
      } else {
        addLog('❌ Stock OUT should have been rejected for insufficient stock', 'error')
      }
      
      addLog('Stock Out Test completed!', 'success')
      
    } catch (error) {
      addLog(`Test error: ${error.message}`, 'error')
    } finally {
      setIsRunning(false)
      loadData()
    }
  }

  const resetData = () => {
    localStorage.removeItem('demo-suppliers')
    localStorage.removeItem('demo-products')
    localStorage.removeItem('demo-transactions')
    localStorage.removeItem('deleted-demo-suppliers')
    localStorage.removeItem('deleted-demo-products')
    setTestLog([])
    loadData()
    addLog('All data reset to defaults', 'info')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Stock Out Fix Test
          </h1>
          <p className="text-gray-600">
            Testing stock out functionality with proper stock validation
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TouchButton
              variant="primary"
              onClick={runStockOutTest}
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? 'Running Test...' : 'Run Stock Out Test'}
            </TouchButton>
            <TouchButton
              variant="outline"
              onClick={loadData}
              className="w-full"
            >
              Refresh Data
            </TouchButton>
            <TouchButton
              variant="outline"
              onClick={resetData}
              className="w-full text-red-600"
            >
              Reset Data
            </TouchButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Log */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Test Log ({testLog.length})
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testLog.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No test logs yet</p>
              ) : (
                testLog.map((log) => (
                  <div 
                    key={log.id} 
                    className={`p-3 rounded text-sm ${
                      log.type === 'success' 
                        ? 'bg-green-50 text-green-800' 
                        : log.type === 'error'
                        ? 'bg-red-50 text-red-800'
                        : 'bg-blue-50 text-blue-800'
                    }`}
                  >
                    <div className="font-medium">{log.message}</div>
                    <div className="text-xs opacity-75 mt-1">{log.timestamp}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Current Data State */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Current Data State
            </h2>
            
            {/* Products */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">
                Products ({products.length})
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {products.length === 0 ? (
                  <p className="text-gray-500 text-sm">No products</p>
                ) : (
                  products.slice(0, 5).map((product) => (
                    <div key={product.id} className="bg-gray-50 rounded p-2 text-sm">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-gray-600">
                        Stock: {product.currentStock} | Min: {product.minimumStock}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Suppliers */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">
                Suppliers ({suppliers.length})
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {suppliers.length === 0 ? (
                  <p className="text-gray-500 text-sm">No suppliers</p>
                ) : (
                  suppliers.slice(0, 5).map((supplier) => (
                    <div key={supplier.id} className="bg-gray-50 rounded p-2 text-sm">
                      <div className="font-medium">{supplier.name}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Transactions */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Recent Transactions ({transactions.length})
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {transactions.length === 0 ? (
                  <p className="text-gray-500 text-sm">No transactions</p>
                ) : (
                  transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="bg-gray-50 rounded p-2 text-sm">
                      <div className="font-medium">{transaction.referenceNumber}</div>
                      <div className="text-gray-600">
                        {transaction.type} | {formatRupiah(transaction.totalValue)} | {transaction.items.length} items
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Test Navigation
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <TouchButton
              variant="outline"
              onClick={() => window.location.href = '/transactions/stock-in'}
              className="w-full text-sm"
            >
              Stock In Page
            </TouchButton>
            <TouchButton
              variant="outline"
              onClick={() => window.location.href = '/transactions/stock-out'}
              className="w-full text-sm"
            >
              Stock Out Page
            </TouchButton>
            <TouchButton
              variant="outline"
              onClick={() => window.location.href = '/products'}
              className="w-full text-sm"
            >
              Products Page
            </TouchButton>
            <TouchButton
              variant="outline"
              onClick={() => window.location.href = '/dashboard'}
              className="w-full text-sm"
            >
              Dashboard
            </TouchButton>
          </div>
        </div>
      </div>
    </div>
  )
}