import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, X, Bot, User, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/i18n';
import { useToast } from '@/components/ui/use-toast';

// NOTE: For a production app, the API key should be handled via a secure backend/edge function
const getGenAI = () => {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) return null;
    return new GoogleGenerativeAI(key);
};


interface Message {
    role: 'user' | 'model';
    content: string;
}

const AIChatAssistant = () => {
    const { lang } = useLanguage();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'model',
            content: lang === 'en'
                ? "Hello! I'm your Kigezi Vet AI Assistant. How can I help you with your livestock or crops today?"
                : "Murembe! Ndi AI Assistant ya Kigezi Vet. Noobaasa nkwongera ho mbeera ki?"
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages, isOpen, isMinimized]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        if (!import.meta.env.VITE_GEMINI_API_KEY) {
            toast({
                title: "API Key Missing",
                description: "Please configure VITE_GEMINI_API_KEY in your .env file to use the AI Assistant.",
                variant: "destructive"
            });
            return;
        }

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        const genAI = getGenAI();
        if (!genAI) {
            toast({
                title: "Configuration Error",
                description: "AI key is missing or invalid. Please check your settings.",
                variant: "destructive"
            });
            setIsLoading(false);
            return;
        }

        const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];
        let lastError: any = null;
        let success = false;

        for (const modelName of modelsToTry) {
            if (success) break;

            try {
                console.log(`Attempting to use AI model: ${modelName}`);
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction: `You are an expert veterinary and agricultural assistant for the Kigezi Vet platform in Uganda. 
            Your goal is to help farmers in the Kigezi region with livestock health, crop management, and general veterinary advice.
            Provide practical, scientifically sound, and localized advice. 
            If a situation sounds critical, always recommend contacting a professional veterinarian through the Kigezi Vet 'Contact' or 'Chat' pages.
            Keep your responses concise and helpful. 
            You can communicate in English and Rukiga. 
            Current language setting: ${lang}.`
                });

                const history = messages.length > 1
                    ? messages.map(m => ({
                        role: m.role,
                        parts: [{ text: m.content }],
                    }))
                    : [];

                const chat = model.startChat({ history });
                const result = await chat.sendMessage(userMessage);
                const response = await result.response;
                const text = response.text();

                setMessages(prev => [...prev, { role: 'model', content: text }]);
                success = true;
                console.log(`Successfully connected using model: ${modelName}`);
            } catch (error: any) {
                lastError = error;
                console.error(`Error with model ${modelName}:`, error);
                if (error?.message?.includes('404') || error?.message?.includes('not found')) {
                    console.warn(`Model ${modelName} not found, trying next option...`);
                    continue;
                }
                break; // If it's not a 404, it might be a key or quota issue, so stop.
            }
        }

        if (!success) {
            let errorMessage = "I'm sorry, I'm having trouble connecting right now. Please try again later.";

            if (lastError?.message?.includes('404') || lastError?.message?.includes('not found')) {
                errorMessage = "AI models unavailable. This usually happens if the API key is restricted or new. Please verify it in Google AI Studio.";
            } else if (lastError?.message?.includes('API key not valid')) {
                errorMessage = "The AI API key appears to be invalid. Please check your .env file.";
            } else if (lastError?.message?.includes('quota')) {
                errorMessage = "AI usage quota exceeded. Please try again later.";
            }

            setMessages(prev => [...prev, {
                role: 'model',
                content: errorMessage
            }]);
        }

        setIsLoading(false);


    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl hover:scale-110 transition-all z-[60] bg-primary group"
            >
                <Sparkles className="h-6 w-6 text-white group-hover:animate-pulse" />
            </Button>
        );
    }

    return (
        <Card className={`fixed bottom-6 right-6 z-[60] w-[90vw] md:w-[400px] shadow-2xl transition-all duration-300 border-primary/20 bg-background/95 backdrop-blur-xl ${isMinimized ? 'h-14 overflow-hidden' : 'h-[500px] flex flex-col'}`}>
            <CardHeader className="p-4 border-b bg-primary text-white flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    <CardTitle className="text-sm font-bold uppercase tracking-wider">AI Vet Assistant</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setIsMinimized(!isMinimized)}>
                        {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setIsOpen(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            {!isMinimized && (
                <>
                    <CardContent className="flex-1 overflow-hidden p-0">
                        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                            <div className="space-y-4">
                                {messages.map((m, i) => (
                                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-secondary' : 'bg-primary'}`}>
                                                {m.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
                                            </div>
                                            <div className={`rounded-2xl p-3 text-sm shadow-sm ${m.role === 'user' ? 'bg-secondary text-white rounded-tr-none' : 'bg-muted text-foreground rounded-tl-none border border-primary/10'}`}>
                                                {m.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="flex gap-2 max-w-[85%]">
                                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                                                <Loader2 className="h-4 w-4 text-white animate-spin" />
                                            </div>
                                            <div className="bg-muted rounded-2xl p-3 text-sm rounded-tl-none border border-primary/10 italic text-foreground/60">
                                                Thinking...
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>

                    <CardFooter className="p-3 border-t bg-muted/30">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex w-full gap-2"
                        >
                            <Input
                                placeholder="Ask me anything..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-1 bg-background/50 border-primary/10 focus-visible:ring-primary"
                                disabled={isLoading}
                            />
                            <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="h-9 w-9 bg-primary hover:bg-primary/90">
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </>
            )}
        </Card>
    );
};

export default AIChatAssistant;
