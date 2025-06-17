'use client';

import React from 'react';
import GroceryList from '@/components/groceries';
import { usePathname, useSearchParams } from 'next/navigation';

interface GroceryListClientProps {
  id: string;
}

export default function GroceryListClient({ id }: GroceryListClientProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  console.log('Current pathname:', pathname);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  
  console.log('Extracted id:', id);
  console.log('Extracted latitude:', lat);
  console.log('Extracted longitude:', lon);

  if (!id) {
    return <div className="text-red-500">Error: No ID provided in the URL.</div>;
  }

  return <GroceryList id={id} />;
} 