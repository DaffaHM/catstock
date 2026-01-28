import { NextResponse } from 'next/server'
import { getProductAction, updateProductAction, deleteProductAction } from '@/lib/actions/products'

// GET /api/products/[id] - Get single product
export async function GET(request, { params }) {
  try {
    const { id } = params
    
    const result = await getProductAction(id)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        product: result.product
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Product API GET error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data produk' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Update product
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { sku, brand, name, category, size, unit, purchasePrice, sellingPrice, minimumStock } = body
    
    // Create FormData to match the action signature
    const formData = new FormData()
    if (sku) formData.append('sku', sku)
    if (brand) formData.append('brand', brand)
    if (name) formData.append('name', name)
    if (category) formData.append('category', category)
    if (size) formData.append('size', size)
    if (unit) formData.append('unit', unit)
    if (purchasePrice) formData.append('purchasePrice', purchasePrice.toString())
    if (sellingPrice) formData.append('sellingPrice', sellingPrice.toString())
    if (minimumStock) formData.append('minimumStock', minimumStock.toString())
    
    const result = await updateProductAction(id, {}, formData)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        product: result.product
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
    console.error('Product API PUT error:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui produk' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    
    const result = await deleteProductAction(id)
    
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
    console.error('Product API DELETE error:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus produk' },
      { status: 500 }
    )
  }
}