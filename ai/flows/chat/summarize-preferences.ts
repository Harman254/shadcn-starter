'use server';

import { ai } from '@/ai/instance';
import { z } from 'genkit';
import type { FormattedUserPreference } from '@/lib/utils/preferences';

const SummarizePreferencesInputSchema = z.object({
  preferences: z.array(
    z.object({
      dietaryPreference: z.string(),
      goal: z.string(),
      householdSize: z.number(),
      cuisinePreferences: z.array(z.string()),
    })
  ).describe('User preferences to summarize'),
});

const SummarizePreferencesOutputSchema = z.object({
  summary: z.string().describe('A one-sentence summary of the user preferences'),
});

export type SummarizePreferencesInput = z.infer<typeof SummarizePreferencesInputSchema>;
export type SummarizePreferencesOutput = z.infer<typeof SummarizePreferencesOutputSchema>;

const prompt = ai.definePrompt({
  name: 'summarizePreferencesPrompt',
  input: {
    schema: SummarizePreferencesInputSchema,
  },
  output: {
    schema: SummarizePreferencesOutputSchema,
  },
  prompt: `Summarize user preferences in one sentence (max 80 chars).

Preferences:
{{#each preferences}}Diet: {{dietaryPreference}}, Goal: {{goal}}, Household: {{householdSize}}, Cuisines: {{#each cuisinePreferences}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/each}}

Summary:`,
});

const summarizePreferencesFlow = ai.defineFlow(
  {
    name: 'summarizePreferencesFlow',
    inputSchema: SummarizePreferencesInputSchema,
    outputSchema: SummarizePreferencesOutputSchema,
  },
  async (input) => {
    // If no preferences, return empty summary
    if (!input.preferences || input.preferences.length === 0) {
      return {
        summary: '',
      };
    }

    const { output } = await prompt(input);

    // ✅ Defensive fallback to avoid schema errors
    if (!output || typeof output.summary !== 'string') {
      console.warn(
        '[Mealwise] summarizePreferencesPrompt returned invalid output:',
        output
      );
      // Fallback: create a simple summary manually
      const firstPref = input.preferences[0];
      return {
        summary: `${firstPref.dietaryPreference} diet for ${firstPref.goal}, ${firstPref.householdSize}-person household`,
      };
    }

    // Ensure summary is not too long (limit to 150 chars for safety)
    const summary = output.summary.length > 150 
      ? output.summary.substring(0, 147) + '...' 
      : output.summary;

    return { summary };
  }
);

export async function summarizePreferences(
  preferences: FormattedUserPreference[]
): Promise<string> {
  if (!preferences || preferences.length === 0) {
    return '';
  }

  const result = await summarizePreferencesFlow({ preferences });
  return result?.summary || '';
}

