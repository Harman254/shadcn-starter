"use client";

import { useTheme } from "next-themes";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

const Button = ({
  variant = "default",
  children,
  onClick,
}: {
  variant?: "default" | "ghost";
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  const baseStyles =
    "inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50";
  const variants = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-md",
    ghost: "bg-transparent border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200 focus:ring-gray-400",
  };

  return (
    <button onClick={onClick} className={`${baseStyles} ${variants[variant]}`}>
      {children}
    </button>
  );
};

const Hero = () => {
  const { theme } = useTheme();
  const { isSignedIn } = useAuth();

  return (
    <section
      className={`relative min-h-screen w-full transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-b from-white to-gray-50 text-gray-900"
      }`}
    >
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 right-1/6 w-64 h-64 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex h-full items-center justify-center px-6 py-24 md:px-12">
        <div className="text-center max-w-4xl mx-auto">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div
              className={`p-3 rounded-full ${
                theme === "dark" ? "bg-gray-800" : "bg-indigo-50"
              }`}
            >
              <svg
                className={`w-12 h-12 ${
                  theme === "dark" ? "text-indigo-400" : "text-indigo-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            Smarter Meal Plans, Powered by AI
          </h1>

          {/* Subtext */}
          <p
            className={`mb-10 text-lg lg:text-xl max-w-2xl mx-auto ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Save time, eat better, and plan meals effortlessly. Our AI-powered
            assistant creates personalized plans from your ingredients and
            preferences—so you can focus on living, not guessing.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
              <Button>
                {isSignedIn ? "Go to Dashboard" : "Get Started"}
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Button>
            </Link>
            <Button variant="ghost">
              Watch Demo
              <svg
                className="ml-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <circle cx="12" cy="12" r="9" strokeWidth={2} />
              </svg>
            </Button>
          </div>

          {/* Trust indicators */}
          <div
            className={`mt-16 pt-8 border-t ${
              theme === "dark" ? "border-gray-800" : "border-gray-200"
            }`}
          >
            <p
              className={`text-sm mb-4 ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Trusted by nutritionists, home chefs, and fitness communities
            </p>
            <div className="flex justify-center gap-8 opacity-70">
              {Array(4)
                .fill(null)
                .map((_, idx) => (
                  <img
                    key={idx}
                    src={`/api/placeholder/120/30?i=${idx}`}
                    alt="Logo"
                    className="h-8 w-auto"
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
