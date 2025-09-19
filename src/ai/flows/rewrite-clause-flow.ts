
'use server';

/**
 * @fileOverview An AI agent that rewrites a legal clause to be more favorable and scores the change.
 *
 * - rewriteClause - A function that takes a clause and returns a more favorable version with favorability scores.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RewriteClauseInputSchema = z.object({
  clause: z.string().describe('The legal clause to rewrite.'),
  companyType: z.string().default('Startup').describe('The perspective to optimize for (e.g., Startup, Landlord).'),
  context: z.string().optional().describe('The surrounding text or context of the clause for better analysis.'),
});
export type RewriteClauseInput = z.infer<typeof RewriteClauseInputSchema>;

const ClauseAnalysisSchema = z.object({
    text: z.string().describe("The text of the clause."),
    favorabilityScore: z.number().min(0).max(100).describe("A score from 0 (very unfavorable) to 100 (very favorable) from the user's perspective."),
});

const RewriteClauseOutputSchema = z.object({
    original: ClauseAnalysisSchema.describe("The analysis of the original clause."),
    rewritten: ClauseAnalysisSchema.extend({
        explanation: z.string().describe("An explanation of what was changed and why it's more favorable."),
    }).describe("The analysis of the rewritten, more favorable clause.")
});
export type RewriteClauseOutput = z.infer<typeof RewriteClauseOutputSchema>;


export async function rewriteClause(input: RewriteClauseInput): Promise<RewriteClauseOutput> {
  return rewriteClauseFlow(input);
}


const prompt = ai.definePrompt({
  name: 'rewriteClausePrompt',
  input: {schema: RewriteClauseInputSchema},
  output: {schema: RewriteClauseOutputSchema},
  prompt: `You are an expert legal AI that rewrites and improves legal clauses. Your client is a {{{companyType}}}.

  **TASK:**
  1.  **Analyze and Score the Original Clause:** Read the original clause and assign it a 'favorabilityScore' from 0 to 100 from the perspective of a {{{companyType}}}. A score of 0 is extremely unfavorable (e.g., unlimited liability for my client), and 100 is extremely favorable (e.g., zero liability).
  2.  **Rewrite the Clause:** Rewrite the clause to be significantly more favorable to the {{{companyType}}}. Make the language clear, fair, and commercially reasonable, but with a clear bias towards your client.
  3.  **Score the Rewritten Clause:** Assign a new, higher 'favorabilityScore' to your rewritten clause.
  4.  **Explain the Changes:** Briefly explain the key changes you made and why they benefit your client.

  **CONTEXT (if provided):**
  {{#if context}}
  The clause appears in the following context: "{{{context}}}"
  {{/if}}

  **ORIGINAL CLAUSE:**
  "{{{clause}}}"

  Provide your response as a single, valid JSON object that strictly conforms to the 'RewriteClauseOutputSchema'. Do not include any other text or markdown.
  `,
});

const rewriteClauseFlow = ai.defineFlow(
  {
    name: 'rewriteClauseFlow',
    inputSchema: RewriteClauseInputSchema,
    outputSchema: RewriteClauseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
