import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});
// import {genkit} from 'genkit';
// import {googleAI} from '@genkit-ai/google-genai';

// export const ai = genkit({
//   plugins: [googleAI()],
//   model: 'googleai/gemini-2.5-flash',
// });
