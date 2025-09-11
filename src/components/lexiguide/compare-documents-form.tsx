
"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Files, FileText, X, GitCompareArrows, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

interface FileUploadAreaProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  title: string;
  id: string;
}

const FileUploadArea = ({ file, onFileChange, title, id }: FileUploadAreaProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (selectedFile: File | null) => {
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        toast({ variant: "destructive", title: "File too large", description: "Please upload a file smaller than 10MB." });
        return;
      }
      onFileChange(selectedFile);
    }
  };
  
  const commonDragProps = {
    onDragEnter: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); },
    onDragLeave: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); },
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files[0]);
        e.dataTransfer.clearData();
      }
    },
  };

  return (
    <div className="flex-1 space-y-2">
      <Label htmlFor={id}>{title}</Label>
      <input
        type="file"
        id={id}
        ref={fileInputRef}
        onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileSelect(e.target.files ? e.target.files[0] : null)}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt"
      />
      {!file ? (
        <div
          {...commonDragProps}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted transition-colors ${isDragging ? 'border-primary' : 'border-border'}`}
        >
          <div className="flex flex-col items-center justify-center text-center p-2">
            <Files className="w-8 h-8 mb-2 text-primary" />
            <p className="text-xs text-muted-foreground"><span className="font-semibold text-primary">Click or drag</span> file</p>
          </div>
        </div>
      ) : (
        <div {...commonDragProps} className="flex items-center justify-between w-full h-24 px-4 border rounded-lg bg-muted/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <FileText className="h-8 w-8 text-primary flex-shrink-0" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onFileChange(null)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
};


interface CompareDocumentsFormProps {
  onCompare: (formData: FormData) => void;
}

export function CompareDocumentsForm({ onCompare }: CompareDocumentsFormProps) {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [instructions, setInstructions] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fileA || !fileB) {
      toast({ variant: "destructive", title: "Missing documents", description: "Please upload both documents to compare." });
      return;
    }
    const formData = new FormData();
    formData.append("documentA", fileA);
    formData.append("documentB", fileB);
    formData.append("instructions", instructions);
    onCompare(formData);
  };

  return (
    <Card className="max-w-4xl mx-auto bg-card">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit mb-4">
          <GitCompareArrows className="h-8 w-8 text-accent" />
        </div>
        <CardTitle className="text-foreground">Compare Job Offers</CardTitle>
        <CardDescription>Upload two job offers to see which one is more favorable.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <FileUploadArea file={fileA} onFileChange={setFileA} title="Offer A" id="file-a" />
            <FileUploadArea file={fileB} onFileChange={setFileB} title="Offer B" id="file-b" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Optional: What's most important to you?
            </Label>
            <Textarea
              id="instructions"
              placeholder="e.g., 'Focus on the non-compete clause' or 'Compare remote work policies'"
              className="h-24"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={!fileA || !fileB}>
            Compare Offers
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
