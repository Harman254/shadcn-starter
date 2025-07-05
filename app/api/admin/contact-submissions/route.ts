import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const submissions = await prisma.contactSubmission.findMany({
      orderBy: { submittedAt: 'desc' }
    })
    return NextResponse.json({ submissions })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contact submissions' }, { status: 500 })
  }
} 