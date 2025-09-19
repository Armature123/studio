
'use server';

/**
 * @fileOverview This file defines a Genkit flow for extracting structured legal metadata from documents.
 *
 * It includes:
 * - `extractLegalMetadata`: A function to initiate the legal metadata extraction process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractLegalMetadataInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The legal document to be analyzed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z.string().optional().default('English').describe('The language for the output summary.'),
});
export type ExtractLegalMetadataInput = z.infer<typeof ExtractLegalMetadataInputSchema>;

const ExtractLegalMetadataOutputSchema = z.object({
  metadata: z
    .object({
      documentTitle: z.string().describe("The title of the document (e.g., 'Residential Lease Agreement')."),
      documentType: z.string().describe("The type of legal document (e.g., 'Lease', 'NDA', 'Employment Contract')."),
      parties: z.array(z.object({name: z.string(), role: z.string()})).describe("The parties involved (e.g., 'Landlord', 'Tenant')."),
      effectiveDate: z.string().describe("The date the agreement becomes effective."),
      term: z.string().describe("The duration or term of the agreement (e.g., '12 months', 'At-will')."),
      governingLaw: z.string().describe("The jurisdiction's law that governs the contract (e.g., 'State of California, USA')."),
      summary: z.string().describe(`A simple, one-paragraph summary of the document's purpose, written in {{{language}}}.`),
    })
    .describe('Extracted metadata from the legal document.'),
  definitions: z.array(z.object({
      term: z.string().describe("The defined term."),
      definition: z.string().describe("The definition of the term.")
  })).describe("A list of key legal terms and their simplified definitions from the document.")
});
export type ExtractLegalMetadataOutput = z.infer<typeof ExtractLegalMetadataOutputSchema>;

export async function extractLegalMetadata(input: ExtractLegalMetadataInput): Promise<ExtractLegalMetadataOutput> {
  return extractLegalMetadataFlow(input);
}

const extractLegalMetadataPrompt = ai.definePrompt({
  name: 'extractLegalMetadataPrompt',
  input: {schema: ExtractLegalMetadataInputSchema},
  output: {schema: ExtractLegalMetadataOutputSchema},
  prompt: `You are an AI legal assistant. Analyze the document below to extract key structural metadata.
Your output must be a valid JSON object conforming to the schema.
The summary and definitions should be written in simple terms for a non-lawyer.
The output summary must be in {{{language}}}.

Legal Document: {{media url=documentDataUri}}
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
