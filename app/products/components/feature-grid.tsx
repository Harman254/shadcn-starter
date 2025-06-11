import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Rocket, ShoppingCart, MapPin, Clock, Utensils, Heart } from "lucide-react"

const features = [
  {
    icon: Rocket,
    title: "AI Meal Planning",
    description:
      "Our advanced AI creates personalized meal plans based on your preferences, dietary restrictions, and nutritional goals.",
    benefits: [
      "Personalized recommendations",
      "Dietary restriction support",
      "Nutritional optimization",
      "Variety and creativity",
    ],
  },
  {
    icon: ShoppingCart,
    title: "Smart Grocery Lists",
    description:
      "Automatically generate organized grocery lists from your meal plans, with smart categorization and quantity optimization.",
    benefits: ["Auto-generated lists", "Smart categorization", "Quantity optimization", "Pantry integration"],
  },
  {
    icon: MapPin,
    title: "Location-Based Shopping",
    description:
      "Find the best stores near you, compare prices, and get optimized shopping routes to save time and money.",
    benefits: ["Store locator", "Price comparison", "Optimized routes", "Real-time availability"],
  },
  {
    icon: Clock,
    title: "Time-Saving Automation",
    description: "Streamline your meal prep with automated scheduling, prep time calculations, and cooking reminders.",
    benefits: ["Automated scheduling", "Prep time tracking", "Smart reminders", "Batch cooking suggestions"],
  },
  {
    icon: Utensils,
    title: "Recipe Management",
    description:
      "Access thousands of recipes, save favorites, and get step-by-step cooking instructions with video guides.",
    benefits: ["Extensive recipe database", "Video instructions", "Favorite collections", "Cooking tips"],
  },
  {
    icon: Heart,
    title: "Health & Nutrition",
    description: "Track your nutritional intake, monitor health goals, and get insights into your eating patterns.",
    benefits: ["Nutrition tracking", "Health goal monitoring", "Eating pattern insights", "Wellness recommendations"],
  },
]

export function FeaturesGrid() {
  return (
    <section className="py-20 px-4 bg-background/95">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need for Smart Meal Planning</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive suite of AI-powered tools makes meal planning, grocery shopping, and cooking easier than
            ever before.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300 border-orange-100">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                <CardDescription className="text-gray-600">{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-3" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
