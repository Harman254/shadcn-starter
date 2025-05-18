'use client';
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";

export default function Hero() {
  const user = useSession();

  return (
    <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-block text-green-800 rounded-lg bg-green-100 px-3 py-1 text-sm dark:bg-green-900 dark:text-green-200">
          New Feature! Generate grocery list for your meal plan
        </div>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
          MealPlanning
          <br />
          <span className="text-gray-400">made easy for you with Ai</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-400 mb-10">
          Huly, an open-source platform, serves as an all-in-one replacement of Linear, Jira, Slack, and Notion.
        </p>

        {user ? (
          <Link href="/meal-plans/new">
            <Button className="relative group px-8 py-6 text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90">
              <span className="relative z-10">Create Your Meal Plan</span>
              <div className="absolute inset-0 bg-white/20 blur-lg group-hover:blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
            </Button>
          </Link>
        ) : (
          <Link href="/sign-in">
            <Button className="relative group px-8 py-6 text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90">
              <span className="relative z-10">Sign In to Get Started</span>
              <div className="absolute inset-0 bg-white/20 blur-lg group-hover:blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}


