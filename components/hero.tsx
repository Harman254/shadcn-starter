
'use client'
import Link from "next/link"
import { Button } from "./ui/button"
import { requireUser } from "@/lib/user"
import Image from "next/image"
import { useSession } from "@/lib/auth-client"

export default async function Hero() {
 const session = useSession()
  const user = session?.data?.user
  return (
    <section className="w-full min-h-screen py-12 md:py-24 lg:py-32 container">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <Link href="/meal-plans/new" legacyBehavior>
              <div className="inline-block text-green-800 rounded-lg bg-green-100 px-3 py-1 text-sm dark:bg-green-900 dark:text-green-200">
                New Feature!  Generate grocery list for your meal plan
              </div>
            </Link>
            <h1 className="text-4xl bg-gradient-to-br from-green-500 to-blue-500 text-transparent bg-clip-text font-extrabold tracking-tighter sm:text-5xl max-w-2xl mx-auto">
              Effortless Meal Planning with AI — Designed for You
            </h1>
            <p className="max-w-2xl text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400 mx-auto">
              Generate personalized meal plans in seconds. Whether youre a solo cook, a busy family, or fitness-focused — get meals tailored to your lifestyle. Save, regenerate, and unlock AI grocery lists with a subscription.
            </p>
          </div>
          <div className="space-x-4">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-8 text-md font-semibold text-white shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
              href="/meal-plans/new"
            >
              Create Your Meal Plan
            </Link>
            {!user && (
              <Button>
                <Link href="/sign-in">Login</Link>
              </Button>
            )}
          </div>
          <div className="w-full max-w-4xl">
            <Image
              src="/hero.png" // Replace with your actual image path
              alt="Preview of AI-generated meal plan"
              width={1200}
              height={600}
              className="rounded-xl shadow-lg dark:border dark:border-gray-700"
              priority
            />
          </div>

        </div>
      </div>
    </section>
  );
}
