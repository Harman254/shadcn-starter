'use client';

import React from 'react';
import GroceryList from '@/components/groceries'; // adjust path as needed
import { usePathname } from 'next/navigation';

export default function GroceryListPage() {
    const pathname = usePathname();
    console.log('Current pathname:', pathname);
    const id = pathname.split('/').pop(); // Extract the last segment as id
    console.log('Extracted id:', id);
    if (!id) {
        return <div className="text-red-500">Error: No ID provided in the URL.</div>;
    }
  

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <GroceryList id={id} />
    </div>
  );
}