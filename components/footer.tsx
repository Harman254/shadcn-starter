import Link from "next/link"
import { Github, Twitter, Mail, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              
              <h2 className="text-xl font-bold text-foreground">
                Meal<span className="text-green-500 dark:text-green-400">Wise</span>
              </h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Your intelligent meal planning companion. Making healthy eating simple, affordable, and delicious.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://github.com/amanesoft"
                className="text-muted-foreground hover:text-green-500 dark:hover:text-green-400 transition-colors"
                aria-label="Follow us on GitHub"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://twitter.com/amanesoft"
                className="text-muted-foreground hover:text-green-500 dark:hover:text-green-400 transition-colors"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/meal-plans"
                  className="text-sm text-muted-foreground hover:text-green-500 dark:hover:text-green-400 transition-colors block"
                >
                  Meal Planning
                </Link>
              </li>
              <li>
                <Link
                  href="/recipes"
                  className="text-sm text-muted-foreground hover:text-green-500 dark:hover:text-green-400 transition-colors block"
                >
                  Recipe Library
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-green-500 dark:hover:text-green-400 transition-colors block"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-green-500 dark:hover:text-green-400 transition-colors block"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Get in Touch</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                <Link
                  href="mailto:hello@mealwise.com"
                  className="text-sm text-muted-foreground hover:text-green-500 dark:hover:text-green-400 transition-colors"
                >
                  hello@mealwise.com
                </Link>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <address className="text-sm text-muted-foreground not-italic">
                  San Francisco, CA
                </address>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} MealWise Inc. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-green-500 dark:hover:text-green-400 transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-green-500 dark:hover:text-green-400 transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}