'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { ShoppingCart, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GroceryItem {
  item: string;
  estimatedPrice: string;
  suggestedLocation: string;
}

const GenerateGroceryList = () => {
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState<string>('$0.00');
  const [groupedItems, setGroupedItems] = useState<Record<string, GroceryItem[]>>({});
  const [expandedLocations, setExpandedLocations] = useState<Set<string>>(new Set());

  // Calculate total price from grocery list
  useEffect(() => {
    if (groceryList.length > 0) {
      calculateTotal();
    }
  }, [groceryList]);

  // Group items by location when grocery list changes
  useEffect(() => {
    if (groceryList.length > 0) {
      groupItemsByLocation();
    }
  }, [groceryList]);

  const calculateTotal = () => {
    let total = 0;
    
    groceryList.forEach(item => {
      // Extract numeric value from price string (handling formats like $10.99, 10.99, etc.)
      const priceString = item.estimatedPrice || '0';
      const numericValue = parseFloat(priceString.replace(/[^0-9.]/g, ''));
      
      if (!isNaN(numericValue)) {
        total += numericValue;
      }
    });
    
    // Format as currency
    setTotalPrice(`$${total.toFixed(2)}`);
  };

  const groupItemsByLocation = () => {
    const grouped: Record<string, GroceryItem[]> = {};
    
    groceryList.forEach(item => {
      const location = item.suggestedLocation || 'Other';
      
      if (!grouped[location]) {
        grouped[location] = [];
      }
      
      grouped[location].push(item);
    });
    
    setGroupedItems(grouped);
    
    // Initialize all locations as expanded
    const allLocations = new Set(Object.keys(grouped));
    setExpandedLocations(allLocations);
  };

  const toggleLocation = (location: string) => {
    const updated = new Set(expandedLocations);
    if (updated.has(location)) {
      updated.delete(location);
    } else {
      updated.add(location);
    }
    setExpandedLocations(updated);
  };

  const fetchGroceryList = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching grocery list with axios...');
      const response = await axios.get('/api/groceries');
      console.log('API Response:', response.data);
      
      // Fix 1: Access data correctly based on API response structure
      const data = response.data.groceryList
      
      if (data) {
        // Fix 2: Handle groceryList property directly
        if (data.groceryList && Array.isArray(data.groceryList)) {
          setGroceryList(data.groceryList);
        } else if (Array.isArray(data)) {
          // Direct array response
          setGroceryList(data);
        } else if (typeof data === 'object' && Object.keys(data).length > 0) {
          // Fix 3: Properly format object data
          const formattedList = [];
          
          for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'object' && value !== null) {
              formattedList.push({
                item: key,
                estimatedPrice: (value as any).price || (value as any).estimatedPrice || 'N/A',
                suggestedLocation: (value as any).location || (value as any).suggestedLocation || 'N/A'
              });
            } else {
              formattedList.push({
                item: key,
                estimatedPrice: 'N/A',
                suggestedLocation: 'N/A'
              });
            }
          }
          
          setGroceryList(formattedList);
        } else {
          throw new Error('Invalid data format received from server');
        }
      } else {
        throw new Error('No data received from server');
      }
    } catch (err) {
      let errorMessage = 'Failed to generate grocery list';
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          errorMessage = `Server error: ${err.response.status} - ${err.response.statusText || err.message}`;
          console.error('Error response data:', err.response.data);
        } else if (err.request) {
          errorMessage = 'No response from server. Please check your connection.';
        } else {
          errorMessage = `Request error: ${err.message}`;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 mx-auto max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl h-screen overflow-hidden">
      <Card className="border shadow-lg">
        <CardHeader className="space-y-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl sm:text-2xl font-bold text-primary">Smart Grocery List</CardTitle>
            <ShoppingCart className="h-6 w-6 text-primary" />
          </div>
          <CardDescription className="text-sm sm:text-base">
            Generate a personalized grocery list based on your preferences
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col justify-center items-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
              <span className="text-muted-foreground">Generating your grocery list...</span>
            </div>
          ) : groceryList.length > 0 ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Your Grocery Items</h3>
                <Badge variant="outline" className="px-3 py-1 text-base font-semibold">
                  Total: {totalPrice}
                </Badge>
              </div>
              
              {/* Grouped items by location */}
              <div className="space-y-4">
                {Object.entries(groupedItems).map(([location, items]) => (
                  <div key={location} className="border rounded-lg overflow-hidden">
                    <div 
                      className="bg-muted/40 px-4 py-2 flex justify-between items-center cursor-pointer"
                      onClick={() => toggleLocation(location)}
                    >
                      <h4 className="font-medium">{location} ({items.length})</h4>
                      {expandedLocations.has(location) ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    
                    {expandedLocations.has(location) && (
                      <div className="divide-y">
                        {items.map((item, index) => (
                          <div key={index} className="px-4 py-3 hover:bg-muted/20 transition-colors">
                            <div className="flex justify-between">
                              <span className="font-medium">{item.item}</span>
                              <span className="text-primary">{item.estimatedPrice || 'N/A'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
              <p className="text-muted-foreground">
                Your grocery list is empty. Click generate to create your shopping list.
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="border-t bg-muted/20 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {groceryList.length > 0 ? `${groceryList.length} items in your list` : ''}
          </div>
          <Button 
            onClick={fetchGroceryList} 
            disabled={loading}
            className="w-full sm:w-auto"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Grocery List'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GenerateGroceryList;