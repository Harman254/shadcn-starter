import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('Database connected successfully')
    
    // Test if ContactSubmission table exists by trying to count records
    const count = await prisma.contactSubmission.count()
    console.log(`ContactSubmission table exists with ${count} records`)
    
    // Test if we can query the table
    const submissions = await prisma.contactSubmission.findMany({
      take: 1,
      orderBy: { submittedAt: 'desc' }
    })
    
    return NextResponse.json({ 
      success: true,
      message: 'Database connection successful',
      tableExists: true,
      recordCount: count,
      sampleRecord: submissions[0] || null
    })
  } catch (error) {
    console.error('Database test error:', error)
    
    return NextResponse.json({ 
      success: false,
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500
    })
  } finally {
    await prisma.$disconnect()
  }
} 