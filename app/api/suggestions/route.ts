import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export const runtime = 'edge';

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { context } = await req.json();

        const result = await generateObject({
            model: google('gemini-2.0-flash'),
            schema: z.object({
                suggestions: z.array(z.object({
                    heading: z.string().describe('Short, catchy title (2-3 words)'),
                    message: z.string().describe('The actual prompt to send to the AI'),
                    iconName: z.enum(['ChefHat', 'UtensilsCrossed', 'BookOpen', 'Sparkles', 'Coffee', 'Pizza']).describe('Name of the icon to display'),
                })).length(3),
            }),
            prompt: `Generate 3 diverse and engaging conversation starters for a meal planning and cooking assistant.
      
      Context: ${context || 'General food and cooking assistance'}
      
      The suggestions should cover different aspects like:
      1. Meal planning or ideas
      2. Specific cuisine or dish exploration
      3. Cooking tips or quick solutions
      
      Make them sound exciting and helpful.`,
        });

        return NextResponse.json(result.object);
    } catch (error) {
        console.error('Error generating suggestions:', error);
        return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
    }
}
