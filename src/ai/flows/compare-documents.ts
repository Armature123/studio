
'use server';

/**
 * @fileOverview An AI agent that intelligently compares two legal documents.
 * It matches similar clauses, summarizes differences, and identifies unique terms.
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
  name: 'smartCompareLegalDocsPrompt',
  input: {schema: CompareDocumentsInputSchema},
  output: {schema: CompareDocumentsOutputSchema},
  prompt: `You are an AI legal assistant specializing in document comparison for a Startup.
Your task is to analyze two documents (Doc A and Doc B) and provide a structured comparison.

**Analysis Steps:**

1.  **Identify Core Clause Categories:** For both documents, extract key clauses and group them into logical categories based on their content (e.g., "Liability", "Intellectual Property", "Termination", "Confidentiality"). Do not use a fixed list; derive the categories from the documents themselves.

2.  **Match Similar Clauses:** Within each category, compare the clauses from Doc A and Doc B.
    *   A pair of clauses is "similar" if they address the same legal concept, even if the wording differs.
    *   If a clause in one document has a counterpart in the other, list them as a matched pair.

3.  **Analyze Matched Pairs:** For each pair of similar clauses, you MUST:
    *   Determine which clause is **more favorable from the perspective of a Startup**. A clause is more favorable if it limits liability, provides more rights, or offers greater flexibility for the startup.
    *   Provide a **concise summary of the key difference** between the two clauses.

4.  **Identify Unique Clauses:**
    *   If a clause exists in one document but has no counterpart in the other, list it as a unique clause for that document.

5.  **Provide an Overall Summary:**
    *   Write a one-sentence executive summary highlighting the most critical difference between the two documents from a startup's point of view.

**Output Format:** Your response MUST be a single, valid JSON object conforming to the schema. Do not add any commentary outside of the JSON structure.

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
