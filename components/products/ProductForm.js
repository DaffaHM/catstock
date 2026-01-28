'use client'

import { useState, useRef, useEffect } from 'react'
import { useFormState } from 'react-dom'
import { createProductAction, updateProductAction } from '@/lib/actions/products'
import { PRODUCT_CATEGORIES, PRODUCT_UNITS } from '@/lib/validations/product'
import TouchInput from '@/components/ui/TouchInput'
import TouchButton from '@/components/ui/TouchButton'
import { XIcon, SaveIcon, PackageIcon } from 'lucide-react'

export default function ProductForm({ product, categories, onSuccess, onCancel }) {
  const isEditing = !!product
  const formRef = useRef(null)
  
  // Form state management
  const [createState, createAction] = useFormState(createProductAction, {})
  const [updateState, updateAction] = useFormState(
    isEditing ? (prevState, formData) => updateProductAction(product.id, prevState, formData) : null,
    {}
  )
  
  const state = isEditing ? updateState : createState
  const action = isEditing ? updateAction : createAction
  
  // Local state for form validation
  const [formData, setFormData] = useState({
    sku: product?.sku || '',
    brand: product?.brand || '',
    name: product?.name || '',
    category: product?.category || '',
    size: product?.size || '',
    unit: product?.unit || 'Each',
    purchasePrice: product?.purchasePrice || '',
    sellingPrice: product?.sellingPrice || '',
    minimumStock: product?.minimumStock || ''
  })

  // Handle successful form submission
  useEffect(() => {
    if (state?.success) {
      onSuccess(state.product)
    }
  }, [state?.success, state?.product, onSuccess])

  // Auto-scroll to first error
  useEffect(() => {
    if (state?.errors && formRef.current) {
      const firstErrorField = Object.keys(state.errors)[0]
      if (firstErrorField) {
        const element = formRef.current.querySelector(`[name="${firstErrorField}"]`)
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            element.focus()
          }, 100)
        }
      }
    }
  }, [state?.errors])

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validatePrices = () => {
    const purchase = parseFloat(formData.purchasePrice) || 0
    const selling = parseFloat(formData.sellingPrice) || 0
    
    if (purchase > 0 && selling > 0 && purchase > selling) {
      return 'Purchase price should not exceed selling price'
    }
    return null
  }

  const priceWarning = validatePrices()

  // Combine categories from props and predefined list
  const allCategories = [...new Set([...categories, ...PRODUCT_CATEGORIES])].sort()

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <PackageIcon className="h-6 w-6 text-primary-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Product' : 'Create New Product'}
              </h2>
              <p className="text-gray-600 mt-1">
                {isEditing 
                  ? `Update details for ${product.name}`
                  : 'Add a new product to your inventory'
                }
              </p>
            </div>
          </div>
          
          <TouchButton
            variant="ghost"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close form"
          >
            <XIcon className="h-6 w-6" />
          </TouchButton>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-6">
        <form ref={formRef} action={action} className="space-y-6 max-w-2xl">
          {/* Global Error */}
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-medium">{state.error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <TouchInput
                label="SKU"
                name="sku"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                error={state?.errors?.sku}
                required
                placeholder="e.g., PAINT-001"
                className="font-mono"
              />

              <TouchInput
                label="Brand"
                name="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                error={state?.errors?.brand}
                required
                placeholder="e.g., Sherwin-Williams"
              />
            </div>

            <TouchInput
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={state?.errors?.name}
              required
              placeholder="e.g., Premium Interior Paint"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-base font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  required
                  className={`w-full h-12 px-4 text-base border rounded-lg touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    state?.errors?.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a category</option>
                  {allCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {state?.errors?.category && (
                  <p className="text-red-600 text-sm">{state.errors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-base font-medium text-gray-700">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  required
                  className={`w-full h-12 px-4 text-base border rounded-lg touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    state?.errors?.unit ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {PRODUCT_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                {state?.errors?.unit && (
                  <p className="text-red-600 text-sm">{state.errors.unit}</p>
                )}
              </div>
            </div>

            <TouchInput
              label="Size/Packaging"
              name="size"
              value={formData.size}
              onChange={(e) => handleInputChange('size', e.target.value)}
              error={state?.errors?.size}
              required
              placeholder="e.g., 1 Gallon, 5 Liters"
            />
          </div>

          {/* Pricing Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Pricing Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <TouchInput
                label="Purchase Price"
                name="purchasePrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.purchasePrice}
                onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                error={state?.errors?.purchasePrice}
                placeholder="0.00"
              />

              <TouchInput
                label="Selling Price"
                name="sellingPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.sellingPrice}
                onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                error={state?.errors?.sellingPrice}
                placeholder="0.00"
              />
            </div>

            {/* Price Warning */}
            {priceWarning && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg">
                <p className="text-sm">{priceWarning}</p>
              </div>
            )}

            {/* Profit Margin Display */}
            {formData.purchasePrice && formData.sellingPrice && !priceWarning && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-800">Profit Margin:</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-green-900">
                      ${(parseFloat(formData.sellingPrice) - parseFloat(formData.purchasePrice)).toFixed(2)}
                    </span>
                    <span className="text-sm text-green-600 ml-2">
                      ({Math.round(((parseFloat(formData.sellingPrice) - parseFloat(formData.purchasePrice)) / parseFloat(formData.purchasePrice)) * 100)}%)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Inventory Settings */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Inventory Settings
            </h3>

            <TouchInput
              label="Minimum Stock Level"
              name="minimumStock"
              type="number"
              min="0"
              value={formData.minimumStock}
              onChange={(e) => handleInputChange('minimumStock', e.target.value)}
              error={state?.errors?.minimumStock}
              placeholder="e.g., 10"
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> Set a minimum stock level to receive low stock alerts 
                when inventory falls below this threshold.
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-center justify-end space-x-4">
          <TouchButton
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </TouchButton>
          
          <TouchButton
            variant="primary"
            onClick={() => formRef.current?.requestSubmit()}
            className="flex items-center"
          >
            <SaveIcon className="h-5 w-5 mr-2" />
            {isEditing ? 'Update Product' : 'Create Product'}
          </TouchButton>
        </div>
      </div>
    </div>
  )
}