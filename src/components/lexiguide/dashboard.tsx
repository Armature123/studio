
"use client";

import React, { useRef, useState } from 'react';
import { Download, FileDown, FileText, Bot, Handshake } from 'lucide-react';
import type { AnalysisResult } from "@/lib/types";
import { RisksSection, type RiskItem } from "./risks-section";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import Link from 'next/link';
import { ClauseRewriterModal, type RewriteClauseData } from './clause-rewriter-modal';

interface DashboardProps {
  data: AnalysisResult;
}

export function Dashboard({ data }: DashboardProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [rewriteModalData, setRewriteModalData] = useState<RewriteClauseData | null>(null);

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

  const handleRewriteClick = (risk: RiskItem) => {
    setRewriteModalData({
        clause: risk.risk,
        context: risk.explanation
    });
  }

  return (
    <div>
        {rewriteModalData && (
            <ClauseRewriterModal
                isOpen={!!rewriteModalData}
                onClose={() => setRewriteModalData(null)}
                data={rewriteModalData}
            />
        )}
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
      <div ref={reportRef} id="report" className="space-y-8 bg-background p-4 sm:p-8 rounded-lg">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-3 space-y-8">
                <RisksSection risks={data.risks.risks} onRewrite={handleRewriteClick} />
                <MetadataSection metadata={data.metadata.metadata} />
            </div>
            <div className="lg:col-span-2 space-y-8">
                <TasksSection tasks={data.actionItems} />
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Handshake /> Next Steps
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <CardDescription>
                            Your report highlights key risks and actions. For professional advice, consider connecting with a legal expert.
                        </CardDescription>
                        <Button asChild className="w-full">
                           <Link href="/lawyers">Find a Lawyer for Expert Review</Link>
                        </Button>
                    </CardContent>
                </Card>
                <GlossarySection definitions={data.metadata.metadata.definitions} />
            </div>
        </div>
      </div>
    </div>
  );
}
