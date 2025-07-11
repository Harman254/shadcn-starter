"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import SignIn from "@/components/auth/sign-in";
import SignUp from "@/components/auth/sign-up";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePathname } from "next/navigation";

type AuthModalType = "sign-in" | "sign-up" | null;

interface AuthModalContextType {
  open: (type: AuthModalType) => void;
  close: () => void;
  switchToSignIn: () => void;
  switchToSignUp: () => void;
  currentModal: AuthModalType;
}

const AuthModalContext = createContext<AuthModalContextType | null>(null);

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return ctx;
}

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [modalType, setModalType] = useState<AuthModalType>(null);
  const pathname = usePathname();

  const open = useCallback((type: AuthModalType) => {
    setModalType(type);
  }, []);

  const close = useCallback(() => {
    setModalType(null);
  }, []);

  const switchToSignIn = useCallback(() => {
    setModalType("sign-in");
  }, []);

  const switchToSignUp = useCallback(() => {
    setModalType("sign-up");
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      close();
    }
  }, [close]);

  // Close modal if pathname is /forgot-password
  React.useEffect(() => {
    if (pathname === "/forgot-password") {
      close();
    } else if (pathname === "/sign-in") {
      open("sign-in");
    }
  }, [pathname, close, open]);

  const getModalTitle = () => {
    switch (modalType) {
      case "sign-in":
        return "Sign In";
      case "sign-up":
        return "Sign Up";
      default:
        return "";
    }
  };

  const contextValue: AuthModalContextType = {
    open,
    close,
    switchToSignIn,
    switchToSignUp,
    currentModal: modalType,
  };

  return (
    <AuthModalContext.Provider value={contextValue}>
      {children}
      <Dialog open={!!modalType} onOpenChange={handleOpenChange}>
        <DialogContent 
          className="w-full max-w-md sm:max-w-lg p-4 sm:p-8 rounded-2xl shadow-2xl bg-white dark:bg-[#18181b] border border-gray-100 dark:border-gray-800"
          aria-describedby={undefined}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>{getModalTitle()}</DialogTitle>
          </DialogHeader>
          {modalType === "sign-in" && (
            <SignIn key="sign-in" onSwitchToSignUp={switchToSignUp} />
          )}
          {modalType === "sign-up" && (
            <SignUp key="sign-up" onSwitchToSignIn={switchToSignIn} />
          )}
        </DialogContent>
      </Dialog>
    </AuthModalContext.Provider>
  );
}