
"use client";

import { useState } from 'react';
import { FileText, Users, CalendarDays, Gavel, Scale, FileSignature, Volume2, Loader2, AlertCircle, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExtractLegalMetadataOutput } from "@/lib/types";
import { Badge } from "../ui/badge";
import { Button } from '../ui/button';
import { cn } from "@/lib/utils";

interface MetadataSectionProps {
  metadata: ExtractLegalMetadataOutput["metadata"];
  audioSummary: {
    dataUri?: string;
    isLoading: boolean;
    error?: string;
  };
}

const MetadataItem = ({ title, content, icon: Icon, className }: { title: string, content?: string | null, icon: LucideIcon, className?: string }) => {
    if (!content) return null;
    return (
        <div className={cn("flex items-start gap-3", className)}>
            <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
                <h4 className="font-semibold text-sm">{title}</h4>
                <p className="text-sm text-muted-foreground">{content}</p>
            </div>
        </div>
    )
};

const PartyItem = ({ name, role }: { name: string, role: string }) => (
    <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-sm">{name}</span>
        <Badge variant="outline" className="text-xs">{role}</Badge>
    </div>
);


export function MetadataSection({ metadata, audioSummary }: MetadataSectionProps) {
  const [showAudio, setShowAudio] = useState(false);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div className="flex-1">
                <CardTitle className="flex items-center gap-3">
                  <FileText className="h-6 w-6" />
                  Document Overview
                </CardTitle>
                <CardDescription>{metadata.summary || "A summary of the document."}</CardDescription>
            </div>
            {audioSummary.isLoading ? (
                 <Button variant="outline" size="sm" disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Audio
                </Button>
            ) : audioSummary.dataUri ? (
                <Button variant="outline" size="sm" onClick={() => setShowAudio(!showAudio)}>
                    <Volume2 className="mr-2 h-4 w-4" />
                    {showAudio ? 'Hide Player' : 'Listen to Summary'}
                </Button>
            ) : audioSummary.error ? (
                 <Badge variant="destructive" className="flex items-center gap-2 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    Audio Failed
                </Badge>
            ) : null}
        </div>
        {showAudio && audioSummary.dataUri && (
             <div className="mt-4">
                <audio controls className="w-full h-10">
                    <source src={audioSummary.dataUri} type="audio/wav" />
                    Your browser does not support the audio element.
                </audio>
            </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <MetadataItem title="Document Title" content={metadata.documentTitle} icon={FileSignature} />
            <MetadataItem title="Document Type" content={metadata.documentType} icon={FileText} />
            <MetadataItem title="Effective Date" content={metadata.effectiveDate} icon={CalendarDays} />
            <MetadataItem title="Term / Duration" content={metadata.term} icon={Gavel} />
            <MetadataItem title="Governing Law" content={metadata.governingLaw} icon={Scale} />
        </div>
        
        {metadata.parties && metadata.parties.length > 0 && (
            <div>
                <h4 className="font-semibold flex items-center gap-2 text-sm mb-3"><Users className="h-4 w-4 text-muted-foreground" /> Parties Involved</h4>
                <div className="flex flex-wrap gap-4">
                    {metadata.parties.map((party, index) => (
                        <PartyItem key={index} name={party.name} role={party.role} />
                    ))}
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
