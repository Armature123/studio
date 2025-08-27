"use server";

import { generateActionableSummary } from "@/ai/flows/generate-actionable-summary";
import { extractLegalMetadata } from "@/ai/flows/extract-legal-metadata";
import { highlightRisks } from "@/ai/flows/highlight-risks";
import { detectLanguage } from "@/ai/flows/detect-language";
import { extractActionItems } from "@/ai/flows/extract-action-items";

/**
 * Extracts text content from an uploaded PDF file
 */
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Dynamically import pdf-parse only when needed to avoid server-side issues.
    const pdf = (await import('pdf-parse')).default;
    const arrayBuffer = await file.arrayBuffer();
    const data = await pdf(arrayBuffer);
    return data.text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF. Please ensure the file is a valid PDF document.");
  }
}

/**
 * Extracts text content from various document formats
 */
async function extractDocumentText(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  
  if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
    return await extractTextFromPDF(file);
  } else if (fileType === "text/plain" || fileName.endsWith(".txt")) {
    return await file.text();
  } else {
    throw new Error("Unsupported file format. Please upload a PDF or text file.");
  }
}

export async function analyzeDocument(formData: FormData) {
  const file = formData.get('document') as File;
  let documentText = formData.get('documentText') as string;
  const language = (formData.get('language') as string) || "English";
  
  if (!file && !documentText) {
    return { error: 'No document or text provided.' };
  }
  
  // Extract text from uploaded file or use provided text
  try {
    if (file && file.size > 0) {
      console.log(`Processing uploaded file: ${file.name} (${file.size} bytes)`);
      documentText = await extractDocumentText(file);
      
      if (!documentText || documentText.trim().length === 0) {
        return { error: 'The uploaded document appears to be empty or contains no extractable text.' };
      }
      
      console.log(`Extracted ${documentText.length} characters from document`);
    } else if (!documentText || documentText.trim().length === 0) {
      return { error: 'The provided text is empty.' };
    }
  } catch (error) {
    console.error("Error processing document:", error);
    return { 
      error: error instanceof Error ? error.message : 'Failed to process the uploaded document.' 
    };
  }

  const companyType = "Startup";

  try {
    // We don't need to detect language if the user has specified it
    // const { language } = await detectLanguage({ documentText });

    const [summaryResult, metadataResult, risksResult, actionItemsResult] = await Promise.all([
      generateActionableSummary({ documentText, language }),
      extractLegalMetadata({ documentText }),
      highlightRisks({ documentText, companyType }),
      extractActionItems({ documentText }),
    ]);

    return {
      summary: summaryResult,
      metadata: metadataResult,
      risks: risksResult,
      actionItems: actionItemsResult,
    };
  } catch (error) {
    console.error("Error during document analysis:", error);
    return {
      error:
        "Failed to analyze the document with our AI. The service may be temporarily unavailable. Please try again later.",
    };
  }
}
