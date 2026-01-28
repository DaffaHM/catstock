'use client'

import { useState, useCallback } from 'react'
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
  ShoppingCartIcon, 
  CalendarIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  AlertTriangleIcon
} from 'lucide-react'
import { createTransaction } from '@/lib/actions/transactions'
import { TransactionType } from '@/lib/validations/transaction'
import { StockCalculationEngine } from '@/lib/engines/stock-calculation'
import { getDemoProducts } from '@/lib/utils/demo-products'
import { createDemoTransaction } from '@/lib/utils/demo-transactions'

export default function StockOutPage({ isDemoMode = false }) {
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
  const [stockValidation, setStockValidation] = useState({})
  
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

  // Validate stock availability for a product
  const validateProductStock = async (productId, requestedQuantity) => {
    try {
      let currentStock = 0
      
      if (isDemoMode) {
        // Use demo data for stock validation
        const demoProducts = getDemoProducts()
        const product = demoProducts.find(p => p.id === productId)
        currentStock = product ? (product.currentStock || 0) : 0
      } else {
        // Use database for real mode
        currentStock = await StockCalculationEngine.getCurrentStock(productId)
      }
      
      const isValid = currentStock >= requestedQuantity
      
      setStockValidation(prev => ({
        ...prev,
        [productId]: {
          currentStock,
          requestedQuantity,
          isValid,
          shortfall: isValid ? 0 : requestedQuantity - currentStock
        }
      }))
      
      return { currentStock, isValid, shortfall: isValid ? 0 : requestedQuantity - currentStock }
    } catch (error) {
      console.error('Stock validation error:', error)
      return { currentStock: 0, isValid: false, shortfall: requestedQuantity }
    }
  }

  // Handle product selection for adding
  const handleProductSelect = async (product) => {
    setTempProduct(product)
    setTempQuantity(1)
    setTempUnitPrice(product.sellingPrice || '')
    setShowAddProduct(true)
    
    // Validate stock availability for initial quantity
    await validateProductStock(product.id, 1)
  }

  // Handle quantity change in temp product
  const handleTempQuantityChange = async (newQuantity) => {
    setTempQuantity(newQuantity)
    
    if (tempProduct && newQuantity > 0) {
      await validateProductStock(tempProduct.id, newQuantity)
    }
  }

  // Add product to cart
  const handleAddProduct = async () => {
    if (!tempProduct) return

    const unitPrice = parseFloat(tempUnitPrice) || 0
    
    if (tempQuantity <= 0) {
      setErrors(prev => ({ ...prev, quantity: 'Quantity must be greater than 0' }))
      return
    }
    
    if (unitPrice <= 0) {
      setErrors(prev => ({ ...prev, unitPrice: 'Unit price must be greater than 0' }))
      return
    }

    // Validate stock availability
    const stockCheck = await validateProductStock(tempProduct.id, tempQuantity)
    if (!stockCheck.isValid) {
      setErrors(prev => ({ 
        ...prev, 
        stock: `Insufficient stock. Available: ${stockCheck.currentStock}, Requested: ${tempQuantity}` 
      }))
      return
    }

    // Check if product already exists in cart
    const existingItemIndex = items.findIndex(item => item.productId === tempProduct.id)
    
    if (existingItemIndex >= 0) {
      // Update existing item - need to validate total quantity
      const existingQuantity = items[existingItemIndex].quantity
      const totalQuantity = existingQuantity + tempQuantity
      
      const totalStockCheck = await validateProductStock(tempProduct.id, totalQuantity)
      if (!totalStockCheck.isValid) {
        setErrors(prev => ({ 
          ...prev, 
          stock: `Insufficient stock for total quantity. Available: ${totalStockCheck.currentStock}, Total requested: ${totalQuantity}` 
        }))
        return
      }
      
      const updatedItems = [...items]
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: totalQuantity,
        unitPrice: unitPrice // Use the new unit price
      }
      setItems(updatedItems)
    } else {
      // Add new item
      const newItem = {
        id: `temp_${Date.now()}`,
        productId: tempProduct.id,
        product: tempProduct,
        quantity: tempQuantity,
        unitPrice: unitPrice
      }
      setItems(prev => [...prev, newItem])
    }

    // Reset temp state
    setTempProduct(null)
    setTempQuantity(1)
    setTempUnitPrice('')
    setShowAddProduct(false)
    setErrors(prev => ({ ...prev, quantity: null, unitPrice: null, stock: null }))
  }

  // Cancel adding product
  const handleCancelAdd = () => {
    setTempProduct(null)
    setTempQuantity(1)
    setTempUnitPrice('')
    setShowAddProduct(false)
    setErrors(prev => ({ ...prev, quantity: null, unitPrice: null, stock: null }))
  }

  // Update item in cart
  const handleUpdateItem = async (itemId, updates) => {
    const updatedItems = items.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    )
    
    // If quantity was updated, validate stock
    if (updates.quantity !== undefined) {
      const item = updatedItems.find(i => i.id === itemId)
      if (item) {
        await validateProductStock(item.productId, updates.quantity)
      }
    }
    
    setItems(updatedItems)
  }

  // Remove item from cart
  const handleRemoveItem = (itemId) => {
    setItems(prev => prev.filter(item => item.id !== itemId))
    
    // Clear stock validation for removed item
    const removedItem = items.find(item => item.id === itemId)
    if (removedItem) {
      setStockValidation(prev => {
        const updated = { ...prev }
        delete updated[removedItem.productId]
        return updated
      })
    }
  }

  // Clear all items
  const handleClearItems = () => {
    setItems([])
    setStockValidation({})
  }

  // Validate form
  const validateForm = async () => {
    const newErrors = {}
    
    if (!transactionDate) {
      newErrors.transactionDate = 'Transaction date is required'
    }
    
    if (items.length === 0) {
      newErrors.items = 'At least one product is required'
    }
    
    // Validate each item and check stock availability
    const stockValidationPromises = items.map(async (item, index) => {
      if (!item.quantity || item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0'
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        newErrors[`item_${index}_unitPrice`] = 'Unit price must be greater than 0'
      }
      
      // Validate stock availability
      if (item.quantity > 0) {
        const stockCheck = await validateProductStock(item.productId, item.quantity)
        if (!stockCheck.isValid) {
          newErrors[`item_${index}_stock`] = `Insufficient stock. Available: ${stockCheck.currentStock}, Requested: ${item.quantity}`
        }
      }
    })
    
    await Promise.all(stockValidationPromises)
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Save transaction
  const handleSaveTransaction = async () => {
    const isValid = await validateForm()
    if (!isValid) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const transactionData = {
        type: TransactionType.OUT,
        transactionDate,
        notes: notes.trim() || null,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          product: item.product // Include product details for demo mode
        }))
      }

      let result
      
      if (isDemoMode) {
        // Use demo transaction creation
        result = createDemoTransaction(transactionData)
      } else {
        // Use real transaction creation
        result = await createTransaction(transactionData)
      }

      if (result.success) {
        setSuccessMessage(`Stock out transaction created successfully! Reference: ${result.data.referenceNumber}`)
        
        // Reset form
        setTransactionDate(new Date())
        setNotes('')
        setItems([])
        setStockValidation({})
        
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

  // Check if temp product has stock issues
  const tempProductStockInfo = tempProduct ? stockValidation[tempProduct.id] : null
  const hasStockIssue = tempProductStockInfo && !tempProductStockInfo.isValid

  return (
    <div className="h-full bg-gray-50">
      <SplitView
        masterContent={
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <ShoppingCartIcon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Stock Out</h1>
                  <p className="text-gray-600">Process outgoing inventory and sales</p>
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

              {/* Transaction Details */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Transaction Details
                </h2>

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
                      Pilih Produk
                    </label>
                    <ProductDropdown
                      onProductSelect={handleProductSelect}
                      placeholder="Pilih produk untuk dijual..."
                      disabled={isLoading}
                      excludeProductIds={excludeProductIds}
                      showStock={true}
                      isDemoMode={isDemoMode}
                    />
                  </div>
                )}

                {/* Add Product Form */}
                {showAddProduct && tempProduct && (
                  <div className={`border rounded-lg p-4 space-y-4 ${
                    hasStockIssue ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{tempProduct.name}</h3>
                        <p className="text-sm text-gray-600">
                          {tempProduct.brand} • {tempProduct.sku}
                        </p>
                        {tempProduct.size && (
                          <p className="text-xs text-gray-500">Size: {tempProduct.size}</p>
                        )}
                        {/* Stock Information */}
                        {tempProductStockInfo && (
                          <div className={`mt-2 text-sm ${
                            tempProductStockInfo.isValid ? 'text-green-600' : 'text-red-600'
                          }`}>
                            <span className="font-medium">
                              Available Stock: {tempProductStockInfo.currentStock}
                            </span>
                            {!tempProductStockInfo.isValid && (
                              <span className="ml-2">
                                (Short by {tempProductStockInfo.shortfall})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stock Warning */}
                    {hasStockIssue && (
                      <div className="p-3 bg-red-100 border border-red-200 rounded-lg flex items-start space-x-2">
                        <AlertTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-red-800">
                          <p className="font-medium">Insufficient Stock</p>
                          <p>
                            Only {tempProductStockInfo.currentStock} units available. 
                            Reduce quantity to proceed.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Stock Error */}
                    {errors.stock && (
                      <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">{errors.stock}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Quantity */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <QuantityStepper
                          value={tempQuantity}
                          onChange={handleTempQuantityChange}
                          min={1}
                          max={tempProductStockInfo?.currentStock || 9999}
                          disabled={isLoading}
                        />
                        {errors.quantity && (
                          <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                        )}
                      </div>

                      {/* Unit Price */}
                      <div>
                        <TouchInput
                          label="Unit Price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={tempUnitPrice}
                          onChange={(e) => setTempUnitPrice(e.target.value)}
                          placeholder="0"
                          required
                          error={errors.unitPrice}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <TouchButton
                        variant="primary"
                        onClick={handleAddProduct}
                        disabled={isLoading || hasStockIssue}
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
            title="Stock Out Items"
            saveButtonText="Save Stock Out Transaction"
            isLoading={isLoading}
            disabled={isLoading}
            transactionType={TransactionType.OUT}
            validationErrors={cartValidationErrors}
            successMessage={successMessage}
          />
        }
        masterWidth="60%"
      />
    </div>
  )
}