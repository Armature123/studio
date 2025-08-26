import type { AnalysisResult } from "@/app/page";
import { RisksSection } from "./risks-section";
import { TasksSection } from "./tasks-section";
import { MetadataSection } from "./metadata-section";
import { GlossarySection } from "./glossary-section";

interface DashboardProps {
  data: AnalysisResult;
}

export function Dashboard({ data }: DashboardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-8">
        <RisksSection risks={data.risks.risks} />
      </div>
      <div className="lg:col-span-1 space-y-8">
        <TasksSection tasks={data.actionItems.tasks} />
        <MetadataSection metadata={data.metadata.metadata} />
        <GlossarySection definitions={data.metadata.metadata.definitions} />
      </div>
    </div>
  );
}
