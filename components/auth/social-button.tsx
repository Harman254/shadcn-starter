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

  // Provider-specific styling
  const getProviderStyles = () => {
    switch (provider) {
      case 'google':
        return {
          container: "hover:bg-blue-50 dark:hover:bg-blue-950/20 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700",
          text: "text-gray-700 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-300"
        };
      case 'github':
        return {
          container: "hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
          text: "text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white"
        };
      case 'discord':
        return {
          container: "hover:bg-indigo-50 dark:hover:bg-indigo-950/20 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700",
          text: "text-gray-700 dark:text-gray-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-300"
        };
      default:
        return {
          container: "hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700",
          text: "text-gray-700 dark:text-gray-200"
        };
    }
  };

  const providerStyles = getProviderStyles();

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className={cn(
        "group w-full relative h-14 px-8",
        "bg-white/90 backdrop-blur-md dark:bg-gray-900/90",
        providerStyles.container,
        "transition-all duration-300 ease-out",
        "flex items-center justify-center gap-4",
        "font-bold text-lg",
        "shadow-xl hover:shadow-2xl hover:shadow-black/10",
        "rounded-2xl",
        "transform hover:scale-[1.03] active:scale-[0.98]",
        "disabled:transform-none disabled:opacity-60 disabled:cursor-not-allowed",
        "border-2",
        // Focus styles
        "focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500",
        // Loading state
        loading && "cursor-not-allowed"
      )}
      disabled={loading}
      onClick={handleSignIn}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Icon/Spinner */}
      <div className="relative z-10 flex items-center justify-center">
        {loading ? (
          <div className="relative">
            <Loader2 className="w-5 h-5 animate-spin text-gray-500 dark:text-gray-400" />
            {/* Spinning ring effect */}
            <div className="absolute inset-0 w-5 h-5 border-2 border-transparent border-t-blue-500 rounded-full animate-spin opacity-30" />
          </div>
        ) : (
          <div className={cn(
            "w-5 h-5 flex items-center justify-center transition-transform duration-200",
            "group-hover:scale-110"
          )}>
            {icon}
          </div>
        )}
      </div>
      
      {/* Button Text */}
      <span className={cn(
        "relative z-10 flex-1 text-center transition-colors duration-200",
        providerStyles.text,
        loading && "opacity-70"
      )}>
        {loading ? (
          <span className="inline-flex items-center gap-2">
            Connecting...
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </span>
        ) : (
          title
        )}
      </span>

      {/* Ripple effect on click */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-active:opacity-100 transition-opacity duration-150" />
      </div>
    </Button>
  );
};