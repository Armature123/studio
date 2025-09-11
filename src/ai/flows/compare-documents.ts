
'use server';

/**
 * @fileOverview An AI agent that compares two legal documents and highlights their differences.
 *
 * - compareDocuments - A function that processes two documents and returns a detailed comparison.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { CompareDocumentsInput, CompareDocumentsInputSchema, CompareDocumentsOutput, CompareDocumentsOutputSchema } from '@/lib/comparison-types';

export async function compareDocuments(input: CompareDocumentsInput): Promise<CompareDocumentsOutput> {
  return compareDocumentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'compareDocumentsPrompt',
  input: {schema: CompareDocumentsInputSchema},
  output: {schema: CompareDocumentsOutputSchema},
  prompt: `You are an expert legal AI specializing in comparing two documents and identifying key differences.

Analyze the two provided documents:
- Document A: {{{documentA.fileName}}}
- Document B: {{{documentB.fileName}}}

Your task is to perform a detailed comparison and generate a structured report.

Follow these steps:
1.  **Calculate Similarity Score:** Provide an overall similarity score from 0 to 100, where 100 means the documents are identical.
2.  **Write a Comparison Summary:** Create a concise, high-level summary explaining the most critical differences. This should be an executive summary for someone who needs to understand the changes quickly.
3.  **Generate a Detailed Diff:** Create a structured list of all significant changes. For each change, specify:
    *   \`type\`: Is the content 'added' (exists in B, not in A), 'removed' (exists in A, not in B), or 'modified' (exists in both but is different)?
    *   \`content\`: The text of the 'added' or 'removed' block. For 'modified' blocks, show the new version from Document B.
    *   \`originalContent\`: For 'modified' blocks only, show the original version from Document A.

{{#if instructions}}
**User Instructions:** Pay special attention to the following: "{{{instructions}}}"
{{/if}}

DOCUMENT A:
{{media url=documentA.documentDataUri}}

DOCUMENT B:
{{media url=documentB.documentDataUri}}

Provide your complete analysis as a single JSON object that conforms to the CompareDocumentsOutputSchema. Do not include any text outside of the JSON object.`,
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
