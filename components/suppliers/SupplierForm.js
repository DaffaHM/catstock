'use client'

import { useState, useRef, useEffect } from 'react'
import { useFormState } from 'react-dom'
import { createSupplierAction, updateSupplierAction } from '@/lib/actions/suppliers'
import TouchInput from '@/components/ui/TouchInput'
import TouchButton from '@/components/ui/TouchButton'
import { XIcon, SaveIcon, TruckIcon } from 'lucide-react'

export default function SupplierForm({ supplier, onSuccess, onCancel, isDemoMode }) {
  const isEditing = !!supplier
  const formRef = useRef(null)
  
  // Form state management
  const [createState, createAction] = useFormState(createSupplierAction, {})
  const [updateState, updateAction] = useFormState(
    isEditing ? (prevState, formData) => updateSupplierAction(supplier.id, prevState, formData) : null,
    {}
  )
  
  const state = isEditing ? updateState : createState
  const action = isEditing ? updateAction : createAction
  
  // Local state for form validation
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    contact: supplier?.contact || '',
    notes: supplier?.notes || ''
  })
  
  // Local state for demo mode
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState(null)

  // Handle successful form submission
  useEffect(() => {
    if (state?.success) {
      console.log('SupplierForm: Success state received:', state.supplier)
      onSuccess(state.supplier)
    }
  }, [state?.success, state?.supplier, onSuccess])

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
    setLocalError(null) // Clear local error when user types
  }
  
  // Handle demo mode form submission
  const handleDemoSubmit = async (e) => {
    e.preventDefault()
    
    if (isSubmitting) return
    
    setIsSubmitting(true)
    setLocalError(null)
    
    try {
      // Basic validation
      if (!formData.name.trim()) {
        setLocalError('Nama pemasok harus diisi')
        return
      }
      
      // Create new supplier object
      const newSupplier = {
        id: isEditing ? supplier.id : `demo-supp-${Date.now()}`,
        name: formData.name.trim(),
        contact: formData.contact.trim() || null,
        notes: formData.notes.trim() || null,
        transactionCount: isEditing ? supplier.transactionCount : 0,
        createdAt: isEditing ? supplier.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      console.log('Demo form submission:', newSupplier)
      
      // Simulate a small delay
      await new Promise(resolve => setTimeout(resolve, 300))
      
      onSuccess(newSupplier)
    } catch (error) {
      console.error('Demo form error:', error)
      setLocalError('Terjadi kesalahan saat menyimpan data')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Choose submit handler based on mode
  const handleSubmit = isDemoMode ? handleDemoSubmit : () => formRef.current?.requestSubmit()

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TruckIcon className="h-6 w-6 text-primary-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Supplier' : 'Create New Supplier'}
              </h2>
              <p className="text-gray-600 mt-1">
                {isEditing 
                  ? `Update details for ${supplier.name}`
                  : 'Add a new supplier to your system'
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
        <form ref={formRef} action={isDemoMode ? undefined : action} onSubmit={isDemoMode ? handleDemoSubmit : undefined} className="space-y-6 max-w-2xl">
          {/* Global Error */}
          {(state?.error || localError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-medium">{state?.error || localError}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Supplier Information
            </h3>

            <TouchInput
              label="Supplier Name"
              name="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={state?.errors?.name}
              required
              placeholder="e.g., ABC Paint Supply Co."
            />

            <div className="space-y-2">
              <label className="block text-base font-medium text-gray-700">
                Contact Information
              </label>
              <textarea
                name="contact"
                value={formData.contact}
                onChange={(e) => handleInputChange('contact', e.target.value)}
                rows={4}
                placeholder="Phone, email, address, or other contact details..."
                className={`w-full px-4 py-3 text-base border rounded-lg touch-manipulation resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  state?.errors?.contact ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {state?.errors?.contact && (
                <p className="text-red-600 text-sm">{state.errors.contact}</p>
              )}
              <p className="text-sm text-gray-500">
                Include phone numbers, email addresses, physical addresses, or any other relevant contact information.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-base font-medium text-gray-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={6}
                placeholder="Additional notes about this supplier..."
                className={`w-full px-4 py-3 text-base border rounded-lg touch-manipulation resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  state?.errors?.notes ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {state?.errors?.notes && (
                <p className="text-red-600 text-sm">{state.errors.notes}</p>
              )}
              <p className="text-sm text-gray-500">
                Add any additional information about this supplier, such as payment terms, delivery schedules, product specialties, etc.
              </p>
            </div>
          </div>

          {/* Information Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Supplier Management Tips</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Keep contact information up to date for smooth communication</li>
              <li>• Use notes to track important details like payment terms or delivery preferences</li>
              <li>• Suppliers with associated transactions cannot be deleted</li>
            </ul>
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
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center"
          >
            <SaveIcon className="h-5 w-5 mr-2" />
            {isSubmitting ? 'Menyimpan...' : (isEditing ? 'Update Supplier' : 'Create Supplier')}
          </TouchButton>
        </div>
      </div>
    </div>
  )
}