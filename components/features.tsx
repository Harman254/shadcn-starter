'use client'

import React from "react"
import { DollarSign, MessageSquare, PersonStanding, Timer, Zap, ZoomIn } from "lucide-react"
import { useRouter } from "next/navigation";

const Feature17 = ({
  heading = "Smarter Meal Planning",
  subheading = "Why You'll Love It",
  features = [
    {
      title: "Fast Planning",
      description: "No more stress or dinner dread—get smart plans in seconds instead.",
      icon: <Timer className="w-6 h-6" />,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Smart Recipes",
      description: "AI picks meals that match your goal—from bulking up to self-control.",
      icon: <Zap className="w-6 h-6" />,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Healthy Choices",
      description: "Eat with balance, taste, and flair—our plans are built with expert care.",
      icon: <ZoomIn className="w-6 h-6" />,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "For Everyone",
      description: "Solo, family, fit, or new—we've got the perfect plan for you.",
      icon: <PersonStanding className="w-6 h-6" />,
      gradient: "from-orange-500 to-red-500",
    },
    {
      title: "Budget Friendly",
      description: "Stick to meals that save you cash—without dull food or boring hash.",
      icon: <DollarSign className="w-6 h-6" />,
      gradient: "from-yellow-500 to-amber-500",
    },
    {
      title: "Live Support",
      description: "Questions? Feedback? Hit us fast—our friendly help is built to last.",
      icon: <MessageSquare className="w-6 h-6" />,
      gradient: "from-indigo-500 to-blue-500",
    },
  ],
}) => {
  const router = useRouter();
  return (
    <section className="py-24 bg-gradient-to-b from-background/5 to-background/95 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium mb-6">
            {subheading}
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {heading}
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover what makes our AI-powered plans the easiest way to eat well, save time, and stay on track.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>

              {/* Subtle accent line */}
              <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.gradient} w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl`} />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <button onClick={() => router.push('/meal-plans/new')} className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
            Start Your Journey Today
          </button>
        </div>
      </div>
    </section>
  )
}

export default Feature17