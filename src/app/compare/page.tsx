
"use client";

import { useState, useRef } from "react";
import { Landmark, FileUp, Scale, Download } from "lucide-react";
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
  const sections = content.split(/(?=###\s)/).filter(s => s.trim() !== '');

  const parseSection = (sectionText: string) => {
    const firstNewline = sectionText.indexOf('\n');
    const title = sectionText.substring(0, firstNewline).replace(/###\s/,'').trim();
    let body = sectionText.substring(firstNewline).trim();
    
    if (title.toLowerCase().startsWith('disclaimer:')) {
        body = title;
        return { type: 'disclaimer', title: 'Disclaimer', body };
    }
    if (title.toLowerCase() === 'comparison') {
      return { type: 'table', title, body };
    }
    if (title.toLowerCase() === 'key differences' || title.toLowerCase() === 'summary') {
      return { type: 'list', title, body };
    }

    return { type: 'unknown', title, body };
  };
  
  const renderHTML = (text: string) => {
    if (!text) return { __html: '' };
    const html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
    return { __html: html };
  };

  const parseTable = (tableMarkdown: string) => {
    const rows = tableMarkdown.trim().split('\n').map(r => r.trim()).filter(r => r.includes('|'));
    if (rows.length < 2) return { header: [], body: [] };

    const header = rows[0].split('|').slice(1, -1).map(h => h.trim());
    // The second row is the separator `| :--- | :--- | :--- |`
    const tableBody = rows.slice(2).map(row => 
        row.split('|').slice(1, -1).map(c => c.trim() || 'Not specified')
    );

    return { header, body: tableBody };
  };

  return (
    <div className="space-y-8">
      {sections.map((sectionContent, index) => {
        const { type, title, body } = parseSection(sectionContent);
        
        if (type === 'table') {
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

        if (type === 'list') {
          const listItems = body.split('\n').map(item => item.replace(/^[\*•-]\s/,'').trim()).filter(Boolean);
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
        
        if (type === 'disclaimer') {
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
  const reportRef = useRef<HTMLDivElement>(null);


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
          <div className="flex flex-1 items-center justify-end space-x-4">
            {comparison && (
               <>
                <button onClick={handleReset} className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                    <FileUp className="h-4 w-4 mr-2" />
                    Compare New
                </button>
               </>
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
               <div ref={reportRef} id="report" className="p-8 rounded-lg border bg-card text-card-foreground shadow-sm">
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
