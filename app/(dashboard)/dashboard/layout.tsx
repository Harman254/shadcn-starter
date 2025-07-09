import Link from "next/link"
import { DashboardLinks } from "../dashboard-links"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { getMealsByUserId } from "@/data"
import { Toaster } from "@/components/ui/sonner"
import type { ReactNode } from "react"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UserDropdown } from "@/components/user-dropdown"
import Footer from "@/components/footer"
import { Pacifico } from "next/font/google"
import { cn } from "@/lib/utils"

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
})

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/")
  }

  const user = session.user
  const meals = await getMealsByUserId(user.id)

  return (
    <div className="grid h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-background/95 md:block">
        <div className="flex flex-col h-full">
          {/* Desktop Header */}
          <div className="h-14 flex items-center border-b px-4 lg:h-[60px] lg:px-6 shrink-0">
            <Link href="/" className="flex items-center gap-2">
            <span
                className={cn(
                  "bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-black/90 to-rose-500 dark:from-indigo-300 dark:via-white/90 dark:to-rose-300 ",
                  pacifico.className,
                )}
              >Mealwise
                </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="flex-1 flex flex-col min-h-0">
            <nav className="flex-1 overflow-y-auto px-2 lg:px-4 py-2">
              <div className="flex flex-col gap-1 text-sm font-medium">
                <DashboardLinks />
              </div>
            </nav>
            
            {/* Desktop UserDropdown - Fixed at bottom */}
            <div className="border-t p-3 lg:p-4 bg-background/95 shrink-0">
              <UserDropdown user={user} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col min-h-0 w-full">
        {/* Mobile Header */}
        <header className="flex h-14 items-center gap-4 border-none bg-background/95 px-4 lg:h-[60px] lg:px-6 shrink-0 md:justify-end">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="md:hidden bg-transparent border-muted-foreground/20 hover:bg-accent"
              >
                <Menu className="size-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 w-[280px] sm:w-[320px]">
              {/* Mobile Sheet Header */}
              <div className="h-14 flex items-center border-b px-4 shrink-0">
                <SheetTitle className="text-left">
                  <Link href="/" className="flex items-center gap-2">
                  <span
                className={cn(
                  "bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-black/90 to-rose-500 dark:from-indigo-300 dark:via-white/90 dark:to-rose-300 ",
                  pacifico.className,
                )}
              >Mealwise
                </span>
                  </Link>
                </SheetTitle>
              </div>
              
              {/* Mobile Navigation */}
              <div className="flex-1 flex flex-col min-h-0">
                <nav className="flex-1 overflow-y-auto px-3 py-4">
                  <div className="flex flex-col gap-2 text-sm font-medium">
                    <DashboardLinks />
                  </div>
                </nav>
                
                {/* Mobile UserDropdown - Fixed at bottom */}
                <div className="border-t p-4 bg-background/95 shrink-0">
                  <UserDropdown user={user} />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop UserDropdown in header (optional alternative positioning) */}
          <div className="hidden md:flex md:ml-auto">
            {/* You can optionally add a secondary UserDropdown here for desktop header */}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="h-full border-none">
            {children}
          </div>
        </main>
      </div>

      {/* Toast Notifications */}
      <Toaster 
        richColors 
        closeButton 
        theme="light" 
        position="bottom-right"
        className="md:mr-4"
      />

    </div>
  )
}