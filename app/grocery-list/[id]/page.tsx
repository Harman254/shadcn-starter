import React, { Suspense } from 'react';
import { Metadata } from 'next'
import GroceryListClient from './grocery-list-client';

// Generate metadata for the grocery list page
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Grocery List | MealWise - Smart Shopping for Your Meal Plan`,
    description: `Your personalized grocery list for meal planning. Get organized shopping lists with ingredients, quantities, and smart categorization. Save time and money with MealWise's intelligent grocery planning.`,
    keywords: [
      'grocery list',
      'shopping list',
      'meal planning grocery',
      'ingredient list',
      'smart shopping',
      'grocery planning',
      'meal prep shopping',
      'nutrition shopping',
      'healthy grocery list',
      'organized shopping',
      'grocery management',
      'shopping organization'
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
      canonical: `/grocery-list/${id}`,
    },
    openGraph: {
      title: `Grocery List | MealWise - Smart Shopping for Your Meal Plan`,
      description: `Your personalized grocery list for meal planning. Get organized shopping lists with ingredients, quantities, and smart categorization. Save time and money with MealWise's intelligent grocery planning.`,
      url: `https://www.aimealwise.com/grocery-list/${id}`,
      siteName: 'MealWise',
      images: [
        {
          url: '/og-grocery-list.png',
          width: 1200,
          height: 630,
          alt: 'MealWise Grocery List - Smart Shopping Organization',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Grocery List | MealWise - Smart Shopping for Your Meal Plan`,
      description: `Your personalized grocery list for meal planning. Get organized shopping lists with ingredients, quantities, and smart categorization. Save time and money with MealWise's intelligent grocery planning.`,
      images: ['/og-grocery-list.png'],
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
  };
}

export default async function GroceryListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <GroceryListClient id={id} />
    </Suspense>
  )
}

function LoadingSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  );
}
