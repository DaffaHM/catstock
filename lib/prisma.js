import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.warn('[Prisma] DATABASE_URL not found, using default SQLite database')
  process.env.DATABASE_URL = 'file:./prisma/dev.db'
}

// Create Prisma client with error handling
function createPrismaClient() {
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      errorFormat: 'pretty',
    })
  } catch (error) {
    console.error('[Prisma] Failed to create client:', error)
    throw new Error('Database connection failed. Please check your DATABASE_URL.')
  }
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Test database connection
export async function testDatabaseConnection() {
  try {
    await prisma.$connect()
    console.log('[Prisma] Database connection successful')
    return true
  } catch (error) {
    console.error('[Prisma] Database connection failed:', error)
    return false
  }
}