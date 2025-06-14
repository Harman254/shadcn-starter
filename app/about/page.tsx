import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Calendar, ShoppingCart, Heart } from "lucide-react"

export default function About() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Video */}
      <section className="relative w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Simplify Your Meal Planning Journey
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Discover how our intelligent meal planning app transforms the way you plan, shop, and cook. Watch our
                  quick demo to see how easy healthy eating can be.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Start Free Trial
                </Button>
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </div>
            </div>

            {/* Video Player */}
            <div className="mx-auto lg:order-last">
              <div className="relative aspect-video w-full max-w-[600px] rounded-xl overflow-hidden shadow-2xl bg-black">
                <video
                  className="w-full h-full object-cover"
                  poster="/placeholder.svg?height=400&width=600"
                  controls
                  preload="metadata"
                >
                  <source src="/placeholder-video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/10 transition-colors">
                  <Button size="lg" variant="secondary" className="bg-white/90 hover:bg-white text-black">
                    <Play className="mr-2 h-5 w-5" />
                    Watch Demo
                  </Button>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">2 minute overview • See how it works</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Everything You Need for Effortless Meal Planning
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our comprehensive platform brings together meal planning, grocery shopping, and nutrition tracking in
                one seamless experience.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Smart Planning</h3>
                  </div>
                </div>
                <p className="text-muted-foreground mt-4">
                  AI-powered meal suggestions based on your preferences, dietary restrictions, and schedule. Plan weeks
                  ahead with just a few clicks.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Auto Shopping Lists</h3>
                  </div>
                </div>
                <p className="text-muted-foreground mt-4">
                  Automatically generated shopping lists organized by store sections. Never forget an ingredient again
                  with smart quantity calculations.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Heart className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Nutrition Tracking</h3>
                  </div>
                </div>
                <p className="text-muted-foreground mt-4">
                  Track calories, macros, and nutrients effortlessly. Get insights into your eating patterns and achieve
                  your health goals.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How It Works</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Get started with meal planning in three simple steps
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-full text-2xl font-bold">
                1
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Set Your Preferences</h3>
                <p className="text-muted-foreground">
                  Tell us about your dietary preferences, allergies, and cooking skill level. We will customize everything
                  just for you.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-full text-2xl font-bold">
                2
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Get Your Meal Plan</h3>
                <p className="text-muted-foreground">
                  Receive personalized meal suggestions for the week. Swap meals, adjust portions, and make it perfect
                  for your family.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-full text-2xl font-bold">
                3
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Shop & Cook</h3>
                <p className="text-muted-foreground">
                  Use your auto-generated shopping list and step-by-step cooking instructions. Enjoy stress-free meals
                  all week long.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-4 lg:gap-12">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="text-4xl font-bold text-green-600">50K+</div>
              <div className="text-sm text-muted-foreground">Happy Users</div>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="text-4xl font-bold text-green-600">2M+</div>
              <div className="text-sm text-muted-foreground">Meals Planned</div>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="text-4xl font-bold text-green-600">85%</div>
              <div className="text-sm text-muted-foreground">Less Food Waste</div>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="text-4xl font-bold text-green-600">3hrs</div>
              <div className="text-sm text-muted-foreground">Saved Per Week</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-green-600 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Ready to Transform Your Meal Planning?
              </h2>
              <p className="max-w-[600px] text-green-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of families who have simplified their meal planning and improved their eating habits.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                Start Your Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-green-600"
              >
                View Pricing
              </Button>
            </div>
            <p className="text-sm text-green-200">No credit card required • 14-day free trial • Cancel anytime</p>
          </div>
        </div>
      </section>
    </div>
  )
}
