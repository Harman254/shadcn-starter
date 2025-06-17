'use client';

import React, { Suspense } from 'react';
import GroceryList from '@/components/groceries'; // adjust path as needed
import { usePathname, useSearchParams } from 'next/navigation';

export default function GroceryListPage() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    console.log('Current pathname:', pathname);
    const id = pathname.split('/').pop(); // Extract the last segment as id
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    
    console.log('Extracted id:', id);
    console.log('Extracted latitude:', lat);
    console.log('Extracted longitude:', lon);

    if (!id) {
        return <div className="text-red-500">Error: No ID provided in the URL.</div>;
    }
  

  return (
   
<div className="min-h-screen bg-gray-50">
<header className="bg-white shadow">
  <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
    <h1 className="text-3xl font-bold text-gray-900">Grocery List</h1>
  </div>
</header>
<main>
  <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <Suspense fallback={<LoadingSkeleton />}>
        <GroceryList id={id}  />
    </Suspense>
  </div>
</main>
</div>
)
  
}






function LoadingSkeleton() {
return (
<div className="w-full max-w-4xl mx-auto p-4">
<div className="animate-pulse space-y-4">
  <div className="h-12 bg-gray-200 rounded"></div>
  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
  {[...Array(8)].map((_, i) => (
    <div key={i} className="h-20 bg-gray-200 rounded"></div>
  ))}
</div>
</div>
);
}
