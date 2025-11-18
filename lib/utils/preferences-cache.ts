/**
 * Utilities for caching and managing preferences summary
 */

import { createHash } from 'crypto';
import prisma from '@/lib/prisma';
import type { UserPreference } from '@/types';
import { summarizePreferencesForChat } from './preferences';

/**
 * Creates a hash of preferences to detect changes
 */
export function hashPreferences(preferences: UserPreference[]): string {
  if (!preferences || preferences.length === 0) {
    return '';
  }

  // Sort preferences by id to ensure consistent hashing
  const sorted = [...preferences].sort((a, b) => a.id - b.id);
  
  // Create a string representation of preferences
  const prefString = JSON.stringify(
    sorted.map((p) => ({
      dietaryPreference: p.dietaryPreference,
      goal: p.goal,
      householdSize: p.householdSize,
      cuisinePreferences: p.cuisinePreferences.sort(),
    }))
  );

  // Generate hash
  return createHash('sha256').update(prefString).digest('hex');
}

/**
 * Gets cached preferences summary or generates a new one if preferences changed
 */
export async function getOrGeneratePreferencesSummary(
  userId: string,
  preferences: UserPreference[]
): Promise<string> {
  if (!preferences || preferences.length === 0) {
    return '';
  }

  try {
    // Get the preference record (userId is unique in schema, but using findFirst for compatibility)
    // Since userId is unique, findFirst will return the same result as findUnique
    const existingData = await prisma.onboardingData.findFirst({
      where: { userId },
      select: {
        preferencesSummary: true,
        preferencesHash: true,
      },
    });

    // Calculate current hash
    const currentHash = hashPreferences(preferences);

    // If hash matches and summary exists, return cached summary
    if (existingData?.preferencesHash === currentHash && existingData?.preferencesSummary) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[getOrGeneratePreferencesSummary] Using cached summary');
      }
      return existingData.preferencesSummary;
    }

    // Hash changed or no summary exists - generate new one
    if (process.env.NODE_ENV === 'development') {
      console.log('[getOrGeneratePreferencesSummary] Generating new summary (hash changed or missing)');
    }

    const summary = await summarizePreferencesForChat(preferences);

    // Update the database with new summary and hash
    if (summary) {
      await prisma.onboardingData.updateMany({
        where: { userId },
        data: {
          preferencesSummary: summary,
          preferencesHash: currentHash,
        },
      });
    }

    return summary;
  } catch (error) {
    console.error('[getOrGeneratePreferencesSummary] Error:', error);
    // Fallback: generate summary without caching
    return await summarizePreferencesForChat(preferences);
  }
}

