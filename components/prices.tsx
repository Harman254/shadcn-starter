'use client';
import React from 'react';
import { authClient } from '@/lib/auth-client';

// Reusable checkmark icon component
const CheckIcon = () => (
  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

const CheckoutPage = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Choose Your Plan</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <div className="bg-background/95 rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-gray-500 font-semibold">Basic Plan</div>
            <h2 className="mt-2 text-2xl font-bold">Free</h2>
            <p className="mt-2 text-slate-500">Get started with essential features.</p>

            <div className="mt-4">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-slate-500 ml-1">/forever</span>
              </div>

              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-center">
                  <CheckIcon />
                  <span className="ml-2">Basic features</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon />
                  <span className="ml-2">3 AI meal plans per week</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon />
                  <span className="ml-2">Community support</span>
                </li>
              </ul>

              <div className="mt-8">
                <button
                  className="w-full px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-all duration-200"
                  disabled
                >
                  Current Plan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="bg-background/95 rounded-xl shadow-lg overflow-hidden border-2 border-indigo-500 relative">
          <div className="absolute top-0 right-0 bg-indigo-500 text-white px-3 py-1 text-sm font-semibold">
            RECOMMENDED
          </div>
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Premium Plan</div>
            <h2 className="mt-2 text-2xl font-bold">Pro</h2>
            <p className="mt-2 text-slate-500">Unlock all premium features and support.</p>

            <div className="mt-4">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">$5</span>
                <span className="text-slate-500 ml-1">/month</span>
              </div>

              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-center">
                  <CheckIcon />
                  <span className="ml-2">All features from the Free plan</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon />
                  <span className="ml-2">Unlimited AI meal plan generations</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon />
                  <span className="ml-2">Unlimited meal swaps</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon />
                  <span className="ml-2">Grocery lists with local pricing</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon />
                  <span className="ml-2">Advanced nutrition insights</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon />
                  <span className="ml-2">Priority support from the Mealwise team</span>
                </li>
              </ul>

              <div className="mt-8">
                <button
                  onClick={async () => {
                    await authClient.checkout({
                      products: ['d6f79514-fa26-4b48-a8f4-da20e3d087c5'],
                      slug: 'Mealwise-Pro',
                    });
                  }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
