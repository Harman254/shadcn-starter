'use client';

import { useState, useEffect } from 'react';
import { generateGroceryListFromLatest } from '@/ai/flows/generate-grocery-list';
import type { GenerateGroceryListOutput } from '@/ai/flows/generate-grocery-list';
import { Search, ShoppingBag, Check, Filter } from 'lucide-react';

interface GroceryItem {
  item: string;
  estimatedPrice: string;
  suggestedLocation: string;
  checked: boolean; // Added for check functionality
}

export default function GroceryList() {
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [filteredList, setFilteredList] = useState<GroceryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStore, setFilterStore] = useState<string | null>(null);
  const [stores, setStores] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{
    country: string;
    city: string;
    currencyCode: string;
  } | null>(null);

  useEffect(() => {
    const fetchGroceryList = async () => {
      try {
        setIsLoading(true);
        const result: GenerateGroceryListOutput = await generateGroceryListFromLatest();
        
        // Add checked property to each item
        const groceryItems = result.groceryList.map(item => ({
          ...item,
          checked: false
        }));
        
        setGroceryList(groceryItems);
        setFilteredList(groceryItems);
        
        // Extract unique stores for filtering
        const uniqueStores = Array.from(
          new Set(groceryItems.map(item => item.suggestedLocation))
        );
        setStores(uniqueStores);
        
        // Extract location info from the first item's price format (simplified approach)
        // In a real app, you'd get this from the user context or API
        setUserLocation({
          country: 'User\'s Country', // Placeholder
          city: 'User\'s City', // Placeholder
          currencyCode: groceryItems[0]?.estimatedPrice.charAt(0) || '$' // Simple extraction of currency symbol
        });
        
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load grocery list');
        setIsLoading(false);
        console.error(err);
      }
    };

    fetchGroceryList();
  }, []);

  // Handle item checking
  const toggleItemCheck = (index: number) => {
    const updatedList = [...filteredList];
    updatedList[index].checked = !updatedList[index].checked;
    setFilteredList(updatedList);
    
    // Update the main list as well
    const mainIndex = groceryList.findIndex(item => item.item === updatedList[index].item);
    if (mainIndex !== -1) {
      const updatedGroceryList = [...groceryList];
      updatedGroceryList[mainIndex].checked = updatedList[index].checked;
      setGroceryList(updatedGroceryList);
    }
  };

  // Handle search and filtering
  useEffect(() => {
    let result = [...groceryList];
    
    // Apply search term filter
    if (searchTerm) {
      result = result.filter(item => 
        item.item.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply store filter
    if (filterStore) {
      result = result.filter(item => 
        item.suggestedLocation === filterStore
      );
    }
    
    setFilteredList(result);
  }, [searchTerm, filterStore, groceryList]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterStore(null);
    setFilteredList(groceryList);
  };

  if (isLoading) {
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

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl bg-gradient-to-br from-muted/20 to-muted/35 mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Grocery List</h1>
        {userLocation && (
          <p className="text-gray-600">
            Prices shown in {userLocation.currencyCode} for {userLocation.city}, {userLocation.country}
          </p>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:space-x-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search items..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div className="relative sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <select
            value={filterStore || ''}
            onChange={(e) => setFilterStore(e.target.value || null)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">All Stores</option>
            {stores.map((store, index) => (
              <option key={index} value={store}>{store}</option>
            ))}
          </select>
        </div>
        
        {(searchTerm || filterStore) && (
          <button
            onClick={clearFilters}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Total Items</p>
          <p className="text-2xl font-bold text-blue-800">{groceryList.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Items Checked</p>
          <p className="text-2xl font-bold text-green-800">
            {groceryList.filter(item => item.checked).length}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg sm:col-span-1 col-span-2">
          <p className="text-sm text-purple-600 font-medium">Stores to Visit</p>
          <p className="text-2xl font-bold text-purple-800">{stores.length}</p>
        </div>
      </div>

      {/* Grocery List */}
      {filteredList.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No items found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter to find what you&apos;re looking for.
          </p>
          {(searchTerm || filterStore) && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 bg-white shadow rounded-lg">
          {filteredList.map((item, index) => (
            <li 
              key={index} 
              className={`p-4 flex items-start justify-between transition-colors ${
                item.checked ? 'bg-green-50' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => toggleItemCheck(index)}
                  className={`flex-shrink-0 h-6 w-6 rounded-full border ${
                    item.checked 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-gray-300 text-transparent'
                  } flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                >
                  {item.checked && <Check className="h-4 w-4" />}
                </button>
                <div className={`${item.checked ? 'text-gray-500' : 'text-gray-900'}`}>
                  <h3 className={`text-lg font-medium ${item.checked ? 'line-through' : ''}`}>
                    {item.item}
                  </h3>
                  <div className="mt-1 flex flex-col sm:flex-row sm:space-x-4">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Price:</span> {item.estimatedPrice}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Store:</span> {item.suggestedLocation}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Progress Bar */}
      <div className="mt-8">
        <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
          <span>Shopping Progress</span>
          <span>
            {groceryList.filter(item => item.checked).length} of {groceryList.length} items
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-green-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
            style={{ 
              width: `${(groceryList.filter(item => item.checked).length / groceryList.length) * 100}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
