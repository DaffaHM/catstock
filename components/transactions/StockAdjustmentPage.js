'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import SplitView from '@/components/layout/SplitView'
import TransactionCart from '@/components/ui/TransactionCart'
import ProductDropdown from '@/components/ui/ProductDropdown'
import DatePicker from '@/components/ui/DatePicker'
import TouchButton from '@/components/ui/TouchButton'
import TouchInput from '@/components/ui/TouchInput'
import QuantityStepper from '@/components/ui/QuantityStepper'
import { 
  PlusIcon, 
  SlidersIcon as AdjustmentsHorizontalIcon, 
  CalendarIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ScaleIcon,
  ClipboardIcon as ClipboardDocumentListIcon,
  TrashIcon,
  MinusIcon
} from 'lucide-react'
import { createTransaction } from '@/lib/actions/transactions'
import { TransactionType } from '@/lib/validations/transaction'
import { StockCalculationEngine } from '@/lib/engines/stock-calculation'

export default function StockAdjustmentPage({ isDemoMode = false }) {
  const router = useRouter()
  
  // Form state
  const [transactionDate, setTransactionDate] = useState(new Date())
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState([])
  
  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState(null)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [adjustmentCalculations, setAdjustmentCalculations] = useState({})
  
  // Temporary item state for adding products
  const [tempProduct, setTempProduct] = useState(null)
  const [tempActualStock, setTempActualStock] = useState('')
  const [tempAdjustmentInfo, setTempAdjustmentInfo] = useState(null)

  // Clear success message after delay
  const clearSuccessMessage = useCallback(() => {
    if (successMessage) {
      setTimeout(() => setSuccessMessage(null), 5000)
    }
  }, [successMessage])

  // Calculate adjustment for a product
  const calculateAdjustment = async (productId, actualStock) => {
    try {
      const adjustment = await StockCalculationEngine.calculateStockAdjustment(productId, actualStock)
      
      setAdjustmentCalculations(prev => ({
        ...prev,
        [productId]: adjustment
      }))
      
      return adjustment
    } catch (error) {
      console.error('Adjustment calculation error:', error)
      return null
    }
  }

  // Handle product selection for adding
  const handleProductSelect = async (product) => {
    setTempProduct(product)
    setTempActualStock('')
    setTempAdjustmentInfo(null)
    setShowAddProduct(true)
    
    // Get current stock for display
    try {
      const currentStock = await StockCalculationEngine.getCurrentStock(product.id)
      setTempAdjustmentInfo({
        currentStock,
        actualStock: null,
        difference: 0,
        adjustmentType: 'NO_CHANGE'
      })
    } catch (error) {
      console.error('Error getting current stock:', error)
    }
  }

  // Handle actual stock input change
  const handleActualStockChange = async (value) => {
    setTempActualStock(value)
    
    if (tempProduct && value !== '' && !isNaN(value)) {
      const actualStock = parseInt(value, 10)
      const adjustment = await calculateAdjustment(tempProduct.id, actualStock)
      
      if (adjustment) {
        setTempAdjustmentInfo(adjustment)
      }
    } else {
      setTempAdjustmentInfo(prev => prev ? {
        ...prev,
        actualStock: null,
        difference: 0,
        adjustmentType: 'NO_CHANGE'
      } : null)
    }
  }

  // Add product adjustment to cart
  const handleAddProduct = () => {
    if (!tempProduct || !tempAdjustmentInfo || tempActualStock === '') {
      setErrors(prev => ({ ...prev, actualStock: 'Actual stock quantity is required' }))
      return
    }

    const actualStock = parseInt(tempActualStock, 10)
    
    if (isNaN(actualStock) || actualStock < 0) {
      setErrors(prev => ({ ...prev, actualStock: 'Actual stock must be a valid non-negative number' }))
      return
    }

    // Skip if no adjustment needed
    if (tempAdjustmentInfo.difference === 0) {
      setErrors(prev => ({ ...prev, actualStock: 'No adjustment needed - actual stock matches current stock' }))
      return
    }

    // Check if product already exists in cart
    const existingItemIndex = items.findIndex(item => item.productId === tempProduct.id)
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...items]
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: tempAdjustmentInfo.difference, // This is the adjustment amount (can be negative)
        actualStock: actualStock,
        currentStock: tempAdjustmentInfo.currentStock,
        adjustmentType: tempAdjustmentInfo.adjustmentType
      }
      setItems(updatedItems)
    } else {
      // Add new item
      const newItem = {
        id: `temp_${Date.now()}`,
        productId: tempProduct.id,
        product: tempProduct,
        quantity: tempAdjustmentInfo.difference, // This is the adjustment amount (can be negative)
        actualStock: actualStock,
        currentStock: tempAdjustmentInfo.currentStock,
        adjustmentType: tempAdjustmentInfo.adjustmentType
      }
      setItems(prev => [...prev, newItem])
    }

    // Reset temp state
    setTempProduct(null)
    setTempActualStock('')
    setTempAdjustmentInfo(null)
    setShowAddProduct(false)
    setErrors(prev => ({ ...prev, actualStock: null }))
  }

  // Cancel adding product
  const handleCancelAdd = () => {
    setTempProduct(null)
    setTempActualStock('')
    setTempAdjustmentInfo(null)
    setShowAddProduct(false)
    setErrors(prev => ({ ...prev, actualStock: null }))
  }

  // Update item in cart
  const handleUpdateItem = async (itemId, updates) => {
    const updatedItems = items.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    )
    
    // If actual stock was updated, recalculate adjustment
    if (updates.actualStock !== undefined) {
      const item = updatedItems.find(i => i.id === itemId)
      if (item) {
        const adjustment = await calculateAdjustment(item.productId, updates.actualStock)
        if (adjustment) {
          item.quantity = adjustment.difference
          item.adjustmentType = adjustment.adjustmentType
        }
      }
    }
    
    setItems(updatedItems)
  }

  // Remove item from cart
  const handleRemoveItem = (itemId) => {
    setItems(prev => prev.filter(item => item.id !== itemId))
    
    // Clear adjustment calculation for removed item
    const removedItem = items.find(item => item.id === itemId)
    if (removedItem) {
      setAdjustmentCalculations(prev => {
        const updated = { ...prev }
        delete updated[removedItem.productId]
        return updated
      })
    }
  }

  // Clear all items
  const handleClearItems = () => {
    setItems([])
    setAdjustmentCalculations({})
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}
    
    if (!transactionDate) {
      newErrors.transactionDate = 'Transaction date is required'
    }
    
    if (items.length === 0) {
      newErrors.items = 'At least one product adjustment is required'
    }
    
    // Validate each item
    items.forEach((item, index) => {
      if (typeof item.quantity !== 'number') {
        newErrors[`item_${index}_quantity`] = 'Invalid adjustment quantity'
      }
      if (typeof item.actualStock !== 'number' || item.actualStock < 0) {
        newErrors[`item_${index}_actualStock`] = 'Actual stock must be a valid non-negative number'
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Save transaction
  const handleSaveTransaction = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const transactionData = {
        type: TransactionType.ADJUST,
        transactionDate,
        notes: notes.trim() || null,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity // This is the adjustment amount (can be negative)
        }))
      }

      const result = await createTransaction(transactionData)

      if (result.success) {
        setSuccessMessage(`Stock adjustment transaction created successfully! Reference: ${result.data.referenceNumber}`)
        
        // Reset form
        setTransactionDate(new Date())
        setNotes('')
        setItems([])
        setAdjustmentCalculations({})
        
        clearSuccessMessage()
        
        // Optionally redirect after a delay
        setTimeout(() => {
          router.push('/transactions')
        }, 2000)
      } else {
        setErrors({ general: result.error || 'Failed to create adjustment transaction' })
      }
    } catch (error) {
      console.error('Transaction save error:', error)
      setErrors({ general: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  // Get excluded product IDs (products already in cart)
  const excludeProductIds = items.map(item => item.productId)

  // Prepare validation errors for cart
  const cartValidationErrors = []
  if (errors.items) cartValidationErrors.push(errors.items)
  if (errors.general) cartValidationErrors.push(errors.general)

  // Calculate adjustment summary
  const adjustmentSummary = items.reduce((acc, item) => {
    if (item.adjustmentType === 'INCREASE') {
      acc.increases += 1
      acc.totalIncrease += Math.abs(item.quantity)
    } else if (item.adjustmentType === 'DECREASE') {
      acc.decreases += 1
      acc.totalDecrease += Math.abs(item.quantity)
    }
    return acc
  }, { increases: 0, decreases: 0, totalIncrease: 0, totalDecrease: 0 })

  return (
    <div className="h-full bg-gray-50">
      <SplitView
        masterContent={
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <AdjustmentsHorizontalIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Stock Adjustment</h1>
                  <p className="text-gray-600">Adjust inventory levels based on physical counts</p>
                </div>
              </div>

              {/* Adjustment Summary */}
              {items.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                    <ScaleIcon className="h-4 w-4 mr-2" />
                    Adjustment Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-600 font-medium">Increases: {adjustmentSummary.increases}</span>
                      <span className="text-gray-500 ml-2">(+{adjustmentSummary.totalIncrease})</span>
                    </div>
                    <div>
                      <span className="text-red-600 font-medium">Decreases: {adjustmentSummary.decreases}</span>
                      <span className="text-gray-500 ml-2">(-{adjustmentSummary.totalDecrease})</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* General Error */}
              {errors.general && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                  <AlertCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800">{errors.general}</p>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-green-800">{successMessage}</p>
                </div>
              )}

              {/* Transaction Details */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Adjustment Details
                </h2>

                {/* Transaction Date */}
                <div>
                  <DatePicker
                    label="Adjustment Date"
                    value={transactionDate}
                    onChange={setTransactionDate}
                    required
                    error={errors.transactionDate}
                    disabled={isLoading}
                    max={new Date()} // Can't be in the future
                  />
                </div>

                {/* Notes */}
                <div>
                  <TouchInput
                    label="Notes (Optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this stock adjustment (e.g., physical count, damaged goods, etc.)..."
                    disabled={isLoading}
                    multiline
                    rows={3}
                  />
                </div>
              </div>

              {/* Add Products Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                  Product Adjustments
                </h2>

                {/* Product Search */}
                {!showAddProduct && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pilih Produk untuk Disesuaikan
                    </label>
                    <ProductDropdown
                      onProductSelect={handleProductSelect}
                      placeholder="Pilih produk untuk penyesuaian stok..."
                      disabled={isLoading}
                      excludeProductIds={excludeProductIds}
                      showStock={true}
                      isDemoMode={isDemoMode}
                    />
                  </div>
                )}

                {/* Add Product Form */}
                {showAddProduct && tempProduct && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{tempProduct.name}</h3>
                        <p className="text-sm text-gray-600">
                          {tempProduct.brand} • {tempProduct.sku}
                        </p>
                        {tempProduct.size && (
                          <p className="text-xs text-gray-500">Size: {tempProduct.size}</p>
                        )}
                        
                        {/* Current Stock Information */}
                        {tempAdjustmentInfo && (
                          <div className="mt-2 text-sm text-gray-700">
                            <span className="font-medium">
                              Current System Stock: {tempAdjustmentInfo.currentStock}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actual Stock Input */}
                    <div>
                      <TouchInput
                        label="Actual Stock Count"
                        type="number"
                        min="0"
                        step="1"
                        value={tempActualStock}
                        onChange={(e) => handleActualStockChange(e.target.value)}
                        placeholder="Enter counted stock quantity..."
                        required
                        error={errors.actualStock}
                        disabled={isLoading}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Enter the actual quantity counted during physical inventory
                      </p>
                    </div>

                    {/* Adjustment Calculation Display */}
                    {tempAdjustmentInfo && tempActualStock !== '' && !isNaN(tempActualStock) && (
                      <div className={`p-3 border rounded-lg ${
                        tempAdjustmentInfo.adjustmentType === 'INCREASE' 
                          ? 'bg-green-50 border-green-200' 
                          : tempAdjustmentInfo.adjustmentType === 'DECREASE'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Adjustment Calculation:</span>
                          <span className={`text-sm font-semibold ${
                            tempAdjustmentInfo.adjustmentType === 'INCREASE' 
                              ? 'text-green-600' 
                              : tempAdjustmentInfo.adjustmentType === 'DECREASE'
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}>
                            {tempAdjustmentInfo.adjustmentType === 'NO_CHANGE' 
                              ? 'No Change Needed'
                              : `${tempAdjustmentInfo.adjustmentType === 'INCREASE' ? '+' : ''}${tempAdjustmentInfo.difference}`
                            }
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>Current Stock: {tempAdjustmentInfo.currentStock}</div>
                          <div>Actual Count: {tempAdjustmentInfo.actualStock}</div>
                          <div>Difference: {tempAdjustmentInfo.difference}</div>
                        </div>
                      </div>
                    )}

                    {/* No Change Warning */}
                    {tempAdjustmentInfo && tempAdjustmentInfo.adjustmentType === 'NO_CHANGE' && tempActualStock !== '' && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2">
                        <AlertTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium">No Adjustment Needed</p>
                          <p>The actual count matches the current system stock.</p>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <TouchButton
                        variant="primary"
                        onClick={handleAddProduct}
                        disabled={isLoading || !tempAdjustmentInfo || tempAdjustmentInfo.adjustmentType === 'NO_CHANGE'}
                        className="flex-1"
                      >
                        Add Adjustment
                      </TouchButton>
                      <TouchButton
                        variant="outline"
                        onClick={handleCancelAdd}
                        disabled={isLoading}
                      >
                        Cancel
                      </TouchButton>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        }
        detailContent={
          <StockAdjustmentCart
            items={items}
            onUpdateItem={handleUpdateItem}
            onRemoveItem={handleRemoveItem}
            onSave={handleSaveTransaction}
            onClear={handleClearItems}
            title="Stock Adjustments"
            saveButtonText="Save Stock Adjustment"
            isLoading={isLoading}
            disabled={isLoading}
            transactionType={TransactionType.ADJUST}
            validationErrors={cartValidationErrors}
            successMessage={successMessage}
          />
        }
        masterWidth="60%"
      />
    </div>
  )
}

// Custom cart component for stock adjustments
function StockAdjustmentCart({
  items = [],
  onUpdateItem,
  onRemoveItem,
  onSave,
  onClear,
  title = 'Stock Adjustments',
  saveButtonText = 'Save Stock Adjustment',
  isLoading = false,
  disabled = false,
  validationErrors = [],
  successMessage = null,
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(true)

  // Validate adjustments
  const validation = useMemo(() => {
    const errors = []
    
    if (items.length === 0) {
      errors.push('At least one product adjustment is required')
    }
    
    items.forEach((item, index) => {
      const itemPrefix = `Item ${index + 1}`
      
      if (typeof item.quantity !== 'number') {
        errors.push(`${itemPrefix}: Invalid adjustment quantity`)
      }
      if (typeof item.actualStock !== 'number' || item.actualStock < 0) {
        errors.push(`${itemPrefix}: Actual stock must be a valid non-negative number`)
      }
    })
    
    if (validationErrors && validationErrors.length > 0) {
      errors.push(...validationErrors)
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }, [items, validationErrors])

  // Calculate totals
  const totals = useMemo(() => {
    return items.reduce((acc, item) => {
      const adjustmentQty = Math.abs(item.quantity || 0)
      
      if (item.adjustmentType === 'INCREASE') {
        acc.totalIncreases += adjustmentQty
        acc.increaseCount += 1
      } else if (item.adjustmentType === 'DECREASE') {
        acc.totalDecreases += adjustmentQty
        acc.decreaseCount += 1
      }
      
      return {
        ...acc,
        itemCount: acc.itemCount + 1
      }
    }, {
      totalIncreases: 0,
      totalDecreases: 0,
      increaseCount: 0,
      decreaseCount: 0,
      itemCount: 0
    })
  }, [items])

  const handleSave = () => {
    if (onSave && validation.isValid && items.length > 0) {
      onSave()
    }
  }

  const handleActualStockChange = async (itemId, newActualStock) => {
    if (onUpdateItem) {
      const item = items.find(i => i.id === itemId)
      if (item) {
        // Recalculate adjustment
        const adjustment = await StockCalculationEngine.calculateStockAdjustment(
          item.productId, 
          newActualStock
        )
        
        if (adjustment) {
          onUpdateItem(itemId, {
            actualStock: newActualStock,
            quantity: adjustment.difference,
            adjustmentType: adjustment.adjustmentType
          })
        }
      }
    }
  }

  return (
    <div className={`h-full bg-white flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {title}
          </h2>
          <div className="flex items-center space-x-2">
            {items.length > 0 && (
              <TouchButton
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-500"
              >
                {isExpanded ? <MinusIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
              </TouchButton>
            )}
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {totals.itemCount} {totals.itemCount === 1 ? 'adjustment' : 'adjustments'}
            </span>
          </div>
        </div>
        
        {/* Success Message */}
        {successMessage && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}
        
        {/* Validation Errors */}
        {!validation.isValid && validation.errors.length > 0 && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800 mb-1">
                  Please fix the following issues:
                </h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {validation.errors.map((error, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-1 h-1 bg-red-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <AdjustmentsHorizontalIcon className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <p className="text-lg font-medium mb-2">No adjustments added</p>
            <p className="text-sm">Search for products and enter actual stock counts to create adjustments</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {items.map((item, index) => (
              <StockAdjustmentItem
                key={item.id || index}
                item={item}
                onActualStockChange={handleActualStockChange}
                onRemove={onRemoveItem}
                isExpanded={isExpanded}
                disabled={disabled}
                validationErrors={validation.errors.filter(error => 
                  error.startsWith(`Item ${index + 1}`)
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Totals Section */}
      {items.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Adjustments:</span>
              <span className="font-medium">{totals.itemCount}</span>
            </div>
            {totals.increaseCount > 0 && (
              <div className="flex justify-between">
                <span className="text-green-600">Stock Increases:</span>
                <span className="font-medium text-green-600">+{totals.totalIncreases}</span>
              </div>
            )}
            {totals.decreaseCount > 0 && (
              <div className="flex justify-between">
                <span className="text-red-600">Stock Decreases:</span>
                <span className="font-medium text-red-600">-{totals.totalDecreases}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-4 border-t border-gray-200 space-y-3 flex-shrink-0">
        {items.length > 0 && onClear && (
          <TouchButton
            variant="outline"
            onClick={onClear}
            disabled={disabled || isLoading}
            className="w-full"
          >
            Clear All Adjustments
          </TouchButton>
        )}
        
        <TouchButton
          variant="primary"
          onClick={handleSave}
          disabled={disabled || isLoading || !validation.isValid || items.length === 0}
          className="w-full text-lg font-semibold"
        >
          {isLoading ? 'Saving...' : saveButtonText}
        </TouchButton>
      </div>
    </div>
  )
}

function StockAdjustmentItem({
  item,
  onActualStockChange,
  onRemove,
  isExpanded = true,
  disabled = false,
  validationErrors = []
}) {
  const handleRemove = () => {
    if (onRemove && item.id) {
      onRemove(item.id)
    }
  }

  const handleActualStockChange = (newValue) => {
    const actualStock = parseInt(newValue, 10)
    if (!isNaN(actualStock) && actualStock >= 0) {
      onActualStockChange(item.id, actualStock)
    }
  }

  // Check if this item has validation errors
  const hasErrors = validationErrors.length > 0

  return (
    <div className={`bg-white border rounded-lg p-4 space-y-3 ${
      hasErrors ? 'border-red-300 bg-red-50' : 'border-gray-200'
    }`}>
      {/* Product Info */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">
            {item.product?.name || item.name || 'Unknown Product'}
          </h4>
          <p className="text-sm text-gray-500 truncate">
            {item.product?.brand} • {item.product?.sku}
          </p>
          {item.product?.size && (
            <p className="text-xs text-gray-400">
              Size: {item.product.size}
            </p>
          )}
        </div>
        
        <TouchButton
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={disabled}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2 flex-shrink-0"
          aria-label="Remove adjustment"
        >
          <TrashIcon className="h-4 w-4" />
        </TouchButton>
      </div>

      {/* Validation Errors for this item */}
      {hasErrors && (
        <div className="p-2 bg-red-100 border border-red-200 rounded text-sm text-red-700">
          {validationErrors.map((error, index) => (
            <div key={index} className="flex items-start">
              <span className="inline-block w-1 h-1 bg-red-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
              {error.replace(/^Item \d+:\s*/, '')}
            </div>
          ))}
        </div>
      )}

      {/* Stock Information */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Current Stock</label>
          <div className="text-lg font-semibold text-gray-900">{item.currentStock}</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Actual Count</label>
          <input
            type="number"
            min="0"
            step="1"
            value={item.actualStock || ''}
            onChange={(e) => handleActualStockChange(e.target.value)}
            disabled={disabled}
            className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Adjustment</label>
          <div className={`text-lg font-semibold ${
            item.adjustmentType === 'INCREASE' 
              ? 'text-green-600' 
              : item.adjustmentType === 'DECREASE'
              ? 'text-red-600'
              : 'text-gray-600'
          }`}>
            {item.adjustmentType === 'INCREASE' ? '+' : ''}
            {item.quantity || 0}
          </div>
        </div>
      </div>

      {/* Adjustment Type Badge */}
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          item.adjustmentType === 'INCREASE'
            ? 'bg-green-100 text-green-800'
            : item.adjustmentType === 'DECREASE'
            ? 'bg-red-100 text-red-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {item.adjustmentType === 'INCREASE' && '↗ Stock Increase'}
          {item.adjustmentType === 'DECREASE' && '↘ Stock Decrease'}
          {item.adjustmentType === 'NO_CHANGE' && '→ No Change'}
        </span>
      </div>
    </div>
  )
}