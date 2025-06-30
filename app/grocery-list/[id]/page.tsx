import React, { Suspense } from 'react';
import GroceryListClient from './grocery-list-client';



export default async function GroceryListPage() {
  
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <GroceryListClient />
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
