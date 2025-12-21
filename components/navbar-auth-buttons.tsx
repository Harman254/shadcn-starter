"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuthModal } from "@/components/AuthModalProvider";

interface NavbarAuthButtonsProps {
  isSignedIn: boolean;
  userName?: string | null;
}

export function NavbarAuthButtons({ isSignedIn, userName }: NavbarAuthButtonsProps) {
  const { open } = useAuthModal();

  if (isSignedIn) {
    return (
      <>
        <span className="text-sm text-[#7F8CAA] dark:text-[#B8CFCE]">Hi, {userName}</span>
        <Button asChild
          className="bg-[#1DCD9F] text-[#EAEFEF] dark:bg-[#1DCD9F] dark:text-[#000000] border border-[#169976] dark:border-[#169976] hover:bg-[#169976] hover:text-[#EAEFEF] dark:hover:bg-[#169976] dark:hover:text-[#EAEFEF] transition-colors font-semibold shadow-md"
        >
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </>
    );
  }

  return (
    <>
      <Button 
        className="bg-transparent text-[#333446] dark:bg-[#222222] dark:text-[#EAEFEF] border border-[#B8CFCE] dark:border-[#1DCD9F] hover:bg-[#B8CFCE] dark:hover:bg-[#1DCD9F]/10 hover:text-[#333446] dark:hover:text-[#1DCD9F]" 
        onClick={() => open("sign-in")}
      >
        Sign in
      </Button>
      <Button 
        className="bg-[#7F8CAA] text-[#EAEFEF] dark:bg-[#7F8CAA] dark:text-[#EAEFEF] border border-[#B8CFCE] dark:border-[#1DCD9F] hover:bg-[#333446] dark:hover:bg-[#1DCD9F] hover:text-[#EAEFEF] dark:hover:text-[#EAEFEF]" 
        onClick={() => open("sign-up")}
      >
        Start for free
      </Button>
    </>
  );
}

