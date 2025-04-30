// pages/preferences.tsx
import { fetchOnboardingData } from "@/data";
import { saveOnboardingData } from "@/actions/saveData";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/lable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { auth } from "@clerk/nextjs/server";
import { UserPreference } from "@/types";
import toast from "react-hot-toast";

const cuisines = [
  { id: "italian", label: "Italian" },
  { id: "mexican", label: "Mexican" },
  { id: "indian", label: "Indian" },
  { id: "chinese", label: "Chinese" },
  { id: "american", label: "American" },
  { id: "japanese", label: "Japanese" },
  { id: "thai", label: "Thai" },
  { id: "kenyan", label: "Kenyan" },
  { id: "moroccan", label: "Moroccan" },
  { id: "spanish", label: "Spanish" },
  { id: "french", label: "French" },
  { id: "greek", label: "Greek" },
  { id: "turkish", label: "Turkish" },
];

const dietaryOptions = [
  { value: "vegan", label: "Vegan" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "omnivore", label: "Omnivore" },
];

const goalOptions = [
  { value: "weight_loss", label: "Weight Loss" },
  { value: "muscle_gain", label: "Muscle Gain" },
  { value: "maintenance", label: "Maintenance" },
];

export default async function PreferencesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Fetch the user preferences, if they exist
  const prefs: UserPreference[] = await fetchOnboardingData(userId);

  const defaultPreferences = {
    dietaryPreference: prefs?.[0]?.dietaryPreference ?? "omnivore",
    goal: prefs?.[0]?.goal ?? "maintenance",
    householdSize: prefs?.[0]?.householdSize ?? 1,
    cuisinePreferences: prefs?.[0]?.cuisinePreferences ?? [],
  };

  async function updatePreferences(formData: FormData) {
    "use server";
  
    const dietaryPreference = formData.get("dietaryPreference") as string;
    const goal = formData.get("goal") as string;
    const householdSize = Number(formData.get("householdSize"));
  
    const cuisinePreferences = cuisines
      .filter((c) => formData.get(c.id) === "on")
      .map((c) => c.id);
  
    // Validate data
    if (!dietaryPreference || !goal || isNaN(householdSize)) {
      throw new Error("Invalid form data submitted.");
    }
  
    await saveOnboardingData({
      userId, // make sure this is accessible in this scope
      dietaryPreference,
      goal,
      householdSize,
      cuisinePreferences,
    });
  
    // ⚠️ This will error: `toast` is client-side only
    // toast.success("Preferences updated successfully!");
  
    revalidatePath("/preferences");
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8">
        <form action={updatePreferences} className="mx-auto max-w-2xl">
          <Card className="border-2 shadow-lg">
            <CardHeader className="space-y-1 bg-muted/50">
              <CardTitle className="text-2xl">Taste Preferences</CardTitle>
              <CardDescription>
                Customize your meal recommendations based on your preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Dietary Preference */}
              <div className="space-y-2">
                <Label htmlFor="dietaryPreference">Dietary Preference</Label>
                <Select
                  name="dietaryPreference"
                  defaultValue={defaultPreferences.dietaryPreference}
                >
                  <SelectTrigger id="dietaryPreference">
                    <SelectValue placeholder="Select a dietary preference" />
                  </SelectTrigger>
                  <SelectContent>
                    {dietaryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Goal */}
              <div className="space-y-2">
                <Label htmlFor="goal">Primary Goal</Label>
                <Select name="goal" defaultValue={defaultPreferences.goal}>
                  <SelectTrigger id="goal">
                    <SelectValue placeholder="Select a goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {goalOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Household Size */}
              <div className="space-y-2">
                <Label htmlFor="householdSize">
                  Household Size: {defaultPreferences.householdSize}
                </Label>
                <Input
                  type="range"
                  id="householdSize"
                  name="householdSize"
                  min={1}
                  max={8}
                  defaultValue={defaultPreferences.householdSize}
                />
              </div>

              {/* Cuisine Preferences */}
              <div className="space-y-4">
                <Label>Cuisine Preferences</Label>
                <div className="grid grid-cols-2 gap-4">
                  {cuisines.map((cuisine) => (
                    <div key={cuisine.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={cuisine.id}
                        name={cuisine.id}
                        defaultChecked={defaultPreferences.cuisinePreferences.includes(
                          cuisine.id
                        )}
                      />
                      <Label htmlFor={cuisine.id} className="cursor-pointer">
                        {cuisine.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/30 p-4">
              <Button type="submit" className="ml-auto">
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </form>
      </main>
    </div>
  );
}
