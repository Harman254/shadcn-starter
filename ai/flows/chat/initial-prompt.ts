'use server';

/**
 * @fileOverview Genkit flow for initializing the chatbot with a specific prompt or topic.
 *
 * - initialPromptChatbot - A function that initializes the chatbot with a prompt.
 * - InitialPromptChatbotInput - The input type for the initialPromptChatbot function.
 * - InitialPromptChatbotOutput - The return type for the initialPromptChatbot function.
 */

import { ai } from '@/ai/instance';
import { z } from 'genkit';

const InitialPromptChatbotInputSchema = z.object({
  initialPrompt: z
    .string()
    .describe('The initial prompt or topic to configure the chatbot.'),
  userMessage: z.string().describe('The user message to the chatbot.'),
  chatHistory: z
    .array(z.object({ role: z.string(), content: z.string() }))
    .optional(),
});
export type InitialPromptChatbotInput = z.infer<
  typeof InitialPromptChatbotInputSchema
>;

const InitialPromptChatbotOutputSchema = z.object({
  response: z.string().describe('The chatbot response.'),
});
export type InitialPromptChatbotOutput = z.infer<
  typeof InitialPromptChatbotOutputSchema
>;

export async function initialPromptChatbot(
  input: InitialPromptChatbotInput
): Promise<InitialPromptChatbotOutput> {
  return initialPromptChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'initialPromptChatbotPrompt',
  input: { schema: InitialPromptChatbotInputSchema },
  output: { schema: InitialPromptChatbotOutputSchema },
  prompt: `You are a very helpful kitchen assistant called Mealwise. Your job is to help users track the meals they eat and offer cooking and fitness and diertary instructions,advice and insights.

Context: {{#each chatHistory}}
{{this.role}}: {{this.content}}
{{/each}}

User: {{{userMessage}}}
Chatbot: `,
});

const initialPromptChatbotFlow = ai.defineFlow(
  {
    name: 'initialPromptChatbotFlow',
    inputSchema: InitialPromptChatbotInputSchema,
    outputSchema: InitialPromptChatbotOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);

    // ✅ Defensive fallback to prevent schema errors
    if (!output || typeof output.response !== 'string') {
      console.warn(
        '[Mealwise] initialPromptChatbotPrompt returned invalid output:',
        output
      );
      return {
        response:
          'Sorry, I could not generate a response at the moment. Please try again.',
      };
    }

    return output;
  }
);
