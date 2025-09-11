
import type { ExtractLegalMetadataOutput } from "@/ai/flows/extract-legal-metadata";
import type { HighlightRisksOutput } from "@/ai/flows/highlight-risks";
import type { ExtractActionItemsOutput } from "@/ai/flows/extract-action-items";
import type { CompareDocumentsOutput } from "@/lib/comparison-types";

export type {
  ExtractLegalMetadataOutput,
  HighlightRisksOutput,
  ExtractActionItemsOutput,
  CompareDocumentsOutput,
};

export type AnalysisResult = {
  metadata: ExtractLegalMetadataOutput;
  risks: HighlightRisksOutput;
  actionItems: ExtractActionItemsOutput;
};
