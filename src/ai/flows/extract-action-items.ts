'use server';

/**
 * @fileOverview This file defines a Genkit flow for extracting categorized action items from a document.
 *
 * It includes:
 * - `extractActionItems`: A function to initiate the action item extraction process.
 * - `ExtractActionItemsInput`: The input type definition for the function.
 * - `ExtractActionItemsOutput`: The output type definition for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractActionItemsInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the document to be analyzed.'),
});
export type ExtractActionItemsInput = z.infer<typeof ExtractActionItemsInputSchema>;

const TaskSchema = z.object({
    description: z.string().describe('A concise description of the action item or task.'),
});

const ExtractActionItemsOutputSchema = z.object({
  tasks: z.object({
    financial: z.array(TaskSchema).describe('Tasks related to payments, fees, or any monetary transactions.'),
    deadlines: z.array(TaskSchema).describe('Tasks associated with specific dates or deadlines.'),
    obligations: z.array(TaskSchema).describe('General duties, responsibilities, or obligations outlined in the document.'),
    rightsProtections: z.array(TaskSchema).describe('Specific rights, protections, or entitlements granted to a party (e.g., intellectual property ownership, indemnification).'),
    terminationRules: z.array(TaskSchema).describe('Conditions and rules related to the termination of the agreement.'),
  }).describe('A structured list of categorized action items.'),
});
export type ExtractActionItemsOutput = z.infer<typeof ExtractActionItemsOutputSchema>;


export async function extractActionItems(input: ExtractActionItemsInput): Promise<ExtractActionItemsOutput> {
  return extractActionItemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractActionItemsPrompt',
  input: {schema: ExtractActionItemsInputSchema},
  output: {schema: ExtractActionItemsOutputSchema},
  prompt: `You are an expert legal analyst. You are given a single document. Only use the contents of this document — do not invent, assume, or pull from external knowledge.

  Extract the obligations, payments, dates, duties, rights, and termination conditions exactly as stated in the document, and summarize them into an "Action Center" format with these sections:
  - **Financial Actions**: Anything related to payments, fees, or monetary transactions.
  - **Deadlines & Dates**: Specific dates or timeframes for actions.
  - **Duties & Obligations**: Key responsibilities and duties a party must perform.
  - **Rights & Protections**: Specific rights or protections granted to a party (e.g., IP ownership, indemnification).
  - **Termination Rules**: Conditions under which the agreement can be ended.

  Each item must be phrased as a clear, actionable sentence. Do not just list every single related sentence; summarize the information concisely. For example, instead of listing three separate payment schedule items, summarize it into one or two clear actions. If no information exists in the document for a category, leave it blank by providing an empty array. Never include information that is not present in the document.

  Document:
  {{{documentText}}}

  Format your answer as a single JSON object that conforms to the ExtractActionItemsOutputSchema schema.
  `,
});


const extractActionItemsFlow = ai.defineFlow(
  {
    name: 'extractActionItemsFlow',
    inputSchema: ExtractActionItemsInputSchema,
    outputSchema: ExtractActionItemsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
