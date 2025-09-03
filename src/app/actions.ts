"use server";

import { generateActionableSummary } from "@/ai/flows/generate-actionable-summary";
import { extractLegalMetadata } from "@/ai/flows/extract-legal-metadata";
import { highlightRisks } from "@/ai/flows/highlight-risks";
import { detectLanguage } from "@/ai/flows/detect-language";
import { extractActionItems } from "@/ai/flows/extract-action-items";

async function fileToDataURI(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');
  return `data:${file.type};base64,${base64}`;
}

export async function analyzeDocument(formData: FormData) {
  const file = formData.get('document') as File;
  const language = (formData.get('language') as string) || "English";
  
  if (!file) {
    return { error: 'No document provided.' };
  }
  
  let documentDataUri: string;
  try {
    console.log(`Processing uploaded file: ${file.name} (${file.size} bytes)`);
    documentDataUri = await fileToDataURI(file);
  } catch (error) {
    console.error("Error processing document:", error);
    return { 
      error: 'Failed to read the uploaded document.' 
    };
  }

  const companyType = "Startup";
  
  let summaryResult, metadataResult, risksResult, actionItemsResult;

  try {
    summaryResult = await generateActionableSummary({ documentDataUri, language });
  } catch (error: any) {
    console.error("Error generating summary:", error);
    return { error: `Failed during summary generation: ${error.message}` };
  }

  try {
    metadataResult = await extractLegalMetadata({ documentDataUri });
  } catch (error: any) {
    console.error("Error extracting metadata:", error);
    return { error: `Failed during metadata extraction: ${error.message}` };
  }

  try {
    risksResult = await highlightRisks({ documentDataUri, companyType });
  } catch (error: any) {
    console.error("Error highlighting risks:", error);
    return { error: `Failed during risk analysis: ${error.message}` };
  }

  try {
    actionItemsResult = await extractActionItems({ documentDataUri });
  } catch (error: any) {
    console.error("Error extracting action items:", error);
    return { error: `Failed during action item extraction: ${error.message}` };
  }
  
  return {
    summary: summaryResult,
    metadata: metadataResult,
    risks: risksResult,
    actionItems: actionItemsResult,
  };
}