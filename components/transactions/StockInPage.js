'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import SplitView from '@/components/layout/SplitView'
import TransactionCart from '@/components/ui/TransactionCart'
import ProductAutocomplete from '@/components/ui/ProductAutocomplete'
import SupplierSelect from '@/components/ui/SupplierSelect'
import DatePicker from '@/components/ui/DatePicker'
import TouchButton from '@/components/ui/TouchButton'
import TouchInput from '@/components/ui/TouchInput'
import QuantityStepper from '@/components/ui/QuantityStepper'
import { 
  PlusIcon, 
  PackageIcon, 
  TruckIcon,
  CalendarIcon,
  AlertCircleIcon,
  CheckCircleIcon
} from 'lucide-react'
import { createTransaction } from '@/lib/actions/transactions'
import { TransactionType } from '@/lib/validations/transaction'

export default function StockInPage() {
  const router = useRouter()
  
  // Form state
  const [supplier, setSupplier] = useState(null)
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
  const [tempUnitCost, setTempUnitCost] = useState('')

  // Clear success message after delay
  const clearSuccessMessage = useCallback(() => {
    if (successMessage) {
      setTimeout(() => setSuccessMessage(null), 5000)
    }
  }, [successMessage])

  // Handle supplier selection
  const handleSupplierSelect = (selectedSupplier) => {
    setSupplier(selectedSupplier)
    setErrors(prev => ({ ...prev, supplier: null }))
  }

  // Handle product selection for adding
  const handleProductSelect = (product) => {
    setTempProduct(product)
    setTempQuantity(1)
    setTempUnitCost(product.purchasePrice || '')
    setShowAddProduct(true)
  }

  // Add product to cart
  const handleAddProduct = () => {
    if (!tempProduct) return

    const unitCost = parseFloat(tempUnitCost) || 0
    
    if (tempQuantity <= 0) {
      setErrors(prev => ({ ...prev, quantity: 'Quantity must be greater than 0' }))
      return
    }
    
    if (unitCost <= 0) {
      setErrors(prev => ({ ...prev, unitCost: 'Unit cost must be greater than 0' }))
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
        unitCost: unitCost // Use the new unit cost
      }
      setItems(updatedItems)
    } else {
      // Add new item
      const newItem = {
        id: `temp_${Date.now()}`,
        productId: tempProduct.id,
        product: tempProduct,
        quantity: tempQuantity,
        unitCost: unitCost
      }
      setItems(prev => [...prev, newItem])
    }

    // Reset temp state
    setTempProduct(null)
    setTempQuantity(1)
    setTempUnitCost('')
    setShowAddProduct(false)
    setErrors(prev => ({ ...prev, quantity: null, unitCost: null }))
  }

  // Cancel adding product
  const handleCancelAdd = () => {
    setTempProduct(null)
    setTempQuantity(1)
    setTempUnitCost('')
    setShowAddProduct(false)
    setErrors(prev => ({ ...prev, quantity: null, unitCost: null }))
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
    
    if (!supplier) {
      newErrors.supplier = 'Supplier is required for stock in transactions'
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
      if (!item.unitCost || item.unitCost <= 0) {
        newErrors[`item_${index}_unitCost`] = 'Unit cost must be greater than 0'
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
        type: TransactionType.IN,
        transactionDate,
        supplierId: supplier.id,
        notes: notes.trim() || null,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost
        }))
      }

      const result = await createTransaction(transactionData)

      if (result.success) {
        setSuccessMessage(`Stock in transaction created successfully! Reference: ${result.data.referenceNumber}`)
        
        // Reset form
        setSupplier(null)
        setTransactionDate(new Date())
        setNotes('')
        setItems([])
        
        clearSuccessMessage()
        
        // Optionally redirect after a delay
        setTimeout(() => {
          router.push('/transactions')
        }, 2000)
      } else {
        setErrors({ general: result.error || 'Failed to create transaction' })
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

  return (
    <div className="h-full bg-gray-50">
      <SplitView
        masterContent={
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <PackageIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Stock In</h1>
                  <p className="text-gray-600">Receive inventory from suppliers</p>
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

              {/* Form Validation Errors */}
              {(errors.supplier || errors.transactionDate) && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                  <AlertCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-red-800 mb-1">
                      Please fix the following issues:
                    </h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {errors.supplier && (
                        <li className="flex items-start">
                          <span className="inline-block w-1 h-1 bg-red-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {errors.supplier}
                        </li>
                      )}
                      {errors.transactionDate && (
                        <li className="flex items-start">
                          <span className="inline-block w-1 h-1 bg-red-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {errors.transactionDate}
                        </li>
                      )}
                    </ul>
                  </div>
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
                  <TruckIcon className="h-5 w-5 mr-2" />
                  Transaction Details
                </h2>

                {/* Supplier Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier <span className="text-red-500">*</span>
                  </label>
                  <SupplierSelect
                    value={supplier}
                    onSupplierSelect={handleSupplierSelect}
                    placeholder="Search and select supplier..."
                    required
                    error={errors.supplier}
                    disabled={isLoading}
                  />
                </div>

                {/* Transaction Date */}
                <div>
                  <DatePicker
                    label="Transaction Date"
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
                    placeholder="Add any notes about this transaction..."
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
                      placeholder="Search products to add..."
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

                      {/* Unit Cost */}
                      <div>
                        <TouchInput
                          label="Unit Cost"
                          type="number"
                          step="0.01"
                          min="0"
                          value={tempUnitCost}
                          onChange={(e) => setTempUnitCost(e.target.value)}
                          placeholder="0.00"
                          required
                          error={errors.unitCost}
                          disabled={isLoading}
                        />
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
            title="Stock In Items"
            saveButtonText="Save Stock In Transaction"
            isLoading={isLoading}
            disabled={isLoading}
            transactionType={TransactionType.IN}
            validationErrors={cartValidationErrors}
            successMessage={successMessage}
          />
        }
        masterWidth="60%"
      />
    </div>
  )
}