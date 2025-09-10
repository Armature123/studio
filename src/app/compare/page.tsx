
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

// A component to render the markdown report
function MarkdownReport({ content }: { content: string }) {
  const sections = content.split('### ').filter(s => s.trim() !== '');

  const parseSection = (sectionText: string) => {
    const firstNewline = sectionText.indexOf('\n');
    const title = sectionText.substring(0, firstNewline).trim();
    let body = sectionText.substring(firstNewline).trim();
    
    // The disclaimer is a special case without a title
    if (title.toLowerCase().startsWith('disclaimer:')) {
        body = title;
        return { title: 'Disclaimer', body };
    }
    
    return { title, body };
  };
  
  const renderHTML = (text: string) => {
    if (!text) return { __html: '' };
    // Process markdown-style bolding and remove asterisks
    const html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*/g, ''); // Remove stray asterisks
    return { __html: html };
  };

  const parseTable = (tableMarkdown: string) => {
    const rows = tableMarkdown.trim().split('\n').filter(r => r.includes('|'));
    if (rows.length < 2) return { header: [], body: [] }; // Header and separator line

    const header = rows[0].split('|').slice(1, -1).map(h => h.trim());
    const tableBody = rows.slice(2).map(row => row.split('|').slice(1, -1).map(c => c.trim() || 'Not specified'));

    return { header, body: tableBody };
  };

  return (
    <div className="space-y-8">
      {sections.map((sectionContent, index) => {
        const { title, body } = parseSection(sectionContent);
        
        if (title.toLowerCase().startsWith('comparison')) {
          const { header, body: tableBody } = parseTable(body);
           if (tableBody.length === 0) return null;

          return (
            <div key={index}>
              <h3 className="text-xl font-semibold mb-4">{title}</h3>
              <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      {header.map((h, i) => (
                        <th key={i} scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-foreground" dangerouslySetInnerHTML={renderHTML(h)}></th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-background">
                    {tableBody.map((row, rIndex) => (
                      <tr key={rIndex}>
                        {row.map((cell, cIndex) => (
                          <td key={cIndex} className="py-4 px-4 text-sm text-muted-foreground align-top" dangerouslySetInnerHTML={renderHTML(cell)}></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }

        if (title.toLowerCase().startsWith('key differences') || title.toLowerCase().startsWith('summary')) {
          const listItems = body.split('\n').map(item => item.replace(/^[\*•] /,'').trim()).filter(Boolean);
          return (
            <div key={index}>
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                {listItems.map((item, itemIndex) => (
                    <li key={itemIndex} dangerouslySetInnerHTML={renderHTML(item)}></li>
                ))}
              </ul>
            </div>
          );
        }

        if (title.toLowerCase() === 'disclaimer') {
           return (
            <div key={index} className="text-xs text-muted-foreground pt-4 border-t" dangerouslySetInnerHTML={renderHTML(body)}>
            </div>
           )
        }
        
        return null;
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
            <div className="max-w-5xl mx-auto">
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
