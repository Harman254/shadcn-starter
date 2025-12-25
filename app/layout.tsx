import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';
import Navbar from '@/components/Navbar';
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Footer from '@/components/footer';
import { AuthModalProvider } from '@/components/AuthModalProvider';
import PushEngageScript from '@/components/PushEngageScript';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register';
import { Geist, Geist_Mono } from 'next/font/google';

// Geist Sans - Primary font for body text and UI
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

// Geist Mono - For code blocks and monospace text
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata = {
  title: {
    default: 'MealWise - AI-Powered Meal Planning & Nutrition | Smart Food Planning',
    template: '%s | MealWise',
  },
  description: 'Transform your eating habits with MealWise. Get personalized AI meal plans, smart grocery lists, and expert nutrition guidance tailored to your lifestyle, goals, and dietary preferences.',
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
    'family meal planning',
    'AI nutrition',
    'meal planning software',
  ],
  authors: [{ name: 'MealWise Team' }],
  creator: 'MealWise',
  publisher: 'MealWise',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.aimealwise.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://www.aimealwise.com',
    siteName: 'MealWise',
    title: 'MealWise - AI-Powered Meal Planning & Nutrition | Smart Food Planning',
    description: 'Transform your eating habits with MealWise. Get personalized AI meal plans, smart grocery lists, and expert nutrition guidance tailored to your lifestyle.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MealWise - AI-Powered Personalized Meal Planning Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MealWise - AI-Powered Meal Planning & Nutrition',
    description: 'Transform your eating habits with personalized AI meal plans tailored to your lifestyle.',
    images: ['/og-image.png'],
    creator: '@mealwise',
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
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  category: 'health',
}

export const viewport = {
  themeColor: '#6366f1',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

// Force dynamic rendering since Navbar uses headers() for session
// This allows the Navbar to fetch session data on all pages
export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html suppressHydrationWarning lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* JSON-LD Structured Data for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'MealWise',
              url: process.env.NEXT_PUBLIC_APP_URL || 'https://www.aimealwise.com',
              logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.aimealwise.com'}/android-chrome-512x512.png`,
              description: 'AI-powered meal planning app that creates personalized nutrition plans, grocery lists, and recipes tailored to your lifestyle.',
              sameAs: [
                'https://twitter.com/mealwise',
                'https://facebook.com/mealwise',
                'https://instagram.com/mealwise',
              ],
            }),
          }}
        />
        {/* JSON-LD Structured Data for WebApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'MealWise',
              applicationCategory: 'HealthApplication',
              operatingSystem: 'Web, iOS, Android',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '12050',
                bestRating: '5',
                worstRating: '1',
              },
              description: 'AI-powered meal planning app that creates personalized nutrition plans, grocery lists, and recipes tailored to your lifestyle.',
            }),
          }}
        />
      </head>
      <body suppressHydrationWarning className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthModalProvider>
            {/* Single container for the entire application */}
            <div className="flex min-h-screen bg-background flex-col">
              <Navbar />
              {children}
            </div>
            <Toaster />
            <SpeedInsights />
            <Analytics />
            <PushEngageScript />
            <InstallPrompt />
            <ServiceWorkerRegister />
          </AuthModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

