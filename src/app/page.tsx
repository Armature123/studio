
"use client";

import { useState } from "react";
import { Landmark, FileUp } from "lucide-react";

import type { GenerateActionableSummaryOutput } from "@/ai/flows/generate-actionable-summary";
import type { ExtractLegalMetadataOutput } from "@/ai/flows/extract-legal-metadata";
import type { HighlightRisksOutput } from "@/ai/flows/highlight-risks";
import type { ExtractActionItemsOutput } from "@/ai/flows/extract-action-items";
import { analyzeDocument } from "@/app/actions";
import { FileUploadForm } from "@/components/lexiguide/file-upload-form";
import { Dashboard } from "@/components/lexiguide/dashboard";
import { AnalysisLoader } from "@/components/lexiguide/analysis-loader";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export type AnalysisResult = {
  summary: GenerateActionableSummaryOutput;
  metadata: ExtractLegalMetadataOutput;
  risks: HighlightRisksOutput;
  actionItems: ExtractActionItemsOutput;
};

export default function Home() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeDocument(formData);
      if (result.error) {
        throw new Error(result.error);
      }
      setAnalysis(result as AnalysisResult);
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: e.message || "Could not analyze the document. Please try again.",
      });
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setAnalysis(null);
    setError(null);
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex items-center">
            <Landmark className="h-6 w-6 mr-2" />
            <h1 className="text-lg font-semibold">LexiGuide</h1>
          </div>
          <div className="flex flex-1 items-center justify-end">
            {analysis && (
              <button onClick={handleReset} className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                <FileUp className="h-4 w-4 mr-2" />
                Analyze New Document
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          {isLoading && <AnalysisLoader />}
          {!isLoading && !analysis && (
            <>
              {error && (
                <Alert variant="destructive" className="mb-8">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <FileUploadForm onAnalyze={handleAnalyze} />
            </>
          )}
          {!isLoading && analysis && <Dashboard data={analysis} />}
        </div>
      </main>
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
            <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
                DISCLAIMER: This tool provides automated analysis and is for informational purposes only. It is not a substitute for professional legal advice. Always consult with a qualified attorney for legal matters.
            </p>
        </div>
      </footer>
    </div>
  );
}
