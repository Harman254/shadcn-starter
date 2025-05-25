import { signIn } from "@/lib/auth-client";

import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export const SignInButton = ({
  title,
  provider,
  loading,
  setLoading,
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
      onClick={async () => {
        await signIn.social(
          {
            provider: provider,
            callbackURL: callbackURL
          },
          {
            onRequest: (ctx) => {
              setLoading(true);
            },
          },
        );
      }}
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