import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, MessageSquare, ShoppingBag, MapPin, ChefHat } from "lucide-react"

const steps = [
  {
    step: 1,
    icon: MessageSquare,
    title: "Tell Us Your Preferences",
    description:
      "Share your dietary preferences, restrictions, cooking skills, and family size. Our AI learns what you love.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    step: 2,
    icon: ChefHat,
    title: "Get Your AI Meal Plan",
    description:
      "Receive a personalized weekly meal plan with recipes, nutritional info, and prep instructions tailored just for you.",
    color: "bg-green-100 text-green-600",
  },
  {
    step: 3,
    icon: ShoppingBag,
    title: "Generate Smart Grocery List",
    description:
      "Your meal plan automatically creates an organized grocery list with exact quantities and smart categorization.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    step: 4,
    icon: MapPin,
    title: "Shop with Location Intelligence",
    description:
      "Find the best stores near you, compare prices, and get optimized shopping routes to save time and money.",
    color: "bg-orange-100 text-orange-600",
  },
]

export function HowItWorks() {
  return (
    <section className="py-20 px-4 bg-background/95">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-orange-100 text-orange-800">
            Simple Process
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From preferences to plate in four simple steps. Our AI handles the complexity so you can focus on enjoying
            great meals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <step.icon className="w-8 h-8" />
                  </div>
                  <div className="text-sm font-semibold text-gray-500 mb-2">STEP {step.step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
