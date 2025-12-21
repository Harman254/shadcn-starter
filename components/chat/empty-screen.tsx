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
    heading: 'Week Meal Plan',
    message: 'Create a healthy 5-day meal plan for weight loss with 3 meals per day',
    iconName: 'ChefHat',
  },
  {
    heading: 'Budget Meals',
    message: 'Show me budget-friendly dinner ideas under $5 per serving',
    iconName: 'Pizza',
  },
  {
    heading: 'High Protein',
    message: 'Generate high-protein meal ideas for muscle building',
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ context: '' }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
        }
      } else {
        // API endpoint might not exist - use defaults silently
        if (process.env.NODE_ENV === 'development') {
          console.warn('[EmptyScreen] Suggestions API returned:', response.status);
        }
      }
    } catch (error) {
      // Silently handle errors - use default suggestions
      if (process.env.NODE_ENV === 'development') {
        console.warn('[EmptyScreen] Failed to fetch suggestions:', error);
      }
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
        "h-full flex flex-col items-center justify-center",
        "overflow-y-auto overflow-x-hidden",
        "px-4 pb-20" // Add padding bottom to account for chat input
      )}
      role="region"
      aria-labelledby="empty-title"
    >
      <div className="max-w-3xl w-full mx-auto flex flex-col items-center text-center space-y-8">
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="space-y-4"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-2 ring-1 ring-primary/20"
          >
            <Wand2 className="h-8 w-8 text-primary" />
          </motion.div>
          
          <h2 
            id="empty-title" 
            className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground"
          >
            What are we cooking?
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            I can help you plan meals, find recipes, or create a grocery list for your next shop.
          </p>
        </motion.div>

        {/* Example Messages - Redesigned as Chips */}
        <motion.div
          variants={containerVariants}
          className="flex flex-wrap justify-center gap-2 w-full max-w-xl"
          role="group"
          aria-label="Example conversation starters"
        >
          {suggestions.map((example, index) => {
            const Icon = iconMap[example.iconName] || Coffee;
            return (
              <motion.button
                key={example.heading}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onExampleClick(example.message)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5",
                  "bg-card/50 hover:bg-card border border-border/50 hover:border-primary/30",
                  "rounded-full shadow-sm hover:shadow-md",
                  "transition-all duration-200",
                  "text-sm font-medium text-foreground/80 hover:text-primary"
                )}
              >
                <Icon className="h-4 w-4 opacity-70" />
                <span>{example.heading}</span>
              </motion.button>
            );
          })}
          
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchSuggestions}
            disabled={isLoading}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
            aria-label="Refresh suggestions"
          >
            <RefreshCw className={cn("h-4 w-4 text-muted-foreground", isLoading && "animate-spin")} />
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}