"use client";

import { MenuIcon } from "lucide-react";
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
import { useUser } from "@clerk/nextjs";
import { Skeleton } from "./ui/skeleton";

const Navbar5 = () => {
  const { isSignedIn, isLoaded, user } = useUser();

  const features = [
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
      href: "/support",
    },
  ];

  // Show skeleton loading if user data is not loaded or signed in
  if (!isLoaded || !isSignedIn) return <Skeleton />;

  return (
    <section className="py-4">
      <div className="container">
        <nav className="flex items-center justify-between">
          {/* Logo and app name */}
          <a href="/" className="flex items-center gap-2">
            <img
              src="https://shadcnblocks.com/images/block/logos/shadcnblockscom-icon.svg"
              className="max-h-8"
              alt="MealWise Logo"
            />
            <span className="text-lg font-semibold tracking-tighter">MealWise</span>
          </a>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Desktop navigation menu */}
          <NavigationMenu className="hidden lg:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[600px] grid-cols-2 p-3">
                    {features.map((feature, index) => (
                      <NavigationMenuLink
                        href={feature.href}
                        key={index}
                        className="rounded-md p-3 transition-colors hover:bg-muted/70"
                      >
                        <div>
                          <p className="mb-1 font-semibold text-foreground">
                            {feature.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/products"
                  className={navigationMenuTriggerStyle()}
                >
                  Products
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/resources"
                  className={navigationMenuTriggerStyle()}
                >
                  Resources
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/contact"
                  className={navigationMenuTriggerStyle()}
                >
                  Contact
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* User profile and authentication buttons */}
          <div className="hidden items-center gap-4 lg:flex">
            {isLoaded && isSignedIn ? (
              <>
                <span className="text-sm">Hi, {user?.firstName}</span>
                <Button asChild variant="outline">
                  <a href="/dashboard">Go to Dashboard</a>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline">
                  <a href="/sign-in">Sign in</a>
                </Button>
                <Button asChild>
                  <a href="/sign-up">Start for free</a>
                </Button>
              </>
            )}
          </div>

          {/* Mobile navigation menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="icon">
                <MenuIcon className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="max-h-screen overflow-auto">
              <SheetHeader>
                <SheetTitle>
                  <a href="/" className="flex items-center gap-2">
                    <img
                      src="https://shadcnblocks.com/images/block/logos/shadcnblockscom-icon.svg"
                      className="max-h-8"
                      alt="MealWise Logo"
                    />
                    <span className="text-lg font-semibold tracking-tighter">
                      MealWise
                    </span>
                  </a>
                </SheetTitle>
              </SheetHeader>

              {/* Accordion menu for mobile */}
              <div className="flex flex-col p-4">
                <Accordion type="single" collapsible className="mt-4 mb-2">
                  <AccordionItem value="solutions" className="border-none">
                    <AccordionTrigger className="text-base hover:no-underline">
                      Features
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid md:grid-cols-2">
                        {features.map((feature, index) => (
                          <a
                            href={feature.href}
                            key={index}
                            className="rounded-md p-3 transition-colors hover:bg-muted/70"
                          >
                            <div>
                              <p className="mb-1 font-semibold text-foreground">
                                {feature.title}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {feature.description}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Additional links for mobile */}
                <div className="flex flex-col gap-6">
                  <a href="#" className="font-medium">
                    Templates
                  </a>
                  <a href="#" className="font-medium">
                    Blog
                  </a>
                  <a href="#" className="font-medium">
                    Pricing
                  </a>
                </div>

                {/* User profile and authentication buttons for mobile */}
                <div className="mt-6 flex flex-col gap-4">
                  {isLoaded && isSignedIn ? (
                    <>
                      <span className="text-sm">Hi, {user?.firstName}</span>
                      <Button asChild variant="outline">
                        <a href="/dashboard">Go to Dashboard</a>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild variant="outline">
                        <a href="/sign-in">Sign in</a>
                      </Button>
                      <Button asChild>
                        <a href="/sign-up">Start for free</a>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </section>
  );
};

export default Navbar5;
