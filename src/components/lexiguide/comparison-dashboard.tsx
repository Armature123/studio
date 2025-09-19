
"use client";

import React, { useMemo, useRef } from 'react';
import { Download, FileUp, FileText, Landmark, Bot, ShieldCheck, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { exportToPdf } from '@/lib/export-utils';
import type { ComparisonResult, ClauseCategory, MatchedClause, UniqueClause } from "@/lib/comparison-types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { similar } from '@/lib/string-similarity';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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

function copyToClipboard(text: string, toast: any) {
    navigator.clipboard.writeText(text);
    toast({ title: "Clause copied to clipboard!" });
}

const MatchedClauseCard: React.FC<{ pair: MatchedClause; docNames: [string, string]; toast: any }> = ({ pair, docNames, toast }) => {
    const favorabilityColor = pair.moreFavorable === 'DocA' ? 'border-green-500' : 'border-gray-300';
    const favorabilityColorB = pair.moreFavorable === 'DocB' ? 'border-green-500' : 'border-gray-300';
    const favorabilityText = pair.moreFavorable === 'DocA' ? 'More Favorable' : 'Less Favorable';
    const favorabilityTextB = pair.moreFavorable === 'DocB' ? 'More Favorable' : 'Less Favorable';

    return (
        <div className="bg-white rounded-lg p-4 border relative">
            <Badge variant="similar" className="absolute -top-2.5 left-3">Similar Clause</Badge>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className={`p-3 rounded-md bg-gray-50/70 border-2 ${favorabilityColor}`}>
                    <div className="flex justify-between items-center mb-2">
                         <Badge variant={pair.moreFavorable === 'DocA' ? 'default' : 'secondary'}>{favorabilityText}</Badge>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(pair.docAClause, toast)}><Copy className="h-4 w-4" /></Button>
                    </div>
                    <p className="text-sm">{pair.docAClause}</p>
                </div>
                <div className={`p-3 rounded-md bg-gray-50/70 border-2 ${favorabilityColorB}`}>
                    <div className="flex justify-between items-center mb-2">
                         <Badge variant={pair.moreFavorable === 'DocB' ? 'default' : 'secondary'}>{favorabilityTextB}</Badge>
                         <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(pair.docBClause, toast)}><Copy className="h-4 w-4" /></Button>
                    </div>
                    <p className="text-sm">{pair.docBClause}</p>
                </div>
            </div>
            <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                <h4 className="font-semibold text-sm text-blue-800">Key Difference:</h4>
                <p className="text-sm text-blue-700">{pair.differenceSummary}</p>
            </div>
        </div>
    );
};

const UniqueClauseCard: React.FC<{ clause: UniqueClause; docName: string; toast: any }> = ({ clause, docName, toast }) => (
    <div className="bg-white rounded-lg p-4 border relative">
        <Badge variant="unique" className="absolute -top-2.5 left-3">Unique to {docName}</Badge>
        <div className="flex justify-between items-start mt-2">
            <p className="text-sm flex-grow pr-2">{clause.clause}</p>
            <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => copyToClipboard(clause.clause, toast)}><Copy className="h-4 w-4" /></Button>
        </div>
    </div>
);


export function ComparisonDashboard({ data, onReset }: ComparisonDashboardProps) {
    const reportRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const { summary, docNames, comparison } = data;

    const handleExport = () => {
        const reportElement = reportRef.current;
        if (!reportElement) {
            toast({ variant: 'destructive', title: 'Export Failed', description: 'Could not find the report content.' });
            return;
        }
        exportToPdf(reportElement, toast);
    };
    
    const allCategories = (Object.keys(CATEGORY_CONFIG) as Array<keyof ClauseCategory>);

    return (
        <div className="space-y-6 animate-fade-in-up" id="comparison-report">
            <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Comparison Report</h2>
                    <p className="text-muted-foreground mt-1 text-slate-600">{docNames[0]} vs. {docNames[1]}</p>
                </div>
                <div className='flex items-center gap-2'>
                  <Button variant="outline" onClick={onReset}><FileUp className="mr-2 h-4 w-4"/> New Comparison</Button>
                  <Button onClick={handleExport}>
                      <Download className="mr-2 h-5 w-5" />
                      Export PDF
                  </Button>
                </div>
            </div>
      
            <Card ref={reportRef} id="report" className="bg-white/60 backdrop-blur-xl shadow-lg p-4 sm:p-6">
                <CardHeader>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <ShieldCheck className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <CardTitle>AI Executive Summary</CardTitle>
                            <CardDescription className="mt-2 text-base text-foreground">{summary}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Accordion type="multiple" defaultValue={allCategories} className="w-full space-y-4">
                        {allCategories.map(categoryKey => {
                            const categoryData = comparison[categoryKey];
                            if (!categoryData || (categoryData.matched.length === 0 && categoryData.uniqueToDocA.length === 0 && categoryData.uniqueToDocB.length === 0)) {
                                return null;
                            }
                            return (
                                <AccordionItem value={categoryKey} key={categoryKey} className="bg-slate-50 rounded-lg p-4 border">
                                    <AccordionTrigger className="hover:no-underline py-2">
                                        <h3 className="text-lg font-semibold text-foreground">{CATEGORY_CONFIG[categoryKey].title}</h3>
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-4 space-y-4">
                                        {categoryData.matched.map((pair, index) => (
                                            <MatchedClauseCard key={index} pair={pair} docNames={docNames} toast={toast} />
                                        ))}
                                        {categoryData.uniqueToDocA.map((clause, index) => (
                                            <UniqueClauseCard key={index} clause={clause} docName="Doc A" toast={toast} />
                                        ))}
                                        {categoryData.uniqueToDocB.map((clause, index) => (
                                             <UniqueClauseCard key={index} clause={clause} docName="Doc B" toast={toast} />
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
