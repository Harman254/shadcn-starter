import "@/styles/globals.css"
import { Metadata } from "next"

import { fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar5 from "@/components/Nav"
import Footer2 from "@/components/footer"
import ClerkPRovider from "@/lib/clerk"
import { Toaster } from "react-hot-toast"



interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" >
        <head />
        <body
        suppressHydrationWarning={true}
         
        >
        <ClerkPRovider >  
        
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-white via-cyan-50 to-slate-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-950 transition-colors duration-300">
              <Toaster />
              <Navbar5 />
              <div className="flex-1 ">{children}</div>
              <Footer2 />
            </div>
          </ThemeProvider>
        </ClerkPRovider>

        </body>
      </html>
    </>
  )
}
