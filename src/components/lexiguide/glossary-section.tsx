
import { BookMarked } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type DefinitionItem = {
    term: string;
    definition: string;
}

interface GlossarySectionProps {
  definitions: DefinitionItem[];
}


export function GlossarySection({ definitions }: GlossarySectionProps) {
  if (!definitions || definitions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <BookMarked className="h-6 w-6" />
        <CardTitle>Legal Glossary</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
            {definitions.map((item, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger>{item.term}</AccordionTrigger>
                    <AccordionContent>{item.definition}</AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
