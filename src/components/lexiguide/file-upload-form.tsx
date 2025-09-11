
"use client";

import { useState, useRef } from "react";
import { FileUp, FileText, X, ClipboardPaste, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

interface FileUploadFormProps {
  onAnalyze: (formData: FormData) => void;
}

export function FileUploadForm({ onAnalyze }: FileUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("English");
  const [retention, setRetention] = useState("7d");
  const [consent, setConsent] = useState(false);
  const [activeTab, setActiveTab] = useState("file");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      // Basic validation for demo purposes
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        toast({ variant: "destructive", title: "File too large", description: "Please upload a file smaller than 10MB."});
        return;
      }
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
      const textFile = new File([text], "pasted-text.txt", { type: "text/plain" });
      formData.append("document", textFile);
    }
    formData.append("language", language);
    formData.append("retention", retention);
    
    onAnalyze(formData);
  };

  return (
    <Card className="max-w-2xl mx-auto bg-card">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit mb-4">
          <FileUp className="h-8 w-8 text-accent" />
        </div>
        <CardTitle className="text-foreground">Analyze Your Legal Document</CardTitle>
        <CardDescription>Get AI-powered insights, summaries, and risk assessments.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
            <div className="mt-6 space-y-4">
              <TabsContent value="file" className="m-0 p-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                />
                {!file ? (
                  <label
                      htmlFor="file-upload"
                      className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted transition-colors ${isDragging ? 'border-primary' : 'border-border'}`}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                  >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                          <FileUp className="w-10 h-10 mb-3 text-primary" />
                          <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold text-primary">Click to upload</span> or drag and drop</p>
                          <p className="text-xs text-muted-foreground">PDF, DOCX, or TXT</p>
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
            </div>
          </Tabs>
          
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
            <Label htmlFor="language">Summary Language</Label>
            <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language" className="w-full">
                    <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Kannada">Kannada</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="Tamil">Tamil</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                </SelectContent>
            </Select>
          </div>


          <Button 
            type="submit" 
            className="w-full mt-6" 
            size="lg" 
            disabled={
                !consent ||
                ((activeTab === 'file' && !file) || (activeTab === 'text' && !text.trim()))
            }>
            Analyze Document
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
