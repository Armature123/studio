
"use client";

import { useRef } from 'react';
import type { AnalysisResult } from "@/lib/types";
import { SummarySection } from "./summary-section";
import { RisksSection } from "./risks-section";
import { TasksSection } from "./tasks-section";
import { MetadataSection } from "./metadata-section";
import { GlossarySection } from "./glossary-section";
import { ChatSection } from "./chat-section";
import { exportReport } from '@/lib/export-utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download } from 'lucide-react';


interface DashboardProps {
  data: AnalysisResult;
  documentDataUri: string;
}

export function Dashboard({ data, documentDataUri }: DashboardProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleExport = (format: 'pdf' | 'docx' | 'print') => {
    if (!reportRef.current) {
        toast({ variant: "destructive", title: "Error", description: "Could not find the report to export." });
        return;
    }
    toast({ title: "Exporting...", description: `Your report is being prepared as a ${format.toUpperCase()} file.` });
    exportReport(reportRef.current, format, "analysis-report");
  };
  
  return (
    <div>
        <div className="flex justify-end mb-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Export Report
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => handleExport('pdf')}>Export as PDF</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleExport('docx')}>Export as DOCX</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleExport('print')}>Print</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <div ref={reportRef} id="report" className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
                <SummarySection summary={data.summary.summary} />
                <ChatSection documentDataUri={documentDataUri} />
                <RisksSection risks={data.risks.risks} />
            </div>
            <div className="lg:col-span-1 space-y-8">
                <TasksSection tasks={data.actionItems} />
                <MetadataSection metadata={data.metadata.metadata} />
                <GlossarySection definitions={data.metadata.metadata.definitions} />
            </div>
        </div>
    </div>
  );
}
