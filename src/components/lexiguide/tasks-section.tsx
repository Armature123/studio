import { CheckSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface TasksSectionProps {
  summary: string;
}

function parseTasksFromSummary(summary: string): string[] {
    if (!summary || typeof summary !== 'string') return [];
    
    const actionItemsSection = summary.split(/Action Items:|Checklist:/i)[1];
    if (!actionItemsSection) {
        return summary
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.match(/^(\*|-|\d+\.)\s/))
            .map(line => line.replace(/^(\*|-|\d+\.)\s/, ''));
    }

    return actionItemsSection
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.match(/^(\*|-|\d+\.)\s/))
        .map(line => line.replace(/^(\*|-|\d+\.)\s/, ''));
}


export function TasksSection({ summary }: TasksSectionProps) {
    const tasks = parseTasksFromSummary(summary);

    if (tasks.length === 0) {
        return null; // Don't render the card if no tasks are found
    }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <CheckSquare className="h-6 w-6" />
        <CardTitle>Action Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.map((task, index) => (
            <div key={index} className="flex items-start space-x-3">
                <Checkbox id={`task-${index}`} className="mt-1" />
                <Label htmlFor={`task-${index}`} className="font-normal text-sm leading-snug">{task}</Label>
            </div>
        ))}
      </CardContent>
    </Card>
  );
}
