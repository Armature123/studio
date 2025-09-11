
'use server';

/**
 * @fileOverview An AI agent that compares any two legal documents and extracts key clauses.
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
  name: 'compareLegalDocsPrompt',
  input: {schema: CompareDocumentsInputSchema},
  output: {schema: CompareDocumentsOutputSchema},
  prompt: `You are an AI legal assistant that compares **any two legal documents**.
Ignore the document titles; focus on **semantic clauses**.

For each doc extract exactly these **five universal buckets**:
1. Obligations – duties each party must do
2. Rights – what each party is entitled to
3. Risks_Liabilities – who pays, indemnifies, or is liable
4. Term_Termination – length, exit, notice, renewal
5. Levers – clauses commonly red-lined (caps, governing law, venue, IP, non-compete, etc.)

Return **strict JSON only**, no markdown, no English prose outside JSON.
If a category has no clauses, return an empty array for it.

DOCUMENT A:
{{media url=documentA.documentDataUri}}

DOCUMENT B:
{{media url=documentB.documentDataUri}}

{{#if instructions}}
SPECIAL INSTRUCTIONS: {{{instructions}}}
{{/if}}
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
