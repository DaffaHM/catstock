/** @type {import('next').NextConfig} */
const nextConfig = {
  // External packages for server components
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs']
  },
  
  // Optimize for production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  
  // Output configuration - don't use standalone for Vercel
  // output: process.env.VERCEL ? undefined : 'standalone',
  
  // Generate unique build ID
  generateBuildId: async () => {
    return 'catstock-build-' + Date.now()
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ]
  },
  
  // Redirects for better UX
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false
      }
    ]
  },
  
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  
  // Image optimization
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif']
  }
}

module.exports = nextConfig