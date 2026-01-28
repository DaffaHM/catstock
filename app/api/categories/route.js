import { NextResponse } from 'next/server'
import { getCategoriesAction, createCategoryAction } from '@/lib/actions/categories'

// GET /api/categories - Get all categories
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const parentId = searchParams.get('parentId')
    
    const result = await getCategoriesAction({
      search,
      parentId: parentId === 'null' ? null : parentId
    })
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        categories: result.categories,
        totalCount: result.totalCount
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Categories API GET error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data kategori' },
      { status: 500 }
    )
  }
}

// POST /api/categories - Create new category
export async function POST(request) {
  try {
    const body = await request.json()
    const { name, parentId } = body
    
    // Create FormData to match the action signature
    const formData = new FormData()
    formData.append('name', name)
    if (parentId) {
      formData.append('parentId', parentId)
    }
    
    const result = await createCategoryAction({}, formData)
    
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
    console.error('Categories API POST error:', error)
    return NextResponse.json(
      { error: 'Gagal membuat kategori' },
      { status: 500 }
    )
  }
}