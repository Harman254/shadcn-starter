
import { ThemeProvider } from '@/components/theme-provider';
import Navbar5 from '@/components/Nav';
import Footer2 from '@/components/footer';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';
import { authClient } from '@/lib/auth-client';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function  RootLayout({ children }: RootLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers()
})
if(!session) {
    return <div>Not authenticated</div>
}

  return (
      <html  suppressHydrationWarning={true} lang="en">
        <body >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-white via-cyan-50 to-slate-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-950 transition-colors duration-300">
              <Toaster />
              <Navbar5 />
              <div className="flex-1">{children}</div>
              <Footer2 />
            </div>
          </ThemeProvider>
        </body>
      </html>
  );
}
