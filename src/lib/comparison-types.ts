
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
      'Optional user instructions to guide the comparison, e.g., "Focus on liability clauses." or "Ignore formatting changes."'
    ),
});
export type CompareDocumentsInput = z.infer<typeof CompareDocumentsInputSchema>;

const DiffItemSchema = z.object({
  type: z.enum(['added', 'removed', 'modified']),
  content: z.string().describe('The textual content of the change.'),
  originalContent: z.string().optional().describe('The original content, for modified items.'),
});

export const CompareDocumentsOutputSchema = z.object({
    similarityScore: z.number().min(0).max(100).describe('An overall similarity score from 0 (completely different) to 100 (identical).'),
    comparisonSummary: z.string().describe('A high-level, executive summary of the key differences between the two documents.'),
    detailedDiff: z.array(DiffItemSchema).describe('A structured list of differences between the two documents.'),
});
export type CompareDocumentsOutput = z.infer<typeof CompareDocumentsOutputSchema>;
