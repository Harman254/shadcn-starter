import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getUserProfileById } from '@/data/getUserProfile';
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await getUserProfileById(session.user.id);
  const account = await prisma.account.findFirst({
    where: { userId: session.user.id },
    select: { isOnboardingComplete: true },
  });
  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }
  return NextResponse.json({ user, isOnboardingComplete: account.isOnboardingComplete });
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { isOnboardingComplete } = await request.json();
  if (typeof isOnboardingComplete !== "boolean") {
    return NextResponse.json({ error: "Missing or invalid isOnboardingComplete" }, { status: 400 });
  }
  const account = await prisma.account.updateMany({
    where: { userId: session.user.id },
    data: { isOnboardingComplete },
  });
  return NextResponse.json({ success: true, isOnboardingComplete });
} 