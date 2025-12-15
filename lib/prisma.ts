
// import { PrismaClient } from '@prisma/client'
// const globalForPrisma = global as unknown as { prisma: PrismaClient };

// export const prisma =
//   globalForPrisma.prisma || new PrismaClient();

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;




import { PrismaClient } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    errorFormat: 'pretty',
    // For Prisma 6.6.0, DATABASE_URL is read from schema.prisma datasource block
    // No need to pass datasources here
  })
}

// Helper to check and reconnect if needed
export async function ensurePrismaConnection() {
  try {
    await prisma.$connect()
    return true
  } catch (error) {
    console.error('[Prisma] Connection check failed:', error)
    // Try to disconnect and reconnect
    try {
      await prisma.$disconnect()
      await prisma.$connect()
      return true
    } catch (reconnectError) {
      console.error('[Prisma] Reconnection failed:', reconnectError)
      return false
    }
  }
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

// Helper function to check if error is a connection error
export function isDatabaseConnectionError(error: unknown): boolean {
  if (error instanceof PrismaClientKnownRequestError) {
    // P1001: Can't reach database server
    // P1002: Database connection timeout
    // P1003: Database does not exist
    return error.code === 'P1001' || error.code === 'P1002' || error.code === 'P1003'
  }
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    const errorString = JSON.stringify(error).toLowerCase()
    return (
      message.includes("can't reach database server") ||
      message.includes('database connection') ||
      message.includes('connection timeout') ||
      message.includes('connection closed') ||
      message.includes('postgresql connection') ||
      message.includes('p1001') ||
      message.includes('p1002') ||
      message.includes('p1003') ||
      errorString.includes('kind: closed') ||
      errorString.includes('connection closed') ||
      errorString.includes('error in postgresql connection')
    )
  }
  // Check for nested errors (Better Auth wraps Prisma errors)
  if (error && typeof error === 'object') {
    const errorStr = JSON.stringify(error).toLowerCase()
    return (
      errorStr.includes('p1001') ||
      errorStr.includes('p1002') ||
      errorStr.includes('p1003') ||
      errorStr.includes('kind: closed') ||
      errorStr.includes('connection closed') ||
      errorStr.includes('error in postgresql connection') ||
      errorStr.includes("can't reach database server")
    )
  }
  return false
}

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma