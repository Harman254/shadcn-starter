// app/constants.ts
import type { MealPlan } from "@/types/index"
import type { MealPlanStats } from "@/types/index"

export const CUISINE_OPTIONS = [
    { id: "italian", label: "Italian", icon: "🍝" },
    { id: "japanese", label: "Japanese", icon: "🍣" },
    { id: "mexican", label: "Mexican", icon: "🌮" },
    { id: "indian", label: "Indian", icon: "🍛" },
    { id: "chinese", label: "Chinese", icon: "🥡" },
    { id: "thai", label: "Thai", icon: "🍲" },
    { id: "mediterranean", label: "Mediterranean", icon: "🫒" },
    { id: "american", label: "American", icon: "🍔" },
    { id: "french", label: "French", icon: "🥐" },
    { id: "korean", label: "Korean", icon: "🍜" },
    { id: "kenyan", label: "Kenyan", icon: "🍛" },
    { id: "moroccan", label: "Moroccan", icon: "🍢" },
    { id: "spanish", label: "Spanish", icon: "🥘" },
    { id: "greek", label: "Greek", icon: "🥙" },
    { id: "turkish", label: "Turkish", icon: "🍖" },
  ];
  
  export const DIETARY_OPTIONS = [
    { value: "vegetarian", label: "Vegetarian", description: "Plant-based diet excluding meat and fish", icon: "🥗" },
    { value: "vegan", label: "Vegan", description: "Plant-based diet excluding all animal products", icon: "🌱" },
    { value: "pescatarian", label: "Pescatarian", description: "Plant-based diet including fish and seafood", icon: "🐟" },
    { value: "gluten_free", label: "Gluten-Free", description: "Diet excluding gluten-containing grains", icon: "🌾" },
    { value: "omnivore", label: "None (All foods)", description: "No dietary restrictions", icon: "🍽️" },
  ];
  
  export const GOAL_OPTIONS = [
    { value: "eat_healthier", label: "Eat Healthier", description: "Focus on nutritious and balanced meals", icon: "🥦" },
    { value: "save_money", label: "Save Money", description: "Budget-friendly meal options and planning", icon: "💰" },
    { value: "learn_to_cook", label: "Learn to Cook", description: "Develop culinary skills with easy-to-follow recipes", icon: "👨‍🍳" },
    { value: "reduce_waste", label: "Reduce Food Waste", description: "Smart shopping and ingredient utilization", icon: "♻️" },
    { value: "try_new_cuisines", label: "Try New Cuisines", description: "Explore diverse flavors and cooking styles", icon: "🌍" },
  ];
  


  
 

 

