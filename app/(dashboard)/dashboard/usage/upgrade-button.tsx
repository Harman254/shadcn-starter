'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import type { ButtonProps } from '@/components/ui/button';

interface UpgradeButtonProps extends Omit<ButtonProps, 'onClick' | 'disabled'> {
  showIcon?: boolean;
  label?: string;
}

export function UpgradeButton({ 
  className, 
  size = 'lg', 
  showIcon = true,
  label = 'Upgrade to Pro',
  ...props 
}: UpgradeButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleUpgrade = async () => {
    setIsPending(true);
    try {
      await authClient.checkout({
        products: ['d6f79514-fa26-4b48-a8f4-da20e3d087c5'],
        slug: 'Mealwise-Pro',
      });
    } catch (error) {
      console.error('Failed to initiate checkout:', error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button 
      onClick={handleUpgrade}
      disabled={isPending}
      className={cn('gap-2', className)} 
      size={size}
      {...props}
    >
      {showIcon && <Crown className="h-4 w-4" />}
      {isPending ? 'Processing...' : label}
    </Button>
  );
}

