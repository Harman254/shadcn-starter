import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';
import Navbar from '@/components/Navbar';
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Footer from '@/components/footer';
import { AuthModalProvider } from '@/components/AuthModalProvider';

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata = {
  title: 'MealWise',
  description: 'Plan your meals, create grocery lists, and manage your diet with ease using AI.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default async function  RootLayout({ children }: RootLayoutProps) {
  return (
    <html suppressHydrationWarning lang="en">
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
        </AuthModalProvider>
      </ThemeProvider>
    </body>
  </html>
  );
}
