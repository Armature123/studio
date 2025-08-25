'use server';

/**
 * @fileOverview An AI agent that highlights potential risks and red flags in a legal document.
 *
 * - highlightRisks - A function that processes a legal document and returns highlighted risks.
 * - HighlightRisksInput - The input type for the highlightRisks function.
 * - HighlightRisksOutput - The return type for the highlightRisks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HighlightRisksInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the legal document to analyze.'),
  companyType: z
    .string()
    .default('Startup')
    .describe('The type of company for which the risk assessment is being performed.'),
});
export type HighlightRisksInput = z.infer<typeof HighlightRisksInputSchema>;

const HighlightRisksOutputSchema = z.object({
  risks: z.array(
    z.object({
      risk: z.string().describe('The description of the risk.'),
      explanation: z.string().describe('An explanation of the risk significance and potential impact for a Startup/SMB.'),
      severity: z.enum(['high', 'medium', 'low']).describe('The severity level of the risk.'),
      location: z.string().optional().describe('The location of the risk in the document, e.g. page number or clause.'),
    })
  ).describe('A list of potential risks and red flags in the legal document.'),
});
export type HighlightRisksOutput = z.infer<typeof HighlightRisksOutputSchema>;

export async function highlightRisks(input: HighlightRisksInput): Promise<HighlightRisksOutput> {
  return highlightRisksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'highlightRisksPrompt',
  input: {schema: HighlightRisksInputSchema},
  output: {schema: HighlightRisksOutputSchema},
  prompt: `You are an expert legal analyst specializing in identifying risks and red flags in legal documents for {{{companyType}}} companies.

  Analyze the following legal document and extract potential risks and red flags, providing clear explanations of their significance and potential impact for a {{{companyType}}}. Categorize the severity as high, medium, or low.

  Document:
  {{documentText}}

  Format your answer as a JSON object that conforms to the HighlightRisksOutputSchema schema. Include specific locations where possible.
  `,
});

const highlightRisksFlow = ai.defineFlow(
  {
    name: 'highlightRisksFlow',
    inputSchema: HighlightRisksInputSchema,
    outputSchema: HighlightRisksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
