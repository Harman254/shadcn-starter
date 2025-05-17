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
import { Label } from "@/components/ui/label";
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
    icon: "&#x1F957;",
  },
  {
    value: "Vegan",
    description: "Plant-based diet excluding all animal products",
    icon: "&#x1F331;",
  },
  {
    value: "Pescatarian",
    description: "Plant-based diet including fish and seafood",
    icon: "&#x1F41F;",
  },
  {
    value: "Gluten-Free",
    description: "Diet excluding gluten-containing grains",
    icon: "&#x1F33E;",
  },
  {
    value: "None (All foods)",
    description: "No dietary restrictions",
    icon: "&#x1F37D;",
  },
];

const goalOptions = [
  {
    value: "Eat Healthier", 
    description: "Focus on nutritious and balanced meals",
    icon: "&#x1F966;"
  },
  {
    value: "Save Money", 
    description: "Budget-friendly meal options and planning",
    icon: "&#x1F4B0;"
  },
  {
    value: "Learn to Cook", 
    description: "Develop culinary skills with easy-to-follow recipes",
    icon: "&#x1F468;&#x200D;&#x1F373;"
  },
  {
    value: "Reduce Food Waste", 
    description: "Smart shopping and ingredient utilization",
    icon: "&#x267B;"
  },
  {
    value: "Try New Cuisines", 
    description: "Explore diverse flavors and cooking styles",
    icon: "&#x1F30D;"
  },
];

const cuisineOptions = [
  { value: "Italian", icon: "&#x1F35D;" },
  { value: "Japanese", icon: "&#x1F363;" }, 
  { value: "Mexican", icon: "&#x1F32E;" }, 
  { value: "Indian", icon: "&#x1F35B;" }, 
  { value: "Chinese", icon: "&#x1F961;" },
  { value: "Thai", icon: "&#x1F372;" }, 
  { value: "Mediterranean", icon: "&#x1FAD2;" }, 
  { value: "American", icon: "&#x1F354;" }, 
  { value: "French", icon: "&#x1F950;" }, 
  { value: "Korean", icon: "&#x1F35C;" },
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
        await saveOnboardingData(formData);
      } catch (error) {
        console.error("Error saving onboarding data:", error);
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
    { icon: "&#x1F374;", label: "Utensils" }, 
    { icon: "&#x1F3AF;", label: "Target" }, 
    { icon: "&#x1F465;", label: "Users" },
    { icon: "&#x1F36A;", label: "Cookie" } 
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
    "We&apos;ll adjust portion sizes and planning based on your household.",
    "Select cuisines you enjoy to personalize your recipe suggestions."
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-sm">
            <span 
              className="text-2xl" 
              role="img" 
              aria-label={stepIcons[step-1].label}
              dangerouslySetInnerHTML={{ __html: stepIcons[step-1].icon }}
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight leading-tight">Create Your Profile</h1>
            <p className="text-muted-foreground font-medium">Step {step} of 4 • {stepTitles[step-1]}</p>
          </div>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2.5 mb-3">
          <div 
            className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className="flex justify-between px-1 text-xs font-medium mb-8">
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
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs mb-1.5 shadow-sm",
                  step > num ? "bg-primary text-primary-foreground" : 
                  step === num ? "border-2 border-primary text-primary" : 
                  "border border-muted-foreground/50"
                )}
              >
                {step > num ? <CheckCircle className="w-4 h-4" /> : num}
              </div>
              <span className="hidden md:block text-xs">{stepTitles[num-1]}</span>
            </div>
          ))}
        </div>
      </div>

      <Card className="w-full max-w-3xl shadow-lg border-t-4 border-t-primary animate-in fade-in-50 duration-300">
        <CardHeader className="pb-5">
          <CardTitle className="text-2xl font-bold tracking-tight">{stepTitles[step-1]}</CardTitle>
          <CardDescription className="text-base text-muted-foreground">{stepDescriptions[step-1]}</CardDescription>
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
                      formData.dietaryPreference === option.value ? "border-primary bg-primary/5 shadow-sm" : "border-border"
                    )}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="hidden" />
                    <Label 
                      htmlFor={option.value} 
                      className="flex items-center gap-4 cursor-pointer w-full"
                    >
                      <span 
                        className="text-2xl" 
                        role="img" 
                        aria-label={option.value}
                        dangerouslySetInnerHTML={{ __html: option.icon }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-base">{option.value}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{option.description}</p>
                      </div>
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                        formData.dietaryPreference === option.value ? "border-primary" : "border-muted-foreground/50"
                      )}>
                        {formData.dietaryPreference === option.value && 
                          <div className="w-3 h-3 rounded-full bg-primary" />
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
                      formData.goal === option.value ? "border-primary bg-primary/5 shadow-sm" : "border-border"
                    )}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="hidden" />
                    <Label 
                      htmlFor={option.value} 
                      className="flex items-center gap-4 cursor-pointer w-full"
                    >
                      <span 
                        className="text-2xl" 
                        role="img" 
                        aria-label={option.value}
                        dangerouslySetInnerHTML={{ __html: option.icon }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-base">{option.value}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{option.description}</p>
                      </div>
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                        formData.goal === option.value ? "border-primary" : "border-muted-foreground/50"
                      )}>
                        {formData.goal === option.value && 
                          <div className="w-3 h-3 rounded-full bg-primary" />
                        }
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-7">
              <div className="flex flex-col gap-6 items-center justify-center p-8 bg-muted/30 rounded-xl border border-border/50">
                <div className="flex items-center gap-2.5">
                  <Users className="w-6 h-6 text-primary" />
                  <span className="text-lg font-semibold">Household Size</span>
                </div>
                <div className="flex items-center gap-6">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setFormData({
                      ...formData,
                      householdSize: Math.max(1, formData.householdSize - 1)
                    })}
                    disabled={formData.householdSize <= 1}
                    className="h-12 w-12 rounded-full shadow-sm"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    <span className="sr-only">Decrease</span>
                  </Button>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-5xl font-bold tabular-nums">{formData.householdSize}</span>
                    <span className="text-sm font-medium text-muted-foreground mt-1">
                      {formData.householdSize === 1 ? "Person" : "People"}
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
                    className="h-12 w-12 rounded-full shadow-sm"
                  >
                    <ChevronRight className="h-5 w-5" />
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
                  className="w-full max-w-sm accent-primary"
                />
              </div>
              
              <div className="bg-muted/30 p-5 rounded-lg border border-border/50">
                <div className="flex items-center gap-2.5 mb-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <p className="text-base font-medium">Our recommendations will be tailored for {formData.householdSize} {formData.householdSize === 1 ? "person" : "people"}</p>
                </div>
                <p className="text-sm text-muted-foreground pl-7 leading-relaxed">
                  We&apos;ll adjust recipe portions and shopping lists accordingly
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
                          ? "bg-primary/10 border-2 border-primary shadow-sm" 
                          : "bg-muted/30 border border-muted hover:border-primary/30"
                      )}
                    >
                      <span 
                        className="text-3xl mb-2" 
                        role="img" 
                        aria-label={cuisine.value}
                        dangerouslySetInnerHTML={{ __html: cuisine.icon }}
                      />
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
              
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-medium">Selected: {formData.cuisinePreferences.length}/10</span>
                </div>
                {formData.cuisinePreferences.length > 0 && (
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({...formData, cuisinePreferences: []})}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-12">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="min-w-36 h-11 font-medium"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={!isStepValid() || isSaving}
              className="min-w-36 h-11 font-medium"
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