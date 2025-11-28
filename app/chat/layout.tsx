import Link from "next/link";
import { DashboardLinks } from "../(dashboard)/dashboard-links";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { ReactNode } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserDropdown } from "@/components/user-dropdown";

import { Pacifico } from "next/font/google"
import { cn } from "@/lib/utils";

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
})

export default async function ChatLayout({
  children,
}: {
  children: ReactNode;
}) {
  let session;
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    // Handle database connection errors gracefully
    console.error('[ChatLayout] Error fetching session:', error);
    if (process.env.NODE_ENV === 'development') {
      if (error instanceof Error) {
        console.error('[ChatLayout] Session error details:', {
          message: error.message,
          stack: error.stack,
        });
      }
    }
    // If database is unavailable, redirect to home
    // This prevents the app from crashing
    redirect("/");
  }

  if (!session) {
    redirect("/");
  }
  
  return (
    <div className="h-full w-full">
      {children}
      <Toaster 
        richColors 
        closeButton 
        theme="light" 
        position="bottom-right"
        className="md:mr-4"
      />
    </div>
  );
}
