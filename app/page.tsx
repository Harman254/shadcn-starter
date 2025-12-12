import { Metadata } from 'next'
import Cta10 from "../components/cta";
import Feature17 from "@/components/features";
import Testimonial14 from "@/components/testimonials";
// import  { Hero1 } from "@/components/hero";
import CTA from "../components/cta";
import HeroGeometric from '@/components/hero';
import Footer from '@/components/footer';
import { Companies } from '@/components/socialproof';
import VideoPlayer from '@/components/magicui/hero-video-dialog';
import  Pricing4  from '@/components/prices'
import TestimonialsCarousel from '@/components/testimonials';
import Faq2 from '@/components/FAQ';
import AboutUs1 from '@/components/about';


export const metadata: Metadata = {
  title: 'Personalized AI Meal Plans for Your Lifestyle',
  description: 'Transform your eating habits with MealWise. Get personalized AI meal plans tailored to your lifestyle, goals, and preferences. Save time, eat healthier, and enjoy delicious meals with smart grocery lists and expert nutrition guidance.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Personalized AI Meal Plans for Your Lifestyle | MealWise',
    description: 'Transform your eating habits with MealWise. Get personalized AI meal plans tailored to your lifestyle, goals, and preferences.',
    url: 'https://www.aimealwise.com',
    images: [
      {
        url: '/og-home.png',
        width: 1200,
        height: 630,
        alt: 'MealWise - AI-Powered Personalized Meal Planning Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Personalized AI Meal Plans for Your Lifestyle | MealWise',
    description: 'Transform your eating habits with MealWise. Get personalized AI meal plans tailored to your lifestyle, goals, and preferences.',
    images: ['/og-home.png'],
  },
}

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function IndexPage() {
  // Check if user is authenticated
  let session;
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    console.error("DEBUG: auth.api.getSession failed:", error);
    // Continue without session or rethrow depending on desired behavior.
    // For debugging, we logging it is enough, but we need session for logic.
    // If it fails, session is undefined, which falls through to landing page.
  }

  // If user is logged in, redirect to chat page (default page)
  if (session?.user?.id) {
    redirect('/chat');
  }

  // If not authenticated, show landing page
  const image = {
    src: "/image01.jpg",
    alt: "Hero section demo image showing interface components",
  };

 
  return (
    <>
    {/* JSON-LD Structured Data */}
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'MealWise',
          applicationCategory: 'HealthApplication',
          operatingSystem: 'Any',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '12050',
          },
          description: 'AI-powered meal planning app that creates personalized nutrition plans, grocery lists, and recipes tailored to your lifestyle.',
          sameAs: [
            "https://twitter.com/mealwise",
            "https://www.facebook.com/mealwise",
            "https://www.instagram.com/mealwise"
          ]
        }),
      }}
    />

    {/* <Hero1 heading="Personalized AI Meal Plans for Your Lifestyle" image={image} description='this is all you need' /> */}
<HeroGeometric />
<VideoPlayer  videoSrc="https://www.loom.com/embed/7ad81c7ce2444cefbbdccb21eb0a273e?sid=70cb2568-f0ec-438f-922b-9f8c694489c3"
            thumbnailSrc="https://res.cloudinary.com/dcidanigq/image/upload/v1752343768/k4vvn7s6jzqhqmj1dr2o.png" />

<Companies />

    <Feature17 />
    <AboutUs1 />
    <TestimonialsCarousel />
    <Pricing4 />
    
    <CTA />
    <Faq2 />
    <Footer />
    

    
    
    
    </>
    
    
  )
}
