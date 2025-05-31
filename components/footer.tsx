import Link from "next/link"
import { Github, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 dark:bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MW</span>
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Meal<span className="text-green-500 dark:text-green-400">Wise</span>
              </h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your intelligent meal planning companion. Making healthy eating simple, affordable, and delicious for
              everyone.
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
              <Link
                href="https://linkedin.com/company/amanesoft"
                className="text-muted-foreground hover:text-green-500 dark:hover:text-green-400 transition-colors"
                aria-label="Connect with us on LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Solutions Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Solutions</h3>
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
                  href="/nutrition"
                  className="text-sm text-muted-foreground hover:text-green-500 dark:hover:text-green-400 transition-colors block"
                >
                  Nutrition Tracking
                </Link>
              </li>
              <li>
                <Link
                  href="/shopping-lists"
                  className="text-sm text-muted-foreground hover:text-green-500 dark:hover:text-green-400 transition-colors block"
                >
                  Shopping Lists
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/analytics"
                  className="text-sm text-muted-foreground hover:text-green-500 dark:hover:text-green-400 transition-colors block"
                >
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
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
                  href="/careers"
                  className="text-sm text-muted-foreground hover:text-green-500 dark:hover:text-green-400 transition-colors block"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-muted-foreground hover:text-green-500 dark:hover:text-green-400 transition-colors block"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/press"
                  className="text-sm text-muted-foreground hover:text-green-500 dark:hover:text-green-400 transition-colors block"
                >
                  Press Kit
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
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                <Link
                  href="tel:+1234567890"
                  className="text-sm text-muted-foreground hover:text-green-500 dark:hover:text-green-400 transition-colors"
                >
                  +1 (234) 567-890
                </Link>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <address className="text-sm text-muted-foreground not-italic">
                  123 Healthy Street
                  <br />
                  Nutrition City, NC 12345
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
            <div className="flex flex-wrap justify-center md:justify-end gap-6">
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-green-500 dark:hover:text-green-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-green-500 dark:hover:text-green-400 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="text-sm text-muted-foreground hover:text-green-500 dark:hover:text-green-400 transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
