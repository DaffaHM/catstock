'use client'

import { useState, useEffect } from 'react'
import { getCategoriesAction, deleteCategoryAction } from '@/lib/actions/categories'
import CategoryTree from './CategoryTree'
import CategoryForm from './CategoryForm'
import { FolderIcon, AlertTriangleIcon } from 'lucide-react'

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [parentId, setParentId] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState(null)

  // Load categories
  const loadCategories = async () => {
    try {
      setLoading(true)
      const result = await getCategoriesAction()
      
      if (result.success) {
        setCategories(result.categories)
        setError(null)
      } else {
        setError(result.error || 'Gagal memuat kategori')
      }
    } catch (err) {
      console.error('Error loading categories:', err)
      setError('Terjadi kesalahan saat memuat kategori')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  // Handle add category
  const handleAddCategory = (parentCategoryId = null) => {
    setParentId(parentCategoryId)
    setEditingCategory(null)
    setShowForm(true)
  }

  // Handle edit category
  const handleEditCategory = (category) => {
    setEditingCategory(category)
    setParentId(null)
    setShowForm(true)
  }

  // Handle delete category
  const handleDeleteCategory = (category) => {
    setDeletingCategory(category)
    setShowDeleteConfirm(true)
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (!deletingCategory) return

    try {
      const result = await deleteCategoryAction(deletingCategory.id)
      
      if (result.success) {
        await loadCategories()
        setShowDeleteConfirm(false)
        setDeletingCategory(null)
        
        // Clear selection if deleted category was selected
        if (selectedCategory?.id === deletingCategory.id) {
          setSelectedCategory(null)
        }
      } else {
        alert(result.error || 'Gagal menghapus kategori')
      }
    } catch (err) {
      console.error('Error deleting category:', err)
      alert('Terjadi kesalahan saat menghapus kategori')
    }
  }

  // Handle form success
  const handleFormSuccess = async (category) => {
    await loadCategories()
    setShowForm(false)
    setEditingCategory(null)
    setParentId(null)
  }

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false)
    setEditingCategory(null)
    setParentId(null)
  }

  // Handle category selection
  const handleSelectCategory = (category) => {
    setSelectedCategory(category)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat kategori...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangleIcon className="h-5 w-5 text-red-500 mr-3" />
          <div>
            <h3 className="text-red-800 font-medium">Gagal Memuat Kategori</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={loadCategories}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Category Tree */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CategoryTree
            categories={categories}
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onSelectCategory={handleSelectCategory}
            selectedCategoryId={selectedCategory?.id}
          />
        </div>

        {/* Category Form or Details */}
        <div className="lg:col-span-1">
          {showForm ? (
            <CategoryForm
              category={editingCategory}
              parentId={parentId}
              categories={categories}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          ) : selectedCategory ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Kategori</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Kategori
                  </label>
                  <p className="text-gray-900">{selectedCategory.name}</p>
                </div>

                {selectedCategory.parentId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori Induk
                    </label>
                    <p className="text-gray-600">
                      {selectedCategory.parentId ? 'Ada Kategori Induk' : 'Kategori Utama'}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah Produk
                  </label>
                  <p className="text-gray-900">
                    {selectedCategory._count?.products || 0} produk
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub-kategori
                  </label>
                  <p className="text-gray-900">
                    {selectedCategory.children?.length || 0} sub-kategori
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEditCategory(selectedCategory)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(selectedCategory)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
              <FolderIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">Pilih kategori untuk melihat detail</p>
              <p className="text-sm text-gray-500">
                Klik pada kategori di sebelah kiri untuk melihat informasi lengkap
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangleIcon className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Konfirmasi Hapus</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus kategori "{deletingCategory?.name}"? 
              Tindakan ini tidak dapat dibatalkan.
            </p>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}