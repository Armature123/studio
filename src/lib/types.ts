
import type { GenerateActionableSummaryOutput } from "@/ai/flows/generate-actionable-summary";
import type { ExtractLegalMetadataOutput } from "@/ai/flows/extract-legal-metadata";
import type { HighlightRisksOutput } from "@/ai/flows/highlight-risks";
import type { ExtractActionItemsOutput } from "@/ai/flows/extract-action-items";

export type {
  GenerateActionableSummaryOutput,
  ExtractLegalMetadataOutput,
  HighlightRisksOutput,
  ExtractActionItemsOutput,
};

export type AnalysisResult = {
  summary: GenerateActionableSummaryOutput;
  metadata: ExtractLegalMetadataOutput;
  risks: HighlightRisksOutput;
  actionItems: ExtractActionItemsOutput;
};
