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


export const metadata: Metadata = {
  title: 'MealWise - Personalized AI Meal Plans for Your Lifestyle | Smart Nutrition Planning',
  description: 'Transform your eating habits with MealWise. Get personalized AI meal plans tailored to your lifestyle, goals, and preferences. Save time, eat healthier, and enjoy delicious meals with smart grocery lists and expert nutrition guidance.',
  keywords: [
    'AI meal planning',
    'personalized meal plans',
    'smart nutrition',
    'meal planning app',
    'healthy eating',
    'diet planning',
    'meal prep',
    'grocery lists',
    'nutrition planning',
    'lifestyle meal plans',
    'smart recipes',
    'budget meal planning',
    'fitness meal plans',
    'family meal planning'
  ],
  authors: [{ name: 'MealWise Team' }],
  creator: 'MealWise',
  publisher: 'MealWise',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.aimealwise.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'MealWise - Personalized AI Meal Plans for Your Lifestyle | Smart Nutrition Planning',
    description: 'Transform your eating habits with MealWise. Get personalized AI meal plans tailored to your lifestyle, goals, and preferences. Save time, eat healthier, and enjoy delicious meals with smart grocery lists and expert nutrition guidance.',
    url: 'https://www.aimealwise.com',
    siteName: 'MealWise',
    images: [
      {
        url: '/og-home.png',
        width: 1200,
        height: 630,
        alt: 'MealWise - AI-Powered Personalized Meal Planning Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MealWise - Personalized AI Meal Plans for Your Lifestyle | Smart Nutrition Planning',
    description: 'Transform your eating habits with MealWise. Get personalized AI meal plans tailored to your lifestyle, goals, and preferences. Save time, eat healthier, and enjoy delicious meals with smart grocery lists and expert nutrition guidance.',
    images: ['/og-home.png'],
    creator: '@mealwise',
    site: '@mealwise',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
}

export default async function IndexPage() {
  const image = {
    src: "/image01.jpg",
    alt: "Hero section demo image showing interface components",
  };

 
  return (
    <>
    {/* <Hero1 heading="Personalized AI Meal Plans for Your Lifestyle" image={image} description='this is all you need' /> */}
<HeroGeometric />
<VideoPlayer title="Hero Video" src="https://res.cloudinary.com/dcidanigq/video/upload/v1742111998/samples/dance-2.mp4"
            thumbnail="https://res.cloudinary.com/dcidanigq/image/upload/v1742112004/cld-sample.jpg" />

<Companies />

    <Feature17 />
    <TestimonialsCarousel />
    <Pricing4 />
    
    <CTA />
    <Faq2 />
    <Footer />
    

    
    
    
    </>
    
    
  )
}
