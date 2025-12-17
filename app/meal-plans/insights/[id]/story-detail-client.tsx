'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Clock, Flame, ChefHat, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'

interface StoryDetail {
  id: string
  title: string
  description: string
  content: string
}

export function StoryDetailClient({ storyId }: { storyId: string }) {
  const router = useRouter()
  const [story, setStory] = useState<StoryDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStory = async () => {
      try {
        setLoading(true)
        // Get title and description from URL params
        const urlParams = new URLSearchParams(window.location.search)
        const title = urlParams.get('title') || 'Meal Insight'
        const description = urlParams.get('description') || 'Detailed meal insight'
        
        const response = await fetch(`/api/insights/stories/${storyId}?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch story')
        }

        const data = await response.json()
        setStory(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load story')
      } finally {
        setLoading(false)
      }
    }

    fetchStory()
  }, [storyId])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !story) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error || 'Story not found'}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Insights
        </Button>

        {/* Story content */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {story.title}
            </h1>
            <p className="text-lg text-muted-foreground">
              {story.description}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown>{story.content}</ReactMarkdown>
          </div>
        </motion.article>
      </div>
    </div>
  )
}

