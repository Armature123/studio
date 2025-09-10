
"use client";

import { useRef } from 'react';
import type { AnalysisResult } from "@/lib/types";
import { SummarySection } from "./summary-section";
import { RisksSection } from "./risks-section";
import { TasksSection } from "./tasks-section";
import { MetadataSection } from "./metadata-section";
import { GlossarySection } from "./glossary-section";
import { ChatSection } from "./chat-section";
import { useToast } from '@/hooks/use-toast';


interface DashboardProps {
  data: AnalysisResult;
  documentDataUri: string;
}

export function Dashboard({ data, documentDataUri }: DashboardProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  return (
    <div>
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
