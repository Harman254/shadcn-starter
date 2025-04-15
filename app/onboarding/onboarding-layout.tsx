import React from 'react';
import { Calendar} from 'lucide-react';

import { ProgressBar } from './progress';
import { OnboardingStep } from '@/types';



const Onboardinglayout = ({ children ,currentStep }: { children: React.ReactNode, currentStep: OnboardingStep }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <Calendar className="w-10 h-10 text-emerald-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">Onboarding</h1>
        </div>
        
        <ProgressBar currentStep={currentStep} />
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Onboardinglayout
