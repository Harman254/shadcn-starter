'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CarIcon } from 'lucide-react';





export default function GroceryListButton({ mealplanId }: { mealplanId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateGroceryList = async () => {
    if (!mealplanId) return;

    try {
      setIsLoading(true);
      
      // Navigate to the grocery list page with the mealplanId
      router.push(`/grocery-list/${mealplanId}`);

      
    } catch (error) {
      console.error('Error navigating to grocery list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleGenerateGroceryList}
      disabled={isLoading || !mealplanId}
      className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-green-50 dark:bg-green-800/30 text-green-700 dark:text-green-300 text-xs sm:text-sm font-medium rounded-full shadow-sm border border-green-100 dark:border-green-800/50"
    >
      <CarIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
      <span className="whitespace-nowrap">
        {isLoading ? 'Loading...' : 'Grocery List'}
      </span>
    </Button>
  );
}
