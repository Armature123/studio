
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
    Benefits: z.array(z.string()).describe("Salary, leave, perks, equity"),
    Liabilities: z.array(z.string()).describe("Notice period, non-compete, bond"),
    Levers: z.array(z.string()).describe("Clauses that can usually be negotiated"),
});
export type ClauseCategory = z.infer<typeof ClauseCategorySchema>;

export const CompareDocumentsOutputSchema = z.object({
    docA: ClauseCategorySchema,
    docB: ClauseCategorySchema,
});
export type CompareDocumentsOutput = z.infer<typeof CompareDocumentsOutputSchema>;


export type ComparisonResult = CompareDocumentsOutput & { docNames: [string, string] };
