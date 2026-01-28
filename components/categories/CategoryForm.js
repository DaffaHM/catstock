'use client'

import { useState, useEffect } from 'react'
import { useFormState } from 'react-dom'
import { createCategoryAction, updateCategoryAction } from '@/lib/actions/categories'

export default function CategoryForm({ 
  category = null, 
  parentId = null, 
  categories = [], 
  onSuccess, 
  onCancel 
}) {
  const [selectedParentId, setSelectedParentId] = useState(parentId || category?.parentId || '')
  
  const isEditing = !!category
  const action = isEditing 
    ? updateCategoryAction.bind(null, category.id)
    : createCategoryAction

  const [state, formAction] = useFormState(action, {})

  // Handle success
  useEffect(() => {
    if (state.success) {
      onSuccess?.(state.category)
    }
  }, [state.success, state.category, onSuccess])

  // Build parent options (exclude current category and its descendants)
  const getParentOptions = () => {
    const options = [{ id: '', name: '-- Kategori Utama --' }]
    
    const addCategoryOptions = (cats, level = 0) => {
      cats.forEach(cat => {
        // Skip current category and its descendants when editing
        if (isEditing && (cat.id === category.id || isDescendantOf(cat, category.id))) {
          return
        }
        
        // Limit to 2 levels for parent selection (to maintain 3-level max)
        if (level < 2) {
          options.push({
            id: cat.id,
            name: '  '.repeat(level) + cat.name
          })
          
          if (cat.children) {
            addCategoryOptions(cat.children, level + 1)
          }
        }
      })
    }
    
    addCategoryOptions(categories)
    return options
  }

  // Helper to check if a category is descendant of another
  const isDescendantOf = (category, ancestorId) => {
    if (!category || !ancestorId) return false
    if (category.parentId === ancestorId) return true
    
    const parent = findCategoryById(categories, category.parentId)
    if (parent) {
      return isDescendantOf(parent, ancestorId)
    }
    
    return false
  }

  // Helper to find category by ID in tree structure
  const findCategoryById = (cats, id) => {
    if (!cats || !id) return null
    
    for (const cat of cats) {
      if (cat.id === id) return cat
      if (cat.children) {
        const found = findCategoryById(cat.children, id)
        if (found) return found
      }
    }
    return null
  }

  const parentOptions = getParentOptions()

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {isEditing ? 'Edit Kategori' : 'Tambah Kategori Baru'}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form action={formAction} className="space-y-4">
        {/* Category Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nama Kategori *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={category?.name || ''}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              state.errors?.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Masukkan nama kategori"
            required
          />
          {state.errors?.name && (
            <p className="mt-1 text-sm text-red-600">{state.errors.name}</p>
          )}
        </div>

        {/* Parent Category */}
        <div>
          <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-2">
            Kategori Induk
          </label>
          <select
            id="parentId"
            name="parentId"
            value={selectedParentId}
            onChange={(e) => setSelectedParentId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {parentOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Pilih kategori induk untuk membuat sub-kategori (maksimal 3 tingkat)
          </p>
        </div>

        {/* Error Message */}
        {state.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{state.error}</p>
          </div>
        )}

        {/* Success Message */}
        {state.success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600">
              Kategori berhasil {isEditing ? 'diperbarui' : 'dibuat'}!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isEditing ? 'Perbarui' : 'Buat'} Kategori
          </button>
        </div>
      </form>
    </div>
  )
}