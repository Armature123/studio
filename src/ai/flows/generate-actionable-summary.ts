'use server';

/**
 * @fileOverview Generates an actionable summary of key data points and action items from legal documents.
 *
 * - generateActionableSummary - A function that generates the actionable summary.
 * - GenerateActionableSummaryInput - The input type for the generateActionableSummary function.
 * - GenerateActionableSummaryOutput - The return type for the generateActionableSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateActionableSummaryInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The legal document to be analyzed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z
    .string()
    .optional()
    .default('English')
    .describe('The language for the summary.'),
});
export type GenerateActionableSummaryInput = z.infer<
  typeof GenerateActionableSummaryInputSchema
>;

const GenerateActionableSummaryOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A summary of key data points and action items extracted from the legal document, categorized by importance and relevance.'
    ),
});
export type GenerateActionableSummaryOutput = z.infer<
  typeof GenerateActionableSummaryOutputSchema
>;

export async function generateActionableSummary(
  input: GenerateActionableSummaryInput
): Promise<GenerateActionableSummaryOutput> {
  return generateActionableSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateActionableSummaryPrompt',
  input: {schema: GenerateActionableSummaryInputSchema},
  output: {schema: GenerateActionableSummaryOutputSchema},
  prompt: `You are an AI assistant specializing in legal document analysis. Your task is to generate an actionable summary of key data points and action items extracted from the legal document provided. Categorize the information by importance and relevance for a Startup/SMB.

Generate the summary in the following language: {{{language}}}.

Document: {{media url=documentDataUri}}

Actionable Summary:`, // Ensure the output is suitable for a Startup/SMB
});

const generateActionableSummaryFlow = ai.defineFlow(
  {
    name: 'generateActionableSummaryFlow',
    inputSchema: GenerateActionableSummaryInputSchema,
    outputSchema: GenerateActionableSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
