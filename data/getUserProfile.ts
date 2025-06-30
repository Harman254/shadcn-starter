import prisma from '@/lib/prisma';

export async function getUserProfileById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { Subscription: true, Account: true },
  });
} 