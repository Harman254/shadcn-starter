import { prisma } from "@/lib/prisma";
import { MealPlan } from "@/types";




export const fetchOnboardingData = async () => {
const data = await prisma.onboardingData.findMany({
  where: {
    id: 3
  }
});
console.log("Fetched Onboarding Data:", data);
return data;
}


export const mockMealPlan: MealPlan = {
  id: "meal-plan-1",
  name: "7-Day Weight Loss Plan",
  description: "A balanced meal plan designed to support weight loss while providing all necessary nutrients.",
  days: [
    {
      id: "day-1",
      date: "2025-04-14",
      meals: [
        {
          id: "meal-1",
          type: "breakfast",
          name: "Avocado Toast with Egg",
          description: "Whole grain toast topped with mashed avocado and a poached egg.",
          calories: 350
        },
        {
          id: "meal-2",
          type: "lunch",
          name: "Grilled Chicken Salad",
          description: "Mixed greens with grilled chicken, cherry tomatoes, and balsamic vinaigrette.",
          calories: 420
        },
        {
          id: "meal-3",
          type: "dinner",
          name: "Baked Salmon with Roasted Vegetables",
          description: "Wild-caught salmon with a side of roasted broccoli and sweet potatoes.",
          calories: 550
        },
        {
          id: "meal-4",
          type: "snack",
          name: "Greek Yogurt with Berries",
          description: "Plain Greek yogurt topped with mixed berries and a drizzle of honey.",
          calories: 180
        }
      ]
    },
    {
      id: "day-2",
      date: "2025-04-15",
      meals: [
        {
          id: "meal-5",
          type: "breakfast",
          name: "Overnight Oats with Banana",
          description: "Rolled oats soaked in almond milk overnight, topped with sliced banana and chia seeds.",
          calories: 320
        },
        {
          id: "meal-6",
          type: "lunch",
          name: "Quinoa Buddha Bowl",
          description: "Quinoa with roasted chickpeas, avocado, kale, and tahini dressing.",
          calories: 480
        },
        {
          id: "meal-7",
          type: "dinner",
          name: "Turkey Meatballs with Zucchini Noodles",
          description: "Lean turkey meatballs served over spiralized zucchini with marinara sauce.",
          calories: 520
        },
        {
          id: "meal-8",
          type: "snack",
          name: "Apple with Almond Butter",
          description: "Sliced apple served with a tablespoon of natural almond butter.",
          calories: 200
        }
      ]
    }
  ]
};

export const regenerateMeal = (type: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
  const mockNames = {
    breakfast: ['Avocado Toast with Egg', 'Protein Pancakes', 'Veggie Omelette', 'Smoothie Bowl'],
    lunch: ['Grilled Chicken Wrap', 'Quinoa Salad', 'Tuna Sandwich', 'Vegetable Soup with Bread'],
    dinner: ['Stir Fry Veggies with Tofu', 'Baked Salmon', 'Chicken Curry', 'Lentil Pasta'],
    snack: ['Banana Smoothie', 'Trail Mix', 'Hummus with Carrots', 'Greek Yogurt with Berries']
  };

  const randomIndex = Math.floor(Math.random() * mockNames[type].length);
  
  return {
    id: crypto.randomUUID(),
    type,
    name: mockNames[type][randomIndex],
    description: 'A healthy and tasty option to keep you going!',
    calories: Math.floor(Math.random() * 300) + 200
  };
};
