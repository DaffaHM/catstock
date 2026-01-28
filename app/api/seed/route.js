import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    // Check if this is development or if user explicitly wants to seed
    const { force } = await request.json().catch(() => ({}))
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'owner@catstock.com' }
    })

    if (existingUser && !force) {
      return NextResponse.json({
        success: false,
        message: 'Database already seeded. Use force: true to re-seed.',
        userExists: true
      })
    }

    console.log('🌱 Starting database seed via API...')

    // Create owner user
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const owner = await prisma.user.upsert({
      where: { email: 'owner@catstock.com' },
      update: {
        passwordHash: hashedPassword // Update password if user exists
      },
      create: {
        email: 'owner@catstock.com',
        name: 'Store Owner',
        passwordHash: hashedPassword,
      },
    })

    console.log('✅ Created/updated owner user:', owner.email)

    // Create sample suppliers
    const suppliers = await Promise.all([
      prisma.supplier.upsert({
        where: { id: 'supplier-1' },
        update: {},
        create: {
          id: 'supplier-1',
          name: 'PT Cat Indah',
          contact: 'Jl. Raya No. 123, Jakarta | 021-1234567',
          notes: 'Supplier utama cat tembok dan cat kayu',
        },
      }),
      prisma.supplier.upsert({
        where: { id: 'supplier-2' },
        update: {},
        create: {
          id: 'supplier-2',
          name: 'CV Warna Cerah',
          contact: 'Jl. Industri No. 45, Bandung | 022-9876543',
          notes: 'Supplier cat khusus dan aksesoris',
        },
      }),
    ])

    console.log('✅ Created suppliers:', suppliers.length)

    // Create sample products (abbreviated for API)
    const products = await Promise.all([
      prisma.product.upsert({
        where: { sku: 'CT-001' },
        update: {},
        create: {
          sku: 'CT-001',
          brand: 'Dulux',
          name: 'Catylac Interior',
          category: 'Cat Tembok',
          size: '2.5L',
          unit: 'Kaleng',
          purchasePrice: 85000,
          sellingPrice: 120000,
          minimumStock: 10,
        },
      }),
      prisma.product.upsert({
        where: { sku: 'CT-002' },
        update: {},
        create: {
          sku: 'CT-002',
          brand: 'Nippon Paint',
          name: 'Vinilex Fresh',
          category: 'Cat Tembok',
          size: '5L',
          unit: 'Kaleng',
          purchasePrice: 160000,
          sellingPrice: 220000,
          minimumStock: 8,
        },
      }),
      prisma.product.upsert({
        where: { sku: 'AK-001' },
        update: {},
        create: {
          sku: 'AK-001',
          brand: 'Generic',
          name: 'Kuas Cat 2 inch',
          category: 'Aksesoris',
          size: '2"',
          unit: 'Pcs',
          purchasePrice: 8000,
          sellingPrice: 15000,
          minimumStock: 25,
        },
      }),
    ])

    console.log('✅ Created products:', products.length)

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      data: {
        user: {
          email: owner.email,
          name: owner.name
        },
        suppliers: suppliers.length,
        products: products.length
      },
      credentials: {
        email: 'owner@catstock.com',
        password: 'admin123'
      }
    })

  } catch (error) {
    console.error('❌ Seed failed:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Database seed failed',
      error: error.message
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Check database status
    const userCount = await prisma.user.count()
    const supplierCount = await prisma.supplier.count()
    const productCount = await prisma.product.count()
    
    const user = await prisma.user.findUnique({
      where: { email: 'owner@catstock.com' },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      status: {
        userCount,
        supplierCount,
        productCount,
        ownerUserExists: !!user
      },
      user: user || null,
      needsSeed: userCount === 0
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}