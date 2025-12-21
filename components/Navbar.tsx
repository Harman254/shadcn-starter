import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import ThemeToggle from "./theme-toggle";
import NavMenuTriggerClient from "./nav-menu";
import { NavbarAuthButtons } from "./navbar-auth-buttons";
import { NavbarMobileMenu } from "./navbar-mobile-menu";
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
});

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

export default async function Navbar() {
  // Fetch session server-side
  // Handle static generation gracefully - don't throw if headers() is unavailable
  let session = null;
  try {
    // Check if we're in a request context (not static generation)
    // During static generation, headers() will throw, so we catch and continue
    const headersList = await headers();
    session = await auth.api.getSession({
      headers: headersList,
    });
  } catch (error: any) {
    // During static generation, headers() throws DYNAMIC_SERVER_USAGE error
    // This is expected and we should gracefully handle it silently
    // Don't log this error as it's expected during build time
    if (error?.digest === 'DYNAMIC_SERVER_USAGE' || 
        error?.message?.includes('headers') || 
        error?.message?.includes('rendered statically')) {
      // This is expected during static generation - navbar will render without session
      // Session will be fetched client-side if needed via NavbarAuthButtons
      // Silently continue - no logging needed
      session = null;
    } else {
      // Only log unexpected errors (not static generation errors)
      if (process.env.NODE_ENV === 'development') {
        console.error('[Navbar] Unexpected error fetching session:', error);
      }
      session = null;
    }
  }

  const isSignedIn = !!session?.user;
  const userName = session?.user?.name;

  return (
    <div suppressHydrationWarning className="w-full border-none z-30 dark:bg-[#222222]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2">
            <span
              className={cn(
                "bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-black/90 to-rose-500 dark:from-indigo-300 dark:via-white/90 dark:to-rose-300 ",
                pacifico.className,
              )}
            >
              Mealwise
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
            <NavbarAuthButtons isSignedIn={isSignedIn} userName={userName} />
          </div>
          {/* Mobile Menu */}
          <NavbarMobileMenu features={features} isSignedIn={isSignedIn} userName={userName} />
        </nav>
      </div>
    </div>
  );
}
