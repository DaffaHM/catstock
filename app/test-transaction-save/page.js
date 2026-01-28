'use client'

import { useState } from 'react'
import { createDemoTransaction } from '@/lib/utils/demo-transactions'
import TouchButton from '@/components/ui/TouchButton'

export default function TestTransactionSave() {
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const testSaveTransaction = () => {
    setIsLoading(true)
    setResult(null)

    try {
      // Create test transaction data
      const transactionData = {
        type: 'IN',
        transactionDate: new Date(),
        supplierId: 'demo-supp-1',
        notes: 'Test transaction from test page',
        items: [
          {
            productId: 'demo-prod-1',
            quantity: 5,
            unitCost: 20000,
            product: {
              id: 'demo-prod-1',
              name: 'Test Product',
              sku: 'TEST-001',
              brand: 'Test Brand'
            }
          }
        ]
      }

      // Call demo transaction creation
      const result = createDemoTransaction(transactionData)
      setResult(result)
      
    } catch (error) {
      setResult({ error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test Transaction Save
          </h1>
          <p className="text-gray-600">
            Testing demo transaction creation functionality
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <TouchButton
              variant="primary"
              onClick={testSaveTransaction}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Testing...' : 'Test Save Transaction'}
            </TouchButton>

            {result && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Result:</h3>
                <div className="bg-gray-50 rounded p-4">
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">localStorage Data:</h3>
              <div className="space-y-2">
                <TouchButton
                  variant="outline"
                  onClick={() => {
                    console.log('Demo transactions:', localStorage.getItem('demo-transactions'))
                    console.log('Demo products:', localStorage.getItem('demo-products'))
                    console.log('Demo suppliers:', localStorage.getItem('demo-suppliers'))
                  }}
                  className="w-full text-sm"
                >
                  Log localStorage Data
                </TouchButton>
                
                <TouchButton
                  variant="outline"
                  onClick={() => {
                    localStorage.removeItem('demo-transactions')
                    console.log('Cleared demo transactions')
                  }}
                  className="w-full text-sm text-red-600"
                >
                  Clear Demo Transactions
                </TouchButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}