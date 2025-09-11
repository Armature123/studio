
'use server';

/**
 * @fileOverview An AI agent that compares two job offer documents and extracts key clauses.
 *
 * - compareDocuments - A function that processes two documents and returns a structured comparison.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { CompareDocumentsInputSchema, CompareDocumentsOutputSchema } from '@/lib/comparison-types';
import type { CompareDocumentsInput, CompareDocumentsOutput } from '@/lib/comparison-types';


export async function compareDocuments(input: CompareDocumentsInput): Promise<CompareDocumentsOutput> {
  return compareDocumentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'compareJobOffersPrompt',
  input: {schema: CompareDocumentsInputSchema},
  output: {schema: CompareDocumentsOutputSchema},
  prompt: `You are a contract analyst for job offers.
For each document extract ONLY these categories:
- Benefits (salary, leave, perks, equity)
- Liabilities (notice period, non-compete, bond)
- Negotiation Levers (clauses that usually change)

Return pure JSON, no markdown.

DOCUMENT A:
{{media url=documentA.documentDataUri}}

DOCUMENT B:
{{media url=documentB.documentDataUri}}
`,
});

const compareDocumentsFlow = ai.defineFlow(
  {
    name: 'compareDocumentsFlow',
    inputSchema: CompareDocumentsInputSchema,
    outputSchema: CompareDocumentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
