'use client';
import React, { useState } from 'react';
import { authClient } from '@/lib/auth-client';

// Reusable checkmark icon component
const CheckIcon = () => (
  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

const CheckoutPage = () => {
  const [isPending, setIsPending] = useState(false);
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Choose Your Plan</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <div className="bg-background/95 rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-gray-500 font-semibold">Basic Plan</div>
            <h2 className="mt-2 text-2xl font-bold">Free</h2>
            <p className="mt-2 text-slate-500">Perfect for getting started with meal planning.</p>

            <div className="mt-4">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-slate-500 ml-1">/forever</span>
              </div>

              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-start">
                  <CheckIcon />
                  <span className="ml-2">3 AI meal plans per week</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon />
                  <span className="ml-2">10 pantry analyses per month</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon />
                  <span className="ml-2">5 recipe generations per week</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon />
                  <span className="ml-2">Up to 7-day meal plans</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon />
                  <span className="ml-2">20 saved favorite recipes</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon />
                  <span className="ml-2">PDF export format</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon />
                  <span className="ml-2">Basic meal planning features</span>
                </li>
                <li className="flex items-start">
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
        <div className="bg-background/95 rounded-xl shadow-xl overflow-hidden border-2 border-indigo-500 relative">
          <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 text-sm font-semibold rounded-bl-lg shadow-md">
            RECOMMENDED
          </div>
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Premium Plan</div>
            <h2 className="mt-2 text-2xl font-bold">Pro</h2>
            <p className="mt-2 text-slate-500">Unlock unlimited access and premium features.</p>

            <div className="mt-4">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">$5</span>
                <span className="text-slate-500 ml-1">/month</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Cancel anytime • 7-day money-back guarantee</p>

              <ul className="mt-6 space-y-3 text-sm max-h-[400px] overflow-y-auto pr-2">
                <li className="flex items-start">
                  <CheckIcon />
                  <span className="ml-2"><strong>Unlimited</strong> AI meal plan generations</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon />
                  <span className="ml-2"><strong>Unlimited</strong> pantry analyses</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon />
                  <span className="ml-2"><strong>Unlimited</strong> recipe generations</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon />
                  <span className="ml-2">Up to <strong>30-day</strong> meal plans</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon />
                  <span className="ml-2"><strong>Unlimited</strong> favorite recipes</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon />
                  <span className="ml-2"><strong>Unlimited</strong> meal swaps</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon />
                  <span className="ml-2">Grocery list <strong>optimization</strong></span>
                </li>
                <li className="flex items-start">
                  <CheckIcon />
                  <span className="ml-2"><strong>Advanced</strong> nutrition analytics</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon />
                  <span className="ml-2">AI-generated <strong>realistic</strong> meal images</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon />
                  <span className="ml-2">Recipe <strong>import</strong> from external sources</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon />
                  <span className="ml-2"><strong>Premium</strong> meal plan templates</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon />
                  <span className="ml-2">Multiple export formats (<strong>PDF, CSV, JSON</strong>)</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon />
                  <span className="ml-2"><strong>Priority</strong> support (24-hour response)</span>
                </li>
              </ul>

              <div className="mt-8">
                <button
                  onClick={async () => {
                    setIsPending(true);
                    try {
                      await authClient.checkout({
                        products: ['d6f79514-fa26-4b48-a8f4-da20e3d087c5'],
                        slug: 'Mealwise-Pro',
                      });
                    } finally {
                      setIsPending(false);
                    }
                  }}
                  disabled={isPending}
                  className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Upgrade to Pro'
                  )}
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
