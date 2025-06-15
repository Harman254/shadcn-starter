'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Plus, Calendar, Utensils, Rocket, TrendingUp, Clock } from 'lucide-react';
import { Meal } from '@/types';
import { motion } from 'framer-motion';

export type MealPlan = {
  id: string;
  userId: string;
  duration: number;
  mealsPerDay: number;
  createdAt: string; // string is safer for JSON
};

type Props = {
  hasMealPlan: boolean;
  mealPlan: MealPlan | undefined;
  meals: Meal[];
};

const MealPlanStatusCard = ({ hasMealPlan, mealPlan }: Props) => {
  const router = useRouter();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-cyan-950/30 rounded-3xl shadow-2xl border border-emerald-200/50 dark:border-emerald-800/50 backdrop-blur-sm mb-12"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(20,184,166,0.1),transparent_50%)]" />
      
      {/* Floating Elements */}
      <div className="absolute top-4 right-4 opacity-20">
        <Rocket className="w-8 h-8 text-emerald-500 animate-pulse" />
      </div>
      <div className="absolute bottom-4 left-4 opacity-20">
        <TrendingUp className="w-6 h-6 text-teal-500 animate-bounce" />
      </div>

      {hasMealPlan && mealPlan ? (
        <div className="relative z-10 p-8 sm:p-12">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-3 mb-4 px-6 py-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Active Meal Plan</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              Your Current Meal Plan
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              You are all set for healthy eating!
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto"
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-700/50 shadow-lg"
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {mealPlan.duration}
                </span>
              </div>
              <p className="text-center text-slate-600 dark:text-slate-400 font-semibold">Days</p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-700/50 shadow-lg"
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-white" />
                </div>
                <span className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  {mealPlan.mealsPerDay}
                </span>
              </div>
              <p className="text-center text-slate-600 dark:text-slate-400 font-semibold">Meals per day</p>
            </motion.div>
          </motion.div>

          {/* Total Meals Summary */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full text-white font-bold shadow-lg">
              <Clock className="w-5 h-5" />
              <span>{mealPlan.duration * mealPlan.mealsPerDay} Total Meals Planned</span>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/meal-plans')} 
              className="group px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              <span>View Plan</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Grocery List
            </motion.button> 
          </motion.div>
        </div>
      ) : (
        <div className="relative z-10 p-8 sm:p-12 text-center">
          {/* Empty State */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Plus className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
              Start Your Meal Planning Journey
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Create your first meal plan and make healthy eating effortless with personalized recipes and smart shopping lists.
            </p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/meal-plans/new')}
            className="group px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 mx-auto"
          >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
            <span>Generate Meal Plan</span>
            <Rocket className="w-5 h-5 group-hover:animate-pulse" />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

export default MealPlanStatusCard;
