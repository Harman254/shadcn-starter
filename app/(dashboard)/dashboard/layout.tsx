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
import { getAccount, getDBSession, getMealsByUserId } from "@/data";
import { Toaster } from "@/components/ui/sonner";
import { authClient } from "@/lib/auth-client";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import SignOut from "@/components/auth/sign-out";
import { Sign } from "crypto";


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
const CheckOnbaord  = await getAccount(session.user.id);

const isOnboarded = CheckOnbaord?.isOnboardingComplete 
if (!isOnboarded) {
  
    redirect("/onboarding");
  }


  const user = session.user;

  const meals = await getMealsByUserId(user.id);

  return (
    <>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex flex-col max-h-screen h-full gap-2">
            <div className="h-14 flex items-center border-b px-4 lg:h-[60px] lg:px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <Link href="/" className="flex items-center gap-2">
                <p className="text-2xl font-bold">
                  Meal<span className="text-green-600">Wise</span>
                </p>
              </Link>
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">

                <DashboardLinks />
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:h-[60px] lg:px-6">
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
                      <p className="text-2xl font-bold">
                        Meal<span className="text-green-600">Wise</span>
                      </p>
                    </Link>
                  </div>
                </SheetTitle>
                <nav className="grid gap-2">
                  <DashboardLinks />

                    

                </nav>
              </SheetContent>
            </Sheet>

          
          </header>

          {/* Full-width Main Section */}
          <main className="flex flex-1 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-col gap-4 p-4 lg:gap-6 lg:p-6 w-full">
            {children}
          </main>
        </div>
      </div>
      <Toaster richColors closeButton theme="light" />
    </>
  );
}
