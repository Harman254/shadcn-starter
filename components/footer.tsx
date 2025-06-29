"use client"
import Link from "next/link"
import { Facebook, Instagram, Linkedin, Twitter, ArrowUp } from "lucide-react"

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-green-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-blue-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Top section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {/* Brand section */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block group">
              <h2 className="text-5xl font-black tracking-tight mb-4 transition-all duration-300 group-hover:scale-105">
                <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                  Meal
                </span>
                <span className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 bg-clip-text text-transparent">
                  Wise
                </span>
              </h2>
            </Link>
            <p className="text-gray-300 text-lg leading-relaxed mb-6 font-light">
              Transforming the way you think about nutrition, one meal at a time.
            </p>
            
            {/* Social links */}
            <div className="flex space-x-4">
              {[
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Linkedin, href: "#", label: "LinkedIn" }
              ].map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  className="group relative p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 hover:border-green-500/50 transition-all duration-300 hover:scale-110"
                  aria-label={label}
                >
                  <Icon className="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Navigation links */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-6 text-white">Company</h3>
              <nav className="space-y-3">
                {[
                  { href: "/about", label: "About" },
                  { href: "/careers", label: "Careers" },
                  { href: "/blog", label: "Blog" }
                ].map(({ href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    className="block text-gray-400 hover:text-green-400 transition-all duration-300 hover:translate-x-1 font-medium"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-6 text-white">Product</h3>
              <nav className="space-y-3">
                {[
                  { href: "/features", label: "Features" },
                  { href: "/pricing", label: "Pricing" },
                  { href: "/integrations", label: "Integrations" }
                ].map(({ href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    className="block text-gray-400 hover:text-green-400 transition-all duration-300 hover:translate-x-1 font-medium"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-6 text-white">Support</h3>
              <nav className="space-y-3">
                {[
                  { href: "/contact", label: "Contact" },
                  { href: "/help", label: "Help Center" },
                  { href: "/community", label: "Community" }
                ].map(({ href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    className="block text-gray-400 hover:text-green-400 transition-all duration-300 hover:translate-x-1 font-medium"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-6 text-white">Legal</h3>
              <nav className="space-y-3">
                {[
                  { href: "/privacy", label: "Privacy Policy" },
                  { href: "/terms", label: "Terms of Service" },
                  { href: "/licensing", label: "Licensing" }
                ].map(({ href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    className="block text-gray-400 hover:text-green-400 transition-all duration-300 hover:translate-x-1 font-medium"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
        
        {/* Divider with gradient */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} {" "}
              <Link 
                href="/" 
                className="font-semibold hover:text-green-400 transition-colors duration-300"
              >
                <span className="text-white">Meal</span>
                <span className="text-green-500">Wise</span>
              </Link>
              . All rights reserved.
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Crafted with ❤️ for better nutrition
            </p>
          </div>
          
          {/* Back to top button */}
          <button
            onClick={scrollToTop}
            className="group flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 hover:bg-white/10 hover:border-green-500/50 transition-all duration-300 hover:scale-105"
          >
            <span className="text-sm font-medium text-gray-400 group-hover:text-green-400 transition-colors duration-300">
              Back to top
            </span>
            <ArrowUp className="w-4 h-4 text-gray-400 group-hover:text-green-400 transition-all duration-300 group-hover:-translate-y-1" />
          </button>
        </div>
      </div>
      
      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>
    </footer>
  )
}