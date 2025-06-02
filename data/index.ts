'use server';

import  prisma  from "@/lib/prisma";
import { MealPlan, UserPreference } from "@/types";


import { revalidatePath } from "next/cache";




export async function fetchOnboardingData(userid: string): Promise<UserPreference[]> {
const data = await prisma.onboardingData.findMany({
  where: {
    userId: userid,
  }
});
return data;
}
export const getMealsByUserId = async (userId: string) => {
  const meals = await prisma.meal.findMany({
    where: {
      dayMeal: {
        mealPlan: {
          userId: userId,
        },
      },
    },
    include: {
      dayMeal: {
        include: {
          mealPlan: true,
        },
      },
    },
  });

  return meals;
};


export const fetchMealPlansByUserId = async (userId: string) => {
  const mealPlans = await prisma.mealPlan.findMany({
    where: {
      userId: userId,
    },
    include: {
      days: {
        include: {
          meals: true,
        },
      },
    },
  });

  return mealPlans;
};

export const fetchMealPlanById = async (mealPlanId: string) => {
  const mealPlan = await prisma.mealPlan.findUnique({
    where: {
      id: mealPlanId,
    },
    include: {
      days: {
        include: {
          meals: true,
        },
      },
    },
  });
  return mealPlan;
};




export const deleteMealPlanById = async (formData: FormData) => {
  const mealPlanId = formData.get("id") as string;
  if (!mealPlanId) throw new Error("Meal Plan ID is required");

  console.log("Deleting meal plan:", mealPlanId);

  // Step 1: Delete Meals linked through DayMeals
  await prisma.meal.deleteMany({
    where: {
      dayMeal: {
        mealPlanId: mealPlanId,
      },
    },
  });

  // Step 2: Delete DayMeals linked to MealPlan
  await prisma.dayMeal.deleteMany({
    where: {
      mealPlanId: mealPlanId,
    },
  });

  // Step 3: Delete MealPlan itself
  await prisma.mealPlan.delete({
    where: {
      id: mealPlanId,
    },
  });

  // Step 4 (Optional): Revalidate relevant page
  revalidatePath('/meal-plans');
};



export async function getLatestFullMealPlanByUserId(userId: string) {
  return await prisma.mealPlan.findFirst({
    where: { userId },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      days: {
        orderBy: { date: "asc" },
        include: {
          meals: {
            orderBy: { name: "asc" },
            select: {
              name: true,
              ingredients: true,
              description: true,
            },
          },
        },
      },
    },
  });
}


export async function getLatestMealPlanByUserId(userId: string) {
    
  return await prisma.mealPlan.findFirst({
    where: { userId },
    orderBy: {
      createdAt: 'desc',
    },
  });
}



export async function getDBSession(userId: string) {
  const session = await prisma.session.findFirst({
    where: {
      userId: userId,
    },
  });
  return session;

}

export const getAccount = async (userId: string) => {
  return await prisma.account.findFirst({
    where: {
      userId,
    },
  });
};

 export const addSubscriber = async (id: string) => {
  const subscriber = await prisma.subscription.create({
    data: {
      userId: id,
      createdAt: new Date(), // Set the current date as creation date
    },
  });

  return subscriber;




 }













// interface Meal {
//   name: string;
//   ingredients: string[];
//   instructions: string;
// }

// // Define the interface for day meal plan data
// interface DayMealPlan {
//   day: number;
//   meals: Meal[];
// }

// // Define the interface for save meal plan input
// export interface SaveMealPlanInput {
//   duration: number;
//   mealsPerDay: number;
//   days: DayMealPlan[];
//   createdAt: string;
// }

// export async function SaveMealPlan(input: SaveMealPlanInput) {
//   console.log("SaveMealPlan function called with input:", JSON.stringify(input, null, 2));
  
//   try {
//     // Create the main MealPlan record with only the fields shown in the database screenshot
//     const mealPlan = await prisma.mealPlan.create({
//       data: {
//         duration: input.duration,
//         mealsPerDay: input.mealsPerDay,
//         createdAt: new Date(input.createdAt)
//       },
//     });
    
//     console.log("Created MealPlan record:", mealPlan);

//     // For each day in the meal plan, create a DayMeal record
//     for (const day of input.days) {
//       // Create a date for this day (using the day number to offset from today)
//       const dayDate = new Date();
//       dayDate.setDate(dayDate.getDate() + (day.day - 1)); // Offset by day number (1-based)
      
//       console.log(`Processing day ${day.day}, creating DayMeal with date:`, dayDate);
      
//       // Create the DayMeal record
//       const dayMeal = await prisma.dayMeal.create({
//         data: {
//           date: dayDate,
//           mealPlanId: mealPlan.id // Direct field assignment
//         },
//       });
      
//       console.log("Created DayMeal record:", dayMeal);

//       // For each meal in this day, create a Meal record
//       for (const meal of day.meals) {
//         // Determine meal type based on index or other logic
//         const mealIndex = day.meals.indexOf(meal);
//         let mealType = "snack";
        
//         if (mealIndex === 0) mealType = "breakfast";
//         else if (mealIndex === 1) mealType = "lunch";
//         else if (mealIndex === 2) mealType = "dinner";
        
//         console.log(`Creating Meal record for ${meal.name} of type ${mealType}`);
        
//         // Create the Meal record
//         const createdMeal = await prisma.meal.create({
//           data: {
//             name: meal.name,
//             type: mealType,
//             description: meal.instructions, // Map instructions to description
//             calories: calculateCalories(meal.ingredients), // Helper function to estimate calories
//             dayMealId: dayMeal.id // Direct field assignment
//           },
//         });
        
//         console.log("Created Meal record:", createdMeal);
//       }
//     }

//     // Return the created meal plan with all related data
//     const savedMealPlan = await prisma.mealPlan.findUnique({
//       where: { id: mealPlan.id },
//       include: {
//         days: {
//           include: {
//             meals: true
//           }
//         }
//       }
//     });
    
//     console.log("Returning saved meal plan:", savedMealPlan);
//     return savedMealPlan;
//   } catch (error) {
//     console.error('Error in SaveMealPlan:', error);
//     throw error;
//   }
// }

// // Helper function to estimate calories based on ingredients
// function calculateCalories(ingredients: string[]): number {
//   // Simple estimation: 100 calories per ingredient
//   return ingredients.length * 100;
// }
