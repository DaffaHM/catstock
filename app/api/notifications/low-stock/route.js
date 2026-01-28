import { NextResponse } from 'next/server'
import { getLowStockProductsAction } from '@/lib/actions/notifications'

// GET /api/notifications/low-stock - Get low stock products
export async function GET(request) {
  try {
    const result = await getLowStockProductsAction()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        products: result.products,
        totalCount: result.totalCount,
        criticalCount: result.criticalCount,
        highCount: result.highCount
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Low stock API error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data stok rendah' },
      { status: 500 }
    )
  }
}