import React, { Suspense } from 'react'
import { Metadata } from 'next'
import Preferences from './pref'
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Footer from '@/components/footer';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidate every 5 minutes

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading preferences...</p>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Preferences & Settings | MealWise - Customize Your Meal Planning Experience',
  description: 'Personalize your MealWise experience. Update your dietary preferences, nutrition goals, allergies, and account settings. Customize your meal planning journey to match your lifestyle and health objectives.',
  keywords: [
    'meal planning preferences',
    'dietary preferences',
    'nutrition settings',
    'allergy management',
    'diet customization',
    'health goals',
    'meal planning settings',
    'personal nutrition',
    'dietary restrictions',
    'food preferences',
    'account settings',
    'meal planning customization'
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
    canonical: '/dashboard/preferences',
  },
  openGraph: {
    title: 'Preferences & Settings | MealWise - Customize Your Meal Planning Experience',
    description: 'Personalize your MealWise experience. Update your dietary preferences, nutrition goals, allergies, and account settings. Customize your meal planning journey to match your lifestyle and health objectives.',
    url: 'https://www.aimealwise.com/dashboard/preferences',
    siteName: 'MealWise',
    images: [
      {
        url: '/og-preferences.png',
        width: 1200,
        height: 630,
        alt: 'MealWise Preferences & Settings - Customize Your Experience',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Preferences & Settings | MealWise - Customize Your Meal Planning Experience',
    description: 'Personalize your MealWise experience. Update your dietary preferences, nutrition goals, allergies, and account settings. Customize your meal planning journey to match your lifestyle and health objectives.',
    images: ['/og-preferences.png'],
    creator: '@mealwise',
    site: '@mealwise',
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
}

async function PreferencesContent({ userId }: { userId: string }) {
  return <Preferences userId={userId} />
}

const PreferencesPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
});

  if (!session) {
    redirect("/sign-in");
  }
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PreferencesContent userId={session.user.id} />
      <Footer />
    </Suspense>
  )
}

export default PreferencesPage