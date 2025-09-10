
"use client";

import { useState, useRef } from "react";
import { FileUp, FileText, X, Scale, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CompareDocumentsFormProps {
  onCompare: (formData: FormData) => void;
}

interface FileDropZoneProps {
  file: File | null;
  setFile: (file: File | null) => void;
  title: string;
  id: string;
}

function FileDropZone({ file, setFile, title, id }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        toast({ variant: "destructive", title: "File too large", description: "Please upload a file smaller than 10MB." });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={cn(
        'text-lg font-semibold',
        id === 'file-a' ? 'text-blue-600' : 'text-purple-600'
      )}>{title}</Label>
       <input
          type="file"
          id={id}
          ref={fileInputRef}
          onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt"
        />
        {!file ? (
          <label
              className={cn(
                  `flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted transition-colors`,
                  isDragging ? 'border-primary' : 'border-border'
              )}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
          >
              <div className="flex flex-col items-center justify-center text-center">
                  <FileUp className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground"><span className="font-semibold text-primary">Click to upload</span> or drag</p>
                  <p className="text-xs text-muted-foreground">PDF, DOCX, or TXT</p>
              </div>
          </label>
        ) : (
          <div className="flex items-center justify-between w-full h-20 px-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                      <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                  <X className="h-5 w-5" />
              </Button>
          </div>
        )}
    </div>
  )
}

export function CompareDocumentsForm({ onCompare }: CompareDocumentsFormProps) {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
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
    
    onCompare(formData);
  };

  return (
    <Card className="max-w-3xl mx-auto bg-card">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit mb-4">
          <Scale className="h-8 w-8" />
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight">Compare Legal Documents</CardTitle>
        <CardDescription className="text-lg text-muted-foreground">Upload two documents to get a side-by-side comparison of key terms and clauses.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-lg border bg-background/50">
            <FileDropZone file={fileA} setFile={setFileA} title="Document A" id="file-a" />
            <FileDropZone file={fileB} setFile={setFileB} title="Document B" id="file-b" />
          </div>

          <div className="space-y-4 rounded-lg border p-4 bg-background">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-6 w-6 mt-1 text-green-600"/>
                <div>
                    <h4 className="font-medium">Data & Privacy</h4>
                    <p className="text-sm text-muted-foreground">Your documents are processed securely and are not used to train our models. They will be automatically deleted after analysis.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 pt-2">
                  <Checkbox id="consent" checked={consent} onCheckedChange={(checked) => setConsent(checked as boolean)} className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="consent" className="font-normal">
                          I acknowledge this tool provides guidance, not legal advice, and agree to the <Link href="#" className="underline text-primary">Terms of Service</Link>.
                      </Label>
                  </div>
              </div>
          </div>

          <Button 
            type="submit" 
            className="w-full mt-2" 
            size="lg" 
            disabled={!consent || !fileA || !fileB}>
            <Scale className="mr-2 h-5 w-5" />
            Compare Documents
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
