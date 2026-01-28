'use client'

import { useState } from 'react'
import { UploadIcon, DownloadIcon, SaveIcon, XIcon } from 'lucide-react'
import { formatRupiah } from '@/lib/utils/currency'
import TouchButton from '@/components/ui/TouchButton'
import TouchInput from '@/components/ui/TouchInput'

export default function BulkPriceUpdate({ products = [], onClose, onSuccess }) {
  const [updates, setUpdates] = useState([])
  const [reason, setReason] = useState('Bulk price update')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [csvData, setCsvData] = useState('')

  // Initialize updates from products
  useState(() => {
    if (products.length > 0) {
      setUpdates(products.map(product => ({
        productId: product.id,
        productName: product.name,
        currentPurchasePrice: product.purchasePrice || 0,
        currentSellingPrice: product.sellingPrice || 0,
        newPurchasePrice: product.purchasePrice || 0,
        newSellingPrice: product.sellingPrice || 0
      })))
    }
  }, [products])

  const handleUpdateChange = (index, field, value) => {
    const newUpdates = [...updates]
    newUpdates[index][field] = parseFloat(value) || 0
    setUpdates(newUpdates)
  }

  const handleBulkPercentageChange = (percentage, field) => {
    const percent = parseFloat(percentage) || 0
    const newUpdates = updates.map(update => ({
      ...update,
      [field]: Math.round(update[field === 'newPurchasePrice' ? 'currentPurchasePrice' : 'currentSellingPrice'] * (1 + percent / 100) * 100) / 100
    }))
    setUpdates(newUpdates)
  }

  const handleCsvImport = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const csv = e.target.result
      setCsvData(csv)
      
      try {
        const lines = csv.split('\n').filter(line => line.trim())
        const headers = lines[0].split(',').map(h => h.trim())
        
        const csvUpdates = []
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim())
          const update = {}
          
          headers.forEach((header, index) => {
            if (header.toLowerCase().includes('id')) {
              update.productId = values[index]
            } else if (header.toLowerCase().includes('name')) {
              update.productName = values[index]
            } else if (header.toLowerCase().includes('purchase')) {
              update.newPurchasePrice = parseFloat(values[index]) || 0
            } else if (header.toLowerCase().includes('selling')) {
              update.newSellingPrice = parseFloat(values[index]) || 0
            }
          })
          
          if (update.productId) {
            csvUpdates.push(update)
          }
        }
        
        setUpdates(csvUpdates)
      } catch (err) {
        setError('Failed to parse CSV file')
      }
    }
    reader.readAsText(file)
  }

  const handleExportCsv = () => {
    const headers = ['Product ID', 'Product Name', 'Current Purchase Price', 'Current Selling Price', 'New Purchase Price', 'New Selling Price']
    const csvContent = [
      headers.join(','),
      ...updates.map(update => [
        update.productId,
        `"${update.productName}"`,
        update.currentPurchasePrice,
        update.currentSellingPrice,
        update.newPurchasePrice,
        update.newSellingPrice
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bulk-price-update-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleSubmit = async () => {
    if (updates.length === 0) {
      setError('No updates to process')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/price-history/bulk-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          updates: updates.map(update => ({
            productId: update.productId,
            purchasePrice: update.newPurchasePrice,
            sellingPrice: update.newSellingPrice
          })),
          reason
        })
      })

      const data = await response.json()

      if (data.success) {
        onSuccess?.(data)
      } else {
        setError(data.error || 'Failed to update prices')
      }
    } catch (err) {
      setError('Failed to update prices')
    } finally {
      setLoading(false)
    }
  }

  const hasChanges = updates.some(update => 
    update.newPurchasePrice !== update.currentPurchasePrice ||
    update.newSellingPrice !== update.currentSellingPrice
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bulk Price Update</h2>
            <p className="text-gray-600 mt-1">Update prices for multiple products</p>
          </div>
          <TouchButton
            variant="ghost"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XIcon className="h-6 w-6" />
          </TouchButton>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <TouchInput
              label="Update Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Quarterly price adjustment"
              className="flex-1 mr-4"
            />
            
            <div className="flex space-x-2">
              <TouchButton
                variant="outline"
                onClick={handleExportCsv}
                className="flex items-center"
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export CSV
              </TouchButton>
              
              <label className="cursor-pointer">
                <TouchButton
                  variant="outline"
                  as="span"
                  className="flex items-center"
                >
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Import CSV
                </TouchButton>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Bulk adjustment controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Bulk Purchase Price Adjustment (%)
              </label>
              <div className="flex space-x-2">
                <TouchButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkPercentageChange(5, 'newPurchasePrice')}
                >
                  +5%
                </TouchButton>
                <TouchButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkPercentageChange(10, 'newPurchasePrice')}
                >
                  +10%
                </TouchButton>
                <TouchButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkPercentageChange(-5, 'newPurchasePrice')}
                >
                  -5%
                </TouchButton>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Bulk Selling Price Adjustment (%)
              </label>
              <div className="flex space-x-2">
                <TouchButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkPercentageChange(5, 'newSellingPrice')}
                >
                  +5%
                </TouchButton>
                <TouchButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkPercentageChange(10, 'newSellingPrice')}
                >
                  +10%
                </TouchButton>
                <TouchButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkPercentageChange(-5, 'newSellingPrice')}
                >
                  -5%
                </TouchButton>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Updates Table */}
        <div className="flex-1 overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Purchase
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  New Purchase
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Selling
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  New Selling
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {updates.map((update, index) => {
                const purchaseChange = update.newPurchasePrice - update.currentPurchasePrice
                const sellingChange = update.newSellingPrice - update.currentSellingPrice
                
                return (
                  <tr key={update.productId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{update.productName}</div>
                      <div className="text-sm text-gray-500">{update.productId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatRupiah(update.currentPurchasePrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={update.newPurchasePrice}
                        onChange={(e) => handleUpdateChange(index, 'newPurchasePrice', e.target.value)}
                        className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatRupiah(update.currentSellingPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={update.newSellingPrice}
                        onChange={(e) => handleUpdateChange(index, 'newSellingPrice', e.target.value)}
                        className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className={purchaseChange !== 0 ? (purchaseChange > 0 ? 'text-red-600' : 'text-green-600') : 'text-gray-500'}>
                        Purchase: {purchaseChange >= 0 ? '+' : ''}${purchaseChange.toFixed(2)}
                      </div>
                      <div className={sellingChange !== 0 ? (sellingChange > 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-500'}>
                        Selling: {sellingChange >= 0 ? '+' : ''}${sellingChange.toFixed(2)}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {updates.length} products • {updates.filter(u => 
              u.newPurchasePrice !== u.currentPurchasePrice || 
              u.newSellingPrice !== u.currentSellingPrice
            ).length} with changes
          </div>
          
          <div className="flex space-x-4">
            <TouchButton
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </TouchButton>
            
            <TouchButton
              variant="primary"
              onClick={handleSubmit}
              disabled={!hasChanges || loading}
              className="flex items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <SaveIcon className="h-4 w-4 mr-2" />
              )}
              Update Prices
            </TouchButton>
          </div>
        </div>
      </div>
    </div>
  )
}