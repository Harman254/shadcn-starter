import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Busy Mom of 3",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    text: "This app has been a game-changer for our family! The AI meal plans are spot-on, and the grocery lists save me hours every week. My kids actually eat the meals it suggests!",
  },
  {
    name: "Mike Chen",
    role: "Fitness Enthusiast",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    text: "Perfect for my macro tracking goals. The AI understands my protein requirements and creates delicious meal plans that fit my fitness routine. The location-based shopping is brilliant!",
  },
  {
    name: "Emily Rodriguez",
    role: "Working Professional",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    text: "As someone with multiple food allergies, finding this app was a blessing. It creates safe, delicious meal plans and even finds specialty stores near me. Absolutely love it!",
  },
  {
    name: "David Thompson",
    role: "College Student",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    text: "Budget-friendly meal planning that actually tastes good! The app helps me eat healthy on a student budget and the grocery price comparisons save me money every month.",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 px-4 bg-background/95">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by Thousands of Users</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See what our community is saying about their meal planning transformation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <Avatar className="w-12 h-12 mr-4">
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback>
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
