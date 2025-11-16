'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-yellow-500/90 text-yellow-950",
        "px-4 py-2 text-center text-sm font-medium",
        "flex items-center justify-center gap-2",
        "animate-in slide-in-from-top duration-300"
      )}
      role="alert"
      aria-live="polite"
    >
      <WifiOff className="h-4 w-4" />
      <span>You're offline. Messages will sync when you're back online.</span>
    </div>
  );
}

