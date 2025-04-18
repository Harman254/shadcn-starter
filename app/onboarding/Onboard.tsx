'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Users, UtensilsCrossed, Target, Cookie, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/lable";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import { saveOnboardingData } from "@/actions/saveData";
import type { OnboardingData } from "@/types";

const dietaryOptions = [
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Gluten-Free",
  "None (All foods)",
];

const goalOptions = [
  "Eat Healthier",
  "Save Money",
  "Learn to Cook",
  "Reduce Food Waste",
  "Try New Cuisines",
];

const cuisineOptions = [
  "Italian", "Japanese", "Mexican", "Indian", "Chinese",
  "Thai", "Mediterranean", "American", "French", "Korean",
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
        router.push("/meal-plans/new");
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full ${i === step ? "bg-primary" : "bg-gray-200"}`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">Step {step} of 4</span>
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === 1 && "Dietary Preferences"}
            {step === 2 && "Your Main Goal"}
            {step === 3 && "Household Size"}
            {step === 4 && "Favorite Cuisines"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <UtensilsCrossed className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Select your dietary preference</span>
              </div>
              <RadioGroup
                value={formData.dietaryPreference}
                onValueChange={(value) =>
                  setFormData({ ...formData, dietaryPreference: value })
                }
                className="grid gap-4"
              >
                {dietaryOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">What's your main goal?</span>
              </div>
              <RadioGroup
                value={formData.goal}
                onValueChange={(value) =>
                  setFormData({ ...formData, goal: value })
                }
                className="grid gap-4"
              >
                {goalOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">How many people are you cooking for?</span>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.householdSize}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      householdSize: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-24"
                />
                <Label>People</Label>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <Cookie className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Select your favorite cuisines (choose at least one)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {cuisineOptions.map((cuisine) => (
                  <div key={cuisine} className="flex items-center space-x-2">
                    <Checkbox
                      id={cuisine}
                      checked={formData.cuisinePreferences.includes(cuisine)}
                      onCheckedChange={(checked) => {
                        setFormData({
                          ...formData,
                          cuisinePreferences: checked
                            ? [...formData.cuisinePreferences, cuisine]
                            : formData.cuisinePreferences.filter((c) => c !== cuisine),
                        });
                      }}
                    />
                    <Label htmlFor={cuisine}>{cuisine}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="w-32"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={!isStepValid() || isSaving}
              className="w-32 flex items-center justify-center"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  {step === 4 ? "Finish" : "Next"}
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
