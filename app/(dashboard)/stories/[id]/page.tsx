'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import { ArrowLeft, Clock, Flame, Users, ChefHat, Tag, Share2, Calendar, CheckCircle2, Lightbulb, BookOpen, TrendingUp } from 'lucide-react'
import { FEED_ITEMS } from '@/lib/data/feed-data'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function StoryPage() {
  const params = useParams()
  const id = params?.id as string
  
  const item = FEED_ITEMS.find(i => i.id === id)

  if (!item) {
    return notFound()
  }

  const displayImage = item.imageUrl || '/feed-images/salmon-bowl.png'

  return (
    <div className="min-h-screen bg-background pb-20 selection:bg-primary/20">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Hero Section */}
      <div className="relative w-full h-[50vh] md:h-[65vh] overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10" />
        <div className="absolute inset-0 bg-black/20 z-[5]" /> {/* Darken slightly for text readability */}
        <Image
          src={displayImage}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
          priority
        />
        
        {/* Navigation */}
        <div className="absolute top-0 left-0 p-4 md:p-8 z-30 w-full flex justify-between items-center">
            <Link href="/dashboard/insights">
                <Button variant="outline" size="sm" className="gap-2 backdrop-blur-md bg-background/50 border-white/10 hover:bg-background/80 text-foreground transition-all rounded-full h-10 px-4 group/back">
                    <ArrowLeft className="w-4 h-4 group-hover/back:-translate-x-1 transition-transform" />
                    Back to Feed
                </Button>
            </Link>
            <Button variant="outline" size="icon" className="rounded-full bg-background/20 border-white/10 backdrop-blur-md hover:bg-background/40">
                <Share2 className="w-4 h-4 text-white" />
            </Button>
        </div>

        {/* Hero Title Container */}
        <div className="absolute bottom-0 w-full z-20 px-4 md:px-8 pb-12 md:pb-16 max-w-7xl mx-auto">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-3xl"
            >
                <div className="flex flex-wrap gap-3 mb-4 md:mb-6">
                    {item.metadata.cuisine && (
                        <Badge className="gap-1.5 px-3 py-1 text-sm bg-primary/90 hover:bg-primary backdrop-blur-sm border-0">
                            <ChefHat className="w-3.5 h-3.5" />
                            {item.metadata.cuisine}
                        </Badge>
                    )}
                    <Badge variant="outline" className="gap-1.5 px-3 py-1 text-sm bg-black/40 text-white border-white/20 backdrop-blur-md">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(item.createdAt).toLocaleDateString()}
                    </Badge>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-white mb-4 md:mb-6 drop-shadow-sm leading-[1.1]">
                    {item.title}
                </h1>

                <div className="flex items-center gap-4 text-white/90">
                    <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white/20">
                             {item.author.name.substring(0,2)}
                        </div>
                        <span className="text-sm font-medium">Curated by {item.author.name}</span>
                    </div>
                </div>
            </motion.div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 z-20 relative">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 lg:gap-16 -mt-8 relative">
            
            {/* Left Column: Main Content */}
            <div className="space-y-10 lg:space-y-12">
                 
                 {/* Quick Stats Banner */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-card rounded-2xl md:rounded-3xl border border-border/50 shadow-lg p-6 md:p-8 flex flex-wrap justify-between gap-6 md:gap-8 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-4 min-w-[140px]">
                        <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Prep Time</p>
                            <p className="text-lg font-bold">{item.metadata.prepTime}</p>
                        </div>
                    </div>
                    <div className="w-px h-12 bg-border hidden sm:block" />
                    <div className="flex items-center gap-4 min-w-[140px]">
                        <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500">
                            <Flame className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Calories</p>
                            <p className="text-lg font-bold">{item.metadata.calories}</p>
                        </div>
                    </div>
                     <div className="w-px h-12 bg-border hidden sm:block" />
                    <div className="flex items-center gap-4 min-w-[140px]">
                        <div className="p-3 rounded-2xl bg-green-500/10 text-green-500">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Servings</p>
                            <p className="text-lg font-bold">{item.metadata.servings} ppl</p>
                        </div>
                    </div>
                </motion.div>

                {/* The Story */}
                <motion.section 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="prose prose-lg md:prose-xl dark:prose-invert max-w-none"
                >
                    <h2 className="text-3xl font-bold tracking-tight mb-6 flex items-center gap-3">
                        <BookOpen className="w-6 h-6 text-yellow-500" />
                        The Story
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                        {item.details?.story || item.description}
                    </p>
                </motion.section>

                {/* Health Benefits */}
                {item.details?.healthBenefits && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/10 rounded-3xl p-8 border border-green-100 dark:border-green-900/50"
                    >
                        <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Why it's good for you
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {item.details.healthBenefits.map((benefit, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                                    <span className="text-foreground/90">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                )}
                 
                 {/* Chef Tips */}
                 {item.details?.chefTips && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                         className="bg-card rounded-3xl p-8 border border-border/50 shadow-sm"
                    >
                         <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <ChefHat className="w-5 h-5 text-primary" />
                            Chef's Secret
                        </h3>
                         <div className="flex gap-5">
                            <div className="w-1 bg-primary/30 rounded-full" />
                            <p className="text-lg text-muted-foreground italic font-medium">
                                "{item.details.chefTips}"
                            </p>
                        </div>
                    </motion.section>
                 )}
            </div>

            {/* Right Column: Sidebar (Sticky) */}
            <div className="space-y-8 lg:sticky lg:top-8 h-fit">
                
                {/* Fun Fact Card */}
                {item.details?.funFact && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-1 shadow-lg text-white"
                    >
                        <div className="bg-white/10 backdrop-blur-sm rounded-[20px] p-6 h-full">
                            <div className="flex items-center gap-2 mb-3">
                                <Lightbulb className="w-5 h-5 text-yellow-300" />
                                <h3 className="font-bold text-sm uppercase tracking-widest opacity-90">Did you know?</h3>
                            </div>
                            <p className="font-medium text-lg leading-relaxed">
                                {item.details.funFact}
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* More Insights CTA */}
                <div className="bg-card rounded-3xl p-6 border border-border overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                    
                    <h3 className="text-lg font-bold mb-2">Want personal insights?</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                        See how your meal choices align with your health goals in your personal analytics dashboard.
                    </p>
                    <Link href="/dashboard/analytics" className="block w-full">
                        <Button className="w-full gap-2 shadow-md">
                            <TrendingUp className="w-4 h-4" />
                            View My Analytics
                        </Button>
                    </Link>
                </div>

                {/* Categories / Tags */}
                <div className="flex flex-wrap gap-2">
                    {item.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="bg-secondary/50 hover:bg-secondary px-3 py-1.5 text-sm">
                            #{tag}
                        </Badge>
                    ))}
                </div>
            </div>

        </div>
      </div>
      
    </div>
  )
}
