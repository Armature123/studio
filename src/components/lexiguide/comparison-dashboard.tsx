
"use client";

import React, { useMemo, useRef, UIEvent } from 'react';
import { Download, FileUp, FileText, Book, ShieldAlert, Scale, Handshake, GitCompareArrows } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { exportToPdf } from '@/lib/export-utils';
import type { ComparisonResult, ClauseCategory } from "@/lib/comparison-types";
import { cn } from '@/lib/utils';
import { similar } from '@/lib/string-similarity';

interface ComparisonDashboardProps {
  data: ComparisonResult;
  onReset: () => void;
}

const CATEGORY_CONFIG: { [key in keyof ClauseCategory]: { title: string; icon: React.ElementType } } = {
    Obligations: { title: "Obligations", icon: Book },
    Rights: { title: "Rights", icon: FileText },
    Risks_Liabilities: { title: "Risks / Liabilities", icon: ShieldAlert },
    Term_Termination: { title: "Term & Termination", icon: Scale },
    Levers: { title: "Negotiation Levers", icon: Handshake },
};

const ClauseChip = ({ text, status }: { text: string; status: 'unique' | 'modified' | 'missing' }) => {
    let variant: 'unique' | 'similar' | 'missing' = 'similar';
    if (status === 'unique') variant = 'unique';
    if (status === 'missing') variant = 'missing';

    return (
        <div className={cn(
            badgeVariants({ variant }), 
            "h-auto text-wrap whitespace-normal transition-all hover:shadow-md hover:-translate-y-0.5"
        )}>
            {text}
        </div>
    );
};

const ComparisonCategoryColumn = ({ title, itemsA, itemsB, docName }: { title: string; itemsA: string[]; itemsB: string[]; docName: string }) => {
    const isDocA = title.includes("A");

    const processedItems = useMemo(() => {
        const sourceClauses = isDocA ? itemsA : itemsB;
        const targetClauses = isDocA ? itemsB : itemsA;

        return sourceClauses.map(clause => {
            let bestMatch = '';
            let highestSimilarity = 0;

            targetClauses.forEach(targetClause => {
                const similarityScore = similar(clause, targetClause);
                if (similarityScore > highestSimilarity) {
                    highestSimilarity = similarityScore;
                    bestMatch = targetClause;
                }
            });
            
            if (highestSimilarity > 0.85) return { text: clause, status: 'unique' };
            if (highestSimilarity > 0.3) return { text: clause, status: 'modified' };
            return { text: clause, status: 'unique' }; // Treat as unique if no decent match
        });

    }, [itemsA, itemsB, isDocA]);

    const missingClauses = useMemo(() => {
        const sourceClauses = isDocA ? itemsA : itemsB;
        const targetClauses = isDocA ? itemsB : itemsA;

        return targetClauses.filter(targetClause => {
            let highestSimilarity = 0;
            sourceClauses.forEach(sourceClause => {
                const similarityScore = similar(targetClause, sourceClause);
                if (similarityScore > highestSimilarity) {
                    highestSimilarity = similarityScore;
                }
            });
            return highestSimilarity < 0.3;
        }).map(clause => ({ text: clause, status: 'missing' as const }));

    }, [itemsA, itemsB, isDocA]);
    
    const allItems = [...processedItems, ...missingClauses];

    return (
        <div className="flex-1 space-y-4 min-w-[320px] bg-white/50 p-3 rounded-lg overflow-y-auto">
            <h2 className="text-lg font-semibold text-slate-800">{docName}</h2>
            {allItems.length > 0 ? (
                <div className="flex flex-col gap-2">
                    {allItems.map((item, index) => (
                         <ClauseChip key={index} text={item.text} status={item.status} />
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg bg-slate-100/50">
                    <div className="text-center text-slate-400">
                        <GitCompareArrows className="mx-auto h-8 w-8 mb-2" />
                        <p>No clauses detected.</p>
                    </div>
                </div>
            )}
        </div>
    )
};


export function ComparisonDashboard({ data, onReset }: ComparisonDashboardProps) {
    const reportRef = useRef<HTMLDivElement>(null);
    const scrollRefA = useRef<HTMLDivElement>(null);
    const scrollRefB = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const { docA, docB, docNames } = data;

    const friendlyVerdict = useMemo(() => {
        let advantagesA = 0;
        let advantagesB = 0;

        Object.keys(docA).forEach(key => {
            const category = key as keyof ClauseCategory;
            const clausesA = docA[category];
            const clausesB = docB[category];
            
            const uniqueToA = clausesA.filter(clauseA => !clausesB.some(clauseB => similar(clauseA, clauseB) > 0.85));
            const uniqueToB = clausesB.filter(clauseB => !clausesA.some(clauseA => similar(clauseB, clauseA) > 0.85));
            
            if (category === 'Risks_Liabilities') {
                advantagesA += uniqueToB.length;
                advantagesB += uniqueToA.length;
            } else {
                advantagesA += uniqueToA.length;
                advantagesB += uniqueToB.length;
            }
        });

        if (advantagesA > advantagesB) {
            return `Doc A appears more favorable, with ${advantagesA - advantagesB} more advantageous clauses.`;
        }
        if (advantagesB > advantagesA) {
            return `Doc B appears more favorable, with ${advantagesB - advantagesA} more advantageous clauses. 🔥`;
        }
        return "The documents appear to have a similar balance of clauses.";

    }, [docA, docB]);
    
    const handleScroll = (scrollingPane: 'A' | 'B') => (e: UIEvent<HTMLDivElement>) => {
        const paneA = scrollRefA.current;
        const paneB = scrollRefB.current;
        if (!paneA || !paneB) return;

        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const scrollRatio = scrollTop / (scrollHeight - clientHeight);
        
        if (scrollingPane === 'A') {
            paneB.scrollTop = scrollRatio * (paneB.scrollHeight - paneB.clientHeight);
        } else {
            paneA.scrollTop = scrollRatio * (paneA.scrollHeight - paneA.clientHeight);
        }
    };

    const handleExport = () => {
        if (reportRef.current) {
            exportToPdf(reportRef.current, toast);
        } else {
            toast({ variant: 'destructive', title: 'Export Failed', description: 'Could not find the report content.' });
        }
    };
    
    const allCategories = (Object.keys(CATEGORY_CONFIG) as Array<keyof ClauseCategory>);

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="flex-1">
                <h2 className="text-3xl font-bold tracking-tight">Comparison Report</h2>
                <p className="text-muted-foreground mt-1 text-slate-600">{friendlyVerdict}</p>
            </div>
            <Button variant="outline" onClick={onReset}><FileUp className="mr-2 h-4 w-4"/> New Comparison</Button>
        </div>
      
        <div ref={reportRef} id="report" className="space-y-8">
            {allCategories.map(categoryKey => {
                const categoryDataA = docA[categoryKey] || [];
                const categoryDataB = docB[categoryKey] || [];

                if (categoryDataA.length === 0 && categoryDataB.length === 0) return null;

                return (
                    <div key={categoryKey} className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-center gap-3">
                            <span className="p-2 bg-primary/10 rounded-lg text-primary">
                                {React.createElement(CATEGORY_CONFIG[categoryKey].icon, { className: "h-5 w-5" })}
                            </span>
                            {CATEGORY_CONFIG[categoryKey].title}
                        </h3>
                        <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg p-2 flex gap-2 h-[400px]">
                           <div ref={scrollRefA} onScroll={handleScroll('A')} className="flex-1 space-y-4 min-w-[320px] bg-white/50 p-3 rounded-lg overflow-y-auto">
                                <h2 className="text-lg font-semibold text-slate-800">{docNames[0]}</h2>
                                <div className="flex flex-col gap-2">
                                {categoryDataA.map((item, index) => <ClauseChip key={index} text={item} status="unique" />)}
                                </div>
                            </div>
                           <div ref={scrollRefB} onScroll={handleScroll('B')} className="flex-1 space-y-4 min-w-[320px] bg-white/50 p-3 rounded-lg overflow-y-auto">
                                <h2 className="text-lg font-semibold text-slate-800">{docNames[1]}</h2>
                                <div className="flex flex-col gap-2">
                                {categoryDataB.map((item, index) => <ClauseChip key={index} text={item} status="unique" />)}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
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
