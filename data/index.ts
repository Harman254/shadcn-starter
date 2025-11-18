'use server';

import  prisma  from "@/lib/prisma";
import { MealPlan, UserPreference } from "@/types";
import { startOfWeek } from "date-fns";


import { revalidatePath } from "next/cache";




export async function fetchOnboardingData(userid: string): Promise<UserPreference[]> {
  try {
    const data = await prisma.onboardingData.findMany({
      where: {
        userId: userid,
      }
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[fetchOnboardingData] Fetched data:', {
        userId: userid,
        count: data.length,
        hasData: data.length > 0,
      });
    }
    
    return data;
  } catch (error) {
    console.error('[fetchOnboardingData] Error:', error);
    if (process.env.NODE_ENV === 'development' && error instanceof Error) {
      console.error('[fetchOnboardingData] Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }
    // Return empty array on error instead of throwing
    return [];
  }
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

    let generationRecord = await prisma.mealPlanGeneration.findUnique({
      where: { userId }
    });

    if (!generationRecord) {
      generationRecord = await prisma.mealPlanGeneration.create({
        data: {
          userId,
          generationCount: 0,
          lastReset: startOfWeek
        }
      });
    } else {
      const lastReset = new Date(generationRecord.lastReset);
      if (lastReset < startOfWeek) {
        generationRecord = await prisma.mealPlanGeneration.update({
          where: { userId },
          data: {
            generationCount: 0,
            lastReset: startOfWeek
          }
        });
      }
    }

    return {
      generationCount: generationRecord.generationCount,
      maxGenerations: 3, // Free users get 3 generations per week
      weekStart: startOfWeek
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
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    let generationRecord = await prisma.mealPlanGeneration.findUnique({
      where: { userId }
    });

    if (!generationRecord) {
      generationRecord = await prisma.mealPlanGeneration.create({
        data: {
          userId,
          generationCount: 1,
          lastReset: startOfWeek
        }
      });
    } else {
      const lastReset = new Date(generationRecord.lastReset);
      if (lastReset < startOfWeek) {
        generationRecord = await prisma.mealPlanGeneration.update({
          where: { userId },
          data: {
            generationCount: 1,
            lastReset: startOfWeek
          }
        });
      } else {
        if (generationRecord.generationCount >= 3) {
          throw new Error("Generation limit reached");
        }
        generationRecord = await prisma.mealPlanGeneration.update({
          where: { userId },
          data: {
            generationCount: { increment: 1 }
          }
        });
      }
    }

    return {
      success: true,
      generationCount: generationRecord.generationCount,
      maxGenerations: 3
    };
  } catch (error) {
    console.error("Error incrementing meal plan generation:", error);
    throw error;
  }
}

// Function to send notification when user runs out of generations
export async function notifyGenerationLimitReached(userId: string) {
  try {
    const notificationResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: '🚀 Upgrade to Pro for Unlimited Meal Plans!',
        message: 'You have used all your weekly generations. Upgrade to Pro for unlimited meal plans and advanced features!',
        url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pricing`,
        category: 'upgrade-reminder',
        userId: userId
      }),
    });

    if (notificationResponse.ok) {
      console.log(`✅ Generation limit notification sent to user ${userId}`);
    } else {
      console.error(`❌ Failed to send generation limit notification to user ${userId}`);
    }
  } catch (notificationError) {
    console.error('Error sending generation limit notification:', notificationError);
  }
}

// Enhanced checkMealPlanGenerationLimit with notifications
export async function checkMealPlanGenerationLimit(userId: string) {
  try {
    const subscription = await getSubscriptionByUserId(userId);
    if (subscription && (subscription.plan === "pro" || subscription.plan === "enterprise")) {
      return {
        canGenerate: true,
        currentCount: 0,
        maxGenerations: Infinity,
        remaining: Infinity,
        weekStart: null
      };
    }
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    let generationRecord = await prisma.mealPlanGeneration.findUnique({
      where: { userId }
    });
    let currentCount = 0;
    if (!generationRecord) {
      generationRecord = await prisma.mealPlanGeneration.create({
        data: {
          userId,
          generationCount: 0,
          lastReset: startOfWeek
        }
      });
    } else {
      const lastReset = new Date(generationRecord.lastReset);
      if (lastReset < startOfWeek) {
        generationRecord = await prisma.mealPlanGeneration.update({
          where: { userId },
          data: {
            generationCount: 0,
            lastReset: startOfWeek
          }
        });
      }
      currentCount = generationRecord.generationCount;
    }
    const maxGenerations = 3;
    const canGenerate = currentCount < maxGenerations;
    if (!canGenerate) {
      await notifyGenerationLimitReached(userId);
    }
    return {
      canGenerate,
      currentCount,
      maxGenerations,
      remaining: Math.max(0, maxGenerations - currentCount),
      weekStart: startOfWeek
    };
  } catch (error) {
    console.error("Error checking meal plan generation limit:", error);
    throw error;
  }
}

// Server action for atomic validation and increment
export async function validateAndIncrementMealPlanGeneration(userId: string) {
  try {
    const subscription = await getSubscriptionByUserId(userId);
    if (subscription && (subscription.plan === "pro" || subscription.plan === "enterprise")) {
      return {
        success: true,
        generationCount: 0,
        maxGenerations: Infinity,
        canGenerate: true
      };
    }
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    let generationRecord = await prisma.mealPlanGeneration.findUnique({
      where: { userId }
    });
    if (!generationRecord) {
      generationRecord = await prisma.mealPlanGeneration.create({
        data: {
          userId,
          generationCount: 1,
          lastReset: startOfWeek
        }
      });
    } else {
      const lastReset = new Date(generationRecord.lastReset);
      if (lastReset < startOfWeek) {
        generationRecord = await prisma.mealPlanGeneration.update({
          where: { userId },
          data: {
            generationCount: 1,
            lastReset: startOfWeek
          }
        });
      } else {
        if (generationRecord.generationCount >= 3) {
          return {
            success: false,
            canGenerate: false,
            error: "Generation limit reached",
            currentCount: generationRecord.generationCount,
            maxGenerations: 3
          };
        }
        generationRecord = await prisma.mealPlanGeneration.update({
          where: { userId },
          data: {
            generationCount: { increment: 1 }
          }
        });
      }
    }
    return {
      success: true,
      generationCount: generationRecord.generationCount,
      maxGenerations: 3,
      canGenerate: true
    };
  } catch (error) {
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

// Function to check if generation count has reset and send notification
export async function checkAndNotifyGenerationReset(userId: string) {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // Get current generation record for this week
    const currentRecord = await prisma.mealPlanGeneration.findUnique({
      where: { userId }
    });

    // Get last week's record to check if there was a reset
    const lastWeekStart = new Date(startOfWeek);
    lastWeekStart.setDate(startOfWeek.getDate() - 7);
    
    const lastWeekEnd = new Date(startOfWeek);
    
    const lastWeekRecord = await prisma.mealPlanGeneration.findUnique({
      where: { userId }
    });

    // Check if this is a new week and user had used generations last week
    const isNewWeek = !currentRecord || currentRecord.generationCount === 0;
    const hadUsageLastWeek = lastWeekRecord && lastWeekRecord.generationCount > 0;

    if (isNewWeek && hadUsageLastWeek) {
      // Send notification about reset
      try {
        const notificationResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: '🎉 Your meal plan generations have reset!',
            message: 'You now have 3 new meal plan generations available this week. Start planning your perfect meals!',
            url: `${process.env.NEXT_PUBLIC_APP_URL}/meal-plans/new`,
            category: 'generation-reset',
            userId: userId
          }),
        });

        if (notificationResponse.ok) {
          console.log(`✅ Generation reset notification sent to user ${userId}`);
        } else {
          console.error(`❌ Failed to send generation reset notification to user ${userId}`);
        }
      } catch (notificationError) {
        console.error('Error sending generation reset notification:', notificationError);
      }
    }

    return {
      isNewWeek,
      hadUsageLastWeek,
      currentCount: currentRecord?.generationCount || 0,
      lastWeekCount: lastWeekRecord?.generationCount || 0
    };
  } catch (error) {
    console.error('Error checking generation reset:', error);
    return {
      isNewWeek: false,
      hadUsageLastWeek: false,
      currentCount: 0,
      lastWeekCount: 0
    };
  }
}

// Enhanced function to get generation count with reset notification
export async function getSafeMealPlanGenerationCount(userId: string) {
  try {
    const data = await getMealPlanGenerationCount(userId);
    
    // Ensure the count is never negative
    const safeCount = Math.max(0, data.generationCount);
    
    // If the count was negative, fix it in the database
    if (data.generationCount < 0) {
      await fixNegativeGenerationCounts();
    }

    // Check for generation reset and send notification if needed
    await checkAndNotifyGenerationReset(userId);
    
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
    let generationRecord = await prisma.mealPlanGeneration.findUnique({
      where: { userId }
    });
    if (!generationRecord) {
      return {
        success: true,
        generationCount: 0,
        maxGenerations: 3,
        message: "No generation record found to rollback"
      };
    }
    const lastReset = new Date(generationRecord.lastReset);
    if (lastReset < startOfWeek) {
      generationRecord = await prisma.mealPlanGeneration.update({
        where: { userId },
        data: {
          generationCount: 0,
          lastReset: startOfWeek
        }
      });
      return {
        success: true,
        generationCount: 0,
        maxGenerations: 3,
        message: "Generation count reset for new week"
      };
    }
    if (generationRecord.generationCount === 0) {
      return {
        success: false,
        error: 'No generations remaining',
        generationCount: 0,
        maxGenerations: 3
      };
    }
    const updatedRecord = await prisma.mealPlanGeneration.update({
      where: { userId },
      data: {
        generationCount: { decrement: 1 }
      }
    });
    return {
      success: true,
      generationCount: updatedRecord.generationCount,
      maxGenerations: 3,
      message: "Generation count rolled back successfully"
    };
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



export async function resetMealPlanGenerationCount(userId: string) {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    let record = await prisma.mealPlanGeneration.findUnique({ where: { userId } });
    if (!record) {
      record = await prisma.mealPlanGeneration.create({
        data: { userId, generationCount: 0, lastReset: startOfWeek },
      });
    } else {
      record = await prisma.mealPlanGeneration.update({
        where: { userId },
        data: { generationCount: 0, lastReset: startOfWeek },
      });
    }
    return { success: true, record };
  } catch (error) {
    console.error("Error resetting meal plan generation count in data layer:", error);
    throw error;
  }
}


