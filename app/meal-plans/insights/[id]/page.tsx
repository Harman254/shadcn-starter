import { Suspense } from 'react'
import { headers } from 'next/headers'
import { Loader2 } from 'lucide-react'
import { auth } from '@/lib/auth'
import { StoryDetailClient } from './story-detail-client'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // Revalidate every 5 minutes (stories don't change often)

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

async function StoryDetailContent({ id }: { id: string }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    return <div>Unauthorized</div>
  }

  return <StoryDetailClient storyId={id} />
}

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <Suspense fallback={<LoadingFallback />}>
      <StoryDetailContent id={id} />
    </Suspense>
  )
}

