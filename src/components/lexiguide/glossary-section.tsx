import { BookMarked } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface GlossarySectionProps {
  definitions: string;
}

type DefinitionItem = {
    term: string;
    definition: string;
}

function parseDefinitions(text: string): DefinitionItem[] {
  if (!text || typeof text !== 'string') return [];
  try {
    // Attempt to parse as JSON if it's a JSON string
    if (text.trim().startsWith('[')) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.every(item => typeof item.term === 'string' && typeof item.definition === 'string')) {
            return parsed;
        }
    }

    // Fallback to text parsing
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.includes(':'))
      .map(line => {
        const [term, ...definitionParts] = line.split(':');
        const definition = definitionParts.join(':').trim();
        return { term: term.replace(/^- /, '').trim(), definition };
      })
      .filter(item => item.term && item.definition);
  } catch (e) {
      console.error("Failed to parse definitions:", e);
      return [];
  }
}

export function GlossarySection({ definitions }: GlossarySectionProps) {
  const parsedDefs = parseDefinitions(definitions);

  if (parsedDefs.length === 0) {
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
            {parsedDefs.map((item, index) => (
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
