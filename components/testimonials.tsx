"use client";

import { Star, Quote } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const testimonials = [
  {
    id: "testimonial-1",
    text: "This meal planning app has transformed how I eat! I save time, eat healthier, and it's always personalized to my needs. A real game-changer!",
    name: "Jane Doe",
    role: "Home Chef",
    avatar: "https://shadcnblocks.com/images/block/avatar-1.webp",
    rating: 5,
  },
  {
    id: "testimonial-2",
    text: "I love how easy it is to stay on track with my fitness goals. The app's AI suggests meal plans that are perfect for my workouts!",
    name: "Mark Smith",
    role: "Fitness Enthusiast",
    avatar: "https://shadcnblocks.com/images/block/avatar-2.webp",
    rating: 5,
  },
  {
    id: "testimonial-3",
    text: "As a busy professional, this app saves me so much time. I no longer stress over meal planning, and the shopping list feature is a bonus!",
    name: "Emily White",
    role: "Professional",
    avatar: "https://shadcnblocks.com/images/block/avatar-3.webp",
    rating: 5,
  },
];

const TestimonialCarousel = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    const updateCurrent = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", updateCurrent);
    return () => {
      api.off("select", updateCurrent);
    };
  }, [api]);

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-b from-background via-background to-muted/20 overflow-hidden">
      <div className="container mx-auto px-4 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 -translate-x-1/2 opacity-10">
          <Quote size={200} strokeWidth={1} className="text-primary rotate-180" />
        </div>
        <div className="absolute bottom-0 right-0 translate-x-1/2 opacity-10">
          <Quote size={200} strokeWidth={1} className="text-primary" />
        </div>
        
        {/* Section header */}
        <div className="text-center mb-12 md:mb-16 relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real stories from real people who've transformed their meal planning experience
          </p>
        </div>

        {/* Testimonial carousel */}
        <div className="relative bg-card shadow-xl rounded-2xl p-6 md:p-10 max-w-5xl mx-auto border border-muted mb-10">
          <Carousel setApi={setApi} className="w-full">
            <CarouselContent>
              {testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id}>
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-8 relative">
                      <Avatar className="size-16 md:size-24 ring-4 ring-background border border-primary/20 shadow-lg">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="flex items-center gap-0.5 mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="size-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    
                    <p className="mb-8 text-lg md:text-xl lg:text-2xl font-medium leading-relaxed italic">
                      &ldquo;{testimonial.text}&rdquo;
                    </p>
                    
                    <div className="mt-2">
                      <p className="text-base font-bold md:text-lg">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-muted-foreground md:text-base">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Carousel navigation */}
        <div className="flex justify-center items-center gap-2">
          {testimonials.map((testimonial, index) => (
            <Button
              key={testimonial.id}
              variant="ghost"
              size="sm"
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "rounded-full h-3 w-3 p-0 transition-all duration-300",
                index === current ? "bg-primary scale-125" : "bg-muted hover:bg-primary/50"
              )}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Call to action */}
        <div className="text-center mt-12 relative z-10">
          <Button size="lg" className="rounded-full px-8 font-medium">
            Join Our Community
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;