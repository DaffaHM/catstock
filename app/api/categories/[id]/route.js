import { NextResponse } from 'next/server'
import { updateCategoryAction, deleteCategoryAction } from '@/lib/actions/categories'

// PUT /api/categories/[id] - Update category
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, parentId } = body
    
    // Create FormData to match the action signature
    const formData = new FormData()
    formData.append('name', name)
    if (parentId) {
      formData.append('parentId', parentId)
    }
    
    const result = await updateCategoryAction(id, {}, formData)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        category: result.category
      })
    } else {
      return NextResponse.json(
        { 
          error: result.error,
          errors: result.errors,
          fields: result.fields
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Categories API PUT error:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui kategori' },
      { status: 500 }
    )
  }
}

// DELETE /api/categories/[id] - Delete category
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    
    const result = await deleteCategoryAction(id)
    
    if (result.success) {
      return NextResponse.json({
        success: true
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Categories API DELETE error:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus kategori' },
      { status: 500 }
    )
  }
}