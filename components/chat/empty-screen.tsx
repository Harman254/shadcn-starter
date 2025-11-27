'use client';

import { ArrowRight, LogIn, Wand2, ChefHat, UtensilsCrossed, BookOpen, Coffee, Pizza, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface EmptyScreenProps {
  onExampleClick: (example: string) => void;
  requireAuth?: boolean;
}

const iconMap = {
  ChefHat,
  UtensilsCrossed,
  BookOpen,
  Coffee,
  Pizza,
};

interface Suggestion {
  heading: string;
  message: string;
  iconName: keyof typeof iconMap;
}

const defaultSuggestions: Suggestion[] = [
  {
    heading: 'Quick Meal Plan',
    message: 'Generate a quick 1-day meal plan',
    iconName: 'ChefHat',
  },
  {
    heading: 'Kenyan Dishes',
    message: 'Show me some Kenyan dishes',
    iconName: 'BookOpen',
  },
  {
    heading: '15-Minute Meals',
    message: 'Show me 15-minute meal ideas',
    iconName: 'UtensilsCrossed',
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
  const [suggestions, setSuggestions] = useState<Suggestion[]>(defaultSuggestions);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        body: JSON.stringify({ context: '' }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.suggestions && Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions);
        }
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!requireAuth) {
      fetchSuggestions();
    }
  }, [requireAuth]);
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
      className={cn(
        "h-full flex items-center justify-center",
        "overflow-y-auto overflow-x-hidden",
        "overflow-scroll-smooth" // Smooth scrolling on mobile
      )}
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
            Welcome! 👋
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg md:text-xl mt-2 max-w-2xl mx-auto tracking-tight leading-relaxed">
            I&apos;m your AI kitchen assistant. I can help you plan meals, find recipes, create grocery lists, and answer cooking questions. What would you like to do?
          </p>
        </motion.div>

        {/* Refresh Button */}
        <motion.div 
          variants={itemVariants}
          className="flex justify-center mb-8"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchSuggestions}
            disabled={isLoading}
            className="text-muted-foreground hover:text-primary"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh Ideas
          </Button>
        </motion.div>

        {/* Example Messages */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl mx-auto"
          role="group"
          aria-label="Example conversation starters"
        >
          {suggestions.map((example, index) => {
            const Icon = iconMap[example.iconName] || Coffee;
            const gradients = [
              'from-orange-500/10 to-red-500/10',
              'from-blue-500/10 to-purple-500/10',
              'from-green-500/10 to-emerald-500/10',
            ];
            const gradient = gradients[index % gradients.length];

            return (
              <motion.div
                key={example.heading}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="h-full"
              >
                <Button
                  variant="outline"
                  className={cn(
                    "h-full w-full p-6",
                    "flex flex-col items-start gap-4",
                    "bg-card/50 dark:bg-card/20",
                    "backdrop-blur-sm",
                    "border-border/50",
                    "hover:bg-accent/50 hover:border-primary/20",
                    "transition-all duration-300",
                    "rounded-2xl",
                    "shadow-sm hover:shadow-md",
                    "relative overflow-hidden group"
                  )}
                  onClick={() => onExampleClick(example.message)}
                >
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    "bg-gradient-to-br",
                    gradient
                  )} />
                  
                  <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-xl bg-background/80 shadow-sm border border-border/50 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div className="relative z-10 text-left space-y-2">
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                      {example.heading}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {example.message}
                    </p>
                  </div>
                  
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <ArrowRight className="h-5 w-5 text-primary" />
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