"use client"
import Link from "next/link"
import { Facebook, Instagram, Linkedin, Twitter, ArrowUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { Pacifico } from "next/font/google"
import TocDialog from "./TocDialog";


const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
})

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
 
  return (
    <footer className="relative bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-500/20 via-transparent to-blue-500/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_70%)]"></div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Top section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {/* Brand section */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block group">
              <h2 className="text-2xl font-bold tracking-tight mb-4 transition-all duration-300 group-hover:scale-105">
              <span
                className={cn(
                  "bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-black/90 to-rose-500 dark:from-indigo-300 dark:via-white/90 dark:to-rose-300 ",
                  pacifico.className,
                )}
              >Mealwise
                </span>
              </h2>
            </Link>
            <p className="text-gray-600 dark:text-zinc-300 text-base leading-relaxed mb-8 max-w-sm">
              Transforming the way you think about nutrition, one meal at a time. Your personal guide to healthier eating.
            </p>
            
            {/* Social links */}
            <div className="flex space-x-3">
              {[
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Linkedin, href: "#", label: "LinkedIn" }
              ].map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  className="group relative p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:border-green-500/50 dark:hover:border-green-400/50 transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  aria-label={label}
                >
                  <Icon className="w-5 h-5 text-gray-500 dark:text-zinc-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300" />
                </Link>
              ))}
            </div>
          </div>
          
          {/* Navigation links */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Company</h3>
              <nav className="space-y-4">
                {[
                  // { href: "/about", label: "About" },
                  { href: "/careers", label: "Careers" },
                  { href: "/blog", label: "Blog" }
                ].map(({ href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    className="block text-gray-600 dark:text-zinc-300 hover:text-green-600 dark:hover:text-green-400 transition-all duration-300 hover:translate-x-1 text-sm font-medium"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Product</h3>
              <nav className="space-y-4">
                {[
                  { href: "/dashboard", label: "Dashboard" },
                  // { href: "/pricing", label: "Pricing" },
                  // { href: "/integrations", label: "Integrations" }
                ].map(({ href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    className="block text-gray-600 dark:text-zinc-300 hover:text-green-600 dark:hover:text-green-400 transition-all duration-300 hover:translate-x-1 text-sm font-medium"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Support</h3>
              <nav className="space-y-4">
                {[
                  { href: "/contact", label: "Contact" },
                  // { href: "/help", label: "Help Center" },
                  // { href: "/community", label: "Community" }
                ].map(({ href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    className="block text-gray-600 dark:text-zinc-300 hover:text-green-600 dark:hover:text-green-400 transition-all duration-300 hover:translate-x-1 text-sm font-medium"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Legal</h3>
              
                <div className="mt-2">
                  <TocDialog />
                </div>
            </div>
          </div>
        </div>
        
        {/* Elegant divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-zinc-600 to-transparent"></div>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-gray-500 dark:text-zinc-400 text-sm">
              © {new Date().getFullYear()} {" "}
              <Link 
                href="/" 
                className="font-semibold hover:text-green-600 dark:hover:text-green-400 transition-colors duration-300"
              >
                <span
                className={cn(
                  "bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-black/90 to-rose-500 dark:from-indigo-300 dark:via-white/90 dark:to-rose-300 ",
                  pacifico.className,
                )}
              >Mealwise
                </span>
              </Link>
              . All rights reserved.
            </p>
            <p className="text-gray-400 dark:text-zinc-500 text-xs mt-1 flex items-center justify-center md:justify-start">
              Crafted with 
              <span className="text-red-500 mx-1 animate-pulse">❤️</span>
              for better nutrition
            </p>
          </div>
          
          {/* Back to top button */}
          <button
            onClick={scrollToTop}
            className="group flex items-center space-x-2 px-4 py-2 bg-gray-50 dark:bg-zinc-800 rounded-full border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:border-green-500/50 dark:hover:border-green-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <span className="text-sm font-medium text-gray-600 dark:text-zinc-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
              Back to top
            </span>
            <ArrowUp className="w-4 h-4 text-gray-600 dark:text-zinc-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-all duration-300 group-hover:-translate-y-1" />
          </button>
        </div>
      </div>
      
      {/* Clean bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500/50 via-green-600 to-green-500/50 dark:from-green-400/50 dark:via-green-500 dark:to-green-400/50"></div>
    </footer>
  )
}