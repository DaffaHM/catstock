import { Inter } from 'next/font/google'
import './globals.css'
import ResponsiveLayout from '@/components/layout/ResponsiveLayout'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata = {
  title: 'CatStock - Manajemen Inventori',
  description: 'Sistem manajemen inventori toko cat yang dioptimalkan untuk iPad',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CatStock',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.variable}>
      <head>
        {/* iPad-specific meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CatStock" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        
        {/* Apple touch icons for iPad */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.className} antialiased bg-gray-50 min-h-screen`}>
        <ResponsiveLayout>
          {children}
        </ResponsiveLayout>
      </body>
    </html>
  )
}