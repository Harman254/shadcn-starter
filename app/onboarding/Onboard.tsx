'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronRight, 
  ChevronLeft, 
  Users, 
  UtensilsCrossed, 
  Target, 
  Cookie, 
  Loader2,
  CheckCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label"; // Fixed typo in import
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

import { saveOnboardingData } from "@/actions/saveData";
import type { OnboardingData } from "@/types";
import toast from "react-hot-toast";

const dietaryOptions = [
  {
    value: "Vegetarian",
    description: "Plant-based diet excluding meat and fish",
    icon: "🥗",
  },
  {
    value: "Vegan",
    description: "Plant-based diet excluding all animal products",
    icon: "🌱",
  },
  {
    value: "Pescatarian",
    description: "Plant-based diet including fish and seafood",
    icon: "🐟",
  },
  {
    value: "Gluten-Free",
    description: "Diet excluding gluten-containing grains",
    icon: "🌾",
  },
  {
    value: "None (All foods)",
    description: "No dietary restrictions",
    icon: "🍽️",
  },
];

const goalOptions = [
  {
    value: "Eat Healthier", 
    description: "Focus on nutritious and balanced meals",
    icon: "🥦"
  },
  {
    value: "Save Money", 
    description: "Budget-friendly meal options and planning",
    icon: "💰"
  },
  {
    value: "Learn to Cook", 
    description: "Develop culinary skills with easy-to-follow recipes",
    icon: "👨‍🍳"
  },
  {
    value: "Reduce Food Waste", 
    description: "Smart shopping and ingredient utilization",
    icon: "♻️"
  },
  {
    value: "Try New Cuisines", 
    description: "Explore diverse flavors and cooking styles",
    icon: "🌍"
  },
];

const cuisineOptions = [
  { value: "Italian", icon: "🍝" },
  { value: "Japanese", icon: "🍣" }, 
  { value: "Mexican", icon: "🌮" }, 
  { value: "Indian", icon: "🍛" }, 
  { value: "Chinese", icon: "🥡" },
  { value: "Thai", icon: "🍲" }, 
  { value: "Mediterranean", icon: "🫒" }, 
  { value: "American", icon: "🍔" }, 
  { value: "French", icon: "🥐" }, 
  { value: "Korean", icon: "🍜" },
];

const OnboardingPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<OnboardingData>({
    dietaryPreference: "",
    goal: "",
    householdSize: 1,
    cuisinePreferences: [],
  });

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      setIsSaving(true);
      try {
        const resuit = await saveOnboardingData(formData);
        toast.success("Onboarding data saved successfully!");
        
      } catch (error) {
        console.log("Error saving onboarding data:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return !!formData.dietaryPreference;
      case 2: return !!formData.goal;
      case 3: return formData.householdSize > 0;
      case 4: return formData.cuisinePreferences.length > 0;
      default: return false;
    }
  };

  const progressPercentage = (step / 4) * 100;

  const stepIcons = [
    <UtensilsCrossed key="step1" className="w-6 h-6" />,
    <Target key="step2" className="w-6 h-6" />,
    <Users key="step3" className="w-6 h-6" />,
    <Cookie key="step4" className="w-6 h-6" />
  ];

  const stepTitles = [
    "Dietary Preferences",
    "Your Main Goal",
    "Household Size",
    "Favorite Cuisines"
  ];

  const stepDescriptions = [
    "Tell us about your dietary needs so we can customize your meal plans.",
    "Choose what matters most to you for better meal recommendations.",
    "We'll adjust portion sizes and planning based on your household.",
    "Select cuisines you enjoy to personalize your recipe suggestions."
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground">
            {stepIcons[step-1]}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Your Profile</h1>
            <p className="text-muted-foreground">Step {step} of 4 • {stepTitles[step-1]}</p>
          </div>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2 mb-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className="flex justify-between px-1 text-xs text-muted-foreground mb-6">
          {[1, 2, 3, 4].map(num => (
            <div 
              key={num} 
              className={cn(
                "flex flex-col items-center transition-colors",
                step >= num ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div 
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs mb-1",
                  step > num ? "bg-primary text-primary-foreground" : 
                  step === num ? "border-2 border-primary text-primary" : 
                  "border border-muted-foreground"
                )}
              >
                {step > num ? <CheckCircle className="w-4 h-4" /> : num}
              </div>
              <span className="hidden md:block text-xs">{stepTitles[num-1]}</span>
            </div>
          ))}
        </div>
      </div>

      <Card className="w-full max-w-3xl shadow-lg border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle className="text-2xl">{stepTitles[step-1]}</CardTitle>
          <CardDescription>{stepDescriptions[step-1]}</CardDescription>
        </CardHeader>
        
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <RadioGroup
                value={formData.dietaryPreference}
                onValueChange={(value) =>
                  setFormData({ ...formData, dietaryPreference: value })
                }
                className="grid gap-3"
              >
                {dietaryOptions.map((option) => (
                  <div 
                    key={option.value} 
                    className={cn(
                      "flex items-center space-x-3 rounded-lg border p-4 transition-all hover:bg-muted/50",
                      formData.dietaryPreference === option.value ? "border-primary bg-primary/5" : "border-border"
                    )}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="hidden" />
                    <Label 
                      htmlFor={option.value} 
                      className="flex items-center gap-3 cursor-pointer w-full"
                    >
                      <span className="text-2xl" role="img" aria-label={option.value}>
                        {option.icon}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium">{option.value}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        formData.dietaryPreference === option.value ? "border-primary" : "border-muted-foreground"
                      )}>
                        {formData.dietaryPreference === option.value && 
                          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        }
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <RadioGroup
                value={formData.goal}
                onValueChange={(value) =>
                  setFormData({ ...formData, goal: value })
                }
                className="grid gap-3"
              >
                {goalOptions.map((option) => (
                  <div 
                    key={option.value} 
                    className={cn(
                      "flex items-center space-x-3 rounded-lg border p-4 transition-all hover:bg-muted/50",
                      formData.goal === option.value ? "border-primary bg-primary/5" : "border-border"
                    )}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="hidden" />
                    <Label 
                      htmlFor={option.value} 
                      className="flex items-center gap-3 cursor-pointer w-full"
                    >
                      <span className="text-2xl" role="img" aria-label={option.value}>
                        {option.icon}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium">{option.value}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        formData.goal === option.value ? "border-primary" : "border-muted-foreground"
                      )}>
                        {formData.goal === option.value && 
                          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        }
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 items-center justify-center p-8 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  <span className="text-lg font-medium">Household Size</span>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setFormData({
                      ...formData,
                      householdSize: Math.max(1, formData.householdSize - 1)
                    })}
                    disabled={formData.householdSize <= 1}
                    className="h-10 w-10 rounded-full"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Decrease</span>
                  </Button>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-bold">{formData.householdSize}</span>
                    <span className="text-sm text-muted-foreground">
                      {formData.householdSize === 1 ? 'Person' : 'People'}
                    </span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setFormData({
                      ...formData,
                      householdSize: Math.min(10, formData.householdSize + 1)
                    })}
                    disabled={formData.householdSize >= 10}
                    className="h-10 w-10 rounded-full"
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Increase</span>
                  </Button>
                </div>
                <Input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.householdSize}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      householdSize: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full max-w-xs"
                />
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium">Our recommendations will be tailored for {formData.householdSize} {formData.householdSize === 1 ? 'person' : 'people'}</p>
                </div>
                <p className="text-xs text-muted-foreground pl-6">
                  We'll adjust recipe portions and shopping lists accordingly
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {cuisineOptions.map((cuisine) => {
                  const isSelected = formData.cuisinePreferences.includes(cuisine.value);
                  return (
                    <div 
                      key={cuisine.value}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          cuisinePreferences: isSelected
                            ? formData.cuisinePreferences.filter((c) => c !== cuisine.value)
                            : [...formData.cuisinePreferences, cuisine.value],
                        });
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all text-center",
                        isSelected 
                          ? "bg-primary/10 border-2 border-primary" 
                          : "bg-muted/30 border border-muted hover:border-primary/30"
                      )}
                    >
                      <span className="text-3xl mb-2" role="img" aria-label={cuisine.value}>
                        {cuisine.icon}
                      </span>
                      <span className="text-sm font-medium">{cuisine.value}</span>
                      <div className="mt-2">
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                          isSelected ? "border-primary" : "border-muted-foreground/30"
                        )}>
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Selected: {formData.cuisinePreferences.length}/10</span>
                </div>
                {formData.cuisinePreferences.length > 0 && (
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({...formData, cuisinePreferences: []})}
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-10">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="min-w-32"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={!isStepValid() || isSaving}
              className="min-w-32 flex items-center justify-center"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  {step === 4 ? "Complete Setup" : "Continue"}
                  {step !== 4 && <ChevronRight className="w-4 h-4 ml-2" />}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingPage;