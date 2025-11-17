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
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
}

export default async function  RootLayout({ children }: RootLayoutProps) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MealWise" />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthModalProvider>
            {/* Single container for the entire application */}
            <div className="flex min-h-screen bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-col">
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
