import { NextResponse } from 'next/server'
import { getProductsAction, createProductAction } from '@/lib/actions/products'

// GET /api/products - Get all products with search and filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const brand = searchParams.get('brand')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'
    
    const result = await getProductsAction({
      search,
      category,
      brand,
      page,
      limit,
      sortBy,
      sortOrder
    })
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        products: result.products,
        pagination: result.pagination
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Products API GET error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data produk' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create new product
export async function POST(request) {
  try {
    const body = await request.json()
    const { sku, brand, name, category, size, unit, purchasePrice, sellingPrice, minimumStock } = body
    
    // Create FormData to match the action signature
    const formData = new FormData()
    formData.append('sku', sku)
    formData.append('brand', brand)
    formData.append('name', name)
    formData.append('category', category)
    formData.append('size', size)
    formData.append('unit', unit)
    if (purchasePrice) formData.append('purchasePrice', purchasePrice.toString())
    if (sellingPrice) formData.append('sellingPrice', sellingPrice.toString())
    if (minimumStock) formData.append('minimumStock', minimumStock.toString())
    
    const result = await createProductAction({}, formData)
    
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
    console.error('Products API POST error:', error)
    return NextResponse.json(
      { error: 'Gagal membuat produk' },
      { status: 500 }
    )
  }
}