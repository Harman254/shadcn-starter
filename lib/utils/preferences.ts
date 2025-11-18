/**
 * Utility functions for formatting and handling user preferences
 */

import { UserPreference } from '@/types';

/**
 * Formatted preference type for AI context (excludes database fields)
 */
export type FormattedUserPreference = {
  dietaryPreference: string;
  goal: string;
  householdSize: number;
  cuisinePreferences: string[];
};

/**
 * Converts UserPreference array to the format needed for AI context
 * Excludes database-specific fields (id, userId)
 */
export function formatPreferencesForAI(
  preferences: UserPreference[]
): FormattedUserPreference[] | undefined {
  if (!preferences || preferences.length === 0) {
    return undefined;
  }

  return preferences.map((pref) => ({
    dietaryPreference: pref.dietaryPreference,
    goal: pref.goal,
    householdSize: pref.householdSize,
    cuisinePreferences: pref.cuisinePreferences,
  }));
}

/**
 * Validates that preferences have all required fields
 */
export function validatePreferences(
  preferences: FormattedUserPreference[]
): boolean {
  return preferences.every(
    (pref) =>
      typeof pref.dietaryPreference === 'string' &&
      typeof pref.goal === 'string' &&
      typeof pref.householdSize === 'number' &&
      Array.isArray(pref.cuisinePreferences)
  );
}

