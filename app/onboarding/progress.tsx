import React from 'react';
import { OnboardingStep } from '@/types';

interface ProgressBarProps {
  currentStep: OnboardingStep;
}

const steps: { id: OnboardingStep; label: string }[] = [
  { id: 'dietary', label: 'Diet' },
  { id: 'goals', label: 'Goals' },
  { id: 'household', label: 'Household' },
  { id: 'cuisine', label: 'Cuisine' },
];

export function ProgressBar({ currentStep }: ProgressBarProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index <= currentIndex
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`mt-2 text-sm ${
                  index <= currentIndex ? 'text-emerald-500' : 'text-gray-500'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-4 ${
                  index < currentIndex ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}