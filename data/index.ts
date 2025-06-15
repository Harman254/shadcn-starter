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
    orderBy: {
      createdAt: 'desc',
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

export const addSubscriber = async (customerID: string, userID: string) => {
  // Input validation
  if (!customerID) {
    throw new Error('Customer ID is required');
  }
  
  if (!userID) {
    throw new Error('User ID is required');
  }

  try {
    // Use a transaction to ensure data consistency
    const subscriber = await prisma.$transaction(async (tx) => {
      // Check if user exists
      const userExists = await tx.user.findUnique({
        where: { id: userID }
      });
      
      if (!userExists) {
        throw new Error(`User with ID ${userID} not found`);
      }
      
      // Check if subscription already exists for this user
      const existingSubscription = await tx.subscription.findUnique({
        where: { userID }
      });
      
      if (existingSubscription) {
        throw new Error(`User with ID ${userID} already has a subscription`);
      }
      
      // Create a new subscription record
      const newSubscription = await tx.subscription.create({
        data: {
          CustomerID: customerID, // Set the CustomerID from the parameter
          userID,                // Link to the user via userID
          // createdAt is handled automatically by @default(now())
          // id is handled automatically by @default(uuid())
        }
      });
      
      return newSubscription;
    });
    
    console.log("Subscriber created:", subscriber);
    return subscriber;
    
  } catch (error) {
    // Log the error for debugging
    console.error("Failed to create subscriber:", error);
    
    // Rethrow the error with a more user-friendly message
    if (error instanceof Error) {
      throw error; // Rethrow application errors with their original message
    } else {
      throw new Error('Failed to create subscription due to an unexpected error');
    }
  }
};














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

// Helper function to estimate calories based on ingredients
function calculateCalories(ingredients: string[]): number {
  // Simple estimation: 100 calories per ingredient
  return ingredients.length * 100;
}

// Meal like/unlike functions
export async function setMealLiked(mealId: string, isLiked: boolean, userId: string) {
  try {
    if (isLiked) {
      // Add to favorites table
      await prisma.favoriteRecipe.upsert({
        where: {
          userId_mealId: {
            userId,
            mealId,
          },
        },
        update: {},
        create: {
          userId,
          mealId,
        },
      });
    } else {
      // Remove from favorites table
      await prisma.favoriteRecipe.deleteMany({
        where: {
          userId,
          mealId,
        },
      });
    }

    // Also update the meal's isLiked status for backward compatibility
    const updatedMeal = await prisma.meal.update({
      where: { id: mealId },
      data: { isLiked },
      include: {
        dayMeal: {
          include: {
            mealPlan: true,
          },
        },
      },
    });
    
    console.log(`Meal ${mealId} like status updated to: ${isLiked} for user ${userId}`);
    return updatedMeal;
  } catch (error) {
    console.error('Error updating meal like status:', error);
    throw new Error('Failed to update meal like status');
  }
}

export async function getMealLikeStatus(mealId: string, userId: string) {
  try {
    // Check if meal is in user's favorites
    const favorite = await prisma.favoriteRecipe.findUnique({
      where: {
        userId_mealId: {
          userId,
          mealId,
        },
      },
    });
    
    return !!favorite;
  } catch (error) {
    console.error('Error getting meal like status:', error);
    return false;
  }
}

// New functions for favorite recipes
export async function addToFavorites(mealId: string, userId: string) {
  try {
    const favorite = await prisma.favoriteRecipe.create({
      data: {
        userId,
        mealId,
      },
      include: {
        meal: true,
      },
    });
    
    console.log(`Meal ${mealId} added to favorites for user ${userId}`);
    return favorite;
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Duplicate entry - meal is already favorited
      console.log(`Meal ${mealId} is already in favorites for user ${userId}`);
      return null;
    }
    console.error('Error adding meal to favorites:', error);
    throw new Error('Failed to add meal to favorites');
  }
}

export async function removeFromFavorites(mealId: string, userId: string) {
  try {
    const deleted = await prisma.favoriteRecipe.deleteMany({
      where: {
        userId,
        mealId,
      },
    });
    
    console.log(`Meal ${mealId} removed from favorites for user ${userId}`);
    return deleted.count > 0;
  } catch (error) {
    console.error('Error removing meal from favorites:', error);
    return false;
  }
}

export async function getUserFavorites(userId: string) {
  try {
    const favorites = await prisma.favoriteRecipe.findMany({
      where: {
        userId,
      },
      include: {
        meal: {
          include: {
            dayMeal: {
              include: {
                mealPlan: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return favorites.map((favorite: any) => favorite.meal);
  } catch (error) {
    console.error('Error getting user favorites:', error);
    return [];
  }
}

export async function isMealFavorited(mealId: string, userId: string) {
  try {
    const favorite = await prisma.favoriteRecipe.findUnique({
      where: {
        userId_mealId: {
          userId,
          mealId,
        },
      },
    });
    
    return !!favorite;
  } catch (error) {
    console.error('Error checking if meal is favorited:', error);
    return false;
  }
}
