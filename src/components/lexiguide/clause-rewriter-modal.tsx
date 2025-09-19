
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { rewriteClauseAction } from "@/app/actions";
import type { RewriteClauseOutput } from "@/ai/flows/rewrite-clause-flow";
import { Loader2, Copy, Check, Sparkles } from "lucide-react";
import { FavorabilityBar } from "./favorability-bar";

export interface RewriteClauseData {
  clause: string;
  context?: string;
}

interface ClauseRewriterModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: RewriteClauseData;
}

export function ClauseRewriterModal({ isOpen, onClose, data }: ClauseRewriterModalProps) {
  const [result, setResult] = useState<RewriteClauseOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      handleRewrite();
    } else {
        // Reset state when closing
        setResult(null);
        setIsLoading(false);
        setError(null);
        setCopied(false);
    }
  }, [isOpen]);

  const handleRewrite = async () => {
    setIsLoading(true);
    setError(null);
    const response = await rewriteClauseAction(data.clause, data.context);
    if ("error" in response) {
      setError(response.error);
      toast({
        variant: "destructive",
        title: "Rewrite Failed",
        description: response.error,
      });
    } else {
      setResult(response);
    }
    setIsLoading(false);
  };

  const handleCopy = () => {
    if (result?.rewritten.text) {
      navigator.clipboard.writeText(result.rewritten.text);
      setCopied(true);
      toast({ title: "Copied to clipboard!" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            AI Clause Rewriter
          </DialogTitle>
          <DialogDescription>
            Our AI analyzes and rewrites clauses to be more favorable for you.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center space-y-4 p-8">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Analyzing and rewriting clause...</p>
            </div>
          )}

          {error && !isLoading && (
             <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
              <p className="text-destructive-foreground font-semibold">Rewrite Failed</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={handleRewrite}>Try Again</Button>
            </div>
          )}

          {result && !isLoading && (
            <div className="space-y-6">
                {/* Original Clause */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Original Clause</h3>
                    <FavorabilityBar score={result.original.favorabilityScore} />
                    <blockquote className="border-l-4 border-border pl-4 py-2 text-sm bg-muted/50 rounded-r-lg">
                        {result.original.text}
                    </blockquote>
                </div>

                {/* Rewritten Clause */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-lg">AI-Powered Rewrite</h3>
                    <FavorabilityBar score={result.rewritten.favorabilityScore} />
                    <div className="relative">
                         <blockquote className="border-l-4 border-primary pl-4 pr-12 py-2 text-sm bg-background rounded-r-lg shadow-sm">
                            {result.rewritten.text}
                        </blockquote>
                         <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-8 w-8" onClick={handleCopy}>
                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
                
                 {/* Explanation */}
                <div className="space-y-2 rounded-lg bg-green-50 border border-green-200 p-4">
                    <h4 className="font-semibold text-green-900">Why this is better:</h4>
                    <p className="text-sm text-green-800">{result.rewritten.explanation}</p>
                </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
