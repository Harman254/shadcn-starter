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
import { ThemeToggle } from "./theme-toggle";

// Client components to handle interactive elements
import MobileMenuTrigger from "./mobile-menu";
import NavMenuTriggerClient from "./nav-menu";
import { useSession } from "@/lib/auth-client";
import SignOut from "./auth/sign-out";

interface Feature {
  title: string;
  description: string;
  href: string;
}

const Navbar = () => {
  const session = useSession();
  // Ensure isSignedIn is strictly checking for a valid session with user data
  const isSignedIn = !!(session && session.data && session.data.user);
  const user = session?.data?.user;

  const features: Feature[] = [
    {
      title: "Dashboard",
      description: "Overview of your activity",
      href: "/dashboard",
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
    <div suppressHydrationWarning className="w-full border-b z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2">
            {/* <img
              src="https://shadcnblocks.com/images/block/logos/shadcnblockscom-icon.svg"
              className="max-h-8"
              alt="MealWise Logo"
            /> */}
            <span className="text-lg font-semibold tracking-tighter">Meal<span className="text-green-500 text-lg">Wise</span></span> 
          </Link>

          <ThemeToggle />

          {/* Desktop Nav */}
          <NavigationMenu className="hidden lg:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavMenuTriggerClient>Features</NavMenuTriggerClient>
                <NavigationMenuContent>
                  <div className="grid w-[600px] grid-cols-2 p-3">
                    {features.map((feature, index) => (
                      <NavigationMenuLink 
                        key={index}
                        href={feature.href}
                        className="rounded-md p-3 transition-colors hover:bg-muted/70"
                      >
                        <p className="mb-1 font-semibold text-foreground">{feature.title}</p>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/products">
                  Products
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/resources">
                  Resources
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/contact">
                  Contact
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Desktop Auth Actions */}
          <div className="hidden items-center gap-4 lg:flex">
            {isSignedIn ? (
              <>
                <span className="text-sm">Hi, {user?.name}</span>
                <Button asChild variant="outline">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
                <SignOut />
              </>
            ) : (
              <>
                <Button asChild variant="outline">
                  <Link href="/sign-in">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up">Start for free</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <MobileMenuTrigger />
            <SheetContent side="top" className="max-h-screen overflow-auto">
              <SheetHeader>
                <SheetTitle>
                  <Link href="/" className="flex items-center gap-2">
                    {/* <img
                      src="https://shadcnblocks.com/images/block/logos/shadcnblockscom-icon.svg"
                      className="max-h-8"
                      alt="MealWise Logo"
                    /> */}
                    <span className="text-lg font-semibold tracking-tighter">Meal <span className="text-green-500">Wise</span></span>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col p-4">
                <Accordion type="single" collapsible className="mt-4 mb-2">
                  <AccordionItem value="solutions" className="border-none">
                    <AccordionTrigger className="text-base hover:no-underline">
                      Features
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid md:grid-cols-2">
                        {features.map((feature, index) => (
                          <Link
                            href={feature.href}
                            key={index}
                            className="rounded-md p-3 transition-colors hover:bg-muted/70"
                          >
                            <p className="mb-1 font-semibold text-foreground">{feature.title}</p>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="flex flex-col gap-6">
                  <Link href="/products" className="font-medium">
                    Products
                  </Link>
                  <Link href="/blog" className="font-medium">
                    Blog
                  </Link>
                  <Link href="/dashboard/pricing" className="font-medium">
                    Pricing
                  </Link>
                </div>

                <div className="mt-6 flex flex-col gap-4">
                  {isSignedIn ? (
                    <>
                      <span className="text-sm">Hi, {user?.name}</span>
                      <Button asChild variant="outline">
                        <Link href="/dashboard">Go to Dashboard</Link>
                      </Button>
                      <SignOut />
                    </>
                  ) : (
                    <>
                      <Button asChild variant="outline">
                        <Link href="/sign-in">Sign in</Link>
                      </Button>
                      <Button asChild>
                        <Link href="/sign-up">Start for free</Link>
                      </Button>
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
