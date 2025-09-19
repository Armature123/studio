
"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Files, FileText, X, GitCompareArrows, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

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

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };
  
  return (
    <div className="flex-1 space-y-2">
       <Label htmlFor={id} className="text-center w-full block">{title}</Label>
      <input
        type="file"
        id={id}
        ref={fileInputRef}
        onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileSelect(e.target.files ? e.target.files[0] : null)}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt"
      />
      {!file ? (
        <label
          htmlFor={id}
          className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted transition-colors ${isDragging ? 'border-primary' : 'border-border'}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center text-center p-2">
            <Files className="w-8 h-8 mb-2 text-primary" />
            <p className="text-sm text-muted-foreground"><span className="font-semibold text-primary">Click or drag</span> file</p>
            <p className="text-xs text-muted-foreground">PDF, DOCX, or TXT</p>
          </div>
        </label>
      ) : (
         <div className="flex items-center justify-between w-full h-48 px-4 border rounded-lg bg-muted/50">
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
  const [retention, setRetention] = useState("7d");
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
    formData.append("instructions", instructions);
    onCompare(formData);
  };

  return (
    <Card className="max-w-4xl mx-auto bg-card animate-fade-in-up">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit mb-4">
          <GitCompareArrows className="h-8 w-8 text-accent" />
        </div>
        <CardTitle className="text-foreground">Compare Legal Documents</CardTitle>
        <CardDescription>Upload two documents to see a side-by-side clause comparison.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <FileUploadArea file={fileA} onFileChange={setFileA} title="Document A" id="file-a" />
            <FileUploadArea file={fileB} onFileChange={setFileB} title="Document B" id="file-b" />
          </div>

          <Separator />
          
           <div className="space-y-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-6 w-6 mt-1 text-green-600"/>
                <div>
                    <h4 className="font-medium text-primary">Data &amp; Privacy</h4>
                    <p className="text-sm text-muted-foreground">Your document is processed securely and is not used to train our models. It will be automatically deleted after the selected retention period.</p>
                </div>
              </div>

              <div className="space-y-2">
                  <Label htmlFor="retention">Data Retention Period</Label>
                  <Select value={retention} onValueChange={setRetention}>
                      <SelectTrigger id="retention" className="w-full">
                          <SelectValue placeholder="Select retention period" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="24h">24 Hours</SelectItem>
                          <SelectItem value="7d">7 Days (Default)</SelectItem>
                          <SelectItem value="30d">30 Days</SelectItem>
                      </SelectContent>
                  </Select>
              </div>

              <div className="flex items-start space-x-3">
                  <Checkbox id="consent" checked={consent} onCheckedChange={(checked) => setConsent(checked as boolean)} className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="consent" className="font-normal">
                          I acknowledge that this tool provides guidance and not legal advice. I agree to the <Link href="#" className="underline text-primary">Terms of Service</Link>.
                      </Label>
                  </div>
              </div>
          </div>
          
          <Separator />

          <div className="space-y-2">
            <Label htmlFor="instructions" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Optional: Special instructions for the AI?
            </Label>
            <Textarea
              id="instructions"
              placeholder="e.g., 'Focus on intellectual property clauses' or 'Pay special attention to liability caps'"
              className="h-24"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>


          <Button type="submit" className="w-full" size="lg" disabled={!fileA || !fileB || !consent}>
            Compare Documents
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
