'use client'

import { useState } from 'react'
import TransactionCart from '../ui/TransactionCart'
import TouchButton from '../ui/TouchButton'
import { PlusIcon } from 'lucide-react'

export default function TransactionCartDemo() {
  const [transactionType, setTransactionType] = useState('OUT')
  const [cartItems, setCartItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState([])
  const [successMessage, setSuccessMessage] = useState(null)

  // Sample products
  const sampleProducts = [
    {
      id: '1',
      name: 'Premium Interior Paint',
      brand: 'ColorMax',
      sku: 'CM-INT-001',
      size: '1 Gallon',
      category: 'Interior Paint',
      sellingPrice: 45.99,
      purchasePrice: 32.50,
      currentStock: 25
    },
    {
      id: '2',
      name: 'Exterior Weather Shield',
      brand: 'WeatherPro',
      sku: 'WP-EXT-002',
      size: '5 Liters',
      category: 'Exterior Paint',
      sellingPrice: 89.99,
      purchasePrice: 65.00,
      currentStock: 12
    }
  ]

  const handleAddSampleItem = (product) => {
    const existingItem = cartItems.find(item => item.productId === product.id)
    
    if (existingItem) {
      setCartItems(items => 
        items.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
    } else {
      const newItem = {
        id: `cart-${Date.now()}-${product.id}`,
        productId: product.id,
        quantity: 1,
        unitPrice: transactionType === 'OUT' || transactionType === 'RETURN_OUT' ? product.sellingPrice : null,
        unitCost: transactionType === 'IN' || transactionType === 'RETURN_IN' ? product.purchasePrice : null,
        product: product
      }
      setCartItems(items => [...items, newItem])
    }
    
    // Clear any previous messages
    setValidationErrors([])
    setSuccessMessage(null)
  }

  const handleUpdateCartItem = (itemId, updates) => {
    setCartItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    )
    
    // Clear validation errors when user makes changes
    setValidationErrors([])
    setSuccessMessage(null)
  }

  const handleRemoveCartItem = (itemId) => {
    setCartItems(items => items.filter(item => item.id !== itemId))
    setValidationErrors([])
    setSuccessMessage(null)
  }

  const handleSaveTransaction = async () => {
    setIsLoading(true)
    setValidationErrors([])
    setSuccessMessage(null)
    
    // Simulate validation and save process
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Simulate validation errors for demo purposes
      if (Math.random() < 0.3) { // 30% chance of validation error
        setValidationErrors(['Supplier is required for stock in transactions'])
        return
      }
      
      // Simulate successful save
      setSuccessMessage(`${transactionType} transaction saved successfully with ${cartItems.length} items!`)
      
      // Clear cart after successful save
      setTimeout(() => {
        setCartItems([])
        setSuccessMessage(null)
      }, 3000)
      
    } catch (error) {
      setValidationErrors(['Failed to save transaction. Please try again.'])
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearCart = () => {
    setCartItems([])
    setValidationErrors([])
    setSuccessMessage(null)
  }

  const handleTransactionTypeChange = (newType) => {
    setTransactionType(newType)
    setCartItems([]) // Clear cart when changing type
    setValidationErrors([])
    setSuccessMessage(null)
  }

  const getTransactionTitle = () => {
    switch (transactionType) {
      case 'IN': return 'Stock In Items'
      case 'OUT': return 'Stock Out Items'
      case 'ADJUST': return 'Stock Adjustment Items'
      case 'RETURN_IN': return 'Return In Items'
      case 'RETURN_OUT': return 'Return Out Items'
      default: return 'Transaction Items'
    }
  }

  const getSaveButtonText = () => {
    switch (transactionType) {
      case 'IN': return 'Receive Stock'
      case 'OUT': return 'Complete Sale'
      case 'ADJUST': return 'Apply Adjustment'
      case 'RETURN_IN': return 'Process Return'
      case 'RETURN_OUT': return 'Process Return'
      default: return 'Save Transaction'
    }
  }

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Left Panel - Controls */}
      <div className="w-96 bg-white border-r border-gray-200 p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Transaction Cart Demo
          </h1>
          <p className="text-gray-600">
            Test the transaction cart component with different transaction types and validation scenarios.
          </p>
        </div>

        {/* Transaction Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['IN', 'OUT', 'ADJUST', 'RETURN_IN', 'RETURN_OUT'].map(type => (
              <TouchButton
                key={type}
                variant={transactionType === type ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleTransactionTypeChange(type)}
                className="text-xs"
              >
                {type.replace('_', ' ')}
              </TouchButton>
            ))}
          </div>
        </div>

        {/* Sample Products */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Add Sample Products
          </h3>
          <div className="space-y-3">
            {sampleProducts.map(product => (
              <div
                key={product.id}
                className="p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm truncate">
                      {product.name}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      {product.brand} • {product.sku}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Stock: {product.currentStock} • ${product.sellingPrice}
                    </p>
                  </div>
                  
                  <TouchButton
                    variant="primary"
                    size="sm"
                    onClick={() => handleAddSampleItem(product)}
                    className="ml-2"
                  >
                    <PlusIcon className="h-3 w-3" />
                  </TouchButton>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Actions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Demo Actions
          </h3>
          <div className="space-y-2">
            <TouchButton
              variant="outline"
              size="sm"
              onClick={() => setValidationErrors(['Demo validation error: Invalid supplier selected'])}
              className="w-full text-xs"
            >
              Trigger Validation Error
            </TouchButton>
            <TouchButton
              variant="outline"
              size="sm"
              onClick={() => {
                setValidationErrors([])
                setSuccessMessage('Demo success: Transaction validated successfully!')
              }}
              className="w-full text-xs"
            >
              Show Success Message
            </TouchButton>
            <TouchButton
              variant="outline"
              size="sm"
              onClick={() => {
                setValidationErrors([])
                setSuccessMessage(null)
              }}
              className="w-full text-xs"
            >
              Clear Messages
            </TouchButton>
          </div>
        </div>
      </div>

      {/* Right Panel - Transaction Cart */}
      <div className="flex-1 flex">
        <div className="w-96 border-l border-gray-200">
          <TransactionCart
            items={cartItems}
            onUpdateItem={handleUpdateCartItem}
            onRemoveItem={handleRemoveCartItem}
            onSave={handleSaveTransaction}
            onClear={handleClearCart}
            title={getTransactionTitle()}
            saveButtonText={getSaveButtonText()}
            isLoading={isLoading}
            showTotals={true}
            transactionType={transactionType}
            validationErrors={validationErrors}
            successMessage={successMessage}
          />
        </div>
        
        {/* Info Panel */}
        <div className="flex-1 p-6 bg-gray-50">
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Transaction Cart Features
            </h2>
            
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">✅ Implemented Features:</h3>
                <ul className="space-y-1 ml-4">
                  <li>• Right drawer layout optimized for tablet use</li>
                  <li>• Touch-friendly quantity steppers (48px height)</li>
                  <li>• Running totals calculation and display</li>
                  <li>• Prominent "Save Transaction" button with validation</li>
                  <li>• Item addition/removal functionality</li>
                  <li>• Transaction type-specific price field display</li>
                  <li>• Comprehensive validation with error feedback</li>
                  <li>• Success message display</li>
                  <li>• Loading states and disabled states</li>
                  <li>• Expandable/collapsible item details</li>
                  <li>• Touch-optimized with minimum 44px targets</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">🎯 Transaction Types:</h3>
                <ul className="space-y-1 ml-4">
                  <li>• <strong>IN:</strong> Shows unit cost fields, requires supplier</li>
                  <li>• <strong>OUT:</strong> Shows unit price fields</li>
                  <li>• <strong>ADJUST:</strong> No price fields, allows negative quantities</li>
                  <li>• <strong>RETURN_IN/OUT:</strong> Appropriate price fields</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">🔍 Validation Rules:</h3>
                <ul className="space-y-1 ml-4">
                  <li>• At least one item required</li>
                  <li>• Positive quantities (except adjustments)</li>
                  <li>• Required price fields based on transaction type</li>
                  <li>• Real-time validation feedback</li>
                  <li>• Save button disabled when invalid</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}