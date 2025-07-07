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
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose Your Plan</DialogTitle>
          <DialogDescription>
            Compare plans and unlock premium features.
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {/* Free Plan */}
          <div className="bg-background/95 rounded-lg shadow border border-gray-200 p-4">
            <div className="uppercase tracking-wide text-xs text-gray-500 font-semibold">Basic Plan</div>
            <h2 className="mt-1 text-lg font-bold">Free</h2>
            <p className="mt-1 text-slate-500 text-xs">Get started with essential features.</p>
            <div className="mt-2">
              <div className="flex items-baseline">
                <span className="text-xl font-bold">$0</span>
                <span className="text-slate-500 ml-1 text-xs">/forever</span>
              </div>
              <ul className="mt-3 space-y-2 text-xs">
                <li className="flex items-center"><CheckIcon /><span className="ml-2">Basic features</span></li>
                <li className="flex items-center"><CheckIcon /><span className="ml-2">3 AI meal plans/week</span></li>
                <li className="flex items-center"><CheckIcon /><span className="ml-2">Community support</span></li>
              </ul>
              <div className="mt-4">
                <button className="w-full px-3 py-2 bg-gray-200 text-gray-800 font-medium rounded hover:bg-gray-300 transition-all duration-200 text-xs" disabled>
                  Current Plan
                </button>
              </div>
            </div>
          </div>
          {/* Pro Plan */}
          <div className="bg-background/95 rounded-lg shadow border-2 border-indigo-500 relative p-4">
            <div className="absolute top-2 right-2 bg-indigo-500 text-white px-2 py-0.5 text-xs font-semibold rounded">RECOMMENDED</div>
            <div className="uppercase tracking-wide text-xs text-indigo-500 font-semibold">Premium Plan</div>
            <h2 className="mt-1 text-lg font-bold">Pro</h2>
            <p className="mt-1 text-slate-500 text-xs">Unlock all premium features and support.</p>
            <div className="mt-2">
              <div className="flex items-baseline">
                <span className="text-xl font-bold">$5</span>
                <span className="text-slate-500 ml-1 text-xs">/month</span>
              </div>
              <ul className="mt-3 space-y-2 text-xs">
                <li className="flex items-center"><CheckIcon /><span className="ml-2">All features from Free plan</span></li>
                <li className="flex items-center"><CheckIcon /><span className="ml-2">Unlimited AI meal plan generations</span></li>
                <li className="flex items-center"><CheckIcon /><span className="ml-2">Unlimited meal swaps</span></li>
                <li className="flex items-center"><CheckIcon /><span className="ml-2">Grocery lists with local pricing</span></li>
                <li className="flex items-center"><CheckIcon /><span className="ml-2">Advanced nutrition insights</span></li>
                <li className="flex items-center"><CheckIcon /><span className="ml-2">Priority support</span></li>
              </ul>
              <div className="mt-4">
                {currentPlan === "pro" || isUnlocked ? (
                  <span className="w-full block text-green-600 font-semibold text-center">Already Unlocked!</span>
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
                    className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded shadow hover:shadow-lg transition-all duration-200 text-xs"
                  >
                    {isPending ? "Processing..." : "Upgrade Now"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <button className="btn btn-secondary w-full mt-2">Close</button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 