'use client';

import { ArrowRight, Star, ChefHat, UtensilsCrossed, ShoppingBag, Leaf, Monitor, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface EmptyScreenProps {
  onExampleClick: (example: string) => void;
  requireAuth?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

interface Suggestion {
    label: string;
    message: string;
    icon: any;
    color: string;
}

const suggestions: Suggestion[] = [
    {
        label: 'Create Meal Plan',
        message: 'Create a healthy 3-day meal plan. I like Italian and Mexican food.',
        icon: ChefHat,
        color: 'text-orange-500',
    },
    {
        label: 'Empty My Fridge',
        message: 'I have chicken breast, spinach, and heavy cream. What can I make?',
        icon: UtensilsCrossed,
        color: 'text-blue-500',
    },
    {
        label: 'Seasonal Produce',
        message: 'What fruits and vegetables are in season right now?',
        icon: Leaf,
        color: 'text-green-500',
    },
    {
        label: 'Quick Recipe',
        message: 'I need a dinner recipe ready in 20 minutes.',
        icon: Star,
        color: 'text-purple-500',
    },
];

export function EmptyScreen({ onExampleClick, requireAuth = false }: EmptyScreenProps) {
  
  // Auth Screen Variant
  if (requireAuth) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="h-full flex flex-col items-center justify-center p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "backOut" }}
          className="bg-primary/5 p-6 rounded-full mb-6 ring-1 ring-primary/10"
        >
            <ChefHat className="h-10 w-10 text-primary" />
        </motion.div>
        <h2 className="text-2xl font-semibold tracking-tight font-sans mb-2">
            Welcome to Your Kitchen AI
        </h2>
        <p className="text-muted-foreground max-w-sm mb-8 font-sans">
            Sign in to start planning meals, tracking nutrition, and organizing your grocery lists.
        </p>
        <Button 
            onClick={() => onExampleClick('')} 
            className="rounded-full px-8 font-medium font-sans"
        >
            Sign In to Start
            <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    );
  }

  // Default Chat Start Interface
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-full flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto"
    >
      <div className="max-w-2xl w-full flex flex-col items-center text-center">
        
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="mb-8 sm:mb-12 space-y-4">
            <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-background border rounded-2xl shadow-sm mb-4">
               <span className="text-2xl sm:text-3xl">🍳</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight font-sans bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                What are we cooking?
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto font-sans leading-relaxed">
                I'm your personal AI chef. Ask me to plan meals, find recipes, or verify nutrition facts.
            </p>
        </motion.div>

        {/* Suggestions Grid */}
        <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full"
        >
            {suggestions.map((item, i) => (
                <motion.button
                    key={item.label}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onExampleClick(item.message)}
                    className={cn(
                        "group flex items-center gap-3 p-4 text-left",
                        "bg-card/50 hover:bg-card border border-border/50 hover:border-primary/20",
                        "rounded-xl transition-all duration-200",
                        "shadow-sm hover:shadow-md"
                    )}
                >
                    <div className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-lg",
                        "bg-background ring-1 ring-border/50 group-hover:ring-primary/20 transition-colors",
                        item.color
                    )}>
                        <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="font-medium font-sans text-foreground/90 group-hover:text-primary transition-colors">
                            {item.label}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1 font-sans mt-0.5">
                            {item.message}
                        </div>
                    </div>
                </motion.button>
            ))}
        </motion.div>

        {/* Footer/Input Hint */}
        {/* <motion.p 
            variants={itemVariants} 
            className="mt-8 text-xs sm:text-sm text-muted-foreground/60 font-sans"
        >
            Or just type whatever you're craving below...
        </motion.p> */}
      </div>
    </motion.div>
  );
}