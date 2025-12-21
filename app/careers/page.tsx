import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Force dynamic rendering since Navbar uses headers() for session
export const dynamic = 'force-dynamic';
import {
  Users,
  Utensils,
  TrendingUp,
  BarChart3,
  MapPin,
  Clock,
  ArrowRight,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Heart,
  Zap,
  Target,
} from "lucide-react"
import Footer from "@/components/footer"

export default function CareersPage() {
  const values = [
    {
      icon: <Users className="h-8 w-8 text-zinc-600" />,
      title: "User-First Innovation",
      description: "Every decision we make starts with our users&apos; needs and experiences in mind.",
    },
    {
      icon: <Utensils className="h-8 w-8 text-zinc-600" />,
      title: "Food Meets Tech",
      description: "We bridge the gap between cutting-edge technology and everyday nutrition.",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-zinc-600" />,
      title: "Continuous Improvement",
      description: "We embrace learning, iteration, and growth in everything we do.",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-zinc-600" />,
      title: "Empowerment Through Data",
      description: "We believe data-driven insights can transform how people approach their health.",
    },
  ]

  const openRoles = [
    {
      title: "Frontend Developer",
      location: "Remote",
      type: "Full-time",
      description: "Build beautiful, responsive interfaces that make meal planning delightful and intuitive.",
      tags: ["React", "TypeScript", "Tailwind CSS"],
    },
    {
      title: "AI Research Engineer",
      location: "San Francisco, CA",
      type: "Full-time",
      description: "Develop machine learning models that power personalized nutrition recommendations.",
      tags: ["Python", "TensorFlow", "ML"],
    },
    {
      title: "Growth Marketer",
      location: "Remote",
      type: "Full-time",
      description: "Drive user acquisition and engagement through data-driven marketing strategies.",
      tags: ["Analytics", "SEO", "Content"],
    },
    {
      title: "Customer Success Lead",
      location: "New York, NY",
      type: "Full-time",
      description: "Help our users achieve their health goals and maximize value from our platform.",
      tags: ["Support", "Strategy", "Communication"],
    },
  ]

  const testimonials = [
    {
      quote:
        "Working at Mealwise feels like being part of something bigger. Every feature we ship has the potential to improve someone's relationship with food.",
      author: "Sarah Chen",
      role: "Senior Product Designer",
    },
    {
      quote:
        "The team here is incredibly collaborative. We're all passionate about using technology to solve real problems in people's daily lives.",
      author: "Marcus Rodriguez",
      role: "Backend Engineer",
    },
    {
      quote:
        "I love how we balance innovation with practicality. We're building the future of nutrition, but always with our users' real needs in mind.",
      author: "Emily Watson",
      role: "Data Scientist",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(63,63,70,0.2),transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Work with Purpose</h1>
            <p className="text-xl sm:text-2xl text-zinc-600 dark:text-zinc-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join us on our mission to revolutionize how the world eats — one AI-powered meal at a time.
            </p>
            <Button size="lg" className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 px-8 py-3 text-lg transition-colors">
              View Open Roles
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-20 bg-white dark:bg-zinc-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full">
              <Target className="h-12 w-12 text-zinc-700 dark:text-zinc-200" />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">Why Mealwise?</h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
            We believe that everyone deserves access to personalized, intelligent nutrition guidance. Through AI-powered
            meal planning, smart grocery tools, and intuitive health insights, we&apos;re making it easier for people to eat
            better, feel better, and live healthier lives. Our technology transforms complex nutritional science into
            simple, actionable recommendations that fit seamlessly into busy lifestyles.
          </p>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Our Values</h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-300">The principles that guide everything we do</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full">{value.icon}</div>
                  </div>
                  <CardTitle className="text-xl text-zinc-900 dark:text-zinc-100">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-600 dark:text-zinc-300 text-center">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Open Roles</h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-300">Join our growing team of passionate innovators</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {openRoles.map((role, index) => (
              <Card key={index} className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start mb-4">
                    <CardTitle className="text-xl text-zinc-900 dark:text-zinc-100">{role.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
                        <MapPin className="h-3 w-3 mr-1" />
                        {role.location}
                      </Badge>
                      <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
                        <Clock className="h-3 w-3 mr-1" />
                        {role.type}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-zinc-600 dark:text-zinc-300 text-base">{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {role.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors">Apply Now</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Life at Mealwise */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Life at Mealwise</h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-300">Hear from our team members</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <Heart className="h-6 w-6 text-zinc-400 dark:text-zinc-600" />
                  </div>
                  <blockquote className="text-zinc-700 dark:text-zinc-200 mb-6 italic">{testimonial.quote}</blockquote>
                  <div className="text-center">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{testimonial.author}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-white dark:bg-zinc-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full">
              <Zap className="h-12 w-12 text-zinc-700 dark:text-zinc-200" />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Don&apos;t See a Role That Fits?</h2>
          <p className="text-xl text-zinc-600 dark:text-zinc-300 mb-8 max-w-2xl mx-auto">
            We&apos;re always looking for passionate people. Send us your profile anyway.
          </p>
          <Button
            size="lg"
            variant="outline"
            className="border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-8 py-3 text-lg bg-transparent transition-colors"
          >
            <Mail className="mr-2 h-5 w-5" />
            Send Us Your Info
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
