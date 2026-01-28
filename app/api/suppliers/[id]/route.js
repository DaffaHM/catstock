import { NextResponse } from 'next/server'
import { getSupplierAction, updateSupplierAction, deleteSupplierAction } from '@/lib/actions/suppliers'

// GET /api/suppliers/[id] - Get single supplier
export async function GET(request, { params }) {
  try {
    const { id } = params
    
    const result = await getSupplierAction(id)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        supplier: result.supplier
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Supplier API GET error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data pemasok' },
      { status: 500 }
    )
  }
}

// PUT /api/suppliers/[id] - Update supplier
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, contact, notes } = body
    
    // Create FormData to match the action signature
    const formData = new FormData()
    if (name) formData.append('name', name)
    if (contact) formData.append('contact', contact)
    if (notes) formData.append('notes', notes)
    
    const result = await updateSupplierAction(id, {}, formData)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        supplier: result.supplier
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
    console.error('Supplier API PUT error:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui pemasok' },
      { status: 500 }
    )
  }
}

// DELETE /api/suppliers/[id] - Delete supplier
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    
    const result = await deleteSupplierAction(id)
    
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
    console.error('Supplier API DELETE error:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus pemasok' },
      { status: 500 }
    )
  }
}