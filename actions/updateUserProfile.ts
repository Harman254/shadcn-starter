'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function updateUserProfile(prevState: any, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' };
  const userId = session.user.id;
  const name = formData.get('name') as string;
  await prisma.user.update({
    where: { id: userId },
    data: { name },
  });
  return { success: true };
} 