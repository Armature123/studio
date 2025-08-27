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
    description: z.string().describe('A clear, actionable description of the task or obligation.'),
    priority: z.enum(['high', 'medium', 'low']).describe('Priority level based on urgency and importance.'),
    dueDate: z.string().optional().describe('Due date if specified in the document (format: YYYY-MM-DD or descriptive text).'),
    party: z.string().optional().describe('Which party is responsible for this action.'),
});

const ExtractActionItemsOutputSchema = z.object({
  tasks: z.object({
    financial: z.array(TaskSchema).describe('Payment obligations, fee schedules, billing requirements, reimbursements, penalties, and any monetary transactions.'),
    deadlines: z.array(TaskSchema).describe('Specific dates, deadlines, milestones, delivery schedules, and time-sensitive requirements.'),
    obligations: z.array(TaskSchema).describe('Performance duties, service requirements, compliance obligations, reporting duties, and ongoing responsibilities.'),
    rightsProtections: z.array(TaskSchema).describe('Intellectual property rights, data protection requirements, confidentiality obligations, and protective measures.'),
    terminationRules: z.array(TaskSchema).describe('Termination procedures, notice requirements, post-termination obligations, and end-of-contract duties.'),
  }).describe('Categorized action items extracted from the document.'),
  summary: z.object({
    totalActions: z.number().describe('Total number of action items found.'),
    criticalActions: z.number().describe('Number of high-priority actions.'),
    hasDeadlines: z.boolean().describe('Whether the document contains specific deadlines.'),
  }).describe('Summary statistics of extracted actions.'),
});
export type ExtractActionItemsOutput = z.infer<typeof ExtractActionItemsOutputSchema>;


export async function extractActionItems(input: ExtractActionItemsInput): Promise<ExtractActionItemsOutput> {
  return extractActionItemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractActionItemsPrompt',
  input: {schema: ExtractActionItemsInputSchema},
  output: {schema: ExtractActionItemsOutputSchema},
  prompt: `You are an expert legal document analyzer specializing in extracting actionable items from contracts and legal documents.

INSTRUCTIONS:
1. Analyze ONLY the provided document content - do not add external information
2. Extract concrete, actionable tasks that parties must perform
3. Focus on specific obligations, not general statements
4. Include WHO must do WHAT and WHEN (if specified)
5. Categorize each action appropriately
6. Assign priority levels: HIGH (legal deadlines, payments), MEDIUM (important obligations), LOW (general duties)
7. Extract exact dates when mentioned, or describe timing requirements
8. If no actionable items exist in a category, return an empty array

CATEGORIES:

**Financial Actions** - Extract:
- Payment amounts and schedules
- Fee structures and billing requirements  
- Late payment penalties
- Expense reimbursements
- Security deposits or escrow requirements
- Budget approvals or financial reporting

**Deadlines & Dates** - Extract:
- Contract execution deadlines
- Delivery and milestone dates
- Renewal or expiration dates
- Notice periods and notification deadlines
- Compliance reporting schedules
- Review or audit timelines

**Duties & Obligations** - Extract:
- Service delivery requirements
- Performance standards and KPIs
- Reporting and documentation duties
- Compliance and regulatory obligations
- Quality assurance requirements
- Training or certification needs

**Rights & Protections** - Extract:
- Intellectual property ownership and usage rights
- Data protection and privacy obligations
- Confidentiality and non-disclosure duties
- Indemnification requirements
- Insurance and liability protections
- Access rights and permissions

**Termination Rules** - Extract:
- Termination notice requirements
- Breach cure periods
- Post-termination obligations
- Asset return requirements
- Final payment and settlement procedures
- Non-compete or non-solicitation periods

EXAMPLE OUTPUT FORMAT:
{
  "tasks": {
    "financial": [
      {
        "description": "Pay initial fee of $10,000 within 30 days of contract execution",
        "priority": "high",
        "dueDate": "30 days from execution",
        "party": "Client"
      }
    ],
    "deadlines": [
      {
        "description": "Complete project deliverables by December 31, 2024",
        "priority": "high", 
        "dueDate": "2024-12-31",
        "party": "Provider"
      }
    ]
  },
  "summary": {
    "totalActions": 15,
    "criticalActions": 5,
    "hasDeadlines": true
  }
}

Document to analyze:
{{{documentText}}}

Provide your analysis as a JSON object following the ExtractActionItemsOutputSchema format.`,
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
