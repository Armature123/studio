
import { z } from 'zod';

const DocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A document to compare, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  fileName: z.string().describe('The name of the uploaded file.'),
});

export const CompareDocumentsInputSchema = z.object({
  documentA: DocumentInputSchema,
  documentB: DocumentInputSchema,
  instructions: z
    .string()
    .optional()
    .describe(
      'Optional user instructions to guide the comparison, e.g., "Focus on the non-compete clause."'
    ),
});
export type CompareDocumentsInput = z.infer<typeof CompareDocumentsInputSchema>;


export const MatchedClauseSchema = z.object({
    docAClause: z.string().describe("The full text of the clause from Document A."),
    docBClause: z.string().describe("The full text of the similar clause from Document B."),
    differenceSummary: z.string().describe("A concise explanation of the key difference between the two clauses."),
    moreFavorable: z.enum(['DocA', 'DocB', 'Balanced']).describe("Which document's clause is more favorable to a Startup, or if they are balanced."),
});
export type MatchedClause = z.infer<typeof MatchedClauseSchema>;

export const UniqueClauseSchema = z.object({
    clause: z.string().describe("The full text of the unique clause.")
});
export type UniqueClause = z.infer<typeof UniqueClauseSchema>;

export const ClauseCategorySchema = z.object({
    matched: z.array(MatchedClauseSchema).describe("An array of clauses that are similar between both documents."),
    uniqueToDocA: z.array(UniqueClauseSchema).describe("An array of clauses that only exist in Document A."),
    uniqueToDocB: z.array(UniqueClauseSchema).describe("An array of clauses that only exist in Document B."),
});

const ComparisonSchema = z.object({
    Obligations: ClauseCategorySchema,
    Rights: ClauseCategorySchema,
    Risks_Liabilities: ClauseCategorySchema,
    Term_Termination: ClauseCategorySchema,
    Levers: ClauseCategorySchema,
});
export type ClauseCategory = z.infer<typeof ComparisonSchema>;

export const CompareDocumentsOutputSchema = z.object({
    summary: z.string().describe("A one-sentence executive summary of the most critical difference from a startup's perspective."),
    comparison: ComparisonSchema,
});
export type CompareDocumentsOutput = z.infer<typeof CompareDocumentsOutputSchema>;


export type ComparisonResult = CompareDocumentsOutput & { docNames: [string, string] };
