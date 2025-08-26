import { CheckSquare, CircleDollarSign, FileCheck, CalendarClock, Gavel } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { ExtractActionItemsOutput } from "@/ai/flows/extract-action-items";

interface TasksSectionProps {
  tasks: ExtractActionItemsOutput["tasks"];
}

const categoryConfig = {
    financial: { title: "Financial Actions", icon: CircleDollarSign },
    review: { title: "Review & Approval", icon: FileCheck },
    deadlines: { title: "Deadlines & Dates", icon: CalendarClock },
    obligations: { title: "Duties & Obligations", icon: Gavel },
}

const TaskItem = ({ task, id }: { task: { description: string }, id: string }) => (
    <div key={id} className="flex items-start space-x-3 py-2">
        <Checkbox id={id} className="mt-1" />
        <Label htmlFor={id} className="font-normal text-sm leading-snug">{task.description}</Label>
    </div>
);

export function TasksSection({ tasks }: TasksSectionProps) {
    const allTasks = Object.values(tasks).flat();

    if (allTasks.length === 0) {
        return null; // Don't render the card if no tasks are found
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <CheckSquare className="h-6 w-6" />
                <CardTitle>Action Center</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" defaultValue={Object.keys(categoryConfig)}>
                    {Object.entries(categoryConfig).map(([key, { title, icon: Icon }]) => {
                        const categoryTasks = tasks[key as keyof typeof tasks];
                        if (!categoryTasks || categoryTasks.length === 0) return null;

                        return (
                            <AccordionItem value={key} key={key}>
                                <AccordionTrigger>
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-5 w-5 text-muted-foreground" />
                                        <span>{title} ({categoryTasks.length})</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pl-2">
                                    {categoryTasks.map((task, index) => (
                                        <TaskItem task={task} id={`${key}-task-${index}`} key={index}/>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            </CardContent>
        </Card>
    );
}
