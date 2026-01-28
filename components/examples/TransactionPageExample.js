'use client'

import { useState } from 'react'
import SplitView from '../layout/SplitView'
import TransactionCart from '../ui/TransactionCart'
import DetailPanel from '../ui/DetailPanel'
import SplitViewDrawer from '../ui/SplitViewDrawer'
import TouchButton from '../ui/TouchButton'
import { PlusIcon, ShoppingCartIcon } from 'lucide-react'

export default function TransactionPageExample() {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(true)

  // Sample products data
  const products = [
    {
      id: '1',
      name: 'Premium Interior Paint',
      brand: 'ColorMax',
      sku: 'CM-INT-001',
      size: '1 Gallon',
      category: 'Interior Paint',
      sellingPrice: 45.99,
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
      currentStock: 12
    },
    {
      id: '3',
      name: 'Primer Base Coat',
      brand: 'BaseCoat',
      sku: 'BC-PRM-003',
      size: '2.5 Liters',
      category: 'Primer',
      sellingPrice: 32.50,
      currentStock: 18
    }
  ]

  const handleAddToCart = (product) => {
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
        id: `cart-${Date.now()}`,
        productId: product.id,
        quantity: 1,
        unitPrice: product.sellingPrice,
        product: product,
        showUnitPrice: true,
        showUnitCost: false
      }
      setCartItems(items => [...items, newItem])
    }
    
    // Open cart if it's closed
    if (!isCartOpen) {
      setIsCartOpen(true)
    }
  }

  const handleUpdateCartItem = (itemId, updates) => {
    setCartItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    )
  }

  const handleRemoveCartItem = (itemId) => {
    setCartItems(items => items.filter(item => item.id !== itemId))
  }

  const handleSaveTransaction = () => {
    // Simulate validation
    if (cartItems.length === 0) {
      alert('Please add items to the transaction')
      return
    }
    
    // Simulate successful save
    alert(`Transaction saved with ${cartItems.length} items!`)
    setCartItems([])
  }

  const handleClearCart = () => {
    setCartItems([])
  }

  // Master content - Product list
  const masterContent = (
    <div className="h-full">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Stock Out Transaction</h1>
        <p className="text-gray-600 mt-1">Select products to add to your transaction</p>
      </div>
      
      <div className="p-4 space-y-3">
        {products.map(product => (
          <div
            key={product.id}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedProduct?.id === product.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setSelectedProduct(product)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {product.brand} • {product.sku}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {product.size} • Stock: {product.currentStock}
                </p>
              </div>
              
              <div className="ml-4 flex items-center space-x-2">
                <span className="text-lg font-semibold text-gray-900">
                  ${product.sellingPrice}
                </span>
                <TouchButton
                  variant="primary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAddToCart(product)
                  }}
                >
                  <PlusIcon className="h-4 w-4" />
                </TouchButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // Detail content - Product details
  const detailContent = selectedProduct ? (
    <DetailPanel
      title={selectedProduct.name}
      subtitle={`${selectedProduct.brand} • ${selectedProduct.sku}`}
      onClose={() => setSelectedProduct(null)}
    >
      <div className="p-4 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <p className="text-base text-gray-900">{selectedProduct.category}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Size
            </label>
            <p className="text-base text-gray-900">{selectedProduct.size}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Stock
            </label>
            <p className="text-base text-gray-900">{selectedProduct.currentStock} units</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selling Price
            </label>
            <p className="text-xl font-semibold text-gray-900">
              ${selectedProduct.sellingPrice}
            </p>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <TouchButton
            variant="primary"
            onClick={() => handleAddToCart(selectedProduct)}
            className="w-full"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add to Transaction
          </TouchButton>
        </div>
      </div>
    </DetailPanel>
  ) : (
    <div className="h-full flex items-center justify-center text-gray-500">
      <div className="text-center">
        <ShoppingCartIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium mb-2">Select a Product</p>
        <p className="text-sm">Choose a product from the list to view details</p>
      </div>
    </div>
  )

  // Transaction cart drawer
  const cartDrawer = (
    <SplitViewDrawer
      isOpen={isCartOpen}
      onToggle={() => setIsCartOpen(!isCartOpen)}
      title="Transaction Cart"
      width="400px"
      position="right"
    >
      <TransactionCart
        items={cartItems}
        onUpdateItem={handleUpdateCartItem}
        onRemoveItem={handleRemoveCartItem}
        onSave={handleSaveTransaction}
        onClear={handleClearCart}
        title="Transaction Items"
        saveButtonText="Complete Sale"
        showTotals={true}
        transactionType="OUT"
        validationErrors={[]}
        successMessage={null}
      />
    </SplitViewDrawer>
  )

  return (
    <div className="h-screen bg-gray-100">
      <SplitView
        masterContent={masterContent}
        detailContent={detailContent}
        masterWidth="45%"
        rightDrawer={cartDrawer}
        rightDrawerWidth="400px"
        className="bg-white"
      />
    </div>
  )
}