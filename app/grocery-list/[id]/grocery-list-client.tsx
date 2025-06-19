'use client';

import React from 'react';
import GroceryList from '@/components/groceries';
import { usePathname, useSearchParams } from 'next/navigation';

interface GroceryListClientProps {
  id: string;
}

export default function GroceryListClient({ id }: GroceryListClientProps) {

  if (!id) {
    return <div className="text-red-500">Error: No ID provided in the URL.</div>;
  }

  return <GroceryList id={id} />;
} 