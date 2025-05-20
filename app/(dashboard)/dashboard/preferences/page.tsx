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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CUISINE_OPTIONS, DIETARY_OPTIONS, GOAL_OPTIONS } from "@/lib/constants";
import SaveButton from "@/components/save-preferences";

// Define UserPreference interface
interface UserPreference {
  dietaryPreference: string;
  goal: string;
  householdSize: number;
  cuisinePreferences: string[];
}

// Server-side form validation and processing
async function updatePreferences(formData: FormData): Promise<void> {
  "use server";

  const dietaryPreference = formData.get("dietaryPreference");
  const goal = formData.get("goal");
  const householdSizeRaw = formData.get("householdSize");

  // Form validation
  if (typeof dietaryPreference !== "string" || !DIETARY_OPTIONS.some(d => d.value === dietaryPreference)) {
    redirect(`/preferences?error=${encodeURIComponent("Please select a valid dietary preference")}`);
  }
  
  if (typeof goal !== "string" || !GOAL_OPTIONS.some(g => g.value === goal)) {
    redirect(`/preferences?error=${encodeURIComponent("Please select a valid goal")}`);
  }
  
  const householdSize = Number(householdSizeRaw);
  if (isNaN(householdSize) || householdSize < 1 || householdSize > 8) {
    redirect(`/preferences?error=${encodeURIComponent("Please select a valid household size (1-8)")}`);
  }

  // Get selected cuisines
  const cuisinePreferences = CUISINE_OPTIONS
    .filter((c) => formData.get(c.id) === "on")
    .map((c) => c.id);

  await saveOnboardingData({
    dietaryPreference,
    goal,
    householdSize,
    cuisinePreferences,
  });

  revalidatePath("/preferences");
}

export default async function PreferencesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id || typeof session.user.id !== "string") {
    redirect("/sign-in");
  }

  const userId = session.user.id;

  // Get existing preferences with error handling
  let prefs: UserPreference[] = [];
  let fetchError: string | null = null;
  
  try {
    prefs = await fetchOnboardingData(userId);
  } catch (e) {
    console.error("Failed to fetch preferences:", e);
    fetchError = "Failed to load your preferences. Default values will be shown.";
  }

  const defaultPreferences: UserPreference = {
    dietaryPreference: prefs[0]?.dietaryPreference ?? "omnivore",
    goal: prefs[0]?.goal ?? "eat_healthier",
    householdSize: prefs[0]?.householdSize ?? 1,
    cuisinePreferences: prefs[0]?.cuisinePreferences ?? [],
  };

  // Get error from query param
  const searchParams = new URLSearchParams(await headers().then(h => h.get("x-url") || ""));
  const formError = searchParams.get("error");

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8">
        {fetchError && (
          <div className="mb-6 max-w-2xl mx-auto bg-red-100 p-4 rounded">
            <p>{fetchError}</p>
          </div>
        )}
        {formError && (
          <div className="mb-6 max-w-2xl mx-auto bg-red-100 p-4 rounded">
            <p>{decodeURIComponent(formError)}</p>
          </div>
        )}
        
        <form action={updatePreferences} className="mx-auto bg-gradient-to-b from-muted/35 to-muted/15 max-w-2xl">
          <Card className="border-2 shadow-lg">
            <CardHeader className="space-y-1 bg-muted/50">
              <CardTitle className="text-2xl">Taste Preferences</CardTitle>
              <CardDescription>
                Customize your meal recommendations based on your preferences.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6 space-y-8">
              {/* Dietary Preference */}
              <div className="space-y-2">
                <Label htmlFor="dietaryPreference">Dietary Preference</Label>
                <Select
                  name="dietaryPreference"
                  defaultValue={defaultPreferences.dietaryPreference}
                >
                  <SelectTrigger id="dietaryPreference" aria-label="Select dietary preference">
                    <SelectValue placeholder="Select a dietary preference">
                      {
                        DIETARY_OPTIONS.find(
                          (option) => option.value === defaultPreferences.dietaryPreference
                        )?.label
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {DIETARY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <span>{option.icon}</span>
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Goal */}
              <div className="space-y-2">
                <Label htmlFor="goal">Primary Goal</Label>
                <Select name="goal" defaultValue={defaultPreferences.goal}>
                  <SelectTrigger id="goal" aria-label="Select your primary goal">
                    <SelectValue placeholder="Select a goal">
                      {
                        GOAL_OPTIONS.find(
                          (option) => option.value === defaultPreferences.goal
                        )?.label
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <span>{option.icon}</span>
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Household Size */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label htmlFor="householdSize">Household Size</Label>
                  <span className="font-medium text-lg bg-primary/10 px-3 py-1 rounded-full">
                    {defaultPreferences.householdSize} {defaultPreferences.householdSize === 1 ? 'person' : 'people'}
                  </span>
                </div>
                <Input
                  type="range"
                  id="householdSize"
                  name="householdSize"
                  min={1}
                  max={8}
                  defaultValue={defaultPreferences.householdSize}
                  className="cursor-pointer"
                  aria-label={`Select household size, current value: ${defaultPreferences.householdSize}`}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                  <span>6</span>
                  <span>7</span>
                  <span>8</span>
                </div>
              </div>

              {/* Cuisine Preferences */}
              <div className="space-y-4">
                <Label>Cuisine Preferences</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CUISINE_OPTIONS.map((cuisine) => (
                    <div key={cuisine.id} className="flex items-center spacedo-x-2">
                      <Checkbox
                        id={cuisine.id}
                        name={cuisine.id}
                        defaultChecked={defaultPreferences.cuisinePreferences.includes(
                          cuisine.id
                        )}
                        aria-label={`Select ${cuisine.label} cuisine`}
                      />
                      <Label htmlFor={cuisine.id} className="cursor-pointer flex items-center space-x-2">
                        <span>{cuisine.icon}</span>
                        <span>{cuisine.label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="border-t bg-muted/30 p-4 flex justify-between">
              
              <SaveButton />
            </CardFooter>
          </Card>
        </form>
      </main>
    </div>
  );
}