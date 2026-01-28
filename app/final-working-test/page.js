'use client'

import { useState } from 'react'

export default function FinalWorkingTestPage() {
  const [status, setStatus] = useState('')
  const [sessionInfo, setSessionInfo] = useState(null)

  const checkSession = async () => {
    try {
      const response = await fetch('/api/session-check')
      const data = await response.json()
      setSessionInfo(data)
      
      if (data.authenticated) {
        setStatus(`✅ Terautentikasi sebagai: ${data.user.email}`)
      } else {
        setStatus('❌ Tidak Terautentikasi')
      }
    } catch (error) {
      setStatus('❌ Error memeriksa sesi')
    }
  }

  const performLogin = async () => {
    setStatus('🔄 Mencoba login...')
    
    try {
      // Create form data
      const formData = new FormData()
      formData.append('email', 'owner@catstock.com')
      formData.append('password', 'admin123')

      // Submit to login action
      const response = await fetch('/login', {
        method: 'POST',
        body: formData,
        redirect: 'manual' // Don't follow redirects automatically
      })

      console.log('Login response status:', response.status)
      console.log('Login response headers:', [...response.headers.entries()])

      if (response.status === 0) {
        // This means the request was redirected
        setStatus('✅ Login berhasil! (Dialihkan)')
        // Check session after a short delay
        setTimeout(checkSession, 1000)
      } else if (response.status === 302 || response.status === 307) {
        setStatus('✅ Login berhasil! (Respons redirect)')
        setTimeout(checkSession, 1000)
      } else {
        const text = await response.text()
        setStatus(`❌ Login gagal: ${response.status} - ${text}`)
      }
    } catch (error) {
      console.error('Login error:', error)
      setStatus(`❌ Error login: ${error.message}`)
    }
  }

  const testDirectNavigation = (url) => {
    setStatus(`🔄 Test navigasi ke ${url}...`)
    window.location.href = url
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Test Kerja Final</h1>
        
        <div className="space-y-6">
          {/* Status Display */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Status</h2>
            <p className="text-lg mb-4">{status || 'Siap untuk test'}</p>
            
            {sessionInfo && (
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <h3 className="font-semibold mb-2">Info Sesi:</h3>
                <pre className="text-sm">{JSON.stringify(sessionInfo, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Aksi</h2>
            <div className="space-y-3">
              <button
                onClick={checkSession}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700"
              >
                Periksa Status Sesi
              </button>
              
              <button
                onClick={performLogin}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700"
              >
                Lakukan Login
              </button>
            </div>
          </div>

          {/* Navigation Tests */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Test Navigasi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => testDirectNavigation('/dashboard')}
                className="bg-blue-100 text-blue-800 py-3 px-4 rounded-lg hover:bg-blue-200"
              >
                Dasbor
              </button>
              <button
                onClick={() => testDirectNavigation('/products')}
                className="bg-green-100 text-green-800 py-3 px-4 rounded-lg hover:bg-green-200"
              >
                Produk
              </button>
              <button
                onClick={() => testDirectNavigation('/suppliers')}
                className="bg-purple-100 text-purple-800 py-3 px-4 rounded-lg hover:bg-purple-200"
              >
                Pemasok
              </button>
              <button
                onClick={() => testDirectNavigation('/reports')}
                className="bg-orange-100 text-orange-800 py-3 px-4 rounded-lg hover:bg-orange-200"
              >
                Laporan
              </button>
              <button
                onClick={() => testDirectNavigation('/settings')}
                className="bg-gray-100 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-200"
              >
                Pengaturan
              </button>
              <button
                onClick={() => testDirectNavigation('/working-test')}
                className="bg-indigo-100 text-indigo-800 py-3 px-4 rounded-lg hover:bg-indigo-200"
              >
                Test Kerja
              </button>
            </div>
          </div>

          {/* Direct Links */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Link Langsung</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <a href="/dashboard" className="block bg-blue-100 text-blue-800 py-3 px-4 rounded-lg hover:bg-blue-200 text-center">
                Dasbor (Link)
              </a>
              <a href="/products" className="block bg-green-100 text-green-800 py-3 px-4 rounded-lg hover:bg-green-200 text-center">
                Produk (Link)
              </a>
              <a href="/suppliers" className="block bg-purple-100 text-purple-800 py-3 px-4 rounded-lg hover:bg-purple-200 text-center">
                Pemasok (Link)
              </a>
              <a href="/reports" className="block bg-orange-100 text-orange-800 py-3 px-4 rounded-lg hover:bg-orange-200 text-center">
                Laporan (Link)
              </a>
              <a href="/settings" className="block bg-gray-100 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-200 text-center">
                Pengaturan (Link)
              </a>
              <a href="/working-test" className="block bg-indigo-100 text-indigo-800 py-3 px-4 rounded-lg hover:bg-indigo-200 text-center">
                Test Kerja (Link)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}