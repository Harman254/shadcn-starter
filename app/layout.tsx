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
  title: 'MealWise - AI Meal Planning',
  description: 'Plan your meals, create grocery lists, and manage your diet with ease using AI.',
  manifest: '/manifest.json',
  themeColor: '#6366f1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MealWise',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html suppressHydrationWarning lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MealWise" />
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
          </AuthModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

