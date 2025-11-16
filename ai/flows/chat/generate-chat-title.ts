'use server';

import { ai } from '@/ai/instance';
import { z } from 'genkit';

const GenerateChatTitleInputSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ).describe('The conversation messages to summarize'),
});

const GenerateChatTitleOutputSchema = z.object({
  title: z.string().describe('A short, descriptive title for the conversation (max 60 characters)'),
});

export type GenerateChatTitleInput = z.infer<typeof GenerateChatTitleInputSchema>;
export type GenerateChatTitleOutput = z.infer<typeof GenerateChatTitleOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateChatTitlePrompt',
  input: {
    schema: GenerateChatTitleInputSchema,
  },
  output: {
    schema: GenerateChatTitleOutputSchema,
  },
  prompt: `You are a helpful assistant that creates concise, descriptive titles for conversations.

Based on the conversation below, generate a short title (maximum 60 characters) that summarizes the main topic or purpose of the conversation.

Conversation:
{{#each messages}}
{{role}}: {{content}}
{{/each}}

Generate a concise, descriptive title that captures the essence of this conversation. The title should be:
- Short and clear (max 60 characters)
- Descriptive of the main topic
- Professional and appropriate

Title:`,
});

const generateChatTitleFlow = ai.defineFlow(
  {
    name: 'generateChatTitleFlow',
    inputSchema: GenerateChatTitleInputSchema,
    outputSchema: GenerateChatTitleOutputSchema,
  },
  async (input) => {
    // Only generate title if there are at least 2 messages (user + assistant)
    if (input.messages.length < 2) {
      return {
        title: 'New Chat',
      };
    }

    const { output } = await prompt(input);

    // ✅ Defensive fallback to avoid schema errors
    if (!output || typeof output.title !== 'string') {
      console.warn(
        '[Mealwise] generateChatTitlePrompt returned invalid output:',
        output
      );
      return {
        title: 'New Chat',
      };
    }

    // Ensure title is not too long
    const title = output.title.length > 60 
      ? output.title.substring(0, 57) + '...' 
      : output.title;

    return { title };
  }
);

export async function generateChatTitle(
  input: GenerateChatTitleInput
): Promise<GenerateChatTitleOutput> {
  return generateChatTitleFlow(input);
}



