import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { useProFeatures, PRO_FEATURES } from "@/hooks/use-pro-features";
import { authClient } from '@/lib/auth-client';

// Reusable checkmark icon component
const CheckIcon = () => (
  <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

export default function SubscriptionModal({
  featureId = "unlimited-meal-plans",
  triggerLabel = "Upgrade to Pro",
  open,
  onOpenChange
}: {
  featureId?: string;
  triggerLabel?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const {
    canAccess,
    subscription
  } = useProFeatures();

  const [isPending, setIsPending] = useState(false);
  const feature = PRO_FEATURES[featureId];
  const isUnlocked = canAccess(feature);
  const currentPlan = subscription?.plan || "free";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Choose Your Plan</DialogTitle>
          <DialogDescription className="text-base">
            {feature ? (
              <>
                Unlock <span className="font-semibold">{feature.name}</span> and all Pro features
              </>
            ) : (
              'Compare plans and unlock premium features to take your meal planning to the next level.'
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Free Plan */}
          <div className={`bg-background/95 rounded-xl shadow-lg border-2 ${currentPlan === 'free' ? 'border-primary' : 'border-gray-200'} p-6 relative`}>
            {currentPlan === 'free' && (
              <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-2 py-1 text-xs font-semibold rounded">
                CURRENT
              </div>
            )}
            <div className="uppercase tracking-wide text-xs text-muted-foreground font-semibold">Basic Plan</div>
            <h2 className="mt-2 text-2xl font-bold">Free</h2>
            <p className="mt-1 text-muted-foreground text-sm">Perfect for getting started with meal planning.</p>
            <div className="mt-4">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-muted-foreground ml-1 text-sm">/forever</span>
              </div>
              <ul className="mt-4 space-y-2.5 text-sm">
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
              <div className="mt-6">
                <button 
                  className={`w-full px-4 py-2.5 font-medium rounded-lg transition-all duration-200 text-sm ${
                    currentPlan === 'free' 
                      ? 'bg-primary text-primary-foreground cursor-default' 
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`} 
                  disabled
                >
                  {currentPlan === 'free' ? 'Current Plan' : 'Free Forever'}
                </button>
              </div>
            </div>
          </div>
          {/* Pro Plan */}
          <div className={`bg-background/95 rounded-xl shadow-xl border-2 ${currentPlan === 'pro' ? 'border-primary' : 'border-indigo-500'} relative p-6`}>
            <div className="absolute top-3 right-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 text-xs font-semibold rounded-full shadow-md">
              RECOMMENDED
            </div>
            {currentPlan === 'pro' && (
              <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-2 py-1 text-xs font-semibold rounded">
                CURRENT
              </div>
            )}
            <div className="uppercase tracking-wide text-xs text-indigo-500 dark:text-indigo-400 font-semibold">Premium Plan</div>
            <h2 className="mt-2 text-2xl font-bold">Pro</h2>
            <p className="mt-1 text-muted-foreground text-sm">Unlock unlimited access and premium features.</p>
            <div className="mt-4">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">$5</span>
                <span className="text-muted-foreground ml-1 text-sm">/month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Cancel anytime • 7-day money-back guarantee</p>
              <ul className="mt-4 space-y-2.5 text-sm max-h-[300px] overflow-y-auto pr-2">
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
              <div className="mt-6">
                {currentPlan === "pro" || isUnlocked ? (
                  <div className="w-full px-4 py-2.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold rounded-lg text-center text-sm">
                    ✓ Already Unlocked!
                  </div>
                ) : (
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
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                      "Upgrade to Pro"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Close
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 