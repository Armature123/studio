
'use server';
/**
 * @fileOverview This file defines a Genkit flow for a general legal chatbot.
 *
 * It includes:
 * - `legalChat`: A function to handle a general legal question.
 * - `LegalChatInput`: The input type for the legalChat function.
 * - `LegalChatOutput`: The return type for the legalChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LegalChatInputSchema = z.object({
  question: z.string().describe('The legal question from the user.'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.string(),
      })
    )
    .optional()
    .describe('The chat history.'),
});
export type LegalChatInput = z.infer<typeof LegalChatInputSchema>;


const LegalChatOutputSchema = z.object({
  answer: z.string().describe('The answer to the legal question.'),
});
export type LegalChatOutput = z.infer<typeof LegalChatOutputSchema>;


export async function legalChat(
  input: LegalChatInput
): Promise<LegalChatOutput> {
  return legalChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'legalChatPrompt',
  input: {schema: LegalChatInputSchema},
  output: {schema: LegalChatOutputSchema},
  prompt: `You are an AI assistant and an expert on Indian law, specializing in answering legal questions for users in a clear and understandable way. Your knowledge is strictly limited to the legal framework of India.

IMPORTANT:
- Only provide answers based on Indian legal sections and regulations. Do not reference laws from any other country.
- Always include this disclaimer at the very beginning of your first response in any conversation: "DISCLAIMER: I am an AI assistant and this is not legal advice. For any legal matters, please consult with a qualified attorney."

Here is the conversation history:
{{#each history}}
User: {{#if (eq this.role 'user')}}{{{this.content}}}{{/if}}
AI: {{#if (eq this.role 'model')}}{{{this.content}}}{{/if}}
{{/each}}

Here is the user's latest question:
Question: {{{question}}}

Provide your answer.
`,
});

const legalChatFlow = ai.defineFlow(
  {
    name: 'legalChatFlow',
    inputSchema: LegalChatInputSchema,
    outputSchema: LegalChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
