import { signIn } from "@/lib/auth-client";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useState, useCallback } from "react";

export const SignInButton = ({
  title,
  provider,
  loading: externalLoading,
  setLoading: setExternalLoading,
  callbackURL,
  icon,
}: {
  title: string;
  provider: "github" | "google" | "discord";
  loading: boolean;
  setLoading: (loading: boolean) => void;
  callbackURL: string;
  icon: React.ReactNode;
}) => {
  // Internal loading state as a fallback
  const [internalLoading, setInternalLoading] = useState(false);
  
  // Use either external or internal loading state
  const loading = externalLoading || internalLoading;
  
  // Handle sign-in with proper error handling
  const handleSignIn = useCallback(async () => {
    try {
      // Prevent multiple clicks
      if (loading) return;
      
      // Set loading state
      setExternalLoading(true);
      setInternalLoading(true);
      
      // Log for debugging in production
      console.log(`[SignInButton] Starting ${provider} sign-in with callback URL: ${callbackURL}`);
      
      // Call the sign-in function with all necessary callbacks
      await signIn.social(
        {
          provider: provider,
          callbackURL: callbackURL,
        },
        {
          onRequest: (ctx) => {
            console.log(`[SignInButton] ${provider} sign-in request started`);
            // Loading state is already set above
          },
          onSuccess: (ctx) => {
            console.log(`[SignInButton] ${provider} sign-in successful`);
            setExternalLoading(false);
            setInternalLoading(false);
          },
          onError: (error) => {
            console.error(`[SignInButton] ${provider} sign-in error:`, error);
            setExternalLoading(false);
            setInternalLoading(false);
          },
        }
      );
    } catch (error) {
      // Handle any uncaught errors
      console.error(`[SignInButton] Uncaught error during ${provider} sign-in:`, error);
      setExternalLoading(false);
      setInternalLoading(false);
    }
  }, [provider, callbackURL, loading, setExternalLoading]);

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className={cn(
        "w-full relative h-12 px-4",
        "bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700",
        "border border-gray-200 dark:border-gray-700",
        "text-gray-700 dark:text-gray-200",
        "transition-colors duration-200",
        "flex items-center justify-center gap-3",
        "font-medium text-base",
        "shadow-sm hover:shadow-md",
        "rounded-lg"
      )}
      disabled={loading}
      onClick={handleSignIn}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-gray-500 dark:text-gray-400" />
      ) : (
        <div className="w-5 h-5 flex items-center justify-center">
          {icon}
        </div>
      )}
      <span className="flex-1 text-center">{title}</span>
    </Button>
  );
};

