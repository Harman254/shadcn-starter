'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {  ShoppingBag, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

const LOCATION_KEY = 'mealwise_user_location';

export default function GroceryListButton({ mealplanId }: { mealplanId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateGroceryList = async () => {
    if (!mealplanId) return;

    setIsLoading(true);

    // Try to get cached location
    let cached: { lat: number; lon: number } | null = null;
    try {
      const raw = localStorage.getItem(LOCATION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          typeof parsed.lat === 'number' &&
          typeof parsed.lon === 'number' &&
          Math.abs(parsed.lat) <= 90 &&
          Math.abs(parsed.lon) <= 180
        ) {
          cached = parsed;
        }
      }
    } catch (e) {
      // Ignore parse errors
    }

    if (cached) {
      router.push(`/grocery-list/${mealplanId}?lat=${cached.lat}&lon=${cached.lon}`);
      setIsLoading(false);
      return;
    }

    // No cached location, prompt user
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Cache location
          try {
            localStorage.setItem(LOCATION_KEY, JSON.stringify({ lat: latitude, lon: longitude }));
          } catch (e) {}
          console.log('User location:', { latitude, longitude });
          router.push(`/grocery-list/${mealplanId}?lat=${latitude}&lon=${longitude}`);
          setIsLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Failed to get your location. Please ensure location services are enabled.');
          // Do not cache on error
          router.push(`/grocery-list/${mealplanId}`);
          setIsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
      router.push(`/grocery-list/${mealplanId}`);
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleGenerateGroceryList}
      disabled={isLoading || !mealplanId}
      className={`
        inline-flex items-center gap-2 px-5 py-2
        bg-[#1DCD9F] text-white font-semibold rounded-full
        shadow-lg transition-all duration-200
        hover:bg-[#169976] hover:shadow-xl
        focus-visible:ring-2 focus-visible:ring-[#1DCD9F] focus-visible:ring-offset-2
        disabled:opacity-60 disabled:cursor-not-allowed
        text-base
      `}
    >
      <ShoppingCart className="h-5 w-5 mr-2 text-white" />
      {isLoading ? 'Loading...' : 'Grocery List'}
    </Button>
  );
}
