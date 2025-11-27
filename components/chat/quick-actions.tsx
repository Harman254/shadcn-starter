'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  message: string;
  variant?: 'default' | 'outline' | 'ghost';
  description?: string; // Optional short description
}

interface QuickActionsProps {
  onActionClick: (message: string) => void;
  context?: 'meal-plan' | 'grocery-list' | 'recipe' | 'general';
}

const quickActions: Record<string, QuickAction[]> = {
  'meal-plan': [
    {
      id: 'explore',
      label: 'Explore Plan',
      message: 'Explain more about the plan',
      variant: 'default',
      description: 'Learn more details',
    },
    {
      id: 'grocery',
      label: 'Grocery List',
      message: 'Create a grocery list for this meal plan',
      variant: 'outline',
      description: 'Get shopping list',
    },
    {
      id: 'swap',
      label: 'Swap Meal',
      message: 'Can you swap one of the meals?',
      variant: 'outline',
      description: 'Replace a meal',
    },
    {
      id: 'snacks',
      label: 'Add Snacks',
      message: 'Add some snacks to this meal plan',
      variant: 'outline',
      description: 'Include snacks',
    },
  ],
  'grocery-list': [
    {
      id: 'cheaper',
      label: 'Cheaper Options',
      message: 'Can you suggest cheaper alternatives?',
      variant: 'outline',
      description: 'Find budget alternatives',
    },
    {
      id: 'healthier',
      label: 'Healthier Options',
      message: 'Suggest healthier alternatives',
      variant: 'outline',
      description: 'Get nutritious swaps',
    },
  ],
  'recipe': [
    {
      id: 'variations',
      label: 'Variations',
      message: 'What are some variations of this recipe?',
      variant: 'outline',
      description: 'See different versions',
    },
    {
      id: 'substitutes',
      label: 'Substitutes',
      message: 'What can I substitute for the ingredients?',
      variant: 'outline',
      description: 'Find alternatives',
    },
  ],
  'general': [], // Removed - no longer showing general quick actions in chat
};

export function QuickActions({ onActionClick, context = 'general' }: QuickActionsProps) {
  const actions = quickActions[context] || [];

  if (actions.length === 0) return null;

  // Determine layout based on context and number of actions
  const isCompact = context === 'grocery-list' || context === 'recipe';
  const isWide = context === 'meal-plan' && actions.length >= 4;
  const isGeneral = context === 'general';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative",
        "w-full"
      )}
    >
      {/* Subtle background container */}
      <div className={cn(
        "relative",
        isGeneral ? "rounded-lg sm:rounded-xl" : "rounded-xl sm:rounded-2xl",
        isGeneral 
          ? "bg-muted/20 dark:bg-muted/10 border border-border/30"
          : "bg-gradient-to-br from-muted/30 via-muted/20 to-transparent dark:from-muted/20 dark:via-muted/10 dark:to-transparent border border-border/40",
        "backdrop-blur-sm",
        isGeneral ? "p-2 sm:p-2.5" : "p-3 sm:p-4",
        isGeneral ? "shadow-none" : "shadow-sm"
      )}>
        {/* Header label - only for general context */}
        {isGeneral && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-2"
          >
            <span className="text-[10px] sm:text-xs font-medium text-muted-foreground/80 tracking-wide uppercase">
              Quick Actions
            </span>
          </motion.div>
        )}

        {/* Actions Grid */}
        <div className={cn(
          "grid gap-1.5 sm:gap-2",
          isCompact 
            ? "grid-cols-1 sm:grid-cols-2" 
            : isWide
            ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"
            : isGeneral
            ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"
            : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"
        )}>
          {actions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, scale: 0.95, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                duration: 0.2, 
                delay: 0.1 + index * 0.05,
                ease: [0.22, 1, 0.36, 1]
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={action.variant || 'outline'}
                size="sm"
                onClick={() => onActionClick(action.message)}
                className={cn(
                  "relative w-full",
                  isGeneral 
                    ? "h-auto min-h-[44px] sm:min-h-[34px] px-3 sm:px-2.5 py-2 sm:py-1.5" // Mobile: 44px min-height
                    : "h-auto min-h-[44px] sm:min-h-[48px] px-3 sm:px-4 py-2.5 sm:py-3",
                  "flex flex-col items-start justify-center",
                  isGeneral ? "gap-0" : "gap-1",
                  "text-left",
                  isGeneral ? "rounded-md" : "rounded-lg sm:rounded-xl",
                  "transition-all duration-200",
                  "group",
                  // Primary action styling
                  action.variant === 'default' 
                    ? cn(
                        "bg-primary text-primary-foreground",
                        "hover:bg-primary/90",
                        "shadow-md shadow-primary/20",
                        "hover:shadow-lg hover:shadow-primary/30",
                        "border border-primary/20"
                      )
                    : isGeneral
                    ? cn(
                        "bg-transparent hover:bg-muted/40",
                        "dark:hover:bg-muted/20",
                        "border border-border/30 hover:border-border/50",
                        "text-foreground"
                      )
                    : cn(
                        "bg-background/60 hover:bg-background/80",
                        "dark:bg-background/40 dark:hover:bg-background/60",
                        "hover:border-primary/40",
                        "hover:shadow-md",
                        "border border-border/50",
                        "text-foreground"
                      )
                )}
              >
                {/* Label */}
                <span className={cn(
                  "font-medium w-full",
                  isGeneral 
                    ? "text-[11px] sm:text-xs leading-[1.3]"
                    : "font-semibold text-xs sm:text-sm leading-tight"
                )}>
                  {action.label}
                </span>

                {/* Description - only show on larger screens and for outline variants */}
                {action.description && action.variant !== 'default' && (
                  <span className={cn(
                    "text-muted-foreground/70 leading-tight w-full",
                    isGeneral
                      ? "text-[9px] sm:text-[10px] hidden sm:block"
                      : "text-[10px] sm:text-xs hidden sm:block"
                  )}>
                    {action.description}
                  </span>
                )}

                {/* Hover effect overlay */}
                <div className={cn(
                  "absolute inset-0",
                  isGeneral ? "rounded-md sm:rounded-lg" : "rounded-lg sm:rounded-xl",
                  "bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5",
                  "opacity-0 group-hover:opacity-100",
                  "transition-opacity duration-200",
                  "pointer-events-none"
                )} />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
