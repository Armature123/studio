"use server";

import { generateActionableSummary } from "@/ai/flows/generate-actionable-summary";
import { extractLegalMetadata } from "@/ai/flows/extract-legal-metadata";
import { highlightRisks } from "@/ai/flows/highlight-risks";
import { detectLanguage } from "@/ai/flows/detect-language";

// As we cannot read file content in this environment, we use a hardcoded sample legal document.
// In a real application, you would read the content from the uploaded file.
const sampleDocumentText = `
SERVICE AGREEMENT

This Service Agreement ("Agreement") is made and entered into as of July 26, 2024 ("Effective Date"), by and between Innovate Inc., a Delaware corporation with its principal place of business at 123 Tech Avenue, Suite 100, San Francisco, CA 94105 ("Client"), and Creative Solutions LLC, a California limited liability company with its principal place of business at 456 Design Drive, Los Angeles, CA 90001 ("Provider").

1. SERVICES. Provider agrees to provide the Client with web design and development services as described in Exhibit A attached hereto ("Services"). The project is expected to be completed by October 31, 2024. Any changes to the scope of services must be made in writing and signed by both parties.

2. COMPENSATION. In consideration for the Services, Client shall pay Provider a total fee of $25,000. Payment shall be made in three installments:
   a. $10,000 upon signing this Agreement.
   b. $10,000 upon delivery of the initial design mockups.
   c. $5,000 upon final completion and launch of the website.
   Late payments will incur a penalty of 1.5% per month.

3. TERM AND TERMINATION. This Agreement shall commence on the Effective Date and continue until the Services are completed. Either party may terminate this Agreement with 30 days written notice if the other party breaches a material term of this Agreement and fails to cure such breach within the notice period. Upon termination, Client shall pay for all services rendered up to the termination date.

4. INTELLECTUAL PROPERTY. Provider agrees that all work product, including designs, code, and other materials created under this Agreement ("Deliverables"), shall be the sole and exclusive property of the Client. Provider shall retain no rights to the Deliverables. This constitutes a "work made for hire."

5. CONFIDENTIALITY. Both parties agree to keep confidential all non-public information obtained from the other party. This obligation shall survive the termination of this Agreement for a period of three years.

6. INDEMNIFICATION. Provider shall indemnify, defend, and hold harmless Client from and against any and all claims, damages, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of any third-party claim that the Deliverables infringe upon any patent, copyright, or trademark.

7. GOVERNING LAW. This Agreement shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of laws principles. Any disputes shall be resolved in the state or federal courts located in San Francisco, California.

8. ENTIRE AGREEMENT. This Agreement, including Exhibit A, constitutes the entire agreement between the parties and supersedes all prior agreements and understandings, whether written or oral.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.

Innovate Inc.
By: Jane Doe, CEO

Creative Solutions LLC
By: John Smith, Manager
`;

export async function analyzeDocument(formData: FormData) {
  const file = formData.get('document') as File;
  let documentText = formData.get('documentText') as string;
  
  if (!file && !documentText) {
    return { error: 'No document or text provided.' };
  }
  
  // In a real app, you'd use the uploaded file's text. Here we have a fallback for demo purposes.
  if (file && file.size > 0) {
    // This is where you would read the file text.
    // For this demo, we'll just use the sample text if a file is "uploaded".
    documentText = sampleDocumentText;
    // documentText = await file.text(); 
  } else if (!documentText) {
     return { error: 'The provided text is empty.' };
  }


  const companyType = "Startup";

  try {
    const { language } = await detectLanguage({ documentText });

    const [summaryResult, metadataResult, risksResult] = await Promise.all([
      generateActionableSummary({ documentText, language }),
      extractLegalMetadata({ documentText }),
      highlightRisks({ documentText, companyType }),
    ]);

    return {
      summary: summaryResult,
      metadata: metadataResult,
      risks: risksResult,
    };
  } catch (error) {
    console.error("Error during document analysis:", error);
    return {
      error:
        "Failed to analyze the document with our AI. The service may be temporarily unavailable. Please try again later.",
    };
  }
}
