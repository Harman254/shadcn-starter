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

export const updateSubscriber = async (customerID: string, userID: string) => {
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
      
      // Update existing subscription or create new one
      const updatedSubscription = await tx.subscription.upsert({
        where: { userID },
        update: {
          CustomerID: customerID,
        },
        create: {
          CustomerID: customerID,
          userID,
        }
      });
      
      return updatedSubscription;
    });
    
    console.log("Subscriber updated:", subscriber);
    return subscriber;
    
  } catch (error) {
    console.error("Failed to update subscriber:", error);
    
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Failed to update subscription due to an unexpected error');
    }
  }
};

export const removeSubscriber = async (userID: string) => {
  // Input validation
  if (!userID) {
    throw new Error('User ID is required');
  }

  try {
    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Check if subscription exists
      const existingSubscription = await tx.subscription.findUnique({
        where: { userID }
      });
      
      if (!existingSubscription) {
        throw new Error(`No subscription found for user with ID ${userID}`);
      }
      
      // Delete the subscription record
      const deletedSubscription = await tx.subscription.delete({
        where: { userID }
      });
      
      return deletedSubscription;
    });
    
    console.log("Subscriber removed:", result);
    return result;
    
  } catch (error) {
    console.error("Failed to remove subscriber:", error);
    
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Failed to remove subscription due to an unexpected error');
    }
  }
};

export const getSubscriberByUserId = async (userID: string) => {
  if (!userID) {
    throw new Error('User ID is required');
  }

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userID },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });
    
    return subscription;
  } catch (error) {
    console.error("Failed to get subscriber:", error);
    throw new Error('Failed to retrieve subscription information');
  }
};

export const getSubscriberByCustomerId = async (customerID: string) => {
  if (!customerID) {
    throw new Error('Customer ID is required');
  }

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { CustomerID: customerID },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });
    
    return subscription;
  } catch (error) {
    console.error("Failed to get subscriber by customer ID:", error);
    throw new Error('Failed to retrieve subscription information');
  }
};

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

export async function getSubscriptionByUserId(userId: string) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: {
        userID: userId,
      },
    });
    return subscription;
  } catch (error) {
    console.error("Error getting subscription:", error);
    throw error;
  }
}

export async function createOrUpdateSubscription(userId: string, data: {
  plan: string;
  status?: string;
  customerId: string;
  features?: string[];
}) {
  try {
    const subscription = await prisma.subscription.upsert({
      where: {
        userID: userId,
      },
      update: {
        plan: data.plan,
        status: data.status || "active",
        CustomerID: data.customerId,
        features: data.features || [],
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        updatedAt: new Date(),
      },
      create: {
        userID: userId,
        CustomerID: data.customerId,
        plan: data.plan,
        status: data.status || "active",
        features: data.features || [],
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      },
    });
    return subscription;
  } catch (error) {
    console.error("Error creating/updating subscription:", error);
    throw error;
  }
}

export async function updateSubscriptionPlan(userId: string, plan: string) {
  try {
    const subscription = await prisma.subscription.update({
      where: {
        userID: userId,
      },
      data: {
        plan,
        updatedAt: new Date(),
      },
    });
    return subscription;
  } catch (error) {
    console.error("Error updating subscription plan:", error);
    throw error;
  }
}

export async function updateSubscriptionFeatures(userId: string, features: string[]) {
  try {
    const subscription = await prisma.subscription.update({
      where: {
        userID: userId,
      },
      data: {
        features,
        updatedAt: new Date(),
      },
    });
    return subscription;
  } catch (error) {
    console.error("Error updating subscription features:", error);
    throw error;
  }
}

export async function upgradeUserToPro(userId: string) {
  try {
    const subscription = await prisma.subscription.upsert({
      where: {
        userID: userId,
      },
      update: {
        plan: "pro",
        status: "active",
        features: ["unlimited-meal-plans", "unlimited-favorites", "nutrition-analytics"],
        updatedAt: new Date(),
      },
      create: {
        userID: userId,
        CustomerID: `pro_${userId}`,
        plan: "pro",
        status: "active",
        features: ["unlimited-meal-plans", "unlimited-favorites", "nutrition-analytics"],
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      },
    });
    return subscription;
  } catch (error) {
    console.error("Error upgrading user to pro:", error);
    throw error;
  }
}

export async function downgradeUserToFree(userId: string) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Update subscription to free plan
      const updatedSubscription = await tx.subscription.upsert({
        where: { userID: userId },
        update: {
          plan: "free",
          status: "active",
          features: [],
          updatedAt: new Date()
        },
        create: {
          userID: userId,
          CustomerID: `free_${userId}`,
          plan: "free",
          status: "active",
          features: []
        }
      });

      // Update account to remove pro status
      await tx.account.updateMany({
        where: { userId },
        data: { isPro: false }
      });

      return updatedSubscription;
    });

    return result;
  } catch (error) {
    console.error("Error downgrading user to free:", error);
    throw error;
  }
}

// Meal Plan Generation Functions
export async function getMealPlanGenerationCount(userId: string) {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // Get or create generation record for this week
    let generationRecord = await prisma.mealPlanGeneration.findFirst({
      where: {
        userId: userId,
        weekStart: {
          gte: startOfWeek,
          lt: endOfWeek
        }
      }
    });

    if (!generationRecord) {
      // Create new record for this week
      generationRecord = await prisma.mealPlanGeneration.create({
        data: {
          userId: userId,
          weekStart: startOfWeek,
          generationCount: 0
        }
      });
    }

    return {
      generationCount: generationRecord.generationCount,
      maxGenerations: 2, // Free users get 2 generations per week
      weekStart: generationRecord.weekStart,
      weekEnd: endOfWeek
    };
  } catch (error) {
    console.error("Error getting meal plan generation count:", error);
    throw error;
  }
}

export async function incrementMealPlanGeneration(userId: string) {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // Get or create generation record for this week
    let generationRecord = await prisma.mealPlanGeneration.findFirst({
      where: {
        userId: userId,
        weekStart: {
          gte: startOfWeek,
          lt: endOfWeek
        }
      }
    });

    if (!generationRecord) {
      // Create new record for this week
      generationRecord = await prisma.mealPlanGeneration.create({
        data: {
          userId: userId,
          weekStart: startOfWeek,
          generationCount: 1
        }
      });
    } else {
      // Check if we can increment (safeguard)
      if (generationRecord.generationCount >= 2) {
        throw new Error("Generation limit reached");
      }
      
      // Increment existing record
      generationRecord = await prisma.mealPlanGeneration.update({
        where: { id: generationRecord.id },
        data: {
          generationCount: {
            increment: 1
          }
        }
      });
    }

    return {
      success: true,
      generationCount: generationRecord.generationCount,
      maxGenerations: 2
    };
  } catch (error) {
    console.error("Error incrementing meal plan generation:", error);
    throw error;
  }
}

export async function checkMealPlanGenerationLimit(userId: string) {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // Get current generation record for this week
    const generationRecord = await prisma.mealPlanGeneration.findFirst({
      where: {
        userId: userId,
        weekStart: {
          gte: startOfWeek,
          lt: endOfWeek
        }
      }
    });

    const currentCount = generationRecord?.generationCount || 0;
    const maxGenerations = 2; // Free users get 2 generations per week

    return {
      canGenerate: currentCount < maxGenerations,
      currentCount,
      maxGenerations,
      remaining: Math.max(0, maxGenerations - currentCount),
      weekStart: startOfWeek,
      weekEnd: endOfWeek
    };
  } catch (error) {
    console.error("Error checking meal plan generation limit:", error);
    throw error;
  }
}

// Server action for atomic validation and increment
export async function validateAndIncrementMealPlanGeneration(userId: string) {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Get or create generation record for this week
      let generationRecord = await tx.mealPlanGeneration.findFirst({
        where: {
          userId: userId,
          weekStart: {
            gte: startOfWeek,
            lt: endOfWeek
          }
        }
      });

      if (!generationRecord) {
        // Create new record for this week
        generationRecord = await tx.mealPlanGeneration.create({
          data: {
            userId: userId,
            weekStart: startOfWeek,
            generationCount: 1
          }
        });
      } else {
        // Check if we can increment
        if (generationRecord.generationCount >= 2) {
          throw new Error("Generation limit reached");
        }
        
        // Ensure count doesn't go negative
        const newCount = generationRecord.generationCount + 1;
        if (newCount < 0) {
          throw new Error("Invalid generation count");
        }
        
        // Increment existing record
        generationRecord = await tx.mealPlanGeneration.update({
          where: { id: generationRecord.id },
          data: {
            generationCount: newCount
          }
        });
      }

      return {
        success: true,
        generationCount: generationRecord.generationCount,
        maxGenerations: 2,
        canGenerate: true
      };
    });

    return result;
  } catch (error) {
    if (error instanceof Error && error.message === "Generation limit reached") {
      // Re-fetch or pass the current state of generations when limit is reached
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      // Get current generation record for this week to provide accurate count
      const generationRecord = await prisma.mealPlanGeneration.findFirst({
        where: {
          userId: userId,
          weekStart: {
            gte: startOfWeek,
            lt: endOfWeek
          }
        }
      });

      const currentCount = Math.max(0, generationRecord?.generationCount || 0); // Ensure non-negative
      const maxGenerations = 2; // Free users get 2 generations per week

      return {
        success: false,
        canGenerate: false,
        error: "Generation limit reached",
        currentCount,
        maxGenerations,
      };
    }
    
    console.error("Error validating and incrementing meal plan generation:", error);
    throw error;
  }
}

// Meal Swap Count Functions
export async function getMealSwapCount(userId: string) {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    let swapRecord = await prisma.mealSwapCount.findFirst({
      where: {
        userId: userId,
        weekStart: {
          gte: startOfWeek,
          lt: endOfWeek
        }
      }
    });

    if (!swapRecord) {
      swapRecord = await prisma.mealSwapCount.create({
        data: {
          userId: userId,
          weekStart: startOfWeek,
          swapCount: 0
        }
      });
    }

    return {
      swapCount: swapRecord.swapCount,
      maxSwaps: 3, // Free users get 3 swaps per week
      weekStart: swapRecord.weekStart,
      weekEnd: endOfWeek
    };
  } catch (error) {
    console.error("Error getting meal swap count:", error);
    throw error;
  }
}

export async function validateAndIncrementMealSwap(userId: string) {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const result = await prisma.$transaction(async (tx) => {
      let swapRecord = await tx.mealSwapCount.findFirst({
        where: {
          userId: userId,
          weekStart: {
            gte: startOfWeek,
            lt: endOfWeek
          }
        }
      });

      if (!swapRecord) {
        swapRecord = await tx.mealSwapCount.create({
          data: {
            userId: userId,
            weekStart: startOfWeek,
            swapCount: 1
          }
        });
      } else {
        if (swapRecord.swapCount >= 3) {
          throw new Error("Swap limit reached");
        }
        
        swapRecord = await tx.mealSwapCount.update({
          where: { id: swapRecord.id },
          data: {
            swapCount: {
              increment: 1
            }
          }
        });
      }

      return {
        success: true,
        swapCount: swapRecord.swapCount,
        maxSwaps: 3,
        canSwap: true
      };
    });

    return result;
  } catch (error) {
    if (error instanceof Error && error.message === "Swap limit reached") {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); 
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      const swapRecord = await prisma.mealSwapCount.findFirst({
        where: {
          userId: userId,
          weekStart: {
            gte: startOfWeek,
            lt: endOfWeek
          }
        }
      });

      const currentCount = swapRecord?.swapCount || 0;
      const maxSwaps = 3;

      return {
        success: false,
        canSwap: false,
        error: "Swap limit reached",
        swapCount: currentCount,
        maxSwaps: maxSwaps,
      };
    }
    
    console.error("Error validating and incrementing meal swap:", error);
    throw error;
  }
}

// Function to fix any existing negative generation counts
export async function fixNegativeGenerationCounts() {
  try {
    const result = await prisma.mealPlanGeneration.updateMany({
      where: {
        generationCount: {
          lt: 0
        }
      },
      data: {
        generationCount: 0
      }
    });
    
    console.log(`Fixed ${result.count} negative generation counts`);
    return result.count;
  } catch (error) {
    console.error("Error fixing negative generation counts:", error);
    throw error;
  }
}

// Function to get current generation count with safety checks
export async function getSafeMealPlanGenerationCount(userId: string) {
  try {
    const data = await getMealPlanGenerationCount(userId);
    
    // Ensure the count is never negative
    const safeCount = Math.max(0, data.generationCount);
    
    // If the count was negative, fix it in the database
    if (data.generationCount < 0) {
      await fixNegativeGenerationCounts();
    }
    
    return {
      ...data,
      generationCount: safeCount
    };
  } catch (error) {
    console.error("Error getting safe meal plan generation count:", error);
    throw error;
  }
}

// Function to rollback generation count (decrement by 1)
export async function rollbackMealPlanGeneration(userId: string) {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Get current generation record for this week
      const generationRecord = await tx.mealPlanGeneration.findFirst({
        where: {
          userId: userId,
          weekStart: {
            gte: startOfWeek,
            lt: endOfWeek
          }
        }
      });

      if (!generationRecord) {
        // No record to rollback
        return {
          success: true,
          generationCount: 0,
          maxGenerations: 2,
          message: "No generation record found to rollback"
        };
      }

      // Decrement the count, ensuring it doesn't go below 0
      const newCount = Math.max(0, generationRecord.generationCount - 1);
      
      const updatedRecord = await tx.mealPlanGeneration.update({
        where: { id: generationRecord.id },
        data: {
          generationCount: newCount
        }
      });

      return {
        success: true,
        generationCount: updatedRecord.generationCount,
        maxGenerations: 2,
        message: "Generation count rolled back successfully"
      };
    });

    return result;
  } catch (error) {
    console.error("Error rolling back meal plan generation:", error);
    throw error;
  }
}

// Function to check database health
export async function checkDatabaseHealth() {
  try {
    // Test database connection with a simple query
    await prisma.$queryRaw`SELECT 1`;
    return {
      healthy: true,
      message: "Database connection is healthy"
    };
  } catch (error) {
    console.error("Database health check failed:", error);
    return {
      healthy: false,
      message: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
