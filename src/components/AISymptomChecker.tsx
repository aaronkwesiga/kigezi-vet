import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Stethoscope, AlertTriangle, CheckCircle2, ChevronRight, Loader2, RefreshCcw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const getGenAI = () => {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) return null;
    return new GoogleGenerativeAI(key);
};


const commonSymptoms = [
    { id: 'fever', label: 'Fever / High Temperature' },
    { id: 'no_appetite', label: 'Loss of Appetite' },
    { id: 'coughing', label: 'Coughing / Respiratory distress' },
    { id: 'diarrhea', label: 'Diarrhea' },
    { id: 'lameness', label: 'Lameness / Difficulty walking' },
    { id: 'skin_lesions', label: 'Skin lesions / Sores' },
    { id: 'lethargy', label: 'Lethargy / Weakness' },
    { id: 'decreased_milk', label: 'Decreased Milk Production' },
];

const AISymptomChecker = () => {
    const { toast } = useToast();
    const [animalType, setAnimalType] = useState('');
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState<string | null>(null);

    const toggleSymptom = (id: string) => {
        setSelectedSymptoms(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleCheck = async () => {
        if (!animalType || selectedSymptoms.length === 0) {
            toast({
                title: "Missing Information",
                description: "Please specify the animal type and at least one symptom.",
                variant: "destructive"
            });
            return;
        }

        if (!import.meta.env.VITE_GEMINI_API_KEY) {
            toast({
                title: "API Key Missing",
                description: "Please configure VITE_GEMINI_API_KEY to use the Symptom Checker.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        const genAI = getGenAI();
        if (!genAI) {
            toast({
                title: "Configuration Error",
                description: "AI key is missing. Please check your .env file.",
                variant: "destructive"
            });
            setLoading(false);
            return;
        }

        const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-flash-latest", "gemini-pro-latest", "gemini-pro"];

        let lastError: any = null;
        let success = false;

        for (const modelName of modelsToTry) {
            if (success) break;

            try {
                console.log(`Symptom Checker: Attempting model ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const prompt = `As a veterinary assistant, analyze these symptoms for a ${animalType}:
        Symptoms: ${selectedSymptoms.join(', ')}
        Additional details: ${additionalInfo}
        
        Provide:
        1. Potential conditions (disclaimer that this is not a final diagnosis).
        2. Immediate steps the farmer can take.
        3. Urgency level (Normal, High, Emergency).
        4. Suggest contacting a vet if appropriate.
        
        Format with clear headings and bullet points.`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                setPrediction(response.text());
                success = true;
                console.log(`Symptom Checker: Success with model ${modelName}`);
            } catch (error: any) {
                lastError = error;
                console.error(`Symptom Checker error with ${modelName}:`, error);
                if (error?.message?.includes('404') || error?.message?.includes('not found')) {
                    continue;
                }
                break;
            }
        }

        if (!success) {
            let msg = "Failed to get AI analysis. ";
            if (lastError?.message?.includes('not found') || lastError?.message?.includes('404')) {
                msg += "AI models currently unavailable for this key. Please verify model access in Google AI Studio.";
            } else {
                msg += `Error details: ${lastError?.message || 'Unknown'}`;
            }
            toast({
                title: "AI Service Error",
                description: msg,
                variant: "destructive"
            });

        }

        setLoading(false);
    };

    const reset = () => {
        setPrediction(null);
        setAnimalType('');
        setSelectedSymptoms([]);
        setAdditionalInfo('');
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex items-center gap-3 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                    <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Livestock Symptom Checker</h1>
                    <p className="text-muted-foreground">Get instant preliminary health guidance powered by AI.</p>
                </div>
            </div>

            {!prediction ? (
                <Card className="border-primary/10 shadow-xl bg-background/50 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="bg-primary/5 border-b border-primary/10">
                        <CardTitle>Describe the Health Issue</CardTitle>
                        <CardDescription>Select the animal type and symptoms to begin the analysis.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-8">
                        <div className="space-y-3">
                            <Label htmlFor="animalType" className="text-base font-bold uppercase tracking-wider text-primary">Animal Type</Label>
                            <Input
                                id="animalType"
                                placeholder="e.g. Cow, Goat, Pig, Chicken..."
                                value={animalType}
                                onChange={(e) => setAnimalType(e.target.value)}
                                className="h-12 border-primary/20 focus-visible:ring-primary text-lg"
                            />
                        </div>

                        <div className="space-y-4">
                            <Label className="text-base font-bold uppercase tracking-wider text-primary">Common Symptoms</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {commonSymptoms.map((symptom) => (
                                    <div
                                        key={symptom.id}
                                        className={`flex items-center space-x-3 p-4 rounded-xl border transition-all cursor-pointer ${selectedSymptoms.includes(symptom.id)
                                            ? 'border-primary bg-primary/10'
                                            : 'border-muted-foreground/10 hover:border-primary/30'
                                            }`}
                                        onClick={() => toggleSymptom(symptom.id)}
                                    >
                                        <Checkbox
                                            id={symptom.id}
                                            checked={selectedSymptoms.includes(symptom.id)}
                                            onCheckedChange={() => toggleSymptom(symptom.id)}
                                            className="border-primary data-[state=checked]:bg-primary"
                                        />
                                        <label
                                            htmlFor={symptom.id}
                                            className="text-sm font-medium leading-none cursor-pointer flex-1"
                                        >
                                            {symptom.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="details" className="text-base font-bold uppercase tracking-wider text-primary">Any other details?</Label>
                            <textarea
                                id="details"
                                placeholder="Describe duration, changes in behavior, environment, etc."
                                value={additionalInfo}
                                onChange={(e) => setAdditionalInfo(e.target.value)}
                                className="w-full min-h-[120px] rounded-xl border border-primary/20 bg-background p-4 text-base focus-visible:ring-primary focus:outline-none focus:ring-2"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/30 p-6 flex justify-end gap-4 border-t border-primary/10">
                        <Button variant="outline" onClick={reset} disabled={loading} className="rounded-xl px-6 h-12 font-bold uppercase tracking-widest text-xs">Clear</Button>
                        <Button
                            onClick={handleCheck}
                            disabled={loading}
                            className="rounded-xl px-8 h-12 font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all hover:scale-105"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    Analyze Health <ChevronRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            ) : (
                <Card className="border-secondary/20 shadow-2xl bg-background/50 backdrop-blur-sm overflow-hidden animate-in fade-in zoom-in duration-500">
                    <CardHeader className="bg-secondary/10 border-b border-secondary/20 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-secondary flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Analysis Results
                            </CardTitle>
                            <CardDescription>Based on information for a {animalType}</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={reset} className="rounded-xl border-secondary/30 text-secondary hover:bg-secondary hover:text-white transition-all">
                            <RefreshCcw className="h-4 w-4 mr-2" /> Start Over
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[400px] p-6 lg:h-[500px]">
                            <div className="prose prose-p:text-foreground prose-headings:text-primary prose-li:text-foreground max-w-none">
                                {prediction.split('\n').map((line, i) => (
                                    <p key={i} className="mb-2">{line}</p>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <CardFooter className="bg-primary p-6 flex flex-col items-center text-center text-white">
                        <CheckCircle2 className="h-8 w-8 mb-2" />
                        <p className="font-bold text-lg mb-1">Remember: AI is not a substitute for professional veterinary care.</p>
                        <p className="text-white/80 text-sm">Always consult with a qualified veterinarian for an accurate diagnosis.</p>
                        <Button
                            variant="secondary"
                            className="mt-6 rounded-xl font-bold uppercase tracking-widest text-xs px-8 h-11 shadow-xl hover:scale-105 transition-all"
                            onClick={() => window.location.href = '#/contact'}
                        >
                            Contact a Veterinarian
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
};

export default AISymptomChecker;
