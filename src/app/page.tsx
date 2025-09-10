
"use client";

import React, { useState } from "react";
import { Landmark, FileUp } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";
import { analyzeDocument } from "@/app/actions";
import { FileUploadForm } from "@/components/lexiguide/file-upload-form";
import { Dashboard } from "@/components/lexiguide/dashboard";
import { AnalysisLoader } from "@/components/lexiguide/analysis-loader";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { LegalChatbotWidget } from "@/components/lexiguide/legal-chatbot-widget";

interface HomeProps {
  setDocumentDataUri?: (uri: string | null) => void;
}

export default function Home({ setDocumentDataUri }: HomeProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  async function fileToDataURI(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    return `data:${file.type};base64,${base64}`;
  }

  const handleAnalyze = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    setDocumentDataUri?.(null);
    
    const file = formData.get('document') as File;
    if (!file) {
      setError("No file provided");
      setIsLoading(false);
      return;
    }

    try {
      const dataUri = await fileToDataURI(file);
      setDocumentDataUri?.(dataUri);

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
    setDocumentDataUri?.(null);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
           <Link href="/" className="mr-6 flex items-center">
            <Landmark className="h-6 w-6 mr-2" />
            <h1 className="text-lg font-semibold">LexiGuide</h1>
          </Link>
           <nav className="flex items-center space-x-6 text-sm font-medium">
             <Link href="/" className="text-foreground">Analyze</Link>
             <Link href="/compare" className="text-muted-foreground transition-colors hover:text-foreground">Compare</Link>
          </nav>
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
