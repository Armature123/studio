
"use client";

import { useState } from "react";
import { Landmark, FileUp, Scale, Home } from "lucide-react";
import { compareDocumentsAction } from "@/app/actions";
import { CompareDocumentsForm } from "@/components/lexiguide/compare-documents-form";
import { AnalysisLoader } from "@/components/lexiguide/analysis-loader";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { CompareDocumentsOutput } from "@/ai/flows/compare-documents";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// A simple markdown parser to display the report
function MarkdownReport({ content }: { content: string }) {
  const sections = content.split('### ').slice(1);

  const parseTable = (tableString: string) => {
    const rows = tableString.trim().split('\n');
    const header = rows[0].split('|').map(h => h.trim()).slice(1, -1);
    const body = rows.slice(2).map(row => row.split('|').map(c => c.trim()).slice(1, -1));
    return { header, body };
  };

  return (
    <div className="space-y-8">
      {sections.map((section, index) => {
        const titleEnd = section.indexOf('\n');
        const title = section.substring(0, titleEnd).trim();
        const body = section.substring(titleEnd).trim();

        if (title.toLowerCase() === 'comparison') {
          const { header, body: tableBody } = parseTable(body);
          return (
            <div key={index} className="prose prose-sm max-w-none">
              <h3 className="font-semibold text-xl mb-4">{title}</h3>
              <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      {header.map((h, i) => (
                        <th key={i} className={`py-3 px-4 text-left text-xs font-medium uppercase tracking-wider ${i === 1 ? 'bg-blue-50/50' : ''} ${i === 2 ? 'bg-purple-50/50' : ''}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {tableBody.map((row, rIndex) => (
                      <tr key={rIndex}>
                        {row.map((cell, cIndex) => (
                          <td key={cIndex} className="py-4 px-4 text-sm align-top">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }

        return (
          <div key={index} className="prose prose-sm max-w-none">
            <h3 className="font-semibold text-xl mb-2">{title}</h3>
            <div dangerouslySetInnerHTML={{ __html: body.replace(/\n\*/g, '<br/>&bull;').replace(/\n/g, '<br />') }} />
          </div>
        );
      })}
    </div>
  );
}

export default function ComparePage() {
  const [comparison, setComparison] = useState<CompareDocumentsOutput | null>(null);
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
      setComparison(result.comparison as CompareDocumentsOutput);
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
      toast({
        variant: "destructive",
        title: "Comparison Failed",
        description: e.message || "Could not compare the documents. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setComparison(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="mr-6 flex items-center">
            <Landmark className="h-6 w-6 mr-2" />
            <h1 className="text-lg font-semibold">LexiGuide</h1>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
             <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">Analyze</Link>
             <Link href="/compare" className="text-foreground">Compare</Link>
          </nav>
          <div className="flex flex-1 items-center justify-end">
            {comparison && (
              <button onClick={handleReset} className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                <FileUp className="h-4 w-4 mr-2" />
                Compare New Documents
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          {isLoading && <AnalysisLoader />}
          {!isLoading && !comparison && (
            <>
              {error && (
                <Alert variant="destructive" className="mb-8">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <CompareDocumentsForm onCompare={handleCompare} />
            </>
          )}
          {!isLoading && comparison && (
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="mb-4 flex items-center justify-center rounded-full bg-primary/10 p-3">
                    <Scale className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight">Comparison Report</h2>
                <p className="mt-2 text-lg text-muted-foreground">Here is the side-by-side analysis of your documents.</p>
              </div>
               <div className="p-8 rounded-lg border bg-card text-card-foreground shadow-sm">
                <MarkdownReport content={comparison.comparison} />
              </div>
            </div>
          )}
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
