'use client'

import { useState } from 'react'
import { ChevronRightIcon, ChevronDownIcon, FolderIcon, FolderOpenIcon, PlusIcon, EditIcon, TrashIcon } from 'lucide-react'

export default function CategoryTree({ 
  categories = [], 
  onAddCategory, 
  onEditCategory, 
  onDeleteCategory,
  onSelectCategory,
  selectedCategoryId = null 
}) {
  const [expandedCategories, setExpandedCategories] = useState(new Set())

  const toggleExpanded = (categoryId) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const renderCategory = (category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0
    const isExpanded = expandedCategories.has(category.id)
    const isSelected = selectedCategoryId === category.id
    const productCount = category._count?.products || 0

    return (
      <div key={category.id} className="select-none">
        <div 
          className={`group flex items-center py-2 px-3 rounded-lg cursor-pointer transition-colors ${
            isSelected 
              ? 'bg-blue-50 border border-blue-200' 
              : 'hover:bg-gray-50'
          }`}
          style={{ paddingLeft: `${12 + level * 20}px` }}
          onClick={() => onSelectCategory?.(category)}
        >
          {/* Expand/Collapse Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (hasChildren) {
                toggleExpanded(category.id)
              }
            }}
            className={`mr-2 p-1 rounded hover:bg-gray-200 transition-colors ${
              !hasChildren ? 'invisible' : ''
            }`}
          >
            {hasChildren && (
              isExpanded ? (
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 text-gray-500" />
              )
            )}
          </button>

          {/* Folder Icon */}
          <div className="mr-3">
            {hasChildren ? (
              isExpanded ? (
                <FolderOpenIcon className="h-5 w-5 text-blue-500" />
              ) : (
                <FolderIcon className="h-5 w-5 text-blue-500" />
              )
            ) : (
              <FolderIcon className="h-5 w-5 text-gray-400" />
            )}
          </div>

          {/* Category Name and Product Count */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className={`font-medium truncate ${
                isSelected ? 'text-blue-700' : 'text-gray-900'
              }`}>
                {category.name}
              </span>
              {productCount > 0 && (
                <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  {productCount} produk
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onAddCategory?.(category.id)
              }}
              className="p-1 rounded hover:bg-blue-100 text-blue-600 transition-colors"
              title="Tambah Sub-kategori"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEditCategory?.(category)
              }}
              className="p-1 rounded hover:bg-yellow-100 text-yellow-600 transition-colors"
              title="Edit Kategori"
            >
              <EditIcon className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDeleteCategory?.(category)
              }}
              className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"
              title="Hapus Kategori"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {category.children.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FolderIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium mb-2">Belum ada kategori</p>
        <p className="text-sm mb-4">Buat kategori pertama untuk mengorganisir produk Anda</p>
        <button
          onClick={() => onAddCategory?.(null)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Buat Kategori
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Kategori Produk</h3>
        <button
          onClick={() => onAddCategory?.(null)}
          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Tambah Kategori
        </button>
      </div>

      {/* Category Tree */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 max-h-96 overflow-y-auto">
        {categories.map(category => renderCategory(category))}
      </div>
    </div>
  )
}