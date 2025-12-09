import { Check, Heart, ShoppingCart, BarChart3,  MapPin, Clock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import  Pricing4  from '@/components/prices'
import Link from "next/link"
import Footer from "@/components/footer"

export default function MealwisePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-8">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-100 dark:bg-zinc-800 dark:text-green-300">
            <Heart className="w-4 h-4 mr-1" />
            AI-Powered Meal Planning
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 dark:text-zinc-100">Explore Mealwise Features</h1>
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed dark:text-zinc-400">
            Everything you need to plan meals, shop smart, and track your eating — powered by AI.
          </p>
        </div>
      </header>

      {/* AI-Powered Meal Plan Generation */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="mb-4 bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-zinc-800 dark:text-orange-300">
              <Heart className="w-4 h-4 mr-1" />
              Google Gemini 2.5 Pro
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 dark:text-zinc-100">
              Your Personalized Meal Plan — In Seconds
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed dark:text-zinc-400">
              Tell us your goals, diet, and preferences. Our AI (Google Gemini 2.5 Pro) creates a full week&apos;s meal plan
              with stunning images and personalized recommendations.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-zinc-700 dark:text-green-300">
                <Clock className="w-4 h-4 mr-1" />
                30 seconds
              </Badge>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-zinc-700 dark:text-orange-300">
                <Star className="w-4 h-4 mr-1" />
                Personalized
              </Badge>
            </div>
          </div>
          <div className="relative">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur dark:bg-zinc-900/80">
              <CardHeader>
                <CardTitle className="text-center dark:text-zinc-100">AI Meal Plan Generator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Your Preferences</h4>
                    <div className="space-y-2 text-xs text-gray-600">
                      <div>🥗 Vegetarian</div>
                      <div>🏃‍♂️ Weight Loss</div>
                      <div>⏰ 30 min prep</div>
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Generated Plan</h4>
                    <div className="space-y-2">
                      <div className="bg-white p-2 rounded text-xs">
                        <Image
                          src="/image04.webp"
                          alt="Quinoa Bowl"
                          width={60}
                          height={40}
                          className="w-full h-6 object-cover rounded mb-1"
                        />
                        <div className="font-medium">Quinoa Power Bowl</div>
                      </div>
                      <div className="bg-white p-2 rounded text-xs">
                        <Image
                          src="/image05.webp"
                          alt="Veggie Stir Fry"
                          width={60}
                          height={40}
                          className="w-full h-6 object-cover rounded mb-1"
                        />
                        <div className="font-medium">Veggie Stir Fry</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Location-Based Grocery Lists */}
      <section className="bg-white/50 py-16 dark:bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="lg:order-2">
              <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-100 dark:bg-zinc-800 dark:text-green-300">
                <MapPin className="w-4 h-4 mr-1" />
                Location-Based
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 dark:text-zinc-100">
                Smart Grocery Lists Based on Your Location
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed dark:text-zinc-400">
                Automatically generate shopping lists based on your meal plan and local pricing. Save time and money
                with store-specific suggestions.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-zinc-700 dark:text-green-300">
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Auto-generated
                </Badge>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-zinc-700 dark:text-orange-300">
                  💰 Local pricing
                </Badge>
              </div>
            </div>
            <div className="lg:order-1">
              <Card className="shadow-2xl border-0 bg-white max-w-sm mx-auto dark:bg-zinc-800">
                <CardHeader className="text-center">
                  <CardTitle className="text-lg dark:text-zinc-100">Your Grocery List</CardTitle>
                  <CardDescription className="dark:text-zinc-400">Whole Foods - Downtown</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg dark:bg-zinc-700">
                    <div>
                      <div className="font-medium text-sm dark:text-zinc-100">Quinoa (2 lbs)</div>
                      <div className="text-xs text-gray-600 dark:text-zinc-400">Organic</div>
                    </div>
                    <div className="text-sm font-semibold dark:text-zinc-100">$8.99</div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg dark:bg-zinc-700">
                    <div>
                      <div className="font-medium text-sm dark:text-zinc-100">Bell Peppers (3)</div>
                      <div className="text-xs text-gray-600 dark:text-zinc-400">Mixed colors</div>
                    </div>
                    <div className="text-sm font-semibold dark:text-zinc-100">$4.50</div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg dark:bg-zinc-700">
                    <div>
                      <div className="font-medium text-sm dark:text-zinc-100">Spinach (5 oz)</div>
                      <div className="text-xs text-gray-600 dark:text-zinc-400">Fresh</div>
                    </div>
                    <div className="text-sm font-semibold dark:text-zinc-100">$3.25</div>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-semibold dark:text-zinc-100">
                    <span>Total</span>
                    <span className="dark:text-zinc-100">$16.74</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Save, Like, and Customize Meals */}
      <section className="container mx-auto px-4 py-16 dark:bg-zinc-900">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="mb-4 bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-zinc-800 dark:text-orange-300">
              <Heart className="w-4 h-4 mr-1" />
              Personalization
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 dark:text-zinc-100">Build Your Favorites Over Time</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed dark:text-zinc-400">
              Like meals you love. Save them to your dashboard. The more you use Mealwise, the better your plans get.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-zinc-700 dark:text-green-300">
                ❤️ Save favorites
              </Badge>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-zinc-700 dark:text-orange-300">
                📊 Smart learning
              </Badge>
            </div>
          </div>
          <div className="space-y-4">
            <Card className="shadow-lg border-0 bg-white dark:bg-zinc-800">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Image
                    src="/image05.webp"
                    alt="Salmon Teriyaki"
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold dark:text-zinc-100">Salmon Teriyaki Bowl</h4>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 dark:text-red-400">
                        <Heart className="w-4 h-4 fill-current" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-zinc-400 mb-2">25 min • 450 cal</p>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800">
                      Save to Dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-lg border-0 bg-white dark:bg-zinc-800">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Image
                    src="/placeholder.svg?height=80&width=80"
                    alt="Mediterranean Wrap"
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold dark:text-zinc-100">Mediterranean Wrap</h4>
                      <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-500 dark:text-zinc-500">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-zinc-400 mb-2">15 min • 380 cal</p>
                    <Button size="sm" variant="outline">
                      Save to Dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Analytics & Insights */}
      <section className="bg-white/50 py-16 dark:bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="lg:order-2">
              <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-100 dark:bg-zinc-800 dark:text-green-300">
                <BarChart3 className="w-4 h-4 mr-1" />
                Analytics
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 dark:text-zinc-100">Track Your Eating Habits</h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed dark:text-zinc-400">
                See what meals you eat most, what&apos;s working, and where you&apos;re improving. Built-in analytics help you
                stay consistent and accountable.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-zinc-700 dark:text-green-300">
                  📈 Progress tracking
                </Badge>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-zinc-700 dark:text-orange-300">
                  🎯 Goal insights
                </Badge>
              </div>
            </div>
            <div className="lg:order-1">
              <Card className="shadow-2xl border-0 bg-white dark:bg-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg dark:text-zinc-100">Your Meal Analytics</CardTitle>
                  <CardDescription className="dark:text-zinc-400">Last 30 days</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium dark:text-zinc-100">Meals Planned</span>
                      <span className="text-sm font-semibold dark:text-zinc-100">84/90</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-zinc-700">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "93%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium dark:text-zinc-100">Grocery Budget</span>
                      <span className="text-sm font-semibold dark:text-zinc-100">$320/$400</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-zinc-700">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: "80%" }}></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg dark:bg-zinc-700">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-300">12</div>
                      <div className="text-xs text-gray-600 dark:text-zinc-400">New recipes tried</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg dark:bg-zinc-700">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-300">8.5</div>
                      <div className="text-xs text-gray-600 dark:text-zinc-400">Avg meal rating</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="container mx-auto px-4 py-16 dark:bg-zinc-900">
        <Pricing4 />
      </section>

      {/* FAQ Section */}
      <section className="bg-white/50 py-16 dark:bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 dark:text-zinc-100">Frequently Asked Questions</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="shadow-lg border-0 bg-white dark:bg-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg dark:text-zinc-100">How accurate is the grocery pricing?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-zinc-400">
                  Our grocery pricing is updated daily from major retailers in your area. While prices can vary
                  slightly, we maintain 90%+ accuracy to help you budget effectively for your meal plans.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white dark:bg-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg dark:text-zinc-100">Can I customize my plan later?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-zinc-400">
                  You can swap out meals, adjust portions, modify ingredients, and update your dietary preferences at
                  any time. Pro users get unlimited swaps and customizations.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white dark:bg-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg dark:text-zinc-100">Is the Pro plan a one-time or monthly fee?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-zinc-400">
                  The Pro plan is $9/month with no long-term commitment. You can cancel anytime and still access your
                  saved meals and data. We also offer annual plans with a 20% discount.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-gradient-to-r from-green-600 to-orange-500 py-16 dark:from-green-900 dark:to-orange-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 dark:text-zinc-100">Ready to Transform Your Meal Planning?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto dark:text-zinc-400">
            Join thousands of users who&apos;ve simplified their meal planning with AI-powered recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href='/chat'>
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 px-8 dark:bg-white dark:text-green-600 dark:hover:bg-gray-100">
              Start Free Today
            </Button>
            </Link>
            
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
