
import { AlertTriangle, Handshake, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type { HighlightRisksOutput } from "@/lib/types";

interface RisksSectionProps {
  risks: HighlightRisksOutput["risks"];
}

const severityConfig: Record<string, { variant: "destructive" | "secondary" | "medium", text: string }> = {
    high: { variant: 'destructive', text: 'High' },
    medium: { variant: 'medium', text: 'Medium' },
    low: { variant: 'secondary', text: 'Low' }
}

export function RisksSection({ risks }: RisksSectionProps) {
  if (!risks || risks.length === 0) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <ShieldAlert className="h-6 w-6 text-accent" />
                <CardTitle>Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">No significant risks were identified in this document.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <AlertTriangle className="h-6 w-6 text-destructive" />
        <CardTitle>Risk & Negotiation Highlights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {risks.map((item, index) => {
            const config = severityConfig[item.severity] || { variant: 'secondary', text: 'Unknown'};
            return (
              <Alert key={index} variant={item.severity === 'high' ? "destructive" : "default"}>
                <div className="flex justify-between items-start">
                  <AlertTitle className="mb-1 flex-grow pr-4">{item.risk}</AlertTitle>
                  <Badge variant={config.variant}>
                    {config.text}
                  </Badge>
                </div>
                <AlertDescription>
                    <p>{item.explanation}</p>
                    {item.location && <div className="mt-2 text-xs text-muted-foreground"><strong>Location:</strong> {item.location}</div>}
                    {item.negotiationAdvice && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <h4 className="font-semibold flex items-center gap-2 text-sm mb-1"><Handshake className="h-4 w-4" /> Negotiation Advice</h4>
                        <p className="text-sm text-foreground/80">{item.negotiationAdvice}</p>
                      </div>
                    )}
                </AlertDescription>
              </Alert>
            );
        })}
      </CardContent>
    </Card>
  );
}
