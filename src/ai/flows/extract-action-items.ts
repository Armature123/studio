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
    review: z.array(TaskSchema).describe('Tasks that require reviewing, approving, or signing documents or clauses.'),
    deadlines: z.array(TaskSchema).describe('Tasks associated with specific dates or deadlines.'),
    obligations: z.array(TaskSchema).describe('General duties, responsibilities, or obligations outlined in the document.'),
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
  prompt: `You are an expert legal analyst. Your task is to extract actionable tasks and reminders from the provided legal document and categorize them.

  Analyze the document text and identify specific, actionable tasks. Categorize each task into one of the following four categories:
  - **financial**: Tasks related to payments, fees, costs, or any monetary transactions. (e.g., "Pay the deposit of $10,000")
  - **review**: Tasks that require reviewing, approving, or signing parts of the document. (e.g., "Review Exhibit A for service scope")
  - **deadlines**: Tasks or events tied to a specific date or timeframe. (e.g., "Complete the project by October 31, 2024")
  - **obligations**: General duties, responsibilities, or compliance actions required by the document. (e.g., "Maintain confidentiality of all non-public information")

  Document:
  {{{documentText}}}

  Format your answer as a single JSON object that conforms to the ExtractActionItemsOutputSchema schema. If no tasks are found for a category, return an empty array for it.
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
