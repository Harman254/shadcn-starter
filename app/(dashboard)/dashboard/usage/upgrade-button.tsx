'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export function UpgradeButton() {
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
      className="w-full" 
      size="lg"
    >
      <Crown className="h-4 w-4 mr-2" />
      {isPending ? 'Processing...' : 'Upgrade to Pro'}
    </Button>
  );
}

