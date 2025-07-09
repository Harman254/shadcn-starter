import React from 'react'
import { Metadata } from 'next'
import Dashboard from './dashboard'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Dashboard | MealWise - Your Personal Meal Planning Hub',
  description: 'Welcome to your MealWise dashboard. Create meal plans, track your nutrition goals, manage favorite recipes, and view your meal planning analytics all in one place.',
  keywords: [
    'meal planning dashboard',
    'nutrition tracking',
    'meal plans',
    'recipe management',
    'diet planning',
    'healthy eating',
    'meal prep',
    'food planning',
    'nutrition analytics',
    'personal dashboard'
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
    canonical: '/dashboard',
  },
  openGraph: {
    title: 'Dashboard | MealWise - Your Personal Meal Planning Hub',
    description: 'Welcome to your MealWise dashboard. Create meal plans, track your nutrition goals, manage favorite recipes, and view your meal planning analytics all in one place.',
    url: 'https://www.aimealwise.com/dashboard',
    siteName: 'MealWise',
    images: [
      {
        url: '/og-dashboard.png',
        width: 1200,
        height: 630,
        alt: 'MealWise Dashboard - Personal Meal Planning Hub',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dashboard | MealWise - Your Personal Meal Planning Hub',
    description: 'Welcome to your MealWise dashboard. Create meal plans, track your nutrition goals, manage favorite recipes, and view your meal planning analytics all in one place.',
    images: ['/og-dashboard.png'],
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

const DashboardPage = () => {
  return (
    <>
    <Dashboard />
    <Footer/>
    </>

  )
}

export default DashboardPage