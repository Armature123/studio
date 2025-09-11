
"use client";

import React, { useMemo, useRef } from 'react';
import { Download, FileUp, Sparkles, FileText, Book, ShieldAlert, Scale, Handshake } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

const ClauseChip = ({ text, status }: { text: string; status: 'unique' | 'modified' | 'shared' }) => {
    let emoji = '';
    switch (status) {
        case 'unique': emoji = '🟢'; break; // Green for unique/advantage
        case 'modified': emoji = '🟡'; break; // Yellow for modified
        case 'shared': emoji = '⚪'; break; // White/Neutral for shared
    }

    return (
        <div className="flex items-start gap-2 bg-muted/50 p-2 rounded-md border text-sm">
            <span className="mt-0.5">{emoji}</span>
            <span className="flex-1">{text}</span>
        </div>
    );
};

const ComparisonCategoryCard = ({ title, icon: Icon, itemsA, itemsB, docNames }: { title: string; icon: React.ElementType; itemsA: string[]; itemsB: string[]; docNames: [string, string] }) => {
    
    const processedItems = useMemo(() => {
        const aClauses = new Set(itemsA);
        const bClauses = new Set(itemsB);
        let items = new Map<string, { statusA: 'unique' | 'modified' | 'shared' | 'missing', statusB: 'unique' | 'modified' | 'shared' | 'missing', textA: string, textB: string }>();

        itemsA.forEach(clauseA => {
            let bestMatchB = '';
            let highestSimilarity = 0;
            itemsB.forEach(clauseB => {
                const similarityScore = similar(clauseA, clauseB);
                if (similarityScore > highestSimilarity) {
                    highestSimilarity = similarityScore;
                    bestMatchB = clauseB;
                }
            });
            
            if (highestSimilarity > 0.7) { // High similarity -> modified or shared
                if (highestSimilarity < 0.99) { // High but not identical -> modified
                    items.set(clauseA, { statusA: 'modified', statusB: 'modified', textA: clauseA, textB: bestMatchB });
                } else { // Almost identical -> shared
                    items.set(clauseA, { statusA: 'shared', statusB: 'shared', textA: clauseA, textB: bestMatchB });
                }
                bClauses.delete(bestMatchB); // Remove from B set to avoid re-matching
            } else { // Low similarity -> unique to A
                items.set(clauseA, { statusA: 'unique', statusB: 'missing', textA: clauseA, textB: '' });
            }
        });

        // Any remaining clauses in B are unique to B
        bClauses.forEach(clauseB => {
             items.set(clauseB, { statusA: 'missing', statusB: 'unique', textA: '', textB: clauseB });
        });
        
        return Array.from(items.values());

    }, [itemsA, itemsB]);
    
    if (processedItems.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base"><Icon className="h-5 w-5"/>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">No relevant clauses found in this category.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="flex-1 min-w-[280px]">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Icon className="h-5 w-5"/>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-x-4">
                    <h3 className="font-semibold text-sm truncate">{docNames[0]}</h3>
                    <h3 className="font-semibold text-sm truncate">{docNames[1]}</h3>
                </div>
                {processedItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-2 gap-x-4">
                        <div>
                            {item.statusA !== 'missing' && <ClauseChip text={item.textA} status={item.statusA === 'shared' ? 'shared' : item.statusA === 'modified' ? 'modified' : 'unique'} />}
                        </div>
                        <div>
                            {item.statusB !== 'missing' && <ClauseChip text={item.textB} status={item.statusB === 'shared' ? 'shared' : item.statusB === 'modified' ? 'modified' : 'unique'} />}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};


export function ComparisonDashboard({ data, onReset }: ComparisonDashboardProps) {
    const reportRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const { docA, docB, docNames } = data;

    const friendlyVerdict = useMemo(() => {
        const aAdvantages = (docA.Obligations.length - docB.Obligations.length) + (docA.Rights.length - docB.Rights.length);
        const bAdvantages = (docB.Obligations.length - docA.Obligations.length) + (docB.Rights.length - docA.Rights.length);

        const aRisks = docA.Risks_Liabilities.length;
        const bRisks = docB.Risks_Liabilities.length;
        
        let verdict = [];
        if (aAdvantages > bAdvantages) {
            verdict.push(`Doc A has ${aAdvantages - bAdvantages} more advantageous clauses.`);
        } else if (bAdvantages > aAdvantages) {
            verdict.push(`Doc B has ${bAdvantages - aAdvantages} more advantageous clauses.`);
        }

        if (aRisks > bRisks) {
            verdict.push(`Doc B has ${aRisks - bRisks} fewer risks/liabilities 🔥`);
        } else if (bRisks > aRisks) {
            verdict.push(`Doc A has ${bRisks - aRisks} fewer risks/liabilities 🔥`);
        }
        
        if (verdict.length === 0) return "The documents appear to have a similar balance of clauses.";

        return verdict.join(' and ');

    }, [docA, docB]);

    const handleExport = () => {
        if (reportRef.current) {
            exportToPdf(reportRef.current, toast);
        } else {
            toast({ variant: 'destructive', title: 'Export Failed', description: 'Could not find the report content.' });
        }
    };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="flex-1">
                <h2 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary"/> Comparison Report</h2>
                <p className="text-muted-foreground mt-1">{`Comparing '${docNames[0]}' and '${docNames[1]}'`}</p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={onReset}><FileUp className="mr-2 h-4 w-4"/> New Comparison</Button>
                <Button onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                </Button>
            </div>
        </div>

        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardHeader>
                <CardTitle className="text-center text-lg md:text-xl text-foreground">
                    {friendlyVerdict}
                </CardTitle>
                <CardDescription className="text-center">Based on a semantic comparison of key clauses. 🟢 Unique 🟡 Modified ⚪ Shared</CardDescription>
            </CardHeader>
        </Card>
      
      <div ref={reportRef} id="report" className="space-y-8 bg-background p-4 sm:p-8 rounded-lg border">
         <div className="flex flex-col md:flex-row gap-4 overflow-x-auto">
            {Object.keys(CATEGORY_CONFIG).map(key => {
                 const categoryKey = key as keyof ClauseCategory;
                 return (
                    <ComparisonCategoryCard 
                        key={categoryKey}
                        title={CATEGORY_CONFIG[categoryKey].title}
                        icon={CATEGORY_CONFIG[categoryKey].icon}
                        itemsA={docA[categoryKey] || []}
                        itemsB={docB[categoryKey] || []}
                        docNames={docNames}
                    />
                 )
            })}
        </div>
      </div>
    </div>
  );
}
