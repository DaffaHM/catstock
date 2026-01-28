const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create owner user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const owner = await prisma.user.upsert({
    where: { email: 'owner@catstock.com' },
    update: {},
    create: {
      email: 'owner@catstock.com',
      name: 'Store Owner',
      passwordHash: hashedPassword,
    },
  })

  console.log('✅ Created owner user:', owner.email)

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

  // Create sample product categories and products
  const products = await Promise.all([
    // Cat Tembok
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
      where: { sku: 'CT-003' },
      update: {},
      create: {
        sku: 'CT-003',
        brand: 'Avian',
        name: 'Avitex Interior',
        category: 'Cat Tembok',
        size: '1L',
        unit: 'Kaleng',
        purchasePrice: 45000,
        sellingPrice: 65000,
        minimumStock: 15,
      },
    }),

    // Cat Kayu
    prisma.product.upsert({
      where: { sku: 'CK-001' },
      update: {},
      create: {
        sku: 'CK-001',
        brand: 'Biovarnish',
        name: 'Wood Stain Natural',
        category: 'Cat Kayu',
        size: '1L',
        unit: 'Kaleng',
        purchasePrice: 75000,
        sellingPrice: 105000,
        minimumStock: 12,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'CK-002' },
      update: {},
      create: {
        sku: 'CK-002',
        brand: 'Propan',
        name: 'Propan Alkyd Enamel',
        category: 'Cat Kayu',
        size: '1L',
        unit: 'Kaleng',
        purchasePrice: 68000,
        sellingPrice: 95000,
        minimumStock: 10,
      },
    }),

    // Aksesoris
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
    prisma.product.upsert({
      where: { sku: 'AK-002' },
      update: {},
      create: {
        sku: 'AK-002',
        brand: 'Generic',
        name: 'Roller Cat 9 inch',
        category: 'Aksesoris',
        size: '9"',
        unit: 'Pcs',
        purchasePrice: 12000,
        sellingPrice: 22000,
        minimumStock: 20,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'AK-003' },
      update: {},
      create: {
        sku: 'AK-003',
        brand: 'Generic',
        name: 'Thinner A',
        category: 'Aksesoris',
        size: '1L',
        unit: 'Botol',
        purchasePrice: 18000,
        sellingPrice: 28000,
        minimumStock: 15,
      },
    }),
  ])

  console.log('✅ Created products:', products.length)

  // Create initial stock movements for some products
  const initialStockTransactions = []
  
  // Initial stock for CT-001 (Dulux Catylac)
  const stockIn1 = await prisma.stockTransaction.create({
    data: {
      referenceNumber: 'IN-INITIAL-001',
      type: 'IN',
      transactionDate: new Date('2024-01-01'),
      supplierId: suppliers[0].id,
      userId: owner.id,
      notes: 'Initial stock - opening inventory',
      totalValue: 850000, // 10 * 85000
      items: {
        create: {
          productId: products[0].id,
          quantity: 10,
          unitCost: 85000,
        }
      }
    },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  })

  // Create stock movement for the initial stock
  await prisma.stockMovement.create({
    data: {
      productId: products[0].id,
      transactionId: stockIn1.id,
      movementType: 'IN',
      quantityBefore: 0,
      quantityChange: 10,
      quantityAfter: 10,
    }
  })

  initialStockTransactions.push(stockIn1)

  // Initial stock for CT-002 (Nippon Vinilex)
  const stockIn2 = await prisma.stockTransaction.create({
    data: {
      referenceNumber: 'IN-INITIAL-002',
      type: 'IN',
      transactionDate: new Date('2024-01-01'),
      supplierId: suppliers[0].id,
      userId: owner.id,
      notes: 'Initial stock - opening inventory',
      totalValue: 1280000, // 8 * 160000
      items: {
        create: {
          productId: products[1].id,
          quantity: 8,
          unitCost: 160000,
        }
      }
    },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  })

  await prisma.stockMovement.create({
    data: {
      productId: products[1].id,
      transactionId: stockIn2.id,
      movementType: 'IN',
      quantityBefore: 0,
      quantityChange: 8,
      quantityAfter: 8,
    }
  })

  initialStockTransactions.push(stockIn2)

  // Initial stock for accessories
  const stockIn3 = await prisma.stockTransaction.create({
    data: {
      referenceNumber: 'IN-INITIAL-003',
      type: 'IN',
      transactionDate: new Date('2024-01-01'),
      supplierId: suppliers[1].id,
      userId: owner.id,
      notes: 'Initial stock - accessories',
      totalValue: 400000, // (25*8000) + (20*12000)
      items: {
        createMany: {
          data: [
            {
              productId: products[5].id, // Kuas
              quantity: 25,
              unitCost: 8000,
            },
            {
              productId: products[6].id, // Roller
              quantity: 20,
              unitCost: 12000,
            }
          ]
        }
      }
    },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  })

  // Create stock movements for accessories
  await prisma.stockMovement.createMany({
    data: [
      {
        productId: products[5].id,
        transactionId: stockIn3.id,
        movementType: 'IN',
        quantityBefore: 0,
        quantityChange: 25,
        quantityAfter: 25,
      },
      {
        productId: products[6].id,
        transactionId: stockIn3.id,
        movementType: 'IN',
        quantityBefore: 0,
        quantityChange: 20,
        quantityAfter: 20,
      }
    ]
  })

  initialStockTransactions.push(stockIn3)

  console.log('✅ Created initial stock transactions:', initialStockTransactions.length)

  console.log('🎉 Database seed completed successfully!')
  console.log('')
  console.log('📋 Login credentials:')
  console.log('   Email: owner@catstock.com')
  console.log('   Password: admin123')
  console.log('')
  console.log('📊 Sample data created:')
  console.log(`   - ${suppliers.length} suppliers`)
  console.log(`   - ${products.length} products`)
  console.log(`   - ${initialStockTransactions.length} initial stock transactions`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })