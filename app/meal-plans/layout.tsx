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
import { getMealsByUserId } from "@/data";
import { Toaster } from "@/components/ui/sonner";
import { ReactNode } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserDropdown } from "@/components/user-dropdown";
import Footer from "@/components/footer";


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
    <div className="grid h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <div className="hidden border-r bg-background/95 md:block h-screen">
        <div className="flex flex-col h-full">
          <div className="h-14 flex items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-semibold tracking-tighter">
                Meal<span className="text-green-500 text-2xl">Wise</span>
              </span>
            </Link>
          </div>
          {/* Nav links area, scrollable if needed */}
          <nav className="flex-1 overflow-y-auto flex flex-col gap-1 px-2 text-sm font-medium lg:px-4 py-2">
            <DashboardLinks />
          </nav>
          {/* User Button at Bottom - Always Visible, never scrolls */}
          <div className="p-4 border-t mb-20  bg-background/95 mt-auto">
            <UserDropdown user={user} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative w-full flex min-h-screen flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-background/95 px-4 lg:h-[60px] lg:px-6">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 h-screen">
              <div className="h-14 flex items-center border-b px-4 lg:h-[60px] lg:px-6">
                <SheetTitle>
                  <Link href="/" className="flex items-center gap-2">
                    <span className="text-2xl font-bold">
                      Meal<span className="text-green-600">Wise</span>
                    </span>
                  </Link>
                </SheetTitle>
              </div>
              <div className="flex-1 flex flex-col h-full">
                <nav className="flex-1 overflow-y-auto flex flex-col gap-1 px-2 text-sm font-medium lg:px-4 py-2">
                  <DashboardLinks />
                </nav>
                {/* Mobile User Button - Always at bottom */}
                <div className="border-t p-4 mt-auto bg-background/95">
                  <UserDropdown user={user} />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </header>
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      <Toaster richColors closeButton theme="light" />
    </div>
  );
}
