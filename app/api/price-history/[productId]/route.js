import { NextResponse } from 'next/server'
import { 
  getProductPriceHistory,
  getPriceTrends,
  getAveragePrices,
  getPriceSuggestions
} from '@/lib/services/PriceHistoryManager'

// GET /api/price-history/[productId] - Get price history for a product
export async function GET(request, { params }) {
  try {
    const { productId } = params
    const { searchParams } = new URL(request.url)
    
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const type = searchParams.get('type') || 'history'
    
    let result
    
    switch (type) {
      case 'history':
        result = await getProductPriceHistory(productId, {
          startDate,
          endDate,
          limit,
          page
        })
        break
        
      case 'trends':
        const days = parseInt(searchParams.get('days') || '30')
        result = await getPriceTrends(productId, days)
        break
        
      case 'averages':
        const avgDays = parseInt(searchParams.get('days') || '30')
        result = await getAveragePrices(productId, avgDays)
        break
        
      case 'suggestions':
        result = await getPriceSuggestions(productId)
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        )
    }
    
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Price History API error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data riwayat harga' },
      { status: 500 }
    )
  }
}