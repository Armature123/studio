
"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, MessageSquare, Send, X, User, Minimize, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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

function ChatContent({ documentDataUri, messages, setMessages, input, setInput, isLoading, setIsLoading, title, placeholder }: {
    documentDataUri?: string;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    input: string;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    title: string;
    placeholder: string;
}) {
    const { toast } = useToast();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);
    
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

    return (
        <div className="flex flex-col h-full">
            <ScrollArea className="flex-1" ref={scrollAreaRef}>
                <div className="p-4 space-y-4">
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
                                    "rounded-lg px-3 py-2 max-w-sm text-sm break-words",
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
            <div className="border-t p-4">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
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
            </div>
        </div>
    );
}

export function LegalChatbotWidget({ documentDataUri }: LegalChatbotWidgetProps) {
    const [isWidgetOpen, setIsWidgetOpen] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const title = documentDataUri ? "Chat About This Document" : "Legal AI Assistant";
    const description = documentDataUri ? "Ask me anything about the document!" : "Ask any general legal questions.";
    const placeholder = documentDataUri ? "e.g., What are the payment terms?" : "e.g., What is a non-disclosure agreement?";

    const chatProps = { documentDataUri, messages, setMessages, input, setInput, isLoading, setIsLoading, title, placeholder };

    const handleClose = () => {
        setIsWidgetOpen(false);
        setIsFullScreen(false);
    }
    
    return (
        <div className="fixed bottom-4 right-4 z-50">
            {isWidgetOpen && !isFullScreen && (
                <Card className="w-[350px] h-[500px] flex flex-col shadow-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
                        <div className="space-y-1.5">
                            <CardTitle className="flex items-center gap-2 text-base"><Bot className="h-5 w-5" /> {title}</CardTitle>
                            <CardDescription className="text-xs">{description}</CardDescription>
                        </div>
                        <div className="flex items-center">
                            <Button variant="ghost" size="icon" onClick={() => setIsFullScreen(true)} className="h-8 w-8">
                                <Expand className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                       <ChatContent {...chatProps} />
                    </CardContent>
                </Card>
            )}

            <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
                <DialogContent className="h-[90vh] max-w-[90vw] md:max-w-4xl flex flex-col p-0 gap-0">
                    <DialogHeader className="flex-row items-center justify-between p-4 border-b">
                       <div className="space-y-1.5">
                         <DialogTitle className="flex items-center gap-2">{title}</DialogTitle>
                         <DialogDescription>{description}</DialogDescription>
                       </div>
                       <div className="flex items-center">
                            <Button variant="ghost" size="icon" onClick={() => setIsFullScreen(false)} className="h-8 w-8">
                                <Minimize className="h-4 w-4" />
                            </Button>
                             <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
                                <X className="h-4 w-4" />
                            </Button>
                       </div>
                    </DialogHeader>
                    <div className="flex-1 min-h-0">
                        <ChatContent {...chatProps} />
                    </div>
                </DialogContent>
            </Dialog>

            {!isWidgetOpen && (
                 <Button onClick={() => setIsWidgetOpen(true)} size="icon" className="rounded-full w-14 h-14 shadow-lg">
                    <MessageSquare className="h-6 w-6" />
                </Button>
            )}
        </div>
    );
}
