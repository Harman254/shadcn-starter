'use client';
import React, { useState, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

const testimonials = [
  {
    id: 1,
    text: "This meal planning app has transformed how I eat! I save time, eat healthier, and it's always personalized to my needs. A real game-changer!",
    name: "Jane Doe",
    role: "Home Chef",
    rating: 5,
    initials: "JD"
  },
  {
    id: 2,
    text: "I love how easy it is to stay on track with my fitness goals. The app's AI suggests meal plans that are perfect for my workouts!",
    name: "Mark Smith",
    role: "Fitness Enthusiast",
    rating: 5,
    initials: "MS"
  },
  {
    id: 3,
    text: "As a busy professional, this app saves me so much time. I no longer stress over meal planning, and the shopping list feature is a bonus!",
    name: "Emily White",
    role: "Professional",
    rating: 5,
    initials: "EW"
  },
];

const TestimonialCarousel = () => {
  const [current, setCurrent] = useState(0);
  
  const nextTestimonial = () => {
    setCurrent((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };
  
  const prevTestimonial = () => {
    setCurrent((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };
  
  const goToTestimonial = (index:number) => {
    setCurrent(index);
  };

  // Auto-rotation
  useEffect(() => {
    const timer = setInterval(() => {
      nextTestimonial();
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);

  const router = useRouter();

  return (
    <section className="py-16 md:py-24 bg-background/95 ">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Real stories from real people who we have transformed their meal planning experience
          </p>
        </div>

        {/* Testimonial Card */}
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto mb-8">
          {/* Decorative Quote */}
          <div className="absolute top-4 left-4 text-blue-100 dark:text-gray-700">
            <Quote size={40} />
          </div>
          
          {/* Navigation Arrows */}
          <button 
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button 
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          {/* Testimonial Content */}
          <div className="text-center">
            {/* Avatar */}
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {testimonials[current].initials}
              </div>
            </div>
            
            {/* Rating */}
            <div className="flex justify-center items-center gap-1 mb-6">
              {[...Array(testimonials[current].rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            
            {/* Quote */}
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 italic leading-relaxed">
              {testimonials[current].text}
            </p>
            
            {/* Author */}
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {testimonials[current].name}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {testimonials[current].role}
              </p>
            </div>
          </div>
        </div>

        {/* Indicators */}
        <div className="flex justify-center items-center gap-2 mb-12">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToTestimonial(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === current 
                  ? "bg-blue-500 scale-125" 
                  : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
        
        {/* CTA */}
        <div className="text-center">
          <button onClick={() => router.push('https://whatsapp.com/channel/0029VbAJcIx9RZAQgqWFuu0G')} className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg">
            Join Our Community
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;