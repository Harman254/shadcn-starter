import { ReactNode } from "react";
import Link from "next/link";
import { DashboardLinks } from "../dashboard-links";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, UserCog } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { redirect } from "next/navigation";
import { getMealsByUserId } from "@/data";
import { Toaster } from "@/components/ui/sonner";
import { authClient } from "@/lib/auth-client";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import SignOut from "@/components/auth/sign-out";


export default async function DashboardLayout({
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
    <>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex flex-col max-h-screen h-full gap-2">
            <div className="h-14 flex items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link href="/" className="flex items-center gap-2">
              <p className="text-2xl font-bold">
                        Meal
                        <span className="text-green-600">Wise</span>
                    </p>
              </Link>
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                <DashboardLinks />
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
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
                    <p className="text-2xl font-bold">
                        Meal
                        <span className="text-green-600">Wise</span>
                    </p>
                  </div>
                </SheetTitle>
                <nav className="grid gap-2">
                  <DashboardLinks />
                </nav>
              </SheetContent>
            </Sheet>

            <div className="flex items-center ml-auto">
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        className="rounded-full border-muted-foreground/20 hover:border-muted-foreground/40 transition"
        variant="outline"
        size="icon"
      >
        <UserCog className="h-5 w-5 text-muted-foreground" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-48 shadow-lg border border-muted p-1">
      <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wide px-2 py-1">
        My Account
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link
          href="/dashboard"
          className="w-full px-2 py-1.5 rounded-md hover:bg-muted/50 transition"
        >
          Dashboard
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link
          href="/dashboard/profile"
          className="w-full px-2 py-1.5 rounded-md hover:bg-muted/50 transition"
        >
          Profile
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link
          href="/dashboard/settings"
          className="w-full px-2 py-1.5 rounded-md hover:bg-muted/50 transition"
        >
          Settings
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link
          href="/dashboard/support"
          className="w-full px-2 py-1.5 rounded-md hover:bg-muted/50 transition"
        >
          Support
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <div className="w-full px-2 py-1.5 rounded-md hover:bg-destructive/10 transition text-destructive">
          <SignOut />
        </div>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</div>
          </header>

          {/* Full-width Main Section */}
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 w-full">
            {children}
          </main>
        </div>
      </div>

      <Toaster richColors closeButton theme="light" />
    </>
  );
}
