"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ChefHat, BabyIcon } from "lucide-react"
import { motion } from "framer-motion"

export default function MealLoading() {
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  const stepVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (index: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: index * 0.2,
        duration: 0.4,
        ease: "easeOut",
      },
    }),
  }

  const sparkleVariants = {
    animate: {
      y: [-8, -16, -8],
      rotate: [0, 180, 360],
      scale: [1, 1.2, 1],
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  }

  const chefHatVariants = {
    animate: {
      rotate: [-2, 2, -2],
      transition: {
        duration: 3,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  }

  const pulseVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 1.5,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  }

  const dotVariants = {
    animate: (index: number) => ({
      y: [-4, -12, -4],
      transition: {
        duration: 0.6,
        repeat: Number.POSITIVE_INFINITY,
        delay: index * 0.1,
        ease: "easeInOut",
      },
    }),
  }

  const progressSteps = [
    { text: "Analyzing preferences", status: "completed" },
    { text: "Selecting ingredients", status: "active" },
    { text: "Finalizing plan", status: "pending" },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-950 dark:to-slate-900">
      <div className="container max-w-md mx-auto px-4">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-8 text-center">
              {/* Animated main icon */}
              <motion.div className="relative mb-8" variants={itemVariants}>
                <motion.div
                  className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl shadow-lg"
                  variants={chefHatVariants}
                  animate="animate"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChefHat className="w-10 h-10 text-white" />
                </motion.div>

                {/* Animated sparkle */}
                <motion.div className="absolute -top-2 -right-2" variants={sparkleVariants} animate="animate">
                  <BabyIcon className="w-5 h-5 text-amber-400" />
                </motion.div>

                {/* Subtle glow effect */}
                <motion.div
                  className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-amber-500/20 rounded-2xl blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>

              {/* Animated typography */}
              <motion.div className="space-y-3 mb-8" variants={itemVariants}>
                <motion.h2
                  className="text-2xl font-semibold text-slate-900 dark:text-slate-100"
                  animate={{
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  Crafting Your Meal Plan
                </motion.h2>
                <motion.p className="text-slate-600 dark:text-slate-400" variants={itemVariants}>
                  Personalizing recipes just for you
                </motion.p>
              </motion.div>

              {/* Animated progress steps */}
              <motion.div className="space-y-3 mb-8" variants={itemVariants}>
                {progressSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3 text-sm"
                    custom={index}
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div
                      className={`w-2 h-2 rounded-full ${
                        step.status === "completed"
                          ? "bg-orange-500"
                          : step.status === "active"
                            ? "bg-orange-300"
                            : "bg-slate-300"
                      }`}
                      variants={step.status === "active" ? pulseVariants : {}}
                      animate={step.status === "active" ? "animate" : ""}
                    />
                    <motion.span
                      className={`${
                        step.status === "completed"
                          ? "text-slate-700 dark:text-slate-300"
                          : step.status === "active"
                            ? "text-slate-600 dark:text-slate-400"
                            : "text-slate-500 dark:text-slate-500"
                      }`}
                      animate={
                        step.status === "active"
                          ? {
                              opacity: [0.7, 1, 0.7],
                            }
                          : {}
                      }
                      transition={
                        step.status === "active"
                          ? {
                              duration: 1.5,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "easeInOut",
                            }
                          : {}
                      }
                    >
                      {step.text}
                    </motion.span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Smooth loading dots */}
              <motion.div className="flex justify-center" variants={itemVariants}>
                <div className="flex space-x-1">
                  {[0, 1, 2].map((index) => (
                    <motion.div
                      key={index}
                      className="w-2 h-2 bg-orange-500 rounded-full"
                      custom={index}
                      variants={dotVariants}
                      animate="animate"
                    />
                  ))}
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
