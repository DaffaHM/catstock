'use client'

import { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import { formatRupiah } from '@/lib/utils/currency'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function PriceHistoryChart({ productId, days = 30 }) {
  const [priceHistory, setPriceHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (productId) {
      loadPriceHistory()
    }
  }, [productId, days])

  const loadPriceHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/price-history/${productId}?type=history&days=${days}`)
      const data = await response.json()

      if (data.success) {
        setPriceHistory(data.priceHistory || [])
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Gagal memuat riwayat harga')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        <p>Gagal memuat riwayat harga</p>
      </div>
    )
  }

  if (priceHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Tidak ada riwayat harga tersedia</p>
      </div>
    )
  }

  // Prepare chart data
  const sortedHistory = [...priceHistory].sort((a, b) => 
    new Date(a.effectiveDate) - new Date(b.effectiveDate)
  )

  const labels = sortedHistory.map(item => 
    new Date(item.effectiveDate).toLocaleDateString()
  )

  const purchasePrices = sortedHistory.map(item => item.purchasePrice)
  const sellingPrices = sortedHistory.map(item => item.sellingPrice)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Purchase Price',
        data: purchasePrices,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.1,
      },
      {
        label: 'Selling Price',
        data: sellingPrices,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Riwayat Harga',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${formatRupiah(context.parsed.y)}`
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Harga (Rp)'
        },
        ticks: {
          callback: function(value) {
            return formatRupiah(value, false)
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
      
      {/* Price change summary */}
      {sortedHistory.length > 1 && (
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-red-50 p-3 rounded">
            <div className="font-medium text-red-800">Perubahan Harga Beli</div>
            <div className="text-red-600">
              {formatRupiah(sortedHistory[sortedHistory.length - 1].purchasePrice - sortedHistory[0].purchasePrice)}
              {' '}
              ({((sortedHistory[sortedHistory.length - 1].purchasePrice - sortedHistory[0].purchasePrice) / sortedHistory[0].purchasePrice * 100).toFixed(1)}%)
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="font-medium text-green-800">Perubahan Harga Jual</div>
            <div className="text-green-600">
              {formatRupiah(sortedHistory[sortedHistory.length - 1].sellingPrice - sortedHistory[0].sellingPrice)}
              {' '}
              ({((sortedHistory[sortedHistory.length - 1].sellingPrice - sortedHistory[0].sellingPrice) / sortedHistory[0].sellingPrice * 100).toFixed(1)}%)
            </div>
          </div>
        </div>
      )}
    </div>
  )
}