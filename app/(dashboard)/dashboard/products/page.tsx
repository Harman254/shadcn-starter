'use client';

import React from 'react';
import Groceries from '@/components/groceries';
import { ShoppingCart, ArrowLeft, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Products = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="lg:hidden">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
            <h1 className="text-xl font-semibold">Grocery List</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="hidden md:inline-block text-muted-foreground">
              <ShoppingCart className="h-5 w-5 mr-1 inline-block" />
              Smart Shopping
            </span>
            <Button size="sm" className="hidden sm:flex">Save List</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar/Filters - Only visible on larger screens */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
                <CardDescription>Refine your grocery list</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="produce">Produce</SelectItem>
                      <SelectItem value="dairy">Dairy</SelectItem>
                      <SelectItem value="meat">Meat & Seafood</SelectItem>
                      <SelectItem value="bakery">Bakery</SelectItem>
                      <SelectItem value="pantry">Pantry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select defaultValue="location">
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="location">Location</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Budget</label>
                  <Input type="range" min="10" max="200" defaultValue="100" className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$10</span>
                    <span>$200</span>
                  </div>
                </div>
                
                <Button className="w-full mt-4">Apply Filters</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Saved Lists</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  No saved lists yet. Generate a list and save it for future reference.
                </p>
              </CardContent>
            </Card>
          </aside>
          
          {/* Main Content Area */}
          <div className="col-span-1 lg:col-span-9 space-y-6">
            {/* Mobile Controls */}
            <div className="flex flex-col sm:flex-row gap-3 lg:hidden">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search groceries..." 
                  className="pl-8"
                />
              </div>
              <Button variant="outline" size="icon" className="sm:w-10">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filters</span>
              </Button>
              <Button className="sm:w-auto">Save List</Button>
            </div>
            
            {/* Tips Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-800">
              <CardContent className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-1">Smart Shopping Tips</h3>
                  <p className="text-sm text-muted-foreground">
                    Your grocery list is organized by store location to make shopping more efficient.
                  </p>
                </div>
                <Button variant="outline" className="whitespace-nowrap">View All Tips</Button>
              </CardContent>
            </Card>
            
            {/* Groceries Component */}
            <Groceries />
            
            {/* More actions at bottom */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-end">
              <Button variant="outline" className="sm:w-auto">
                Share List
              </Button>
              <Button variant="outline" className="sm:w-auto">
                Print List
              </Button>
              <Button className="sm:w-auto">
                Checkout
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t mt-10">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          <p>© 2025 Smart Grocery List. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Products;