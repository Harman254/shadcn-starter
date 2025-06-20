import Link from "next/link";
import { DashboardLinks } from "../(dashboard)/dashboard-links";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, } from "lucide-react";

import { getMealsByUserId } from "@/data";
import { Toaster } from "@/components/ui/sonner";
import { ReactNode } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function MealLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
  });

  if (!session) {
    redirect("/sign-in");
  }
  const user = session.user;

  const meals = await getMealsByUserId(user.id);

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <div className="hidden border-r bg-background/95 md:block">
        <div className="flex flex-col max-h-screen h-full gap-2">
          <div className="h-14 flex items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-semibold tracking-tighter">
                Meal<span className="text-green-500 text-2xl">Wise</span>
              </span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <DashboardLinks />
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content - Removed duplicate background gradient */}
      <div className="relative w-full flex min-h-screen flex-col">
        <header className="flex h-14 items-center gap-4 bg-background/95 px-4 lg:h-[60px] lg:px-6">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetTitle>
                <div className="flex items-center gap-2 mb-4">
                  <Link href="/" className="flex items-center gap-2">
                    <span className="text-2xl font-bold">
                      Meal<span className="text-green-600">Wise</span>
                    </span>
                  </Link>
                </div>
              </SheetTitle>
              <nav className="grid gap-2">
                <DashboardLinks />
              </nav>
            </SheetContent>
          </Sheet>
        </header>

        {/* Main content area - simplified structure */}
        <main>
          {children}
        </main>
      </div>
      <Toaster richColors closeButton theme="light" />
    </div>
  );
}
