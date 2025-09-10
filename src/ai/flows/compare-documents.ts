
'use server';

/**
 * @fileOverview A Genkit flow for comparing two legal documents.
 *
 * It includes:
 * - `compareDocuments`: A function to initiate the comparison process.
 * - `CompareDocumentsInput`: The input type for the compareDocuments function.
 * - `CompareDocumentsOutput`: The return type for the compareDocuments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CompareDocumentsInputSchema = z.object({
  documentADataUri: z
    .string()
    .describe(
      "The first document to be analyzed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  documentBDataUri: z
    .string()
    .describe(
      "The second document to be analyzed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type CompareDocumentsInput = z.infer<typeof CompareDocumentsInputSchema>;

const CompareDocumentsOutputSchema = z.object({
  comparison: z
    .string()
    .describe(
      'A detailed comparison of the two documents in Markdown format.'
    ),
});
export type CompareDocumentsOutput = z.infer<
  typeof CompareDocumentsOutputSchema
>;

export async function compareDocuments(
  input: CompareDocumentsInput
): Promise<CompareDocumentsOutput> {
  return compareDocumentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'compareDocumentsPrompt',
  input: {schema: CompareDocumentsInputSchema},
  output: {schema: CompareDocumentsOutputSchema},
  prompt: `You are an AI assistant that compares legal documents for a non-lawyer. Your output must be in a structured format.

Compare the two documents provided below. Analyze them based on key legal and business terms.

Your entire response must follow this exact structure:
1.  A Markdown table comparing the documents side-by-side. The columns must be "Feature", "Document A", and "Document B". The features to compare are: Compensation, Contract Term & Termination, Responsibilities, Confidentiality, and Liability. If a feature is not mentioned, state "Not specified".
2.  A bulleted list under the heading "### Key Differences" that summarizes the most critical differences a user must know.
3.  A final paragraph under the heading "### Summary" that states which document might be more favorable and why, without giving legal advice.
4.  The mandatory disclaimer at the very end.

Here is the content:

---DOCUMENT A START---
{{media url=documentADataUri}}
---DOCUMENT A END---

---DOCUMENT B START---
{{media url=documentBDataUri}}
---DOCUMENT B END---

Your response should be a single markdown string. Start with the "### Comparison" header.

### Comparison

| Feature            | Document A | Document B |
| :----------------- | :--------- | :--------- |
| **Compensation**   |            |            |
| **Term & Termination**|            |            |
| **Responsibilities**|            |            |
| **Confidentiality**|            |            |
| **Liability**      |            |            |

### Key Differences
*

### Summary

Disclaimer: This is an AI-generated analysis and not legal advice. Consult a qualified professional.`,
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
