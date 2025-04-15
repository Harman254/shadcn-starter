'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Loader2, Settings, UtensilsCrossed, ChefHat, Check, X, RefreshCw, AlertCircle } from 'lucide-react';
import { useMealPlanStore, type DayPlan, type MealPlan } from '@/store';
import { useRouter } from 'next/navigation';
import { generateMealPlan } from '@/ai/actions';
import { fetchOnboardingData } from '@/data';
import { OnboardingData } from '@prisma/client';


    export interface UserPreference {
        id: number;
        dietaryPreference: string;
        goal: string;
        householdSize: number;
        cuisinePreferences: string[];
      }



const CreateMealPlan = ({preferences }: UserPreference) => {
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(5);
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [usePreferences, setUsePreferences] = useState(true);
  const [planName, setPlanName] = useState('');
  const [preferencesData, setPreferencesData] = useState<any>(null);
  const [generatedPlan, setGeneratedPlan] = useState<DayPlan[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [replacingMeal, setReplacingMeal] = useState<{ dayIndex: number; type: string } | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const planRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const addPlan = useMealPlanStore((state) => state.addPlan);
  const router = useRouter();

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleGenerate = async () => {
    setError(null);
    setIsLoading(true);
    try {
      let preferences = undefined;
      if (usePreferences) {
        const data = await fetchOnboardingData();
        setPreferencesData(data);
        preferences = data;
      }
      const plan = await generateMealPlan({ duration, mealsPerDay, preferences });
      setGeneratedPlan(plan);
      setToastMessage('Meal plan generated successfully!');
      setShowToast(true);
    } catch (err) {
      console.error('Error generating meal plan:', err);
      setError('Failed to generate meal plan. Please try again.');
    } finally {
      setIsLoading(false);
      setTimeout(() => planRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const handleAcceptPlan = () => {
    if (!generatedPlan) return;
    const trimmedName = planName.trim();
    const finalName = trimmedName || `${duration}-Day Meal Plan`;
    const newPlan: MealPlan = {
      id: crypto.randomUUID(),
      name: finalName,
      days: generatedPlan,
      mealsPerDay,
      createdAt: new Date().toISOString(),
    };
    addPlan(newPlan);
    setToastMessage('Plan saved successfully!');
    setShowToast(true);
    setTimeout(() => router.push('/meal-plans'), 1000);
    setGeneratedPlan(null);
    setPlanName('');
  };

  const handleRejectPlan = () => {
    setGeneratedPlan(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReplaceMeal = async (dayIndex: number, type: string) => {
    if (!generatedPlan) return;
    setReplacingMeal({ dayIndex, type });
    setError(null);
    try {
      const prefs = usePreferences ? preferencesData : undefined;
      const replacement = await generateMealPlan({ duration: 1, mealsPerDay: 1, preferences: prefs });
      const newMeal = replacement[0]?.[type];
      if (!newMeal) throw new Error("Couldn't generate a replacement meal");
      const updatedPlan = [...generatedPlan];
      updatedPlan[dayIndex] = { ...updatedPlan[dayIndex], [type]: newMeal };
      setGeneratedPlan(updatedPlan);
      setToastMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} replaced successfully!`);
      setShowToast(true);
    } catch (err) {
      console.error('Error replacing meal:', err);
      setError('Failed to replace meal. Please try again.');
    } finally {
      setReplacingMeal(null);
    }
  };

  const calculateDayStats = (day: DayPlan) => {
    return Object.values(day).reduce(
      (acc, meal) => {
        if (meal) {
          acc.calories += meal.calories;
          acc.protein += meal.protein;
        }
        return acc;
      },
      { calories: 0, protein: 0 }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-6"
          >
            <ChefHat className="w-16 h-16 text-green-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Cooking up your plan...</h2>
          <p className="text-gray-600">Preparing a nutritious meal plan for you</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50"
          >
            {toastMessage}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded flex items-start"
          >
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
            <UtensilsCrossed className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Create Your Meal Plan</h1>
          <p className="text-lg text-gray-600">Customize your plan to match your lifestyle</p>
        </div>

        <AnimatePresence mode="wait">
          {!generatedPlan ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <div className="space-y-8">
                <div>
                  <label htmlFor="plan-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Name (Optional)
                  </label>
                  <input
                    id="plan-name"
                    ref={nameInputRef}
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="e.g., Healthy Week"
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">Give your plan a memorable name</p>
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Duration
                  </label>
                  <div className="relative">
                    <select
                      id="duration"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="block w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                    >
                      <option value={3}>3 Days</option>
                      <option value={5}>5 Days</option>
                      <option value={7}>7 Days</option>
                      <option value={14}>14 Days</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label htmlFor="meals-per-day" className="block text-sm font-medium text-gray-700 mb-2">
                    Meals Per Day
                  </label>
                  <div className="relative">
                    <select
                      id="meals-per-day"
                      value={mealsPerDay}
                      onChange={(e) => setMealsPerDay(Number(e.target.value))}
                      className="block w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                    >
                      {[2, 3, 4, 5].map((num) => (
                        <option key={num} value={num}>
                          {num} meals
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <label htmlFor="use-preferences" className="text-gray-700">
                      Use Previous Preferences
                    </label>
                  </div>
                  <input
                    id="use-preferences"
                    type="checkbox"
                    checked={usePreferences}
                    onChange={(e) => setUsePreferences(e.target.checked)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  className="w-full bg-green-600 text-white py-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors flex items-center justify-center gap-2"
                >
                  <Loader2 className="w-5 h-5" />
                  Generate Meal Plan
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="plan"
              ref={planRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Your Meal Plan</h2>
                <p className="text-gray-600">
                  {duration} days • {mealsPerDay} meals/day • Total {duration * mealsPerDay} meals
                </p>
              </div>

              <div className="space-y-6">
                {generatedPlan.map((day, dayIndex) => {
                  const stats = calculateDayStats(day);
                  return (
                    <div key={dayIndex} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">Day {dayIndex + 1}</h3>
                        <div className="text-sm text-gray-600 flex gap-4">
                          <span className="flex items-center">
                            <span className="w-3 h-3 bg-green-500 rounded-full mr-1" />
                            {stats.calories} cal
                          </span>
                          <span className="flex items-center">
                            <span className="w-3 h-3 bg-blue-500 rounded-full mr-1" />
                            {stats.protein}g protein
                          </span>
                        </div>
                      </div>
                      <div className="grid gap-4">
                        {Object.entries(day).map(([type, meal]) =>
                          meal && (
                            <div key={type} className="bg-white p-4 rounded-lg shadow-sm relative group">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-sm font-medium text-green-600 capitalize">{type}</span>
                                  <p className="text-gray-900 font-medium mt-1">{meal.name}</p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {meal.calories} cal • {meal.protein}g protein
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleReplaceMeal(dayIndex, type)}
                                  disabled={replacingMeal !== null}
                                  className={`p-2 rounded-full transition-opacity ${
                                    replacingMeal?.dayIndex === dayIndex && replacingMeal?.type === type
                                      ? 'opacity-100 bg-green-100'
                                      : 'opacity-0 group-hover:opacity-100 hover:bg-gray-100'
                                  }`}
                                >
                                  {replacingMeal?.dayIndex === dayIndex && replacingMeal?.type === type ? (
                                    <Loader2 className="w-4 h-4 text-green-600 animate-spin" />
                                  ) : (
                                    <RefreshCw className="w-4 h-4 text-gray-600" />
                                  )}
                                </button>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8">
                <div className="mb-4">
                  <label htmlFor="final-plan-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Final Plan Name
                  </label>
                  <input
                    id="final-plan-name"
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder={`${duration}-Day Meal Plan`}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleAcceptPlan}
                    className="flex-1 bg-green-600 text-white py-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Accept & Save
                  </button>
                  <button
                    onClick={handleRejectPlan}
                    className="flex-1 bg-white border border-gray-300 text-gray-700 py-4 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Generate New
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreateMealPlan;
