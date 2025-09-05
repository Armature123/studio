
"use client";

import { useState } from "react";
import { Bot, User, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { chatWithDocumentAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ChatSectionProps {
  documentDataUri: string;
}

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function ChatSection({ documentDataUri }: ChatSectionProps) {
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
      const result = await chatWithDocumentAction({ documentDataUri, question: input });

      if (result.error) {
        throw new Error(result.error);
      }
      
      const assistantMessage: Message = { role: "assistant", content: result.answer.answer };
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to get a response from the AI.",
      });
       const assistantMessage: Message = { role: "assistant", content: "Sorry, I was unable to process your request." };
       setMessages((prev) => [...prev, assistantMessage]);

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <Bot className="h-6 w-6" />
        <CardTitle>Chat About This Document</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <ScrollArea className="h-[300px] w-full pr-4">
            <div className="space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-muted-foreground pt-16">
                        <Bot className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Ask me anything about the document!</p>
                        <p className="text-xs">e.g., "What are the payment terms?" or "Summarize the termination clause."</p>
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
                        {message.role === "assistant" && (
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>AI</AvatarFallback>
                            </Avatar>
                        )}
                        <div
                        className={cn(
                            "rounded-lg px-4 py-2 max-w-sm",
                            message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                        >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>AI</AvatarFallback>
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
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about the document..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
