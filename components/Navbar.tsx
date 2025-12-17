"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ThemeToggle from "./theme-toggle";

// Client components to handle interactive elements
import MobileMenuTrigger from "./mobile-menu";
import NavMenuTriggerClient from "./nav-menu";
import { useAuthModal } from "@/components/AuthModalProvider";
import { useSession } from "@/lib/auth-client";
import { Pacifico } from "next/font/google";
import { cn } from "@/lib/utils";

interface Feature {
  title: string;
  description: string;
  href: string;
}

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
})

const Navbar = () => {
  const { open } = useAuthModal();
  const { data: session } = useSession();
  // Use session?.user for auth checks
  const isSignedIn = !!session?.user;
  const user = session?.user;
  
  // State to control sheet open/closed
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Function to close the sheet
  const closeSheet = () => {
    setIsSheetOpen(false);
  };

  const features: Feature[] = [
    {
      title: "Dashboard",
      description: "Overview of your activity",
      href: "/dashboard",
    },
    {
      title: "Chat",
      description: "AI-powered chat assistant",
      href: "/chat",
    },
    {
      title: "Recipes",
      description: "Your saved recipes collection",
      href: "/recipes",
    },
    {
      title: "Analytics",
      description: "Track Meal Plans, Recipes, and progress",
      href: "/dashboard/analytics",
    },
    {
      title: "Settings",
      description: "Configure your preferences",
      href: "/dashboard/preferences",
    },
    {
      title: "Support",
      description: "Get help when needed",
      href: "/contact",
    },
  ];

  return (
    <div suppressHydrationWarning className="w-full border-none z-30 dark:bg-[#222222]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2">
            {/* <img
              src="https://shadcnblocks.com/images/block/logos/shadcnblockscom-icon.svg"
              className="max-h-8"
              alt="MealWise Logo"
            /> */}
           <span
                className={cn(
                  "bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-black/90 to-rose-500 dark:from-indigo-300 dark:via-white/90 dark:to-rose-300 ",
                  pacifico.className,
                )}
              >Mealwise
                </span>
          </Link>

          <ThemeToggle />
          {/* Desktop Nav */}
          <NavigationMenu className="hidden lg:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavMenuTriggerClient>Features</NavMenuTriggerClient>
                <NavigationMenuContent>
                  <div className="grid w-[600px] grid-cols-2 p-3 dark:bg-[#222222] dark:border-[#1DCD9F] rounded-lg">
                    {features.map((feature, index) => (
                      <NavigationMenuLink 
                        key={index}
                        href={feature.href}
                        className="rounded-md p-3 transition-colors hover:bg-[#EAEFEF] dark:hover:bg-[#1DCD9F]/10 text-[#333446] dark:text-[#1DCD9F] hover:text-[#1DCD9F] dark:hover:text-[#1DCD9F]"
                      >
                        <p className="mb-1 font-semibold text-[#333446] dark:text-[#EAEFEF]">{feature.title}</p>
                        <p className="text-sm text-[#7F8CAA] dark:text-[#B8CFCE]">{feature.description}</p>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className="px-4 py-2 rounded-md text-[#333446] dark:text-[#1DCD9F] hover:bg-[#EAEFEF] dark:hover:bg-[#1DCD9F]/10 hover:text-[#1DCD9F] dark:hover:text-[#1DCD9F] transition-colors" href="/chat">
                  Chat
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className="px-4 py-2 rounded-md text-[#333446] dark:text-[#1DCD9F] hover:bg-[#EAEFEF] dark:hover:bg-[#1DCD9F]/10 hover:text-[#1DCD9F] dark:hover:text-[#1DCD9F] transition-colors" href="/products">
                  Products
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className="px-4 py-2 rounded-md text-[#333446] dark:text-[#1DCD9F] hover:bg-[#EAEFEF] dark:hover:bg-[#1DCD9F]/10 hover:text-[#1DCD9F] dark:hover:text-[#1DCD9F] transition-colors" href="/resources">
                  Resources
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className="px-4 py-2 rounded-md text-[#333446] dark:text-[#1DCD9F] hover:bg-[#EAEFEF] dark:hover:bg-[#1DCD9F]/10 hover:text-[#1DCD9F] dark:hover:text-[#1DCD9F] transition-colors" href="/contact">
                  Contact
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          {/* Desktop Auth Actions */}
          <div className="hidden items-center gap-4 lg:flex">
            {isSignedIn ? (
              <>
                <span className="text-sm text-[#7F8CAA] dark:text-[#B8CFCE]">Hi, {user?.name}</span>
                <Button asChild
                  className="bg-[#1DCD9F] text-[#EAEFEF] dark:bg-[#1DCD9F] dark:text-[#000000] border border-[#169976] dark:border-[#169976] hover:bg-[#169976] hover:text-[#EAEFEF] dark:hover:bg-[#169976] dark:hover:text-[#EAEFEF] transition-colors font-semibold shadow-md"
                >
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <Button className="bg-transparent text-[#333446] dark:bg-[#222222] dark:text-[#EAEFEF] border border-[#B8CFCE] dark:border-[#1DCD9F] hover:bg-[#B8CFCE] dark:hover:bg-[#1DCD9F]/10 hover:text-[#333446] dark:hover:text-[#1DCD9F]" onClick={() => open("sign-in")}>Sign in</Button>
                <Button className="bg-[#7F8CAA] text-[#EAEFEF] dark:bg-[#7F8CAA] dark:text-[#EAEFEF] border border-[#B8CFCE] dark:border-[#1DCD9F] hover:bg-[#333446] dark:hover:bg-[#1DCD9F] hover:text-[#EAEFEF] dark:hover:text-[#EAEFEF]" onClick={() => open("sign-up")}>Start for free</Button>
              </>
            )}
          </div>
          {/* Mobile Menu */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <MobileMenuTrigger />
            </SheetTrigger>
            <SheetContent side="top" className="max-h-screen overflow-auto dark:bg-[#222222] dark:border-b dark:border-[#1DCD9F]">
              <SheetHeader>
                <SheetTitle>
                  <Link href="/" className="flex items-center gap-2" onClick={closeSheet}>
                    <span className={cn("bg-clip-text text-transparent bg-gradient-to-r from-[#333446] via-[#7F8CAA] to-[#B8CFCE] dark:from-indigo-300 dark:via-white/90 dark:to-rose-300", pacifico.className)}>
                      Mealwise
                    </span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col p-4">
                <Accordion type="single" collapsible className="mt-4 mb-2">
                  <AccordionItem value="solutions" className="border-none">
                    <AccordionTrigger className="text-base hover:no-underline text-[#333446] dark:text-[#1DCD9F]">
                      Features
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid md:grid-cols-2">
                        {features.map((feature, index) => (
                          <Link
                            href={feature.href}
                            key={index}
                            className="rounded-md p-3 transition-colors hover:bg-[#EAEFEF] text-[#333446] hover:text-[#1DCD9F] dark:text-[#1DCD9F] dark:hover:bg-[#1DCD9F]/10 dark:hover:text-[#1DCD9F]"
                            onClick={closeSheet}
                          >
                            <p className="mb-1 font-semibold text-[#333446] dark:text-[#EAEFEF]">{feature.title}</p>
                            <p className="text-sm text-[#7F8CAA] dark:text-[#B8CFCE]">{feature.description}</p>
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <div className="flex flex-col gap-6">
                  <Link href="/chat" className="font-medium text-[#333446] dark:text-[#1DCD9F] hover:text-[#1DCD9F] dark:hover:text-[#1DCD9F]" onClick={closeSheet}>
                    Chat
                  </Link>
                  <Link href="/products" className="font-medium text-[#333446] dark:text-[#1DCD9F] hover:text-[#1DCD9F] dark:hover:text-[#1DCD9F]" onClick={closeSheet}>
                    Products
                  </Link>
                  <Link href="/blog" className="font-medium text-[#333446] dark:text-[#1DCD9F] hover:text-[#1DCD9F] dark:hover:text-[#1DCD9F]" onClick={closeSheet}>
                    Blog
                  </Link>
                  <Link href="/careers" className="font-medium text-[#333446] dark:text-[#1DCD9F] hover:text-[#1DCD9F] dark:hover:text-[#1DCD9F]" onClick={closeSheet}>
                    Careers 
                  </Link>
                </div>
                <div className="mt-6 flex flex-col gap-4">
                  {isSignedIn ? (
                    <>
                      <span className="text-sm text-[#7F8CAA] dark:text-[#B8CFCE]">Hi, {user?.name}</span>
                      <Button asChild className="bg-[#7F8CAA] text-[#EAEFEF] border border-[#B8CFCE] hover:bg-[#333446] hover:text-[#EAEFEF] dark:bg-[#1DCD9F] dark:text-[#000000] dark:border-[#1DCD9F] dark:hover:bg-[#169976] dark:hover:text-[#EAEFEF]">
                        <Link href="/dashboard" onClick={closeSheet}>Go to Dashboard</Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button className="bg-transparent text-[#333446] border border-[#B8CFCE] hover:bg-[#B8CFCE] hover:text-[#333446] dark:bg-[#222222] dark:text-[#EAEFEF] dark:border-[#1DCD9F] dark:hover:bg-[#1DCD9F]/10 dark:hover:text-[#1DCD9F]" onClick={() => { closeSheet(); open("sign-in") }}>Sign in</Button>
                      <Button className="bg-[#7F8CAA] text-[#EAEFEF] border border-[#B8CFCE] hover:bg-[#333446] hover:text-[#EAEFEF] dark:bg-[#1DCD9F] dark:text-[#000000] dark:border-[#1DCD9F] dark:hover:bg-[#169976] dark:hover:text-[#EAEFEF]" onClick={() => { closeSheet(); open("sign-up") }}>Start for free</Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
