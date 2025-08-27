'use server';

/**
 * @fileOverview This file defines a Genkit flow for extracting legal metadata from documents.
 *
 * It includes:
 * - `extractLegalMetadata`: A function to initiate the legal metadata extraction process.
 * - `ExtractLegalMetadataInput`: The input type definition for the function.
 * - `ExtractLegalMetadataOutput`: The output type definition for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractLegalMetadataInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The legal document to be analyzed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractLegalMetadataInput = z.infer<typeof ExtractLegalMetadataInputSchema>;

const ExtractLegalMetadataOutputSchema = z.object({
  metadata: z
    .object({
      keyMetadata: z.string().describe('Key metadata of the legal document.'),
      moneyTerms: z.string().describe('Money terms mentioned in the document.'),
      duties: z.string().describe('Duties and obligations outlined in the document.'),
      clauses: z.string().describe('Important clauses within the legal document.'),
      risks: z.string().describe('Potential risks and red flags identified.'),
      dates: z.string().describe('Important dates mentioned in the document.'),
      definitions: z.string().describe('Definitions of key legal terms used.'),
    })
    .describe('Extracted metadata from the legal document.'),
});
export type ExtractLegalMetadataOutput = z.infer<typeof ExtractLegalMetadataOutputSchema>;

export async function extractLegalMetadata(input: ExtractLegalMetadataInput): Promise<ExtractLegalMetadataOutput> {
  return extractLegalMetadataFlow(input);
}

const extractLegalMetadataPrompt = ai.definePrompt({
  name: 'extractLegalMetadataPrompt',
  input: {schema: ExtractLegalMetadataInputSchema},
  output: {schema: ExtractLegalMetadataOutputSchema},
  prompt: `You are an AI assistant specialized in legal document analysis. Your task is to extract key metadata, money terms, duties, clauses, risks, dates, and definitions from the provided legal document.

    Legal Document: {{media url=documentDataUri}}

    Please provide the extracted information in a structured format.
  `,
});

const extractLegalMetadataFlow = ai.defineFlow(
  {
    name: 'extractLegalMetadataFlow',
    inputSchema: ExtractLegalMetadataInputSchema,
    outputSchema: ExtractLegalMetadataOutputSchema,
  },
  async input => {
    const {output} = await extractLegalMetadataPrompt(input);
    return output!;
  }
);
