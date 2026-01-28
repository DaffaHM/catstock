'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import SplitView from '@/components/layout/SplitView'
import TransactionCart from '@/components/ui/TransactionCart'
import ProductAutocomplete from '@/components/ui/ProductAutocomplete'
import DatePicker from '@/components/ui/DatePicker'
import TouchButton from '@/components/ui/TouchButton'
import TouchInput from '@/components/ui/TouchInput'
import QuantityStepper from '@/components/ui/QuantityStepper'
import { 
  PlusIcon, 
  RotateCcwIcon as ArrowUturnLeftIcon, 
  CalendarIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  TagIcon
} from 'lucide-react'
import { createTransaction } from '@/lib/actions/transactions'
import { TransactionType } from '@/lib/validations/transaction'

export default function ReturnsPage() {
  const router = useRouter()
  
  // Form state
  const [returnType, setReturnType] = useState('RETURN_IN') // RETURN_IN or RETURN_OUT
  const [transactionDate, setTransactionDate] = useState(new Date())
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState([])
  
  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState(null)
  const [showAddProduct, setShowAddProduct] = useState(false)
  
  // Temporary item state for adding products
  const [tempProduct, setTempProduct] = useState(null)
  const [tempQuantity, setTempQuantity] = useState(1)
  const [tempUnitPrice, setTempUnitPrice] = useState('')

  // Clear success message after delay
  const clearSuccessMessage = useCallback(() => {
    if (successMessage) {
      setTimeout(() => setSuccessMessage(null), 5000)
    }
  }, [successMessage])

  // Handle return type change
  const handleReturnTypeChange = (type) => {
    setReturnType(type)
    // Clear items when changing return type as pricing requirements differ
    setItems([])
    setErrors(prev => ({ ...prev, returnType: null }))
  }

  // Handle product selection for adding
  const handleProductSelect = (product) => {
    setTempProduct(product)
    setTempQuantity(1)
    // Set default price based on return type
    if (returnType === 'RETURN_OUT') {
      setTempUnitPrice(product.sellingPrice || '')
    } else {
      setTempUnitPrice(product.purchasePrice || '')
    }
    setShowAddProduct(true)
  }

  // Add product to cart
  const handleAddProduct = () => {
    if (!tempProduct) return

    const unitPrice = parseFloat(tempUnitPrice) || 0
    
    if (tempQuantity <= 0) {
      setErrors(prev => ({ ...prev, quantity: 'Quantity must be greater than 0' }))
      return
    }
    
    // Unit price validation based on return type
    if (returnType === 'RETURN_OUT' && unitPrice <= 0) {
      setErrors(prev => ({ ...prev, unitPrice: 'Unit price is required for return out transactions' }))
      return
    }

    // Check if product already exists in cart
    const existingItemIndex = items.findIndex(item => item.productId === tempProduct.id)
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...items]
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + tempQuantity,
        ...(returnType === 'RETURN_OUT' && { unitPrice: unitPrice }),
        ...(returnType === 'RETURN_IN' && { unitCost: unitPrice })
      }
      setItems(updatedItems)
    } else {
      // Add new item
      const newItem = {
        id: `temp_${Date.now()}`,
        productId: tempProduct.id,
        product: tempProduct,
        quantity: tempQuantity,
        ...(returnType === 'RETURN_OUT' && { unitPrice: unitPrice }),
        ...(returnType === 'RETURN_IN' && { unitCost: unitPrice })
      }
      setItems(prev => [...prev, newItem])
    }

    // Reset temp state
    setTempProduct(null)
    setTempQuantity(1)
    setTempUnitPrice('')
    setShowAddProduct(false)
    setErrors(prev => ({ ...prev, quantity: null, unitPrice: null }))
  }

  // Cancel adding product
  const handleCancelAdd = () => {
    setTempProduct(null)
    setTempQuantity(1)
    setTempUnitPrice('')
    setShowAddProduct(false)
    setErrors(prev => ({ ...prev, quantity: null, unitPrice: null }))
  }

  // Update item in cart
  const handleUpdateItem = (itemId, updates) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ))
  }

  // Remove item from cart
  const handleRemoveItem = (itemId) => {
    setItems(prev => prev.filter(item => item.id !== itemId))
  }

  // Clear all items
  const handleClearItems = () => {
    setItems([])
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}
    
    if (!returnType) {
      newErrors.returnType = 'Return type is required'
    }
    
    if (!transactionDate) {
      newErrors.transactionDate = 'Transaction date is required'
    }
    
    if (items.length === 0) {
      newErrors.items = 'At least one product is required'
    }
    
    // Validate each item
    items.forEach((item, index) => {
      if (!item.quantity || item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0'
      }
      
      // Validate pricing based on return type
      if (returnType === 'RETURN_OUT') {
        if (!item.unitPrice || item.unitPrice <= 0) {
          newErrors[`item_${index}_unitPrice`] = 'Unit price is required for return out transactions'
        }
      }
      // RETURN_IN doesn't require unit cost, it's optional
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
        type: returnType, // RETURN_IN or RETURN_OUT
        transactionDate,
        notes: notes.trim() || null,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          ...(returnType === 'RETURN_OUT' && { unitPrice: item.unitPrice }),
          ...(returnType === 'RETURN_IN' && item.unitCost && { unitCost: item.unitCost })
        }))
      }

      const result = await createTransaction(transactionData)

      if (result.success) {
        const returnTypeLabel = returnType === 'RETURN_IN' ? 'Return In' : 'Return Out'
        setSuccessMessage(`${returnTypeLabel} transaction created successfully! Reference: ${result.data.referenceNumber}`)
        
        // Reset form
        setTransactionDate(new Date())
        setNotes('')
        setItems([])
        
        clearSuccessMessage()
        
        // Optionally redirect after a delay
        setTimeout(() => {
          router.push('/transactions')
        }, 2000)
      } else {
        setErrors({ general: result.error || 'Failed to create return transaction' })
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

  // Get return type configuration
  const returnTypeConfig = {
    RETURN_IN: {
      title: 'Return In',
      description: 'Products returned to inventory',
      color: 'green',
      icon: ArrowUturnLeftIcon
    },
    RETURN_OUT: {
      title: 'Return Out',
      description: 'Products returned by customers',
      color: 'red',
      icon: ArrowUturnLeftIcon
    }
  }

  const currentConfig = returnTypeConfig[returnType]

  return (
    <div className="h-full bg-gray-50">
      <SplitView
        masterContent={
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 bg-${currentConfig.color}-100 rounded-lg flex items-center justify-center mr-4`}>
                  <currentConfig.icon className={`h-6 w-6 text-${currentConfig.color}-600`} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Returns</h1>
                  <p className="text-gray-600">Process product returns and exchanges</p>
                </div>
              </div>
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

              {/* Return Type Selection */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <TagIcon className="h-5 w-5 mr-2" />
                  Return Type
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(returnTypeConfig).map(([type, config]) => (
                    <TouchButton
                      key={type}
                      variant={returnType === type ? 'primary' : 'outline'}
                      onClick={() => handleReturnTypeChange(type)}
                      disabled={isLoading}
                      className="h-auto p-4 text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <config.icon className="h-6 w-6" />
                        <div>
                          <div className="font-medium">{config.title}</div>
                          <div className="text-sm opacity-75">{config.description}</div>
                        </div>
                      </div>
                    </TouchButton>
                  ))}
                </div>
                
                {errors.returnType && (
                  <p className="text-sm text-red-600">{errors.returnType}</p>
                )}
              </div>

              {/* Transaction Details */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Transaction Details
                </h2>

                {/* Transaction Date */}
                <div>
                  <DatePicker
                    label="Return Date"
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
                    label="Return Reason / Notes (Optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about the return reason, condition, etc..."
                    disabled={isLoading}
                    multiline
                    rows={3}
                  />
                </div>
              </div>

              {/* Add Products Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Products
                </h2>

                {/* Product Search */}
                {!showAddProduct && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Products
                    </label>
                    <ProductAutocomplete
                      onProductSelect={handleProductSelect}
                      placeholder="Search products to return..."
                      disabled={isLoading}
                      excludeProductIds={excludeProductIds}
                      showStock={true}
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
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Quantity */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <QuantityStepper
                          value={tempQuantity}
                          onChange={setTempQuantity}
                          min={1}
                          max={9999}
                          disabled={isLoading}
                        />
                        {errors.quantity && (
                          <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                        )}
                      </div>

                      {/* Unit Price (for RETURN_OUT) or Unit Cost (for RETURN_IN) */}
                      <div>
                        <TouchInput
                          label={returnType === 'RETURN_OUT' ? 'Unit Price' : 'Unit Cost (Optional)'}
                          type="number"
                          step="0.01"
                          min="0"
                          value={tempUnitPrice}
                          onChange={(e) => setTempUnitPrice(e.target.value)}
                          placeholder="0.00"
                          required={returnType === 'RETURN_OUT'}
                          error={errors.unitPrice}
                          disabled={isLoading}
                        />
                        {returnType === 'RETURN_IN' && (
                          <p className="mt-1 text-xs text-gray-500">
                            Unit cost is optional for return in transactions
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <TouchButton
                        variant="primary"
                        onClick={handleAddProduct}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        Add to Cart
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
          <TransactionCart
            items={items}
            onUpdateItem={handleUpdateItem}
            onRemoveItem={handleRemoveItem}
            onSave={handleSaveTransaction}
            onClear={handleClearItems}
            title={`${currentConfig.title} Items`}
            saveButtonText={`Save ${currentConfig.title} Transaction`}
            isLoading={isLoading}
            disabled={isLoading}
            transactionType={returnType}
            validationErrors={cartValidationErrors}
            successMessage={successMessage}
          />
        }
        masterWidth="60%"
      />
    </div>
  )
}