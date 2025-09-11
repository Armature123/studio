
"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { askLegalQuestionAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { homeFacts } from "@/lib/home-facts";
import { usePathname } from "next/navigation";

type Message = {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  isTyping?: boolean;
};

export function LegalChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const pathname = usePathname();

  useEffect(() => {
    // This effect runs on the client after mount, safely accessing `document`.
    const checkAnalysis = () => {
      const hasReport = !!document.getElementById('report') || !!document.getElementById('comparison-report');
      setHasAnalysis(hasReport);
    };

    // Run on mount and whenever the path changes
    checkAnalysis();
    
    // We can also use a MutationObserver to detect when the report is added to the DOM
    const observer = new MutationObserver(checkAnalysis);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [pathname]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    // Reset chat when sheet is opened/closed or path changes
    if (!isOpen) {
        setMessages([]);
        setInput('');
    }
  }, [isOpen, pathname]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isSending) return;

    const now = Date.now();
    if (now - lastMessageTime < 10000) { // 10 second rate limit
        toast({
            variant: "destructive",
            title: "Rate Limit Exceeded",
            description: "Slow down—one question at a time.",
        });
        return;
    }
    
    setIsSending(true);
    setLastMessageTime(now);

    const userMessage: Message = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage, { id: Date.now() + 1, sender: 'bot', text: '', isTyping: true }]);
    setInput('');

    try {
      let pageContext: string | undefined;
      const pageContentElement = document.getElementById('page-content');
      
      if (pageContentElement && hasAnalysis) {
        pageContext = pageContentElement.innerText;
      }
      
      const result = await askLegalQuestionAction({
        query: userMessage.text,
        context: pageContext,
        homeFacts: !pageContext ? homeFacts : undefined,
      });

      const botMessage: Message = { id: Date.now(), sender: 'bot', text: result.reply };
      
      setMessages(prev => prev.slice(0, -1).concat(botMessage));

    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = { id: Date.now(), sender: 'bot', text: "Sorry, I can only answer legal questions." };
      setMessages(prev => prev.slice(0, -1).concat(errorMessage));
       toast({
        variant: "destructive",
        title: "Error",
        description: "I can only answer legal questions.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Button
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 z-50 pl-4 pr-5"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-7 w-7" /> : <><Bot className="h-7 w-7 mr-2" /> <span>Ask LexiBot</span></>}
        <span className="sr-only">{isOpen ? "Close Chat" : "Open Legal Chat"}</span>
      </Button>

      {isOpen && (
         <div className="fixed bottom-24 right-4 md:right-6 w-full max-w-md h-[70vh] max-h-[700px] z-50">
            <Sheet open={true} onOpenChange={setIsOpen}>
                <SheetContent 
                side="right" 
                className="bg-background/80 backdrop-blur-xl rounded-2xl p-0 h-full w-full border-2 border-border shadow-2xl flex flex-col"
                >
                <div className="flex flex-col h-full">
                    <SheetHeader className="p-4 border-b text-left sticky top-0 bg-background/90 backdrop-blur-lg">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Bot className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <SheetTitle className="text-lg font-semibold text-foreground">Chat About This Document</SheetTitle>
                            <p className="text-sm text-muted-foreground">Ask me anything about the document!</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="ml-auto">
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close</span>
                        </Button>
                    </div>
                    </SheetHeader>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {messages.length === 0 && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center text-muted-foreground">
                                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50"/>
                                <p>Hi! I'm LexiBot.</p>
                                <p className="text-xs">{hasAnalysis ? "Ask me about the content on this page." : "Ask me about Indian legal docs."}</p>
                            </div>
                        </div>
                    )}
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn("flex items-start gap-3 w-full", msg.sender === 'user' ? "justify-end" : "justify-start")}>
                            {msg.sender === 'bot' && <Bot className="h-8 w-8 text-primary flex-shrink-0 mt-1 p-1.5 bg-primary/10 rounded-full" />}
                            <div
                                className={cn(
                                "max-w-xs md:max-w-sm p-3 rounded-2xl text-sm leading-relaxed",
                                msg.sender === 'user' ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted text-foreground rounded-bl-none",
                                msg.isTyping && "animate-pulse"
                                )}
                            >
                                {msg.isTyping ? '...' : msg.text}
                            </div>
                            {msg.sender === 'user' && <User className="h-8 w-8 text-foreground flex-shrink-0 mt-1 p-1.5 bg-muted rounded-full" />}
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                    </div>

                    <div className="p-4 border-t bg-background/90 sticky bottom-0">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="E.g., What does ‘indemnify’ mean?"
                        className="flex-1"
                        disabled={isSending}
                        />
                        <Button type="submit" size="icon" disabled={!input.trim() || isSending}>
                        <Send className="h-5 w-5" />
                        <span className="sr-only">Send</span>
                        </Button>
                    </form>
                    </div>
                </div>
                </SheetContent>
            </Sheet>
         </div>
      )}
    </>
  );
}
