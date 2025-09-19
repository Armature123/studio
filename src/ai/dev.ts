
import { config } from 'dotenv';
config();

import '@/ai/flows/extract-legal-metadata.ts';
import '@/ai/flows/highlight-risks.ts';
import '@/ai/flows/detect-language.ts';
import '@/ai/flows/extract-action-items.ts';
import '@/ai/flows/compare-documents.ts';
import '@/ai/flows/legal-chat-flow.ts';
import '@/ai/flows/rewrite-clause-flow.ts';
import '@/ai/flows/generate-audio-summary.ts';



