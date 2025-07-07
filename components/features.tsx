'use client'

import React, { useState } from "react"
import { DollarSign, MessageSquare, PersonStanding, Timer, Zap, ZoomIn } from "lucide-react"
import { CldImage } from "next-cloudinary"
import { useRouter } from "next/navigation"

const Feature17 = ({
  heading = "Smarter Meal Planning",
  subheading = "Why You'll Love It",
  features = [
    {
      title: "Fast Planning",
      description: "No more stress or dinner dread—get smart plans in seconds instead.",
      icon: <Timer className="w-6 h-6" />,
      image: "https://res.cloudinary.com/dcidanigq/image/upload/v1742111994/samples/food/fish-vegetables.jpg",
      gradient: "from-zinc-500 to-zinc-600",
    },
    {
      title: "Smart Recipes",
      description: "AI picks meals that match your goal—from bulking up to self-control.",
      icon: <Zap className="w-6 h-6" />,
      image: "https://res.cloudinary.com/dcidanigq/image/upload/v1742112003/samples/man-on-a-street.jpg",
      gradient: "from-zinc-400 to-zinc-500",
    },
    {
      title: "Healthy Choices",
      description: "Eat with balance, taste, and flair—our plans are built with expert care.",
      icon: <ZoomIn className="w-6 h-6" />,
      image: "https://res.cloudinary.com/dcidanigq/image/upload/v1742111996/samples/food/spices.jpg",
      gradient: "from-zinc-600 to-zinc-700",
    },
    {
      title: "For Everyone",
      description: "Solo, family, fit, or new—we've got the perfect plan for you.",
      icon: <PersonStanding className="w-6 h-6" />,
      image: "https://res.cloudinary.com/dcidanigq/image/upload/v1742111996/samples/imagecon-group.jpg",
      gradient: "from-zinc-500 to-zinc-600",
    },
    {
      title: "Budget Friendly",
      description: "Stick to meals that save you cash—without dull food or boring hash.",
      icon: <DollarSign className="w-6 h-6" />,
      image: "https://res.cloudinary.com/dcidanigq/image/upload/v1742111999/samples/two-ladies.jpg",
      gradient: "from-zinc-400 to-zinc-500",
    },
    {
      title: "Live Support",
      description: "Questions? Feedback? Hit us fast—our friendly help is built to last.",
      icon: <MessageSquare className="w-6 h-6" />,
      image: "https://res.cloudinary.com/dcidanigq/image/upload/v1742111994/samples/people/kitchen-bar.jpg",
      gradient: "from-zinc-600 to-zinc-700",
    },
  ],
}) => {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set([...prev, index]))
  }
  const router = useRouter()

  return (
    <section className="py-24 dark:bg-zinc-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-zinc-800/50 border border-green-500 text-zinc-300 text-sm font-medium mb-6 backdrop-blur-sm">
            {subheading}
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {heading}
          </h2>
          
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Discover what makes our AI-powered plans the easiest way to eat well, save time, and stay on track.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-zinc-900/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl hover:shadow-zinc-800/50 transition-all duration-500 hover:-translate-y-2 border border-zinc-800/50 hover:border-zinc-700/50"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <CldImage
                  width={400}
                  height={192}
                  src={feature.image}
                  alt={feature.title}
                  quality="auto:best"
                  dpr={2}
                  crop="fill"
                  loading="eager"
                  className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                    loadedImages.has(index) ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => handleImageLoad(index)}
                />
                {/* Loading skeleton */}
                {!loadedImages.has(index) && (
                  <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
                )}
                
                {/* Icon overlay */}
                <div className="absolute top-4 left-4 z-20">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {feature.icon}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 bg-zinc-100 dark:bg-zinc-500">
                <h3 className="text-xl font-semibold tracking-tighter mb-4 group-hover:text-zinc-600 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-zinc-400 leading-relaxed group-hover:text-zinc-400 transition-colors">
                  {feature.description}
                </p>
              </div>

              {/* Subtle accent line */}
              <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.gradient} w-0 group-hover:w-full transition-all duration-500`} />
              
              {/* Hover glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`} />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <button onClick={() => router.push('/meal-plans/new')} className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-zinc-600 to-zinc-700 text-white font-semibold rounded-xl hover:from-zinc-500 hover:to-zinc-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-zinc-700/50 border border-zinc-600/50">
            Start Your Journey Today
          </button>
        </div>
      </div>
    </section>
  )
}

export default Feature17