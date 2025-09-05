
'use server';
/**
 * @fileOverview This file defines a Genkit flow for chatting about a document.
 *
 * It includes:
 * - `chatAboutDocument`: A function to initiate the chat process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatAboutDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The document to be analyzed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  question: z.string().describe('The question about the document.'),
});
export type ChatAboutDocumentInput = z.infer<typeof ChatAboutDocumentInputSchema>;


const ChatAboutDocumentOutputSchema = z.object({
  answer: z.string().describe('The answer to the question about the document.'),
});
export type ChatAboutDocumentOutput = z.infer<typeof ChatAboutDocumentOutputSchema>;

export async function chatAboutDocument(input: ChatAboutDocumentInput): Promise<ChatAboutDocumentOutput> {
  return chatAboutDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatAboutDocumentPrompt',
  input: {schema: ChatAboutDocumentInputSchema},
  output: {schema: ChatAboutDocumentOutputSchema},
  prompt: `You are an AI assistant that can answer questions about a legal document.

Analyze the following document and answer the question.

Document: {{media url=documentDataUri}}
Question: {{{question}}}
`,
});

const chatAboutDocumentFlow = ai.defineFlow(
  {
    name: 'chatAboutDocumentFlow',
    inputSchema: ChatAboutDocumentInputSchema,
    outputSchema: ChatAboutDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
