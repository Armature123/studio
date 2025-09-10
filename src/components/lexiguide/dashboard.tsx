
"use client";

import { useRef } from 'react';
import { Download, FileDown, FileText, Bot } from 'lucide-react';
import type { AnalysisResult } from "@/lib/types";
import { RisksSection } from "./risks-section";
import { TasksSection } from "./tasks-section";
import { MetadataSection } from "./metadata-section";
import { GlossarySection } from "./glossary-section";
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToPdf, exportToDocx, saveToGoogleDocs } from '@/lib/export-utils';

interface DashboardProps {
  data: AnalysisResult;
}

export function Dashboard({ data }: DashboardProps) {
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

  return (
    <div>
      <div className="flex justify-end mb-4">
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
      <div ref={reportRef} id="report" className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start bg-background p-4 sm:p-8 rounded-lg">
        <div className="lg:col-span-2 space-y-8">
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
