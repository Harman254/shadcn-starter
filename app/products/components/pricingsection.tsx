import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Rocket } from "lucide-react"

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for trying out AI meal planning",
    features: ["3 AI meal plans per month", "Basic grocery lists", "Recipe database access", "Mobile app access"],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    description: "Everything you need for smart meal planning",
    features: [
      "Unlimited AI meal plans",
      "Smart grocery lists with optimization",
      "Location-based store finder",
      "Price comparison",
      "Nutritional tracking",
      "Family meal planning",
      "Recipe customization",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Family",
    price: "$19.99",
    period: "/month",
    description: "Perfect for families and meal prep enthusiasts",
    features: [
      "Everything in Pro",
      "Up to 6 family members",
      "Advanced dietary restrictions",
      "Bulk meal prep planning",
      "Shopping route optimization",
      "Pantry management",
      "Meal prep scheduling",
      "Premium recipe collection",
      "24/7 priority support",
    ],
    cta: "Start Family Trial",
    popular: false,
  },
]

export function PricingSection() {
  return (
    <section className="py-20 px-4 bg-background/95">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start free and upgrade as your meal planning needs grow. All plans include our core AI features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative hover:shadow-lg transition-shadow duration-300 ${
                plan.popular ? "border-orange-200 shadow-lg" : ""
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-600 hover:bg-orange-700">
                  <Rocket className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-gray-600">{plan.period}</span>}
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.popular ? "bg-orange-600 hover:bg-orange-700" : "bg-gray-900 hover:bg-gray-800"
                  }`}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">All plans include a 14-day free trial. No credit card required.</p>
          <p className="text-sm text-gray-500">
            Need a custom solution for your organization?
            <a href="/contact" className="text-orange-600 hover:text-orange-700 ml-1">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
