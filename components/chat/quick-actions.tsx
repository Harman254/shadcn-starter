'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChefHat, RefreshCw, ShoppingCart, Globe, Clock, DollarSign } from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  message: string;
  variant?: 'default' | 'outline' | 'ghost';
}

interface QuickActionsProps {
  onActionClick: (message: string) => void;
  context?: 'meal-plan' | 'grocery-list' | 'recipe' | 'general';
}

const quickActions: Record<string, QuickAction[]> = {
  'meal-plan': [
    {
      id: 'Explain More about the plan',
      label: 'Explore',
      icon: <ChefHat className="h-3.5 w-3.5" />,
      message: 'Explain more about the plan',
      variant: 'default',
    },
    {
      id: 'grocery',
      label: '🛒 Create grocery list',
      icon: <ShoppingCart className="h-3.5 w-3.5" />,
      message: 'Create a grocery list for this meal plan',
      variant: 'outline',
    },
    {
      id: 'swap',
      label: '🍛 Swap a meal',
      icon: <RefreshCw className="h-3.5 w-3.5" />,
      message: 'Can you swap one of the meals?',
      variant: 'outline',
    },
    {
      id: 'snacks',
      label: 'Add snacks',
      icon: <ChefHat className="h-3.5 w-3.5" />,
      message: 'Add some snacks to this meal plan',
      variant: 'outline',
    },
  ],
  'grocery-list': [
    {
      id: 'cheaper',
      label: 'Make it cheaper',
      icon: <DollarSign className="h-3.5 w-3.5" />,
      message: 'Can you suggest cheaper alternatives?',
      variant: 'outline',
    },
    {
      id: 'healthier',
      label: 'Healthier options',
      icon: <ChefHat className="h-3.5 w-3.5" />,
      message: 'Suggest healthier alternatives',
      variant: 'outline',
    },
  ],
  'recipe': [
    {
      id: 'variations',
      label: 'Show variations',
      icon: <RefreshCw className="h-3.5 w-3.5" />,
      message: 'What are some variations of this recipe?',
      variant: 'outline',
    },
    {
      id: 'substitutes',
      label: 'Ingredient substitutes',
      icon: <ChefHat className="h-3.5 w-3.5" />,
      message: 'What can I substitute for the ingredients?',
      variant: 'outline',
    },
  ],
  'general': [
    {
      id: 'quick-plan',
      label: '🥗 Quick meal plan',
      icon: <ChefHat className="h-3.5 w-3.5" />,
      message: 'Generate a quick 1-day meal plan',
      variant: 'outline',
    },
    {
      id: 'kenyan',
      label: '🌍 Kenyan dishes',
      icon: <Globe className="h-3.5 w-3.5" />,
      message: 'Show me some Kenyan dishes',
      variant: 'outline',
    },
    {
      id: 'fast',
      label: '⏱️ 15-minute meals',
      icon: <Clock className="h-3.5 w-3.5" />,
      message: 'Show me 15-minute meal ideas',
      variant: 'outline',
    },
    {
      id: 'budget',
      label: '💸 Budget meals',
      icon: <DollarSign className="h-3.5 w-3.5" />,
      message: 'Show me budget meals under KSh 300',
      variant: 'outline',
    },
  ],
};

export function QuickActions({ onActionClick, context = 'general' }: QuickActionsProps) {
  const actions = quickActions[context] || quickActions.general;

  if (actions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
      className="flex flex-wrap items-center gap-2 mt-3 px-1"
    >
      {actions.map((action, index) => (
        <motion.div
          key={action.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15, delay: 0.1 + index * 0.03 }}
        >
          <Button
            variant={action.variant || 'outline'}
            size="sm"
            onClick={() => onActionClick(action.message)}
            className={cn(
              "h-7 px-2.5 sm:px-3 text-xs sm:text-[13px]",
              "font-medium",
              "rounded-lg",
              "transition-all duration-200",
              "hover:scale-105 active:scale-95",
              "border-border/50",
              action.variant === 'default' 
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-background/50 hover:bg-muted/50 hover:border-primary/30"
            )}
          >
            {/* Only show icon if label doesn't contain emoji (emojis replace icons) */}
            {!action.label.match(/[🥗🍛🛒🌍⏱️💸]/) && (
              <span className="mr-1.5">{action.icon}</span>
            )}
            {action.label}
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
}

