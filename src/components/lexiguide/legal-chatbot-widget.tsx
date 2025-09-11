
"use client";

import { useState, useRef, useEffect } from "react";
import { Scale, Send, Bot, User, X } from "lucide-react";
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
    // This code runs only on the client, after the component has mounted.
    // This is the safe place to access the `document` object.
    setHasAnalysis(!!document.getElementById('report') || !!document.getElementById('comparison-report'));
  }, [pathname, messages]); // Re-check when path or messages change

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    // Reset chat when sheet is opened/closed or path changes
    setMessages([]);
    setInput('');
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
      const isContentAvailable = hasAnalysis;

      if (isContentAvailable) {
        const pageContentElement = document.getElementById('page-content');
        pageContext = pageContentElement ? pageContentElement.innerText : undefined;
      }
      
      const result = await askLegalQuestionAction({
        query: userMessage.text,
        context: isContentAvailable ? pageContext : undefined,
        homeFacts: !isContentAvailable ? homeFacts : undefined,
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
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 h-14 w-14 rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-800 z-50"
        size="icon"
        onClick={() => setIsOpen(true)}
      >
        <Scale className="h-7 w-7" />
        <span className="sr-only">Open Legal Chat</span>
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent 
          side="bottom" 
          className="bg-white/70 backdrop-blur-xl rounded-t-3xl p-0 h-full max-h-[60vh] w-full max-w-lg mx-auto border-t-2 border-slate-200"
          style={{ boxShadow: '0 -10px 30px -15px rgba(0, 0, 0, 0.2)' }}
        >
          <div className="flex flex-col h-full">
            <SheetHeader className="p-4 border-b text-left sticky top-0 bg-white/80 backdrop-blur-lg rounded-t-3xl">
              <div className="flex justify-between items-center">
                <SheetTitle className="text-lg font-semibold text-slate-800">Ask LexiBot</SheetTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
              <p className="text-sm text-slate-500">Ask a question about this page or general legal terms.</p>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center text-slate-500">
                        <Bot className="h-12 w-12 mx-auto mb-2 opacity-50"/>
                        <p>Hi! I'm LexiBot.</p>
                        <p className="text-xs">{hasAnalysis ? "Ask me about the content on this page." : "Ask me about Indian legal docs."}</p>
                    </div>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex items-start gap-3", msg.sender === 'user' ? "justify-end" : "justify-start")}>
                  {msg.sender === 'bot' && <Bot className="h-6 w-6 text-slate-500 flex-shrink-0 mt-1" />}
                  <div
                    className={cn(
                      "max-w-xs md:max-w-md p-3 rounded-2xl text-sm leading-relaxed",
                      msg.sender === 'user' ? "bg-orange-500 text-white rounded-br-none" : "bg-slate-200 text-slate-800 rounded-bl-none",
                      msg.isTyping && "animate-pulse"
                    )}
                  >
                    {msg.isTyping ? '...' : msg.text}
                  </div>
                   {msg.sender === 'user' && <User className="h-6 w-6 text-slate-500 flex-shrink-0 mt-1" />}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t bg-white/80 sticky bottom-0">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="E.g., What does 'indemnify' mean?"
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
    </>
  );
}
