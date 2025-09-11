
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


export const ClauseCategorySchema = z.object({
    Obligations: z.array(z.string()).describe("Duties each party must do."),
    Rights: z.array(z.string()).describe("What each party is entitled to."),
    Risks_Liabilities: z.array(z.string()).describe("Who pays, indemnifies, or is liable."),
    Term_Termination: z.array(z.string()).describe("Length, exit, notice, renewal."),
    Levers: z.array(z.string()).describe("Clauses commonly red-lined (caps, governing law, venue, IP, non-compete, etc.)."),
});
export type ClauseCategory = z.infer<typeof ClauseCategorySchema>;

export const CompareDocumentsOutputSchema = z.object({
    docA: ClauseCategorySchema,
    docB: ClauseCategorySchema,
});
export type CompareDocumentsOutput = z.infer<typeof CompareDocumentsOutputSchema>;


export type ComparisonResult = CompareDocumentsOutput & { docNames: [string, string] };
