"use client";

import { useState, useRef } from "react";
import { FileUp, FileText, X, ClipboardPaste } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface FileUploadFormProps {
  onAnalyze: (formData: FormData) => void;
}

export function FileUploadForm({ onAnalyze }: FileUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [activeTab, setActiveTab] = useState("file");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      setFile(selectedFile);
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
      handleFileChange(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    
    if (activeTab === 'file') {
      if (!file) {
        toast({ variant: "destructive", title: "No file selected", description: "Please select a document to analyze."});
        return;
      }
      formData.append("document", file);
    } else {
      if (!text.trim()) {
        toast({ variant: "destructive", title: "No text provided", description: "Please paste the document text to analyze."});
        return;
      }
      formData.append("documentText", text);
    }
    
    onAnalyze(formData);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit mb-4">
          <FileUp className="h-8 w-8" />
        </div>
        <CardTitle>Analyze Your Legal Document</CardTitle>
        <CardDescription>Upload a document or paste text to get AI-powered insights, summaries, and risk assessments.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">
              <FileUp className="mr-2 h-4 w-4" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="text">
              <ClipboardPaste className="mr-2 h-4 w-4" />
              Paste Text
            </TabsTrigger>
          </TabsList>
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <TabsContent value="file" className="m-0 p-0">
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
                className="hidden"
                accept=".pdf,.doc,.docx" 
              />
              {!file ? (
                 <label
                    htmlFor="file-upload"
                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition-colors ${isDragging ? 'border-primary' : 'border-border'}`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                 >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                        <FileUp className="w-10 h-10 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold text-primary">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-muted-foreground">PDF or DOCX (Demo only)</p>
                    </div>
                </label>
              ) : (
                <div className="flex items-center justify-between w-full h-24 px-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary" />
                        <div>
                            <p className="text-sm font-medium truncate max-w-xs">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="text" className="m-0 p-0">
               <Textarea 
                placeholder="Paste your legal document text here..." 
                className="h-48"
                value={text}
                onChange={(e) => setText(e.target.value)}
               />
            </TabsContent>
            
            <Button type="submit" className="w-full" size="lg" disabled={(activeTab === 'file' && !file) || (activeTab === 'text' && !text.trim())}>
              Analyze Document
            </Button>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
