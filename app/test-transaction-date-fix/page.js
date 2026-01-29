'use client'

import { useState, useEffect } from 'react'
import SimpleNavLayout from '@/components/layout/SimpleNavLayout'
import DatePicker from '@/components/ui/DatePicker'
import TouchButton from '@/components/ui/TouchButton'
import { createDemoTransaction } from '@/lib/utils/demo-transactions'
import { getDemoProducts } from '@/lib/utils/demo-products'

export default function TestTransactionDateFixPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [testResults, setTestResults] = useState([])
  const [products, setProducts] = useState([])

  useEffect(() => {
    // Load demo products for testing
    const demoProducts = getDemoProducts()
    setProducts(demoProducts)
  }, [])

  const testDateSelection = (testDate) => {
    const result = {
      testName: `Test Date: ${testDate.toLocaleDateString('id-ID')}`,
      selectedDate: testDate,
      formattedDate: testDate.toLocaleDateString('id-ID', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      isoString: testDate.toISOString(),
      localDateString: testDate.toDateString(),
      success: true
    }

    setTestResults(prev => [...prev, result])
  }

  const testTransactionCreation = async () => {
    if (products.length === 0) {
      alert('No products available for testing')
      return
    }

    const testProduct = products[0]
    
    const transactionData = {
      type: 'OUT',
      transactionDate: selectedDate,
      notes: `Test transaction for date: ${selectedDate.toLocaleDateString('id-ID')}`,
      items: [{
        productId: testProduct.id,
        quantity: 1,
        unitPrice: testProduct.sellingPrice || 10000,
        product: testProduct
      }]
    }

    const result = createDemoTransaction(transactionData)
    
    if (result.success) {
      const savedTransaction = result.data
      const savedDate = new Date(savedTransaction.transactionDate)
      
      const testResult = {
        testName: 'Transaction Creation Test',
        selectedDate: selectedDate,
        savedDate: savedDate,
        selectedDateString: selectedDate.toLocaleDateString('id-ID'),
        savedDateString: savedDate.toLocaleDateString('id-ID'),
        datesMatch: selectedDate.toDateString() === savedDate.toDateString(),
        transactionId: savedTransaction.id,
        referenceNumber: savedTransaction.referenceNumber,
        success: true
      }
      
      setTestResults(prev => [...prev, testResult])
    } else {
      setTestResults(prev => [...prev, {
        testName: 'Transaction Creation Test',
        error: result.error,
        success: false
      }])
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  const testSpecificDates = () => {
    // Test specific dates that were problematic
    const testDates = [
      new Date(2026, 0, 27), // January 27, 2026
      new Date(2026, 0, 28), // January 28, 2026  
      new Date(2026, 0, 29), // January 29, 2026
    ]

    testDates.forEach(date => {
      testDateSelection(date)
    })
  }

  return (
    <SimpleNavLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Test: Transaction Date Fix
            </h1>
            <p className="text-gray-600">
              Testing timezone fixes for transaction date handling. 
              When you select January 28, it should save as January 28 (not January 27).
            </p>
          </div>

          {/* Date Selection Test */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Date Selection Test
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <DatePicker
                  label="Select Transaction Date"
                  value={selectedDate}
                  onChange={setSelectedDate}
                  max={new Date()}
                />
                
                <div className="mt-4 space-y-2">
                  <TouchButton
                    variant="primary"
                    onClick={() => testDateSelection(selectedDate)}
                    className="w-full"
                  >
                    Test Date Selection
                  </TouchButton>
                  
                  <TouchButton
                    variant="outline"
                    onClick={testTransactionCreation}
                    className="w-full"
                  >
                    Test Transaction Creation
                  </TouchButton>
                  
                  <TouchButton
                    variant="outline"
                    onClick={testSpecificDates}
                    className="w-full"
                  >
                    Test Problematic Dates (27, 28, 29 Jan)
                  </TouchButton>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Current Selection:</h3>
                <div className="space-y-1 text-sm">
                  <div><strong>Display:</strong> {selectedDate.toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</div>
                  <div><strong>ISO String:</strong> {selectedDate.toISOString()}</div>
                  <div><strong>Local Date:</strong> {selectedDate.toDateString()}</div>
                  <div><strong>Day of Week:</strong> {selectedDate.toLocaleDateString('id-ID', { weekday: 'long' })}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Test Results
              </h2>
              <TouchButton
                variant="outline"
                onClick={clearResults}
                disabled={testResults.length === 0}
              >
                Clear Results
              </TouchButton>
            </div>
            
            {testResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No test results yet. Run some tests above.
              </div>
            ) : (
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={`border rounded-lg p-4 ${
                      result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {result.testName}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        result.success 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.success ? '✅ PASS' : '❌ FAIL'}
                      </span>
                    </div>
                    
                    {result.error ? (
                      <div className="text-red-700 text-sm">
                        <strong>Error:</strong> {result.error}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {result.selectedDate && (
                          <div>
                            <strong>Selected Date:</strong><br />
                            {result.selectedDateString || result.formattedDate}
                          </div>
                        )}
                        
                        {result.savedDate && (
                          <div>
                            <strong>Saved Date:</strong><br />
                            {result.savedDateString}
                          </div>
                        )}
                        
                        {result.datesMatch !== undefined && (
                          <div className="md:col-span-2">
                            <strong>Dates Match:</strong> 
                            <span className={result.datesMatch ? 'text-green-600' : 'text-red-600'}>
                              {result.datesMatch ? ' ✅ YES' : ' ❌ NO'}
                            </span>
                          </div>
                        )}
                        
                        {result.referenceNumber && (
                          <div>
                            <strong>Reference:</strong> {result.referenceNumber}
                          </div>
                        )}
                        
                        {result.isoString && (
                          <div className="md:col-span-2 text-xs text-gray-600">
                            <strong>ISO:</strong> {result.isoString}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expected Behavior */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              Expected Behavior
            </h2>
            <div className="space-y-2 text-blue-800">
              <div>✅ When you select January 28, 2026 → Transaction should be saved with January 28, 2026</div>
              <div>✅ When you select January 29, 2026 → Transaction should be saved with January 29, 2026</div>
              <div>✅ No timezone conversion should shift the date to the previous day</div>
              <div>✅ Indonesian date formatting should work correctly</div>
              <div>✅ Date picker should show the correct selected date</div>
            </div>
          </div>

          {/* Current System Date */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              System Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Current System Date:</strong><br />
                {new Date().toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div>
                <strong>Timezone:</strong><br />
                {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </div>
              <div>
                <strong>Available Products:</strong><br />
                {products.length} products loaded for testing
              </div>
              <div>
                <strong>Test Status:</strong><br />
                {testResults.length} tests completed
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimpleNavLayout>
  )
}