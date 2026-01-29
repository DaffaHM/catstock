'use client'

import { useState, useRef, useEffect } from 'react'
import { useFormState } from 'react-dom'
import { createProductAction, updateProductAction } from '@/lib/actions/products'
import { saveDemoProduct } from '@/lib/utils/demo-products'
import { formatRupiah } from '@/lib/utils/currency'
import { PRODUCT_CATEGORIES, PRODUCT_UNITS } from '@/lib/validations/product'
import TouchInput from '@/components/ui/TouchInput'
import TouchButton from '@/components/ui/TouchButton'
import { XIcon, SaveIcon, PackageIcon } from 'lucide-react'

export default function ProductForm({ product, categories, onSuccess, onCancel, isDemoMode }) {
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
    paintColor: product?.paintColor || '',
    unit: product?.unit || 'Each',
    purchasePrice: product?.purchasePrice || '',
    sellingPrice: product?.sellingPrice || '',
    profitMargin: product?.profitMargin || '',
    minimumStock: product?.minimumStock || ''
  })

  // Handle successful form submission
  useEffect(() => {
    if (state?.success) {
      onSuccess(state.product)
    }
  }, [state?.success, state?.product, onSuccess])

  // Handle demo mode form submission
  const handleDemoSubmit = async (e) => {
    e.preventDefault()
    
    if (isDemoMode) {
      // Validate required fields
      const requiredFields = ['sku', 'brand', 'name', 'category', 'size', 'unit']
      const errors = {}
      
      requiredFields.forEach(field => {
        if (!formData[field] || formData[field].trim() === '') {
          errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
        }
      })
      
      if (Object.keys(errors).length > 0) {
        console.log('Validation errors:', errors)
        return
      }
      
      // Create or update product for demo mode
      const productData = {
        id: isEditing ? product.id : `demo-prod-${Date.now()}`,
        sku: formData.sku,
        brand: formData.brand,
        name: formData.name,
        category: formData.category,
        size: formData.size,
        paintColor: formData.paintColor,
        unit: formData.unit,
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
        sellingPrice: parseFloat(formData.sellingPrice) || 0,
        profitMargin: parseFloat(formData.profitMargin) || 0,
        minimumStock: parseInt(formData.minimumStock) || 0,
        currentStock: product?.currentStock || 0,
        transactionCount: product?.transactionCount || 0,
        createdAt: product?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // Save to localStorage
      saveDemoProduct(productData)
      
      console.log(isEditing ? 'Demo product updated:' : 'Demo product created:', productData)
      onSuccess(productData)
      return
    }
    
    // For database mode, use regular form submission
    formRef.current?.requestSubmit()
  }

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
    setFormData(prev => {
      const newData = { ...prev, [name]: value }
      
      // Auto-calculate selling price when profit margin percentage is entered
      if (name === 'profitMargin' && newData.purchasePrice) {
        const purchasePrice = parseFloat(newData.purchasePrice) || 0
        const marginPercent = parseFloat(value) || 0
        if (purchasePrice > 0 && marginPercent > 0) {
          const sellingPrice = purchasePrice * (1 + marginPercent / 100)
          newData.sellingPrice = Math.round(sellingPrice).toString()
        }
      }
      
      // Auto-calculate selling price when purchase price changes and margin is set
      if (name === 'purchasePrice' && newData.profitMargin) {
        const purchasePrice = parseFloat(value) || 0
        const marginPercent = parseFloat(newData.profitMargin) || 0
        if (purchasePrice > 0 && marginPercent > 0) {
          const sellingPrice = purchasePrice * (1 + marginPercent / 100)
          newData.sellingPrice = Math.round(sellingPrice).toString()
        }
      }
      
      return newData
    })
  }

  const validatePrices = () => {
    const purchase = parseFloat(formData.purchasePrice) || 0
    const selling = parseFloat(formData.sellingPrice) || 0
    
    if (purchase > 0 && selling > 0 && purchase > selling) {
      return 'Harga beli tidak boleh lebih tinggi dari harga jual'
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
                {isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h2>
              <p className="text-gray-600 mt-1">
                {isEditing 
                  ? `Update detail untuk ${product.name}`
                  : 'Tambahkan produk baru ke inventori Anda'
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
        <form ref={formRef} action={isDemoMode ? handleDemoSubmit : action} onSubmit={isDemoMode ? handleDemoSubmit : undefined} className="space-y-6 max-w-2xl">
          {/* Global Error */}
          {state?.error && !isDemoMode && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-medium">{state.error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Informasi Dasar
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
                label="Merek"
                name="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                error={state?.errors?.brand}
                required
                placeholder="e.g., Dulux"
              />
            </div>

            <TouchInput
              label="Nama Produk"
              name="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={state?.errors?.name}
              required
              placeholder="e.g., Cat Tembok Premium"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-base font-medium text-gray-700">
                  Kategori <span className="text-red-500">*</span>
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
                  <option value="">Pilih kategori</option>
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
                  Satuan <span className="text-red-500">*</span>
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
              label="Ukuran/Kemasan"
              name="size"
              value={formData.size}
              onChange={(e) => handleInputChange('size', e.target.value)}
              error={state?.errors?.size}
              required
              placeholder="e.g., 1 Galon, 5 Liter"
            />

            <TouchInput
              label="Warna Cat"
              name="paintColor"
              value={formData.paintColor}
              onChange={(e) => handleInputChange('paintColor', e.target.value)}
              error={state?.errors?.paintColor}
              placeholder="e.g., Putih, Biru Laut, Hijau Daun"
              className="capitalize"
            />
          </div>

          {/* Pricing Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Informasi Harga
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <TouchInput
                label="Harga Beli"
                name="purchasePrice"
                type="number"
                step="1000"
                min="0"
                value={formData.purchasePrice}
                onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                error={state?.errors?.purchasePrice}
                placeholder="0"
              />

              <TouchInput
                label="Margin Keuntungan (%)"
                name="profitMargin"
                type="number"
                step="1"
                min="0"
                max="1000"
                value={formData.profitMargin}
                onChange={(e) => handleInputChange('profitMargin', e.target.value)}
                error={state?.errors?.profitMargin}
                placeholder="e.g., 25"
              />

              <TouchInput
                label="Harga Jual"
                name="sellingPrice"
                type="number"
                step="1000"
                min="0"
                value={formData.sellingPrice}
                onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                error={state?.errors?.sellingPrice}
                placeholder="0"
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
                  <span className="text-sm font-medium text-green-800">Keuntungan:</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-green-900">
                      {formatRupiah(parseFloat(formData.sellingPrice) - parseFloat(formData.purchasePrice))}
                    </span>
                    <span className="text-sm text-green-600 ml-2">
                      ({Math.round(((parseFloat(formData.sellingPrice) - parseFloat(formData.purchasePrice)) / parseFloat(formData.purchasePrice)) * 100)}%)
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-green-700">
                  <strong>Tips:</strong> Anda bebas mengatur margin keuntungan sesuai keinginan. 
                  Masukkan persentase margin atau edit langsung harga jual.
                </div>
              </div>
            )}
          </div>

          {/* Inventory Settings */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Pengaturan Inventori
            </h3>

            <TouchInput
              label="Stok Minimum"
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
                <strong>Tips:</strong> Atur level stok minimum untuk menerima peringatan stok rendah 
                ketika inventori turun di bawah ambang batas ini.
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
            Batal
          </TouchButton>
          
          <TouchButton
            variant="primary"
            onClick={isDemoMode ? handleDemoSubmit : () => formRef.current?.requestSubmit()}
            className="flex items-center"
          >
            <SaveIcon className="h-5 w-5 mr-2" />
            {isEditing ? 'Update Produk' : 'Buat Produk'}
          </TouchButton>
        </div>
      </div>
    </div>
  )
}