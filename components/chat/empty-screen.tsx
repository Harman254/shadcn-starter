'use client';

import { ArrowRight, LogIn, Wand2, ChefHat, UtensilsCrossed, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EmptyScreenProps {
  onExampleClick: (example: string) => void;
  requireAuth?: boolean;
}

const exampleMessages = [
  {
    heading: 'Generate Meal Plan',
    message: 'Create a 3-day meal plan for me',
    icon: ChefHat,
    gradient: 'from-orange-500/10 to-red-500/10',
  },
  {
    heading: 'Get Recipe Help',
    message: 'How do I make a classic lasagna?',
    icon: BookOpen,
    gradient: 'from-blue-500/10 to-purple-500/10',
  },
  {
    heading: 'Cooking Tips',
    message: 'What\'s a healthy breakfast idea?',
    icon: UtensilsCrossed,
    gradient: 'from-green-500/10 to-emerald-500/10',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export function EmptyScreen({ onExampleClick, requireAuth = false }: EmptyScreenProps) {
  if (requireAuth) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="h-full flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-auto min-h-[60vh]"
        role="region"
        aria-labelledby="auth-title"
      >
        <div className="max-w-md w-full mx-auto text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block p-4 sm:p-5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl mb-6 border border-primary/20"
            aria-hidden="true"
          >
            <LogIn className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            id="auth-title"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text"
          >
            Sign in to Chat
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-2 text-muted-foreground text-sm sm:text-base leading-relaxed max-w-sm mx-auto"
          >
            Sign in to start chatting with your AI kitchen assistant. Get personalized recipes, meal tracking, and cooking tips.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mt-8 space-y-3"
          >
            <Button
              onClick={() => onExampleClick('')}
              className={cn(
                "w-full h-auto py-3.5 sm:py-4 px-6",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90",
                "font-semibold text-base",
                "rounded-xl sm:rounded-2xl",
                "shadow-lg shadow-primary/20",
                "transition-all duration-200",
                "hover:shadow-xl hover:shadow-primary/30",
                "hover:scale-[1.02] active:scale-[0.98]"
              )}
              aria-label="Sign in to continue chatting"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign in to Continue
            </Button>
            <p className="text-xs text-muted-foreground/70 mt-4">
              New to Mealwise? Sign up for free to get started.
            </p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-full flex items-center justify-center overflow-auto"
      role="region"
      aria-labelledby="empty-title"
    >
      <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-8 sm:mb-10 md:mb-12"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block p-3 sm:p-4 mb-4 sm:mb-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl border border-primary/20"
          >
            <Wand2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </motion.div>
          
          <h2 
            id="empty-title" 
            className={cn(
              "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
              "font-bold text-foreground mb-3 sm:mb-4",
              "tracking-tight leading-tight",
              "bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text"
            )}
          >
            How can I help you today?
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg mt-2">
            Ask me anything about cooking, meal planning, or nutrition
          </p>
        </motion.div>

        {/* Example Messages */}
        <motion.div
          variants={containerVariants}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
          role="group"
          aria-label="Example conversation starters"
        >
          {exampleMessages.map((example, index) => {
            const Icon = example.icon;
            return (
              <motion.div
                key={example.heading}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
            <Button
              variant="outline"
                  className={cn(
                    "h-auto w-full p-4 sm:p-5",
                    "text-left justify-start",
                    "bg-card/50 dark:bg-card/30",
                    "border-border/60",
                    "hover:bg-muted/50 dark:hover:bg-muted/30",
                    "hover:border-primary/40",
                    "transition-all duration-300",
                    "group focus-visible:ring-2 focus-visible:ring-primary",
                    "rounded-xl sm:rounded-2xl",
                    "shadow-sm hover:shadow-md",
                    "relative overflow-hidden"
                  )}
              onClick={() => onExampleClick(example.message)}
              aria-label={`Start conversation: ${example.message}`}
            >
                  {/* Gradient background */}
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    "bg-gradient-to-br",
                    example.gradient
                  )} />
                  
                  <div className="relative z-10 flex items-start gap-3 sm:gap-4 w-full">
                    <div className={cn(
                      "p-2 sm:p-2.5 rounded-lg sm:rounded-xl",
                      "bg-primary/10 group-hover:bg-primary/20",
                      "border border-primary/20",
                      "transition-colors duration-300",
                      "shrink-0"
                    )}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
              <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm sm:text-base mb-1.5 group-hover:text-foreground text-foreground transition-colors">
                        {example.heading}
                      </p>
                <p className="font-normal text-muted-foreground text-xs sm:text-sm line-clamp-2 leading-relaxed">
                  {example.message}
                </p>
              </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground ml-2 shrink-0 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" aria-hidden="true" />
                  </div>
            </Button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
}