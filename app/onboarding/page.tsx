'use client';
import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import OnboardingLayout from './onboarding-layout';
import { OnboardingData, OnboardingStep } from '@/types';
import { saveOnboarding } from '@/actions/saveOnboarding';

const dietaryOptions = [
  'Vegan', 'Vegetarian', 'Pescatarian', 'Keto', 'Paleo', 'Mediterranean', 'No Restrictions'
];

const goalOptions = [
  'Weight Loss', 'Muscle Gain', 'Healthy Eating', 'Family Meal Planning', 'Budget Cooking'
];

const cuisineOptions = [
  'Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 'Thai', 'Mediterranean', 
  'American', 'French', 'Greek'
];

export default function Onboarding() {
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('dietary');
  const [formData, setFormData] = useState<OnboardingData>({
    dietaryPreference: '',
    goal: '',
    householdSize: 1,
    cuisinePreferences: [],
  });

  const handleNext = async () => {
    const steps: OnboardingStep[] = ['dietary', 'goals', 'household', 'cuisine'];
    const currentIndex = steps.indexOf(currentStep);

    if (currentStep === 'dietary' && !formData.dietaryPreference) {
      setError('Please select a dietary preference');
      return;
    }
    if (currentStep === 'goals' && !formData.goal) {
      setError('Please select a goal');
      return;
    }

    setError('');

    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    } else {
      setIsSubmitting(true);
      try {
        await saveOnboarding(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save preferences');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    const steps: OnboardingStep[] = ['dietary', 'goals', 'household', 'cuisine'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'dietary':
        return (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              What's your dietary preference?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {dietaryOptions.map((option) => (
                <button
                  key={option}
                  className={`p-4 rounded-lg border-2 text-left ${
                    formData.dietaryPreference === option
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-200'
                  }`}
                  onClick={() => setFormData({ ...formData, dietaryPreference: option })}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 'goals':
        return (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              What's your primary goal?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {goalOptions.map((option) => (
                <button
                  key={option}
                  className={`p-4 rounded-lg border-2 text-left ${
                    formData.goal === option
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-200'
                  }`}
                  onClick={() => setFormData({ ...formData, goal: option })}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 'household':
        return (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              How many people are you cooking for?
            </h2>
            <div className="flex items-center justify-center space-x-4">
              <button
                className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"
                onClick={() => setFormData({ ...formData, householdSize: Math.max(1, formData.householdSize - 1) })}
              >
                -
              </button>
              <span className="text-4xl font-semibold text-gray-800 w-16 text-center">
                {formData.householdSize}
              </span>
              <button
                className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"
                onClick={() => setFormData({ ...formData, householdSize: Math.min(10, formData.householdSize + 1) })}
              >
                +
              </button>
            </div>
          </div>
        );

      case 'cuisine':
        return (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Select your favorite cuisines (optional)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {cuisineOptions.map((cuisine) => (
                <button
                  key={cuisine}
                  className={`p-4 rounded-lg border-2 text-left ${
                    formData.cuisinePreferences.includes(cuisine)
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-200'
                  }`}
                  onClick={() => {
                    const newPreferences = formData.cuisinePreferences.includes(cuisine)
                      ? formData.cuisinePreferences.filter((c) => c !== cuisine)
                      : [...formData.cuisinePreferences, cuisine];
                    setFormData({ ...formData, cuisinePreferences: newPreferences });
                  }}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <OnboardingLayout currentStep={currentStep}>
      <div className="max-w-2xl mx-auto">
        {renderStep()}

        {error && <p className="text-red-500 mt-4">{error}</p>}

        <div className="mt-12 flex justify-between">
          {currentStep !== 'dietary' && (
            <button
              onClick={handleBack}
              className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className={`ml-auto flex items-center px-6 py-3 rounded-lg transition-colors ${
              isSubmitting
                ? 'bg-emerald-300 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                  />
                </svg>
                Saving...
              </span>
            ) : (
              <>
                {currentStep === 'cuisine' ? 'Complete' : 'Next'}
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
