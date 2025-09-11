
"use client";

import React, { useMemo, useRef } from 'react';
import { Download, FileUp, Sparkles, Gift, ShieldAlert, Handshake } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { exportToPdf } from '@/lib/export-utils';
import type { ComparisonResult, ClauseCategory } from "@/lib/comparison-types";

interface ComparisonDashboardProps {
  data: ComparisonResult;
  onReset: () => void;
}

type ClauseComparison = {
    text: string;
    inA: boolean;
    inB: boolean;
    score: number; // For benefits: 1 for A, -1 for B, 0 for both/neither. For liabilities: -1 for A, 1 for B.
};

const getClauseStatus = (inA: boolean, inB: boolean, type: 'benefit' | 'liability'): 'A' | 'B' | 'Both' | 'None' => {
    if (inA && inB) return 'Both';
    if (inA) return type === 'benefit' ? 'A' : 'B'; // Good for A if it's a benefit, bad for B if it's a liability A has
    if (inB) return type === 'benefit' ? 'B' : 'A';
    return 'None';
};


const ClauseChip = ({ text, inA, inB, type }: { text: string; inA: boolean; inB: boolean; type: 'benefit' | 'liability' | 'lever' }) => {
    let emoji = '🟡';
    let label = 'Both';
    let inDoc = '';

    if (inA && !inB) {
        emoji = type === 'benefit' ? '🟢' : '🔴';
        label = 'Advantage A';
        inDoc = 'In Offer A Only';
    } else if (!inA && inB) {
        emoji = type === 'benefit' ? '🔴' : '🟢';
        label = 'Advantage B';
        inDoc = 'In Offer B Only';
    } else {
        inDoc = 'In Both Offers';
    }
    
    if (type === 'lever') {
        if (inA && !inB) {
            emoji = '🔵';
            label = 'In A';
            inDoc = 'In Offer A Only'
        } else if (!inA && inB) {
            emoji = '🟣';
            label = 'In B';
            inDoc = 'In Offer B Only';
        } else {
            emoji = '⚪';
            label = 'Both';
            inDoc = 'In Both Offers';
        }
    }


    return (
        <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md border text-sm">
            <span title={inDoc}>{emoji}</span>
            <span className="flex-1">{text}</span>
        </div>
    );
};

const ComparisonCategoryCard = ({ title, icon: Icon, itemsA, itemsB, type }: { title: string, icon: React.ElementType, itemsA: string[], itemsB: string[], type: 'benefit' | 'liability' | 'lever' }) => {
    const combinedItems = useMemo(() => {
        const allItems = new Set([...itemsA, ...itemsB]);
        return Array.from(allItems).slice(0, 30).map(item => ({
            text: item,
            inA: itemsA.includes(item),
            inB: itemsB.includes(item)
        }));
    }, [itemsA, itemsB]);
    
    if (combinedItems.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Icon className="h-5 w-5"/>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">No items found in this category.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Icon className="h-5 w-5"/>{title}</CardTitle>
                 <CardDescription>Comparison of {title.toLowerCase()} between the two offers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-muted-foreground px-2">
                    <span>Offer A</span>
                    <span>Offer B</span>
                </div>
                 {combinedItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-2 gap-2">
                        <div>{item.inA && <ClauseChip {...item} type={type} />}</div>
                        <div>{item.inB && !item.inA && <ClauseChip {...item} type={type} />}</div>
                    </div>
                ))}
                 {combinedItems.filter(i => i.inA && i.inB).map((item, index) => (
                     <div key={index} className="col-span-2"><ClauseChip {...item} type={type} /></div>
                 ))}
            </CardContent>
        </Card>
    );
};

export function ComparisonDashboard({ data, onReset }: ComparisonDashboardProps) {
    const reportRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const { docA, docB, docNames } = data;

    const scores = useMemo(() => {
        let scoreA = 0;
        let scoreB = 0;
        const allBenefits = new Set([...(docA?.Benefits || []), ...(docB?.Benefits || [])]);
        const allLiabilities = new Set([...(docA?.Liabilities || []), ...(docB?.Liabilities || [])]);

        allBenefits.forEach(item => {
            const inA = docA?.Benefits?.includes(item);
            const inB = docB?.Benefits?.includes(item);
            if (inA && !inB) scoreA++;
            if (!inA && inB) scoreB++;
        });

        allLiabilities.forEach(item => {
            const inA = docA?.Liabilities?.includes(item);
            const inB = docB?.Liabilities?.includes(item);
            if (inA && !inB) scoreB++; // A has a liability, so B gets a point
            if (!inA && inB) scoreA++; // B has a liability, so A gets a point
        });

        const totalPoints = scoreA + scoreB;
        if (totalPoints === 0) return { percentA: 50, percentB: 50 };
        
        const percentA = Math.round((scoreA / totalPoints) * 100);
        const percentB = Math.round((scoreB / totalPoints) * 100);

        return { percentA, percentB };

    }, [docA, docB]);
    
    const friendlyVerdict = useMemo(() => {
        if (!scores) return "The offers seem evenly matched.";
        const diff = scores.percentA - scores.percentB;
        if (Math.abs(diff) < 10) return "The offers seem evenly matched.";
        if (diff > 0) return `Offer A looks ${scores.percentA}% friendlier 🎉`;
        return `Offer B looks ${scores.percentB}% friendlier 🎉`;
    }, [scores]);

    const handleExport = () => {
        if (reportRef.current) {
            exportToPdf(reportRef.current, toast);
        } else {
            toast({ variant: 'destructive', title: 'Export Failed', description: 'Could not find the report content.' });
        }
    };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary"/> Offer Comparison Report</h2>
            <div className="flex gap-2">
                <Button variant="outline" onClick={onReset}><FileUp className="mr-2 h-4 w-4"/> New Comparison</Button>
                <Button onClick={handleExport} variant="destructive">
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                </Button>
            </div>
        </div>

        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardHeader>
                <CardTitle className="text-center text-xl md:text-2xl text-foreground">
                    {friendlyVerdict}
                </CardTitle>
                <CardDescription className="text-center">Based on a comparison of key benefits and liabilities.</CardDescription>
            </CardHeader>
        </Card>
      
      <div ref={reportRef} id="report" className="space-y-8 bg-background p-4 sm:p-8 rounded-lg border">
         <div className="grid md:grid-cols-3 gap-6">
            <ComparisonCategoryCard 
                title="Benefits" 
                icon={Gift} 
                itemsA={docA.Benefits || []}
                itemsB={docB.Benefits || []}
                type="benefit"
            />
            <ComparisonCategoryCard 
                title="Liabilities" 
                icon={ShieldAlert}
                itemsA={docA.Liabilities || []}
                itemsB={docB.Liabilities || []}
                type="liability"
            />
             <ComparisonCategoryCard 
                title="Negotiation Levers" 
                icon={Handshake}
                itemsA={docA.Levers || []}
                itemsB={docB.Levers || []}
                type="lever"
            />
        </div>
      </div>
    </div>
  );
}
