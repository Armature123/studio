
import { CheckSquare, CircleDollarSign, CalendarClock, Gavel, ShieldCheck, FileWarning, AlertTriangle, Clock, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { ExtractActionItemsOutput } from "@/lib/types";

interface TasksSectionProps {
  tasks: ExtractActionItemsOutput;
}

const categoryConfig = {
    financial: { title: "Financial Actions", icon: CircleDollarSign },
    deadlines: { title: "Deadlines & Dates", icon: CalendarClock },
    obligations: { title: "Duties & Obligations", icon: Gavel },
    rightsProtections: { title: "Rights & Protections", icon: ShieldCheck },
    terminationRules: { title: "Termination Rules", icon: FileWarning },
}

type Task = {
    description: string;
    priority?: "high" | "medium" | "low";
    dueDate?: string;
    party?: string;
}

const TaskItem = ({ task, id }: { task: Task, id: string }) => {
    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPriorityIcon = (priority?: string) => {
        switch (priority) {
            case 'high': return <AlertTriangle className="h-3 w-3" />;
            case 'medium': return <Clock className="h-3 w-3" />;
            case 'low': return <CheckSquare className="h-3 w-3" />;
            default: return null;
        }
    };

    return (
        <div key={id} className="flex items-start space-x-3 py-3 border-b border-border/50 last:border-b-0">
            <Checkbox id={id} className="mt-1.5" />
            <div className="flex-1 space-y-2">
                <Label htmlFor={id} className="font-normal text-sm leading-snug cursor-pointer">
                    {task.description}
                </Label>
                <div className="flex flex-wrap gap-2 text-xs">
                    {task.priority && (
                        <Badge variant="outline" className={`${getPriorityColor(task.priority)} flex items-center gap-1`}>
                            {getPriorityIcon(task.priority)}
                            {task.priority.toUpperCase()}
                        </Badge>
                    )}
                    {task.dueDate && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                            <CalendarClock className="h-3 w-3" />
                            {task.dueDate}
                        </Badge>
                    )}
                    {task.party && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {task.party}
                        </Badge>
                    )}
                </div>
            </div>
        </div>
    );
};

export function TasksSection({ tasks: actionItems }: TasksSectionProps) {
    const { tasks, summary } = actionItems;
    const allTasks = Object.values(tasks || {}).flat();

    if (allTasks.length === 0) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                    <CheckSquare className="h-6 w-6" />
                    <CardTitle>Action Center</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No actionable items found in this document.</p>
                        <p className="text-xs mt-1">Upload a different document to extract action items.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <CheckSquare className="h-6 w-6" />
                <div className="flex-1">
                    <CardTitle>Action Center</CardTitle>
                    {summary && (
                      <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                              {summary.totalActions} total actions
                          </Badge>
                          {summary.criticalActions > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                  {summary.criticalActions} critical
                              </Badge>
                          )}
                          {summary.hasDeadlines && (
                              <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                                  Has deadlines
                              </Badge>
                          )}
                      </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" defaultValue={Object.keys(categoryConfig).filter(key => {
                    const categoryTasks = tasks[key as keyof typeof tasks];
                    return categoryTasks && Array.isArray(categoryTasks) && categoryTasks.length > 0;
                })}>
                    {Object.entries(categoryConfig).map(([key, { title, icon: Icon }]) => {
                        const categoryTasks = tasks[key as keyof typeof tasks];
                        if (!categoryTasks || !Array.isArray(categoryTasks) || categoryTasks.length === 0) return null;

                        const highPriorityCount = categoryTasks.filter(task => task.priority === 'high').length;

                        return (
                            <AccordionItem value={key} key={key}>
                                <AccordionTrigger>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <Icon className="h-5 w-5 text-muted-foreground" />
                                        <span className="font-medium">{title}</span>
                                        <div className="flex gap-1">
                                            <Badge variant="outline" className="text-xs">
                                                {categoryTasks.length}
                                            </Badge>
                                            {highPriorityCount > 0 && (
                                                <Badge variant="destructive" className="text-xs">
                                                    {highPriorityCount} urgent
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-2">
                                    <div className="space-y-0">
                                        {categoryTasks.map((task, index) => (
                                            <TaskItem task={task} id={`${key}-task-${index}`} key={index}/>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            </CardContent>
        </Card>
    );
}
