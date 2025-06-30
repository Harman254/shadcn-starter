'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function getUserProfile() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      Subscription: true,
      Account: true,
    },
  });

  const onboarding = await prisma.onboardingData.findFirst({ where: { userId } });

  return { user, onboarding };
} 