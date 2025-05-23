
import { ThemeProvider } from '@/components/theme-provider';
import Footer2 from '@/components/footer';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';
import { authClient } from '@/lib/auth-client';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import Navbar from '@/components/Navbar';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function  RootLayout({ children }: RootLayoutProps) {


  return (
    <html suppressHydrationWarning lang="en">
    <body suppressHydrationWarning>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {/* Single container for the entire application */}
        <div className="flex min-h-screen flex-col">
          <Navbar />
          {children}
          <Footer2 />
        </div>
        <Toaster />
      </ThemeProvider>
    </body>
  </html>
  );
}
