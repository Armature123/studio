
"use client";

import React, { useRef } from 'react';
import { Download, FileDown, FileText, Bot, Scale, BarChart, FileUp, ChevronRight, CheckCircle, XCircle, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { exportToPdf, exportToDocx, saveToGoogleDocs } from '@/lib/export-utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CompareDocumentsOutput } from "@/lib/comparison-types";

type ComparisonResult = CompareDocumentsOutput & { docNames: [string, string] };

interface ComparisonDashboardProps {
  data: ComparisonResult;
  onReset: () => void;
}

const DiffItem = ({ type, content, originalContent }: { type: 'added' | 'removed' | 'modified', content: string, originalContent?: string }) => {
    switch (type) {
        case 'added':
            return <div className="bg-emerald-500/10 p-2 rounded-md my-1"><pre className="whitespace-pre-wrap text-sm">{content}</pre></div>;
        case 'removed':
            return <div className="bg-red-500/10 p-2 rounded-md my-1"><pre className="whitespace-pre-wrap text-sm line-through">{content}</pre></div>;
        case 'modified':
            return (
                <div className="bg-amber-500/10 p-2 rounded-md my-1 space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground">WAS:</div>
                    <pre className="whitespace-pre-wrap text-sm line-through">{originalContent}</pre>
                    <div className="text-xs font-semibold text-muted-foreground">IS NOW:</div>
                    <pre className="whitespace-pre-wrap text-sm">{content}</pre>
                </div>
            );
        default:
            return <pre className="whitespace-pre-wrap text-sm">{content}</pre>;
    }
};

export function ComparisonDashboard({ data, onReset }: ComparisonDashboardProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleExport = (exportFunction: (element: HTMLElement, toast: any) => void) => {
    if (reportRef.current) {
      exportFunction(reportRef.current, toast);
    } else {
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'Could not find the report content to export.',
      });
    }
  };

  const addedCount = data.detailedDiff.filter(d => d.type === 'added').length;
  const removedCount = data.detailedDiff.filter(d => d.type === 'removed').length;
  const modifiedCount = data.detailedDiff.filter(d => d.type === 'modified').length;

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Scale className="h-6 w-6"/> Comparison Report</h2>
            <div className="flex gap-2">
                <Button variant="outline" onClick={onReset}><FileUp className="mr-2 h-4 w-4"/> New Comparison</Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button>
                            <Download className="mr-2 h-4 w-4" />
                            Export Report
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleExport(exportToPdf)}>
                            <FileDown className="mr-2 h-4 w-4" />
                            <span>Export as PDF</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport(exportToDocx)}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Export as DOCX</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport(saveToGoogleDocs)}>
                            <Bot className="mr-2 h-4 w-4" />
                            <span>Save to Google Docs</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
      
      <div ref={reportRef} id="report" className="space-y-8 bg-background p-4 sm:p-8 rounded-lg border">
        {/* Summary Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <BarChart className="h-6 w-6 text-primary" />
              Executive Summary
            </CardTitle>
            <CardDescription>
                A high-level overview of the differences between "{data.docNames[0]}" and "{data.docNames[1]}".
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
                <h4 className="font-semibold">Key Findings</h4>
                <p className="text-sm text-muted-foreground">{data.comparisonSummary}</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-4 bg-muted p-6 rounded-lg">
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Similarity Score</p>
                    <p className="text-5xl font-bold text-primary">{data.similarityScore}%</p>
                </div>
                <div className="w-full space-y-2 text-sm">
                    <div className="flex justify-between items-center"><span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-emerald-500"/>Added</span> <span className="font-semibold">{addedCount}</span></div>
                    <div className="flex justify-between items-center"><span className="flex items-center gap-1"><XCircle className="h-4 w-4 text-red-500"/>Removed</span> <span className="font-semibold">{removedCount}</span></div>
                    <div className="flex justify-between items-center"><span className="flex items-center gap-1"><Edit className="h-4 w-4 text-amber-500"/>Modified</span> <span className="font-semibold">{modifiedCount}</span></div>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Diff Section */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <Scale className="h-6 w-6 text-primary" />
                    Detailed Differences
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-around text-sm font-semibold p-2 bg-muted rounded-t-lg">
                    <span>{data.docNames[0]} (Original)</span>
                    <span>{data.docNames[1]} (Revised)</span>
                </div>
                 <div className="relative p-4 border border-t-0 rounded-b-lg">
                    <div className="grid grid-cols-2 gap-4">
                        {data.detailedDiff.map((diff, index) => {
                            if (diff.type === 'added') {
                                return <div key={index} className="col-start-2"><DiffItem {...diff} /></div>;
                            }
                            if (diff.type === 'removed') {
                                return <div key={index}><DiffItem {...diff} /></div>;
                            }
                            // modified
                            return (
                                <React.Fragment key={index}>
                                    <div><DiffItem type="removed" content={diff.originalContent || ''} /></div>
                                    <div><DiffItem type="added" content={diff.content} /></div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
                {data.detailedDiff.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500"/>
                        <h3 className="text-lg font-semibold">No Differences Found</h3>
                        <p className="text-sm">The AI analysis concluded that the documents are functionally identical.</p>
                    </div>
                )}
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
