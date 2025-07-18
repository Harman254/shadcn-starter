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
    <footer className="relative bg-[#EAEFEF]  dark:bg-[#222222] overflow-hidden">
      {/* Subtle background pattern using palette */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute top-0 left-0 w-full h-full dark:bg-[#222222] "></div>
        <div className="absolute inset-0 "></div>
      </div>
      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Top section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {/* Brand section */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block group">
              <h2 className="text-xl font-bold tracking-tight mb-4 transition-all duration-300 group-hover:scale-105">
                <span
                  className={cn(
                    // Brand gradient, theme-aware
                    "bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-black/90 to-rose-500 dark:from-indigo-300 dark:via-white/90 dark:to-rose-300 ",
                    pacifico.className,
                  )}
                >Mealwise
                </span>
              </h2>
            </Link>
            <p className="text-[#333446] dark:text-[#EAEFEF] text-base leading-relaxed mb-8 max-w-sm">
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
                  className="group relative p-3 bg-[#EAEFEF] dark:bg-[#222222] rounded-xl border border-[#B8CFCE] dark:border-[#1DCD9F] hover:bg-[#B8CFCE] hover:border-[#7F8CAA] dark:hover:bg-[#1DCD9F] dark:hover:border-[#169976] transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  aria-label={label}
                >
                  <Icon className="w-5 h-5 text-[#7F8CAA] dark:text-[#1DCD9F] group-hover:text-[#333446] dark:group-hover:text-[#000000] transition-colors duration-300" />
                </Link>
              ))}
            </div>
          </div>
          {/* Navigation links */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-6 text-[#333446] dark:text-[#EAEFEF]">Company</h3>
              <nav className="space-y-4">
                {[
                  { href: "/careers", label: "Careers" },
                  { href: "/blog", label: "Blog" }
                ].map(({ href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    className="block text-[#7F8CAA] dark:text-[#B8CFCE] hover:text-[#333446] dark:hover:text-[#1DCD9F] transition-all duration-300 hover:translate-x-1 text-sm font-medium"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6 text-[#333446] dark:text-[#EAEFEF]">Product</h3>
              <nav className="space-y-4">
                {[
                  { href: "/dashboard", label: "Dashboard" },
                ].map(({ href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    className="block text-[#7F8CAA] dark:text-[#B8CFCE] hover:text-[#333446] dark:hover:text-[#1DCD9F] transition-all duration-300 hover:translate-x-1 text-sm font-medium"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6 text-[#333446] dark:text-[#EAEFEF]">Support</h3>
              <nav className="space-y-4">
                {[
                  { href: "/contact", label: "Contact" },
                ].map(({ href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    className="block text-[#7F8CAA] dark:text-[#B8CFCE] hover:text-[#333446] dark:hover:text-[#1DCD9F] transition-all duration-300 hover:translate-x-1 text-sm font-medium"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6 text-[#333446] dark:text-[#EAEFEF]">Legal</h3>
              <div className="mt-2">
                <TocDialog />
              </div>
            </div>
          </div>
        </div>
        {/* Elegant divider using palette */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-[#B8CFCE] dark:bg-[#1DCD9F]"></div>
          </div>
        </div>
        {/* Bottom section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-[#333446] dark:text-[#EAEFEF] text-sm">
              © {new Date().getFullYear()} {" "}
              <Link 
                href="/" 
                className="font-semibold hover:text-[#7F8CAA] dark:hover:text-[#1DCD9F] transition-colors duration-300"
              >
                <span className={cn(
                  // Brand gradient, theme-aware
                  "bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-black/90 to-rose-500 dark:from-indigo-300 dark:via-white/90 dark:to-rose-300 ",
                  pacifico.className,
                )}>
                  Mealwise
                </span>
              </Link>
              . All rights reserved.
            </p>
            <p className="text-[#B8CFCE] dark:text-[#7F8CAA] text-xs mt-1 flex items-center justify-center md:justify-start">
              Crafted with 
              <span className="text-[#7F8CAA] dark:text-[#1DCD9F] mx-1 animate-pulse">❤️</span>
              for better nutrition
            </p>
          </div>
          {/* Back to top button using palette */}
          <button
            onClick={scrollToTop}
            className="group flex items-center space-x-2 px-4 py-2 bg-[#EAEFEF] dark:bg-[#222222] rounded-full border border-[#B8CFCE] dark:border-[#1DCD9F] hover:bg-[#B8CFCE] hover:border-[#7F8CAA] dark:hover:bg-[#1DCD9F] dark:hover:border-[#169976] transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <span className="text-sm font-medium text-[#7F8CAA] dark:text-[#B8CFCE] group-hover:text-[#333446] dark:group-hover:text-[#000000] transition-colors duration-300">
              Back to top
            </span>
            <ArrowUp className="w-4 h-4 text-[#7F8CAA] dark:text-[#B8CFCE] group-hover:text-[#333446] dark:group-hover:text-[#000000] transition-all duration-300 group-hover:-translate-y-1" />
          </button>
        </div>
      </div>
      {/* Clean bottom accent using palette */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#B8CFCE] via-[#7F8CAA] to-[#B8CFCE] dark:from-[#1DCD9F] dark:via-[#169976] dark:to-[#1DCD9F]"></div>
    </footer>
  )
}