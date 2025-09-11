
"use client";

import React, { useRef } from 'react';
import { Download, FileUp, FileText, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { exportToPdf } from '@/lib/export-utils';
import type { ComparisonResult, ClauseCategory } from "@/lib/comparison-types";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ComparisonDashboardProps {
  data: ComparisonResult;
  onReset: () => void;
}

const CATEGORY_CONFIG: { [key in keyof ClauseCategory]: { title: string } } = {
    Obligations: { title: "Obligations" },
    Rights: { title: "Rights" },
    Risks_Liabilities: { title: "Risks / Liabilities" },
    Term_Termination: { title: "Term & Termination" },
    Levers: { title: "Negotiation Levers" },
};

const IconBadge = ({ text, icon }: { text: string; icon: 'check' | 'cross' }) => (
    <div className="inline-flex items-start gap-2 p-2 rounded-md bg-transparent text-sm">
        {icon === 'check' ? 
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" /> : 
            <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
        }
        <span className="text-foreground/90">{text}</span>
    </div>
);

const ClauseCell = ({ clauses }: { clauses: string[] }) => {
    if (!clauses || clauses.length === 0) {
        return <IconBadge text="(none listed)" icon="cross" />;
    }
    return (
        <div className="flex flex-col items-start gap-2">
            {clauses.map((clause, index) => (
                <IconBadge key={index} text={clause} icon="check" />
            ))}
        </div>
    );
};


export function ComparisonDashboard({ data, onReset }: ComparisonDashboardProps) {
    const reportRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const { docA, docB, docNames } = data;

    const handleExport = () => {
        const reportElement = reportRef.current;
        if (!reportElement) {
            toast({ variant: 'destructive', title: 'Export Failed', description: 'Could not find the report content.' });
            return;
        }

        // Temporarily adjust styles for export
        const table = reportElement.querySelector('table');
        if(table) table.style.tableLayout = 'auto';
        
        exportToPdf(reportElement, toast).finally(() => {
            // Revert styles after export
            if(table) table.style.tableLayout = 'fixed';
        });
    };
    
    const allCategories = (Object.keys(CATEGORY_CONFIG) as Array<keyof ClauseCategory>);

    const getAdvantageText = () => {
        const countA = Object.values(docA).flat().length;
        const countB = Object.values(docB).flat().length;
        const diff = Math.abs(countA - countB);

        if (countA > countB) {
            return `Doc A includes ${diff} more clause(s) than Doc B.`;
        }
        if (countB > countA) {
            return `Doc B includes ${diff} more clause(s) than Doc A. 🔥`;
        }
        return "Both documents have a similar number of detected clauses.";
    };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Comparison Report</h2>
                <p className="text-muted-foreground mt-1 text-slate-600">{getAdvantageText()}</p>
            </div>
            <Button variant="outline" onClick={onReset}><FileUp className="mr-2 h-4 w-4"/> New Comparison</Button>
        </div>
      
        <div ref={reportRef} id="report" className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="mb-6 px-2">
                <div className="flex flex-col sm:flex-row gap-4">
                     <Badge variant="outline" className="flex-1 justify-center py-2 text-sm truncate bg-white">
                        <FileText className="h-4 w-4 mr-2" />
                        <span className="font-semibold mr-2">Doc A:</span>
                        <span className="text-muted-foreground truncate">{docNames[0]}</span>
                    </Badge>
                    <Badge variant="outline" className="flex-1 justify-center py-2 text-sm truncate bg-white">
                        <FileText className="h-4 w-4 mr-2" />
                        <span className="font-semibold mr-2">Doc B:</span>
                        <span className="text-muted-foreground truncate">{docNames[1]}</span>
                    </Badge>
                </div>
            </div>

            <Card className="overflow-x-auto bg-transparent border-0 shadow-none">
                <CardHeader className="p-2">
                    <CardTitle className="text-xl">Comparison Matrix</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse" style={{ tableLayout: 'fixed' }}>
                            <thead className="sticky top-0 bg-white/80 backdrop-blur-md z-10">
                                <tr>
                                    <th className="p-4 border-b font-semibold w-1/4">Clause Category</th>
                                    <th className="p-4 border-b font-semibold w-3/8">Doc A</th>
                                    <th className="p-4 border-b font-semibold w-3/8">Doc B</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allCategories.map(categoryKey => (
                                    <tr key={categoryKey} className="group">
                                        <td className="p-4 border-b align-top font-medium text-foreground group-hover:bg-slate-50/80">
                                            {CATEGORY_CONFIG[categoryKey].title}
                                        </td>
                                        <td className="p-4 border-b align-top group-hover:bg-slate-50/80">
                                            <ClauseCell clauses={docA[categoryKey]} />
                                        </td>
                                        <td className="p-4 border-b align-top group-hover:bg-slate-50/80">
                                            <ClauseCell clauses={docB[categoryKey]} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>

        <Button 
            onClick={handleExport}
            className="fixed bottom-8 right-8 h-12 px-5 py-2.5 rounded-full bg-orange-500 text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all"
        >
            <Download className="mr-2 h-5 w-5" />
            Export PDF
        </Button>
    </div>
  );
}

    