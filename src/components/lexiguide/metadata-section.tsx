
import { FileText, CircleDollarSign, CalendarDays, Gavel } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExtractLegalMetadataOutput } from "@/lib/types";

interface MetadataSectionProps {
  metadata: ExtractLegalMetadataOutput["metadata"];
}

const MetadataItem = ({ title, content, icon: Icon }: { title: string, content: string, icon: React.ElementType }) => (
    <div className="space-y-2">
        <h4 className="font-semibold flex items-center gap-2 text-sm"><Icon className="h-4 w-4 text-muted-foreground" /> {title}</h4>
        <p className="text-sm text-muted-foreground pl-6">{content || 'Not specified.'}</p>
    </div>
)

export function MetadataSection({ metadata }: MetadataSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <FileText className="h-6 w-6" />
        <CardTitle>Document Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <MetadataItem title="Key Metadata" content={metadata.keyMetadata} icon={FileText} />
        <MetadataItem title="Money Terms" content={metadata.moneyTerms} icon={CircleDollarSign} />
        <MetadataItem title="Important Dates" content={metadata.dates} icon={CalendarDays} />
        <MetadataItem title="Duties & Obligations" content={metadata.duties} icon={Gavel} />
      </CardContent>
    </Card>
  );
}
