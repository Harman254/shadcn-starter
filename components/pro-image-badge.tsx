'use client';

import { Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProImageBadgeProps {
  isPro?: boolean;
  isGenerated?: boolean;
  className?: string;
  showOnHover?: boolean;
}

/**
 * Pro Image Badge Component
 * 
 * Displays a "Pro" badge on AI-generated images for Pro users.
 * Can be shown always or only on hover.
 */
export function ProImageBadge({ 
  isPro = false, 
  isGenerated = false,
  className,
  showOnHover = false 
}: ProImageBadgeProps) {
  // Only show badge if user is Pro and image is generated
  if (!isPro || !isGenerated) {
    return null;
  }

  return (
    <div 
      className={cn(
        "absolute top-2 right-2 z-10",
        showOnHover && "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
        className
      )}
    >
      <Badge 
        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg backdrop-blur-sm"
        variant="default"
      >
        <Crown className="w-3 h-3 mr-1" />
        Pro
      </Badge>
    </div>
  );
}

/**
 * Upgrade Prompt Badge
 * 
 * Shows on Free user images to encourage upgrade
 */
interface UpgradePromptBadgeProps {
  className?: string;
  showOnHover?: boolean;
}

export function UpgradePromptBadge({ 
  className,
  showOnHover = true 
}: UpgradePromptBadgeProps) {
  return (
    <div 
      className={cn(
        "absolute top-2 right-2 z-10",
        showOnHover && "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
        className
      )}
    >
      <Badge 
        className="bg-muted/80 text-muted-foreground border border-border/50 shadow-lg backdrop-blur-sm cursor-pointer hover:bg-muted transition-colors"
        variant="outline"
        title="Upgrade to Pro for realistic AI-generated images"
      >
        <Crown className="w-3 h-3 mr-1 opacity-50" />
        Upgrade
      </Badge>
    </div>
  );
}

