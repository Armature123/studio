
"use client";

import React, { useState } from "react";
import { Landmark } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { compareDocumentsAction } from "@/app/actions";
import { CompareDocumentsForm } from "@/components/lexiguide/compare-documents-form";
import { AnalysisLoader } from "@/components/lexiguide/analysis-loader";
import { ComparisonDashboard } from "@/components/lexiguide/comparison-dashboard";
import type { ComparisonResult } from "@/lib/comparison-types";

export default function ComparePage() {
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCompare = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    setComparison(null);
    
    try {
      const result = await compareDocumentsAction(formData);
      if (result.error) {
        throw new Error(result.error);
      }
      // Check if there is meaningful data to display
      const hasContent = Object.values(result.comparison).some(cat => 
        cat.matched.length > 0 || cat.uniqueToDocA.length > 0 || cat.uniqueToDocB.length > 0
      );

      if (!hasContent) {
        throw new Error("🚫 Could not find significant legal clauses for comparison. Please check if the documents are text-based and not scanned images.");
      }

      setComparison(result as ComparisonResult);

    } catch (e: any) {
      const errorMessage = e.message || "An unexpected error occurred during comparison.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Comparison Failed",
        description: errorMessage,
      });
      setComparison(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setComparison(null);
    setError(null);
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background" id="page-content">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
           <Link href="/" className="mr-6 flex items-center">
            <Landmark className="h-6 w-6 mr-2" />
            <h1 className="text-lg font-semibold">LexiGuide</h1>
          </Link>
           <nav className="flex items-center space-x-6 text-sm font-medium">
             <Link href="/" className="text-muted-foreground hover:text-foreground">Analyze</Link>
             <Link href="/compare" className="text-foreground">Compare</Link>
             <Link href="/lawyers" className="text-muted-foreground hover:text-foreground">Find a Lawyer</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          {isLoading && <AnalysisLoader />}
          {!isLoading && !comparison && (
            <>
              {error && (
                <Alert variant="destructive" className="mb-8 max-w-4xl mx-auto">
                   <AlertTitle>{error.startsWith("🚫") ? "Parsing Error" : "Error"}</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <CompareDocumentsForm onCompare={handleCompare} />
            </>
          )}
          {!isLoading && comparison && <ComparisonDashboard data={comparison} onReset={handleReset} />}
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
