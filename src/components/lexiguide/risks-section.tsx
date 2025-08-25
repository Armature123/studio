import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type { HighlightRisksOutput } from "@/ai/flows/highlight-risks";

interface RisksSectionProps {
  risks: HighlightRisksOutput["risks"];
}

const severityVariant: Record<string, "default" | "secondary" | "destructive"> = {
    high: 'destructive',
    medium: 'default',
    low: 'secondary'
}

const severityText: Record<string, string> = {
    high: 'High',
    medium: 'Medium',
    low: 'Low'
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
        <CardTitle>Risk Highlights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {risks.map((item, index) => (
          <Alert key={index} variant={item.severity === 'high' || item.severity === 'medium' ? "destructive" : "default"}>
            <div className="flex justify-between items-start">
              <AlertTitle className="mb-1 flex-grow pr-4">{item.risk}</AlertTitle>
              <Badge variant={severityVariant[item.severity] || 'secondary'}>{severityText[item.severity] || 'Unknown'}</Badge>
            </div>
            <AlertDescription>
                {item.explanation}
                {item.location && <div className="mt-2 text-xs text-muted-foreground"><strong>Location:</strong> {item.location}</div>}
            </AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}
