'use client'

import React from 'react';
import GroceryList from '@/components/groceries';
import { useParams } from 'next/navigation';

export default function GroceryListClient() {
  const params = useParams();
  const id = params.id as string;

  if (!id) {
    return <div className="text-red-500">Error: No ID provided in the URL.</div>;
  }

  return <GroceryList id={id} />;
} 