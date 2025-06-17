import { Metadata } from 'next'
import  Pricing4  from '@/components/prices'
import React from 'react'

export const metadata: Metadata = {
  title: 'Pricing Plans | MealWise - Choose Your Perfect Meal Planning Package',
  description: 'Explore MealWise pricing plans designed for every lifestyle. From free starter plans to premium features with AI-powered meal planning, grocery lists, and nutrition tracking. Start your healthy eating journey today.',
  keywords: [
    'meal planning pricing',
    'meal planning plans',
    'nutrition app pricing',
    'meal prep subscription',
    'healthy eating plans',
    'diet planning cost',
    'meal planning packages',
    'nutrition tracking pricing',
    'AI meal planning cost',
    'grocery list app pricing',
    'meal planning subscription',
    'healthy eating subscription'
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
    canonical: '/dashboard/pricing',
  },
  openGraph: {
    title: 'Pricing Plans | MealWise - Choose Your Perfect Meal Planning Package',
    description: 'Explore MealWise pricing plans designed for every lifestyle. From free starter plans to premium features with AI-powered meal planning, grocery lists, and nutrition tracking. Start your healthy eating journey today.',
    url: 'https://www.aimealwise.com/dashboard/pricing',
    siteName: 'MealWise',
    images: [
      {
        url: '/og-pricing.png',
        width: 1200,
        height: 630,
        alt: 'MealWise Pricing Plans - Choose Your Perfect Package',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing Plans | MealWise - Choose Your Perfect Meal Planning Package',
    description: 'Explore MealWise pricing plans designed for every lifestyle. From free starter plans to premium features with AI-powered meal planning, grocery lists, and nutrition tracking. Start your healthy eating journey today.',
    images: ['/og-pricing.png'],
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

const Pricing = () => {
  return (
    <>
    <Pricing4 />
      
    </>
  )
}

export default Pricing
