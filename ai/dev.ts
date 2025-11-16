import { config } from 'dotenv';
config();

import '@/ai/flows/initial-prompt.ts';
import '@/ai/flows/dynamic-select-tool.ts';
import '@/ai/flows/context-aware.ts';