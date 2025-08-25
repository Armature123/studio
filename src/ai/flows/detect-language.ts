'use server';
/**
 * @fileOverview This file defines a Genkit flow for detecting the language of a document.
 *
 * It includes:
 * - `detectLanguage`: A function to initiate the language detection process.
 * - `DetectLanguageInput`: The input type definition for the function.
 * - `DetectLanguageOutput`: The output type definition for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectLanguageInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the document to be analyzed.'),
});
export type DetectLanguageInput = z.infer<typeof DetectLanguageInputSchema>;

const DetectLanguageOutputSchema = z.object({
  language: z.string().describe('The detected language of the document text.'),
});
export type DetectLanguageOutput = z.infer<typeof DetectLanguageOutputSchema>;

export async function detectLanguage(input: DetectLanguageInput): Promise<DetectLanguageOutput> {
  return detectLanguageFlow(input);
}

const detectLanguagePrompt = ai.definePrompt({
  name: 'detectLanguagePrompt',
  input: {schema: DetectLanguageInputSchema},
  output: {schema: DetectLanguageOutputSchema},
  prompt: `You are an AI assistant that detects the language of a given text.
    Analyze the following text and return only the name of the language. For example: "English", "Hindi", "Tamil".

    Document Text: {{{documentText}}}
  `,
});

const detectLanguageFlow = ai.defineFlow(
  {
    name: 'detectLanguageFlow',
    inputSchema: DetectLanguageInputSchema,
    outputSchema: DetectLanguageOutputSchema,
  },
  async input => {
    const {output} = await detectLanguagePrompt(input);
    return output!;
  }
);
