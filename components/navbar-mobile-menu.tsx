"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import MobileMenuTrigger from "./mobile-menu";
import { NavbarAuthButtons } from "./navbar-auth-buttons";
import { Pacifico } from "next/font/google";
import { cn } from "@/lib/utils";

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
});

interface Feature {
  title: string;
  description: string;
  href: string;
}

interface NavbarMobileMenuProps {
  features: Feature[];
  isSignedIn: boolean;
  userName?: string | null;
}

export function NavbarMobileMenu({ features, isSignedIn, userName }: NavbarMobileMenuProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const closeSheet = () => {
    setIsSheetOpen(false);
  };

  return (
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
            <NavbarAuthButtons isSignedIn={isSignedIn} userName={userName} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

