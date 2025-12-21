/**
 * Meal Image Constants
 * 
 * Centralized collection of meal images organized by meal type.
 * All images are hosted on Cloudinary for optimal performance.
 * 
 * To add more images:
 * 1. Upload your image to Cloudinary
 * 2. Add the Cloudinary URL to the appropriate meal type array below
 * 3. The images will be randomly selected when generating meal plans
 */

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

/**
 * Meal images organized by meal type
 * Each meal type has multiple images that will be randomly selected
 */
export const MEAL_IMAGES: Record<MealType, string[]> = {
  breakfast: [
    'https://res.cloudinary.com/dcidanigq/image/upload/v1742112002/samples/breakfast.jpg',
    'https://res.cloudinary.com/dcidanigq/image/upload/v1742111996/samples/food/spices.jpg',
    // Add more breakfast images here
  ],
  lunch: [
    'https://res.cloudinary.com/dcidanigq/image/upload/v1742111994/samples/food/fish-vegetables.jpg',
    'https://res.cloudinary.com/dcidanigq/image/upload/v1742112004/cld-sample-4.jpg',
    // Add more lunch images here
  ],
  dinner: [
    'https://res.cloudinary.com/dcidanigq/image/upload/v1742111994/samples/food/fish-vegetables.jpg',
    'https://res.cloudinary.com/dcidanigq/image/upload/v1742112004/cld-sample-5.jpg',
    // Add more dinner images here
  ],
  snack: [
    'https://res.cloudinary.com/dcidanigq/image/upload/v1742111996/samples/food/spices.jpg',
    'https://res.cloudinary.com/dcidanigq/image/upload/v1742112002/samples/breakfast.jpg',
    // Add more snack images here
  ],
};

/**
 * Get a random image for a specific meal type
 * @param mealType - The type of meal (breakfast, lunch, dinner, snack)
 * @returns A random image URL for the meal type
 */
export function getRandomMealImage(mealType: MealType): string {
  const images = MEAL_IMAGES[mealType];
  if (!images || images.length === 0) {
    // Fallback to first available image if meal type has no images
    const allImages = Object.values(MEAL_IMAGES).flat();
    return allImages[0] || '';
  }
  return images[Math.floor(Math.random() * images.length)];
}

/**
 * Get a random image from all meal types
 * Useful for recipes or when meal type is unknown
 * @returns A random image URL from any meal type
 */
export function getRandomRecipeImage(): string {
  const allImages = Object.values(MEAL_IMAGES).flat();
  if (allImages.length === 0) {
    return '';
  }
  return allImages[Math.floor(Math.random() * allImages.length)];
}

/**
 * Get all meal images as a flat array
 * Useful for fallback scenarios
 * @returns Array of all image URLs
 */
export function getAllMealImages(): string[] {
  return Object.values(MEAL_IMAGES).flat();
}

