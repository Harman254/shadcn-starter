/**
 * Utility functions for formatting and handling user preferences
 */

import { UserPreference } from '@/types';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

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
 * Summarizes user preferences into a one-sentence summary using AI SDK
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

    const firstPref = formatted[0];

    // Use AI SDK generateText for summarization
    const result = await generateText({
      model: google('gemini-2.0-flash'),
      temperature: 0.3,
      maxTokens: 100,
      prompt: `Summarize these user preferences in ONE short sentence (max 20 words) for a meal planning AI context:
- Dietary: ${firstPref.dietaryPreference}
- Goal: ${firstPref.goal}
- Household: ${firstPref.householdSize} people
- Cuisines: ${firstPref.cuisinePreferences.join(', ')}

Return ONLY the summary sentence, nothing else.`,
    });

    return result.text.trim() || createFallbackSummary(preferences[0]);
  } catch (error) {
    console.error('[summarizePreferencesForChat] Error:', error);
    return createFallbackSummary(preferences[0]);
  }
}

/**
 * Creates a simple summary without AI when AI fails
 */
function createFallbackSummary(pref: UserPreference): string {
  if (!pref) return '';
  return `${pref.dietaryPreference} diet for ${pref.goal}, ${pref.householdSize}-person household`;
}

