
"use server";

import { extractLegalMetadata, ExtractLegalMetadataOutput } from "@/ai/flows/extract-legal-metadata";
import { highlightRisks, HighlightRisksOutput } from "@/ai/flows/highlight-risks";
import { detectLanguage } from "@/ai/flows/detect-language";
import { extractActionItems, ExtractActionItemsOutput } from "@/ai/flows/extract-action-items";
import { compareDocuments, CompareDocumentsOutput } from "@/ai/flows/compare-documents";

async function fileToDataURI(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');
  return `data:${file.type};base64,${base64}`;
}

export async function analyzeDocument(formData: FormData) {
  const file = formData.get('document') as File;
  
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
  
  let metadataResult: ExtractLegalMetadataOutput, 
      risksResult: HighlightRisksOutput, 
      actionItemsResult: ExtractActionItemsOutput;

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
    metadata: metadataResult,
    risks: risksResult,
    actionItems: actionItemsResult,
  };
}

export async function compareDocumentsAction(formData: FormData): Promise<{ comparison?: CompareDocumentsOutput; error?: string }> {
  const fileA = formData.get('documentA') as File;
  const fileB = formData.get('documentB') as File;

  if (!fileA || !fileB) {
    return { error: 'Please provide both documents for comparison.' };
  }
  
  try {
    console.log(`Processing Document A: ${fileA.name} (${fileA.size} bytes)`);
    console.log(`Processing Document B: ${fileB.name} (${fileB.size} bytes)`);

    const [documentADataUri, documentBDataUri] = await Promise.all([
      fileToDataURI(fileA),
      fileToDataURI(fileB)
    ]);
    
    const comparisonResult = await compareDocuments({ documentADataUri, documentBDataUri });
    return { comparison: comparisonResult };

  } catch (error: any) {
    console.error("Error during document comparison:", error);
    return { 
      error: `Failed to compare documents: ${error.message}` 
    };
  }
}
