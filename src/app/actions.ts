
"use server";

import { extractLegalMetadata, ExtractLegalMetadataOutput } from "@/ai/flows/extract-legal-metadata";
import { highlightRisks, HighlightRisksOutput } from "@/ai/flows/highlight-risks";
import { detectLanguage } from "@/ai/flows/detect-language";
import { extractActionItems, ExtractActionItemsOutput } from "@/ai/flows/extract-action-items";
import { compareDocuments } from "@/ai/flows/compare-documents";
import { CompareDocumentsOutput } from "@/lib/comparison-types";
import { askLegalQuestion, } from "@/ai/flows/legal-chat-flow";
import type { LegalChatInput, LegalChatOutput } from "@/lib/chat-types";


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

export async function compareDocumentsAction(formData: FormData) {
  const fileA = formData.get('documentA') as File;
  const fileB = formData.get('documentB') as File;
  const instructions = formData.get('instructions') as string || '';

  if (!fileA || !fileB) {
    return { error: 'Please provide both documents for comparison.' };
  }

  try {
    const [dataUriA, dataUriB] = await Promise.all([
      fileToDataURI(fileA),
      fileToDataURI(fileB),
    ]);
    
    const input = {
      documentA: { documentDataUri: dataUriA, fileName: fileA.name },
      documentB: { documentDataUri: dataUriB, fileName: fileB.name },
      instructions,
    };
    
    const result = await compareDocuments(input);
    
    const clauseCountA = Object.values(result.docA || {}).flat().length;
    const clauseCountB = Object.values(result.docB || {}).flat().length;
    if (clauseCountA < 2 && clauseCountB < 2) {
      return { error: "🚫 Could not find legal clauses—check file is text/PDF and not scanned image." };
    }

    return { ...result, docNames: [fileA.name, fileB.name] };

  } catch (error: any) {
    console.error("Error during document comparison action:", error);
    return { 
      error: `Comparison failed: ${error.message || 'An unknown error occurred.'}` 
    };
  }
}

export async function askLegalQuestionAction(input: LegalChatInput): Promise<LegalChatOutput> {
  try {
    const result = await askLegalQuestion(input);
    return result;
  } catch (error: any) {
    console.error("Error in legal chat action:", error);
    // Return a structured error that the client can handle
    return {
      reply: "Sorry, I encountered an error. Please try again.",
    };
  }
}
