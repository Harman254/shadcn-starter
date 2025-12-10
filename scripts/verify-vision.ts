
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// Mock the image fetching logic from ai-tools.ts
async function testVision() {
    console.log("Starting Vision Test...");

    // 1. Simulate Image Fetching (we'll just use a local buffer to simulate a successful fetch)
    // Create a 1x1 pixel PNG buffer to simulate a valid image
    const base64Png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const buffer = Buffer.from(base64Png, 'base64');

    console.log("Image Buffer created:", buffer.length, "bytes");

    const imagePart = {
        type: 'image',
        image: buffer,
        mimeType: 'image/png'
    };

    try {
        console.log("Calling generateObject...");
        const result = await generateObject({
            model: google('gemini-2.0-flash'),
            schema: z.object({
                items: z.array(z.object({
                    name: z.string(),
                    category: z.enum(['produce', 'dairy', 'protein', 'grains', 'spices', 'other']),
                    quantity: z.string(),
                    expiryEstimate: z.string().optional(),
                })),
                summary: z.string(),
            }),
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Analyze this image.' },
                        imagePart as any // Use 'any' to bypass TS check here to see strict runtime validation
                    ]
                }
            ],
        });

        console.log("Success!", result.object);
    } catch (error: any) {
        console.error("Test Failed with Error:");
        console.error(error);
        if (error.cause) {
            console.error("Cause:", JSON.stringify(error.cause, null, 2));
        }
    }
}

testVision().catch(console.error);
