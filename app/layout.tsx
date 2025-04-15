import "@/styles/globals.css"
import { Metadata } from "next"

import { fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar5 from "@/components/Nav"
import Footer2 from "@/components/footer"



interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable
          )}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="relative flex min-h-screen flex-col">
              <Navbar5 />
              <div className="flex-1">{children}</div>
              <Footer2 />
            </div>
          </ThemeProvider>
        </body>
      </html>
    </>
  )
}
