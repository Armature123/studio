import {z} from 'genkit';

export const LegalChatInputSchema = z.object({
  query: z.string().describe("The user's question."),
  context: z
    .string()
    .optional()
    .describe('The text content from the current page, if any.'),
  homeFacts: z
    .array(z.string())
    .optional()
    .describe('An array of pre-canned legal facts for the home screen.'),
});
export type LegalChatInput = z.infer<typeof LegalChatInputSchema>;

export const LegalChatOutputSchema = z.object({
  reply: z.string().describe("The bot's concise, helpful reply."),
});
export type LegalChatOutput = z.infer<typeof LegalChatOutputSchema>;
