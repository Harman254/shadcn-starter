'use client';
 
import React, { useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
 
const defaultTestimonials = [
  {
    text: 'Mealwise has made planning meals for my family so easy. I no longer worry about what to cook every day!',
    imageSrc: '/muslimnun.jpg',
    name: 'Faith Njeri',
    username: '@faithfamily',
    role: 'Mom of 3',
  },
  {
    text: 'I save hours every week with Mealwise. The AI-generated plans and local grocery lists are a game changer.',
    imageSrc: '/roma.jpg',
    name: 'Brian Otieno',
    username: '@fitwithbrian',
    role: 'Fitness Coach',
  },
  {
    text: 'As a busy student, Mealwise helps me eat better without thinking too hard. It’s like having a personal chef.',
    imageSrc: '/teacher.jpg',
    name: 'Linet Auma',
    username: '@linetstudies',
    role: 'University Student',
  },
  {
    text: 'The location-based grocery list is brilliant. I can generate my plan and get everything I need from nearby stores.',
    imageSrc: '/fitjack.jpg',
    name: 'Kevin Mwangi',
    username: '@techdadkevin',
    role: 'Software Engineer',
  },
  {
    text: 'Mealwise Pro is worth it. I love tracking my meals and regenerating plans until I find what fits my week.',
    imageSrc: '/roma.jpg',
    name: 'Sarah Wambui',
    username: '@sarahwellness',
    role: 'Wellness Blogger',
  },
  {
    text: 'I’ve tried other meal apps, but Mealwise feels local, smart, and easy to use. Highly recommend it.',
    imageSrc: '/chef.jpg',
    name: 'Dennis Kipkoech',
    username: '@dennykitchen',
    role: 'Home Chef',
  },
];
 
interface TestimonialProps {
  testimonials?: {
    text: string;
    imageSrc: string;
    name: string;
    username: string;
    role?: string;
  }[];
  title?: string;
  subtitle?: string;
  autoplaySpeed?: number;
  className?: string;
}
 
const  TestimonialsCarousel = ({
  testimonials = defaultTestimonials,
  title = 'What our early adopters say',
  subtitle = 'From intuitive design to powerful features, mealwise offers everything you need to stay ahead with your meals.',
  autoplaySpeed = 3000,
  className,
}: TestimonialProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    containScroll: 'trimSnaps',
    dragFree: true,
  });
 
  useEffect(() => {
    if (!emblaApi) return;
 
    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, autoplaySpeed);
 
    return () => {
      clearInterval(autoplay);
    };
  }, [emblaApi, autoplaySpeed]);
 
  const allTestimonials = [...testimonials, ...testimonials];
 
  const accentPalette = [
    {
      from: 'from-cyan-500',
      to: 'to-blue-400',
      icon: 'text-cyan-500',
      border: 'border-cyan-400',
      ring: 'ring-cyan-200',
      name: 'text-cyan-700',
      username: 'text-cyan-600',
    },
    {
      from: 'from-pink-500',
      to: 'to-rose-400',
      icon: 'text-pink-500',
      border: 'border-pink-400',
      ring: 'ring-pink-200',
      name: 'text-pink-700',
      username: 'text-pink-600',
    },
    {
      from: 'from-amber-400',
      to: 'to-yellow-300',
      icon: 'text-amber-400',
      border: 'border-amber-300',
      ring: 'ring-amber-200',
      name: 'text-amber-700',
      username: 'text-amber-600',
    },
    {
      from: 'from-emerald-400',
      to: 'to-green-300',
      icon: 'text-emerald-500',
      border: 'border-emerald-400',
      ring: 'ring-emerald-200',
      name: 'text-emerald-700',
      username: 'text-emerald-600',
    },
    {
      from: 'from-purple-500',
      to: 'to-fuchsia-400',
      icon: 'text-purple-500',
      border: 'border-purple-400',
      ring: 'ring-purple-200',
      name: 'text-purple-700',
      username: 'text-purple-600',
    },
    {
      from: 'from-orange-400',
      to: 'to-amber-300',
      icon: 'text-orange-400',
      border: 'border-orange-300',
      ring: 'ring-orange-200',
      name: 'text-orange-700',
      username: 'text-orange-600',
    },
  ];
 
  return (
    <section
      className={cn('relative overflow-hidden py-16 md:py-24', className)}
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.2),transparent_60%)]" />
        <div className="absolute left-1/4 top-1/4 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-0 bg-[length:20px_20px] bg-grid-foreground/[0.02]" />
      </div>
 
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative mb-12 text-center md:mb-16"
        >
          <h1 className="mb-4 bg-gradient-to-b from-foreground to-foreground/40 bg-clip-text text-3xl font-bold text-transparent md:text-5xl lg:text-6xl">
            {title}
          </h1>
 
          <motion.p
            className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            {subtitle}
          </motion.p>
        </motion.div>
 
        {/* Testimonials carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {allTestimonials.map((testimonial, index) => {
              const accent = accentPalette[index % accentPalette.length];
              return (
                <div
                  key={`${testimonial.name}-${index}`}
                  className="flex justify-center px-4"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  className={`relative h-full w-fit rounded-2xl border-2 ${accent.border} bg-gradient-to-b ${accent.from} ${accent.to} p-6 shadow-lg backdrop-blur-sm`}
                  >
                    {/* Enhanced decorative gradients */}
                   <div className={`absolute -left-5 -top-5 -z-10 h-40 w-40 rounded-full bg-gradient-to-b ${accent.from} ${accent.to} opacity-30 blur-md`} />
                   <div className={`absolute -bottom-10 -right-10 -z-10 h-32 w-32 rounded-full bg-gradient-to-t ${accent.from} to-transparent opacity-20 blur-xl`} />

                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                      viewport={{ once: true }}
                     className={`mb-4 ${accent.icon}`}
                    >
                      <div className="relative">
                        <Quote className="h-10 w-10 -rotate-180" />
                      </div>
                    </motion.div>

                    <motion.p
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
                      viewport={{ once: true }}
                     className="relative mb-6 text-base leading-relaxed text-white drop-shadow-sm"
                    >
                      <span className="relative">{testimonial.text}</span>
                    </motion.p>

                    {/* Enhanced user info with animation */}
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
                      viewport={{ once: true }}
                     className={`mt-auto flex items-center gap-3 border-t ${accent.border} pt-2`}
                    >
                      <Avatar className={`h-10 w-10 border-2 ${accent.border} ${accent.ring} ring-2 ring-offset-1 ring-offset-background`}>
                        <AvatarImage
                          src={testimonial.imageSrc}
                          alt={testimonial.name}
                        />
                        <AvatarFallback>
                          {testimonial.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                       <h4 className={`whitespace-nowrap font-bold ${accent.name}`}>
                          {testimonial.name}
                        </h4>
                        <div className="flex items-center gap-2">
                         <p className={`whitespace-nowrap text-sm font-semibold ${accent.username}`}>
                            {testimonial.username}
                          </p>
                          {testimonial.role && (
                            <>
                              <span className="flex-shrink-0 text-white/60">
                                •
                              </span>
                             <p className="whitespace-nowrap text-sm text-white/80 font-medium">
                               {testimonial.role}
                             </p>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
 
export default TestimonialsCarousel