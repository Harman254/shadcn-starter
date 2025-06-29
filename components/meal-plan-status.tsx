'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Plus, Calendar, Utensils, Rocket, TrendingUp, Clock,  Target, ChefHat } from 'lucide-react';
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

const MealPlanStatusCard = ({ hasMealPlan, mealPlan, meals }: Props) => {
  const router = useRouter();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl shadow-2xl border border-purple-500/20 backdrop-blur-sm mb-12 min-h-[500px]"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(147,51,234,0.3),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.3),transparent_40%),radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.2),transparent_60%)]" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Glowing Orbs */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />

      {hasMealPlan && mealPlan ? (
        <div className="relative z-10 p-8 sm:p-12">
          {/* Status Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm rounded-full border border-emerald-400/30">
              <div className="relative">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
              </div>
              <Rocket className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-sm font-bold text-emerald-300 tracking-wide">ACTIVE MEAL PLAN</span>
            </div>
          </motion.div>

          {/* Main Header */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl sm:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent drop-shadow-2xl">
                Your Culinary
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Journey
              </span>
            </h1>
            <p className="text-slate-300 text-xl max-w-2xl mx-auto leading-relaxed">
              Perfectly crafted meal plan designed to fuel your success
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto"
          >
            {/* Duration Card */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-emerald-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/25"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <Target className="w-5 h-5 text-emerald-400 opacity-60" />
                </div>
                <div className="text-4xl font-black text-white mb-2">{mealPlan.duration}</div>
                <div className="text-slate-400 font-semibold">Days Planned</div>
              </div>
            </motion.div>

            {/* Meals Per Day Card */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-purple-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/25"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Utensils className="w-6 h-6 text-white" />
                  </div>
                  <ChefHat className="w-5 h-5 text-purple-400 opacity-60" />
                </div>
                <div className="text-4xl font-black text-white mb-2">{mealPlan.mealsPerDay}</div>
                <div className="text-slate-400 font-semibold">Meals Daily</div>
              </div>
            </motion.div>

            {/* Total Meals Card */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-cyan-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/25"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <Clock className="w-5 h-5 text-cyan-400 opacity-60" />
                </div>
                <div className="text-4xl font-black text-white mb-2">{mealPlan.duration * mealPlan.mealsPerDay}</div>
                <div className="text-slate-400 font-semibold">Total Meals</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-4 max-w-2xl mx-auto"
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(`/meal-plans/${mealPlan.id}`)}
              className="group relative px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-bold shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-center justify-center gap-3">
                <span className="text-lg">View Full Plan</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(`/grocery-list/${mealPlan.id}`)}
              className="group relative px-8 py-4 border-2 border-purple-400/50 text-purple-300 hover:text-white hover:border-purple-400 rounded-2xl font-bold transition-all duration-300 backdrop-blur-sm hover:bg-purple-500/20 shadow-lg hover:shadow-purple-500/30"
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-lg">Grocery List</span>
              </div>
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
            className="mb-12"
          >
            <div className="relative inline-block mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                <Plus className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-bounce">
                <Rocket className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                Begin Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Food Journey
              </span>
            </h1>
            
            <p className="text-slate-300 text-xl max-w-3xl mx-auto leading-relaxed mb-12">
              Transform your eating habits with AI-powered meal planning. Get personalized recipes, smart shopping lists, and achieve your health goals effortlessly.
            </p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/meal-plans/new')}
            className="group relative px-10 py-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 text-white rounded-2xl font-bold shadow-2xl hover:shadow-emerald-500/50 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex items-center justify-center gap-4">
              <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-xl">Create Your First Plan</span>
              <Rocket className="w-6 h-6 group-hover:animate-pulse" />
            </div>
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

export default MealPlanStatusCard;