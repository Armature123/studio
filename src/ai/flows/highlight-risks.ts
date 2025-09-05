
'use server';

/**
 * @fileOverview An AI agent that highlights potential risks and red flags in a legal document.
 *
 * - highlightRisks - A function that processes a legal document and returns highlighted risks.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HighlightRisksInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The legal document to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  companyType: z
    .string()
    .default('Startup')
    .describe('The type of company for which the risk assessment is being performed.'),
});
export type HighlightRisksInput = z.infer<typeof HighlightRisksInputSchema>;

const HighlightRisksOutputSchema = z.object({
  risks: z.array(
    z.object({
      risk: z.string().describe('The description of the risk.'),
      explanation: z.string().describe('An explanation of the risk significance and potential impact for a Startup/SMB.'),
      severity: z.enum(['high', 'medium', 'low']).describe('The severity level of the risk.'),
      location: z.string().optional().describe('The location of the risk in the document, e.g. page number or clause.'),
      negotiationAdvice: z.string().describe('Actionable advice on what to negotiate regarding this risk and how to approach it.'),
    })
  ).describe('A list of potential risks and red flags in the legal document.'),
});
export type HighlightRisksOutput = z.infer<typeof HighlightRisksOutputSchema>;

export async function highlightRisks(input: HighlightRisksInput): Promise<HighlightRisksOutput> {
  return highlightRisksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'highlightRisksPrompt',
  input: {schema: HighlightRisksInputSchema},
  output: {schema: HighlightRisksOutputSchema},
  prompt: `You are an expert legal analyst specializing in identifying risks and red flags in legal documents for {{{companyType}}} companies. Your analysis must be extremely consistent.

  Analyze the following legal document. For each risk, provide:
  1. A description of the risk.
  2. An explanation of its significance for a {{{companyType}}}.
  3. A consistent severity rating based on the following criteria:
     - **high**: Poses a direct, immediate, and significant financial, legal, or operational threat. Examples: Unlimited liability, ambiguous IP ownership, unfavorable termination clauses.
     - **medium**: Poses a potential future threat or significant inconvenience. Could lead to disputes or unexpected costs. Examples: Vague scope of work, one-sided indemnification, late payment penalties.
     - **low**: A minor issue, best practice deviation, or something to be aware of that is unlikely to cause a major problem. Examples: Unilateral changes to terms with notice, standard confidentiality clauses.
  4. The location in the document (if possible).
  5. Actionable negotiation advice: What specific terms should be changed, and what is a reasonable alternative to propose?

  Document:
  {{media url=documentDataUri}}

  Format your answer as a JSON object that conforms to the HighlightRisksOutputSchema schema.
  `,
});

const highlightRisksFlow = ai.defineFlow(
  {
    name: 'highlightRisksFlow',
    inputSchema: HighlightRisksInputSchema,
    outputSchema: HighlightRisksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
