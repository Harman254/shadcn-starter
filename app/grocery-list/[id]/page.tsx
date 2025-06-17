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
   

    <Suspense fallback={<LoadingSkeleton />}>
        <GroceryList id={id}  />
    </Suspense>
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
