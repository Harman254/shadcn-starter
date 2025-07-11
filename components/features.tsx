'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Timer, Zap, ZoomIn, PersonStanding, DollarSign, MessageSquare } from 'lucide-react'
import { CldImage } from 'next-cloudinary'

const features = [
  {
    step: 'Step 1',
    title: 'Fast Meal Planning',
    content:
      'Generate a personalized meal plan in seconds—no more stress or guesswork.',
    icon: <Timer className="h-6 w-6 text-primary" />,
    image:
      'https://res.cloudinary.com/dcidanigq/image/upload/v1742111994/samples/food/fish-vegetables.jpg',
  },
  {
    step: 'Step 2',
    title: 'Smart Recipe Selection',
    content:
      'AI picks meals that match your goals, preferences, and dietary needs.',
    icon: <Zap className="h-6 w-6 text-primary" />,
    image:
      'https://res.cloudinary.com/dcidanigq/image/upload/v1742112003/samples/man-on-a-street.jpg',
  },
  {
    step: 'Step 3',
    title: 'Healthy & Balanced Choices',
    content:
      'Enjoy delicious, nutritious meals designed by experts for balance and taste.',
    icon: <ZoomIn className="h-6 w-6 text-primary" />,
    image:
      'https://res.cloudinary.com/dcidanigq/image/upload/v1742111996/samples/food/spices.jpg',
  },
  {
    step: 'Step 4',
    title: 'Plans for Everyone',
    content:
      'Solo, family, fitness, or special diets—we have the perfect plan for you.',
    icon: <PersonStanding className="h-6 w-6 text-primary" />,
    image:
      'https://res.cloudinary.com/dcidanigq/image/upload/v1742111996/samples/imagecon-group.jpg',
  },
  {
    step: 'Step 5',
    title: 'Budget Friendly',
    content:
      'Stick to your budget with affordable meal options that don’t compromise on taste.',
    icon: <DollarSign className="h-6 w-6 text-primary" />,
    image:
      'https://res.cloudinary.com/dcidanigq/image/upload/v1742111999/samples/two-ladies.jpg',
  },
  {
    step: 'Step 6',
    title: 'Live Support',
    content:
      'Questions or feedback? Our friendly support team is here to help you succeed.',
    icon: <MessageSquare className="h-6 w-6 text-primary" />,
    image:
      'https://res.cloudinary.com/dcidanigq/image/upload/v1742111994/samples/people/kitchen-bar.jpg',
  },
]

export default function FeatureSteps() {
  const [currentFeature, setCurrentFeature] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      if (progress < 100) {
        setProgress((prev) => prev + 100 / (4000 / 100))
      } else {
        setCurrentFeature((prev) => (prev + 1) % features.length)
        setProgress(0)
      }
    }, 100)
    return () => clearInterval(timer)
  }, [progress])

  return (
    <div className={'p-8 md:p-12'}>
      <div className="mx-auto w-full max-w-7xl">
        <div className="relative mx-auto mb-12 max-w-2xl sm:text-center">
          <div className="relative z-10">
            <h2 className="font-geist text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">
              Smarter Meal Planning in Simple Steps
            </h2>
            <p className="font-geist mt-3 text-foreground/60">
              Discover how our AI-powered platform helps you eat well, save time, and stay on track.
            </p>
          </div>
          <div
            className="absolute inset-0 mx-auto h-44 max-w-xs blur-[118px]"
            style={{
              background:
                'linear-gradient(152.92deg, rgba(39, 174, 96, 0.18) 4.54%, rgba(39, 174, 96, 0.22) 34.2%, rgba(39, 174, 96, 0.1) 77.55%)',
            }}
          ></div>
        </div>
        <hr className="mx-auto mb-10 h-px w-1/2 bg-foreground/30" />

        <div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-10">
          <div className="order-2 space-y-8 md:order-1">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-6 md:gap-8"
                initial={{ opacity: 0.3, x: -20 }}
                animate={{
                  opacity: index === currentFeature ? 1 : 0.3,
                  x: 0,
                  scale: index === currentFeature ? 1.05 : 1,
                }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full border-2 md:h-14 md:w-14',
                    index === currentFeature
                      ? 'scale-110 border-primary bg-primary/10 text-primary [box-shadow:0_0_15px_rgba(39,174,96,0.3)]'
                      : 'border-muted-foreground bg-muted',
                  )}
                >
                  {feature.icon}
                </motion.div>

                <div className="flex-1">
                  <h3 className="text-xl font-semibold md:text-2xl">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground md:text-base">
                    {feature.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div
            className={cn(
              'relative order-1 h-[200px] overflow-hidden rounded-xl border border-primary/20 [box-shadow:0_5px_30px_-15px_rgba(39,174,96,0.3)] md:order-2 md:h-[300px] lg:h-[400px]',
            )}
          >
            <AnimatePresence mode="wait">
              {features.map(
                (feature, index) =>
                  index === currentFeature && (
                    <motion.div
                      key={index}
                      className="absolute inset-0 overflow-hidden rounded-lg"
                      initial={{ y: 100, opacity: 0, rotateX: -20 }}
                      animate={{ y: 0, opacity: 1, rotateX: 0 }}
                      exit={{ y: -100, opacity: 0, rotateX: 20 }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                    >
                      <CldImage
                        src={feature.image}
                        alt={feature.title}
                        width={1000}
                        height={500}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                        crop="fill"
                        quality="auto:best"
                        dpr={2}
                        loading="eager"
                      />
                      <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-background via-background/50 to-transparent" />

                      <div className="absolute bottom-4 left-4 rounded-lg bg-background/80 p-2 backdrop-blur-sm">
                        <span className="text-xs font-medium text-primary">
                          {feature.step}
                        </span>
                      </div>
                    </motion.div>
                  ),
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}