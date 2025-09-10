
"use client";

import { useState } from "react";
import { Bot, MessageSquare, Send, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { chatWithDocumentAction, askLegalQuestion } from "@/app/actions";

type Message = {
  role: "user" | "model";
  content: string;
};

interface LegalChatbotWidgetProps {
    documentDataUri?: string;
}

export function LegalChatbotWidget({ documentDataUri }: LegalChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let result;
      if (documentDataUri) {
         result = await chatWithDocumentAction({ documentDataUri, question: input });
      } else {
         const chatHistory = messages.map(m => ({role: m.role, content: m.content}));
         result = await askLegalQuestion({ question: input, history: chatHistory });
      }
      

      if (result.error) {
        throw new Error(result.error);
      }
      
      const assistantMessage: Message = { role: "model", content: result.answer.answer };
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to get a response from the AI.",
      });
       const assistantMessage: Message = { role: "model", content: "Sorry, I was unable to process your request." };
       setMessages((prev) => [...prev, assistantMessage]);

    } finally {
      setIsLoading(false);
    }
  };
  
  const title = documentDataUri ? "Chat About This Document" : "Legal AI Assistant";
  const description = documentDataUri ? "Ask me anything about the document!" : "Ask any general legal questions.";
  const placeholder = documentDataUri ? "e.g., What are the payment terms?" : "e.g., What is a non-disclosure agreement?";

  return (
    <div className="fixed bottom-4 right-4 z-50">
        {isOpen && (
            <Card className="w-[350px] h-[500px] flex flex-col shadow-2xl">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="space-y-1.5">
                        <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" /> {title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                     <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-4">
                    <ScrollArea className="flex-1 pr-4 -mr-4">
                        <div className="space-y-4">
                            {messages.length === 0 && (
                                <div className="text-center text-muted-foreground pt-24">
                                    <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Ask a question to start.</p>
                                    <p className="text-xs">{placeholder}</p>
                                </div>
                            )}
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                    "flex gap-3",
                                    message.role === "user" ? "justify-end" : "justify-start"
                                    )}
                                >
                                    {message.role === "model" && (
                                        <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                                            <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div
                                    className={cn(
                                        "rounded-lg px-3 py-2 max-w-sm text-sm",
                                        message.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"
                                    )}
                                    >
                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                    {message.role === "user" && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>
                                                <User className="h-5 w-5"/>
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-3 justify-start">
                                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                                        <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                                    </Avatar>
                                    <div className="rounded-lg px-4 py-2 bg-muted">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                                            <span className="h-2 w-2 rounded-full bg-primary animate-pulse delay-75"></span>
                                            <span className="h-2 w-2 rounded-full bg-primary animate-pulse delay-150"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                    <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t pt-4 mt-2">
                        <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question..."
                        disabled={isLoading}
                        className="flex-1"
                        />
                        <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
                        <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </CardContent>
            </Card>
        )}
        <Button onClick={() => setIsOpen(!isOpen)} size="icon" className="rounded-full w-14 h-14 shadow-lg">
            {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        </Button>
    </div>
  );
}
