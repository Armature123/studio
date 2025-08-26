import { config } from 'dotenv';
config();

import '@/ai/flows/generate-actionable-summary.ts';
import '@/ai/flows/extract-legal-metadata.ts';
import '@/ai/flows/highlight-risks.ts';
import '@/ai/flows/detect-language.ts';
import '@/ai/flows/extract-action-items.ts';
