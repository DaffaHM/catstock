import { NextResponse } from 'next/server'
import { getProfitAnalysisAction, getProfitByCategoryAction, getMonthlyProfitTrendAction } from '@/lib/actions/profit-analysis'

// GET /api/profit-analysis - Get profit analysis data
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'products'
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const sortBy = searchParams.get('sortBy') || 'profitAmount'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const months = parseInt(searchParams.get('months') || '6')
    
    let result
    
    switch (type) {
      case 'products':
        result = await getProfitAnalysisAction({
          search,
          category,
          sortBy,
          sortOrder
        })
        break
        
      case 'categories':
        result = await getProfitByCategoryAction()
        break
        
      case 'monthly':
        result = await getMonthlyProfitTrendAction(months)
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid analysis type' },
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
    console.error('Profit Analysis API error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data analisis keuntungan' },
      { status: 500 }
    )
  }
}