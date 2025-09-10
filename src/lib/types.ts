
import type { ExtractLegalMetadataOutput } from "@/ai/flows/extract-legal-metadata";
import type { HighlightRisksOutput } from "@/ai/flows/highlight-risks";
import type { ExtractActionItemsOutput } from "@/ai/flows/extract-action-items";

export type {
  ExtractLegalMetadataOutput,
  HighlightRisksOutput,
  ExtractActionItemsOutput,
};

export type AnalysisResult = {
  metadata: ExtractLegalMetadataOutput;
  risks: HighlightRisksOutput;
  actionItems: ExtractActionItemsOutput;
};
