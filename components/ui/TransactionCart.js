'use client'

import { useState, useMemo } from 'react'
import { TrashIcon, PlusIcon, MinusIcon, AlertCircleIcon, CheckCircleIcon } from 'lucide-react'
import TouchButton from './TouchButton'
import QuantityStepper from './QuantityStepper'

export default function TransactionCart({
  items = [],
  onUpdateItem,
  onRemoveItem,
  onSave,
  onClear,
  title = 'Transaction Items',
  saveButtonText = 'Save Transaction',
  isLoading = false,
  disabled = false,
  showTotals = true,
  transactionType = null, // 'IN', 'OUT', 'ADJUST', 'RETURN_IN', 'RETURN_OUT'
  validationErrors = [],
  successMessage = null,
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(true)

  // Validate transaction based on type and items
  const validation = useMemo(() => {
    const errors = []
    
    // Check if items exist
    if (items.length === 0) {
      errors.push('At least one item is required')
    }
    
    // Validate based on transaction type
    if (transactionType && items.length > 0) {
      items.forEach((item, index) => {
        const itemPrefix = `Item ${index + 1}`
        
        // Validate quantity
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`${itemPrefix}: Quantity must be greater than 0`)
        }
        
        // Type-specific validations
        switch (transactionType) {
          case 'IN':
            if (!item.unitCost || item.unitCost <= 0) {
              errors.push(`${itemPrefix}: Unit cost is required for stock in transactions`)
            }
            break
          case 'OUT':
            if (!item.unitPrice || item.unitPrice <= 0) {
              errors.push(`${itemPrefix}: Unit price is required for stock out transactions`)
            }
            break
          case 'ADJUST':
            // Adjustments can have negative quantities, so just check it's a number
            if (typeof item.quantity !== 'number') {
              errors.push(`${itemPrefix}: Quantity must be a valid number`)
            }
            break
        }
      })
    }
    
    // Add external validation errors
    if (validationErrors && validationErrors.length > 0) {
      errors.push(...validationErrors)
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }, [items, transactionType, validationErrors])

  // Calculate totals
  const totals = useMemo(() => {
    return items.reduce((acc, item) => {
      const quantity = item.quantity || 0
      const unitCost = item.unitCost || 0
      const unitPrice = item.unitPrice || 0
      
      return {
        totalItems: acc.totalItems + quantity,
        totalCost: acc.totalCost + (quantity * unitCost),
        totalValue: acc.totalValue + (quantity * unitPrice),
        itemCount: acc.itemCount + 1
      }
    }, {
      totalItems: 0,
      totalCost: 0,
      totalValue: 0,
      itemCount: 0
    })
  }, [items])

  const handleQuantityChange = (itemId, newQuantity) => {
    if (onUpdateItem && newQuantity >= 0) {
      onUpdateItem(itemId, { quantity: newQuantity })
    }
  }

  const handlePriceChange = (itemId, field, value) => {
    if (onUpdateItem) {
      const numericValue = parseFloat(value) || 0
      onUpdateItem(itemId, { [field]: numericValue })
    }
  }

  const handleSave = () => {
    if (onSave) {
      onSave() // Always call onSave, let the parent handle validation
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  // Determine which price fields to show based on transaction type
  const getPriceFieldsConfig = () => {
    switch (transactionType) {
      case 'IN':
        return { showUnitCost: true, showUnitPrice: false }
      case 'OUT':
        return { showUnitCost: false, showUnitPrice: true }
      case 'ADJUST':
        return { showUnitCost: false, showUnitPrice: false }
      case 'RETURN_IN':
        return { showUnitCost: true, showUnitPrice: false }
      case 'RETURN_OUT':
        return { showUnitCost: false, showUnitPrice: true }
      default:
        return { showUnitCost: true, showUnitPrice: true }
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
              {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'}
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
                <PlusIcon className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <p className="text-lg font-medium mb-2">No items added</p>
            <p className="text-sm">Add products to start building your transaction</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {items.map((item, index) => (
              <TransactionCartItem
                key={item.id || index}
                item={item}
                onQuantityChange={handleQuantityChange}
                onPriceChange={handlePriceChange}
                onRemove={onRemoveItem}
                isExpanded={isExpanded}
                disabled={disabled}
                priceFieldsConfig={getPriceFieldsConfig()}
                validationErrors={validation.errors.filter(error => 
                  error.startsWith(`Item ${index + 1}`)
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Totals Section */}
      {showTotals && items.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Items:</span>
              <span className="font-medium">{totals.totalItems}</span>
            </div>
            {totals.totalCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Total Cost:</span>
                <span className="font-medium">{formatCurrency(totals.totalCost)}</span>
              </div>
            )}
            {totals.totalValue > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Total Value:</span>
                <span className="font-medium">{formatCurrency(totals.totalValue)}</span>
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
            Clear All Items
          </TouchButton>
        )}
        
        <TouchButton
          variant="primary"
          onClick={handleSave}
          disabled={disabled || isLoading}
          className="w-full text-lg font-semibold"
        >
          {isLoading ? 'Saving...' : saveButtonText}
        </TouchButton>
      </div>
    </div>
  )
}

function TransactionCartItem({
  item,
  onQuantityChange,
  onPriceChange,
  onRemove,
  isExpanded = true,
  disabled = false,
  priceFieldsConfig = { showUnitCost: true, showUnitPrice: true },
  validationErrors = []
}) {
  const handleRemove = () => {
    if (onRemove && item.id) {
      onRemove(item.id)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0)
  }

  const itemTotal = (item.quantity || 0) * (item.unitPrice || item.unitCost || 0)
  
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
          aria-label="Remove item"
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

      {/* Quantity Control */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <QuantityStepper
            value={item.quantity || 0}
            onChange={(value) => onQuantityChange(item.id, value)}
            min={0}
            max={9999}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Price Fields - Show based on transaction type */}
      {isExpanded && (
        <div className="grid grid-cols-1 gap-3">
          {/* Unit Cost (for IN transactions) */}
          {priceFieldsConfig.showUnitCost && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Cost
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={item.unitCost || ''}
                onChange={(e) => onPriceChange(item.id, 'unitCost', e.target.value)}
                disabled={disabled}
                className="w-full h-12 px-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation"
                placeholder="0.00"
              />
            </div>
          )}

          {/* Unit Price (for OUT transactions) */}
          {priceFieldsConfig.showUnitPrice && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Price
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={item.unitPrice || ''}
                onChange={(e) => onPriceChange(item.id, 'unitPrice', e.target.value)}
                disabled={disabled}
                className="w-full h-12 px-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation"
                placeholder="0.00"
              />
            </div>
          )}

          {/* Item Total */}
          {itemTotal > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Item Total:</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatCurrency(itemTotal)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}