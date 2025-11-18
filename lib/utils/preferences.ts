/**
 * Utility functions for formatting and handling user preferences
 */

import { UserPreference } from '@/types';
import { summarizePreferences as summarizePreferencesAI } from '@/ai/flows/chat/summarize-preferences';

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

/**
 * Summarizes user preferences into a one-sentence summary using AI
 * This reduces token usage when passing preferences to chat context
 */
export async function summarizePreferencesForChat(
  preferences: UserPreference[]
): Promise<string> {
  if (!preferences || preferences.length === 0) {
    return '';
  }

  try {
    const formatted = formatPreferencesForAI(preferences);
    if (!formatted || formatted.length === 0) {
      return '';
    }

    return await summarizePreferencesAI(formatted);
  } catch (error) {
    console.error('[summarizePreferencesForChat] Error:', error);
    // Fallback: create a simple summary manually
    const firstPref = preferences[0];
    if (firstPref) {
      return `${firstPref.dietaryPreference} diet for ${firstPref.goal}, ${firstPref.householdSize}-person household`;
    }
    return '';
  }
}

