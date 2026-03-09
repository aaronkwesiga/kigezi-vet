import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/i18n';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle } from "lucide-react";

interface Testimonial {
    id: string;
    name: string;
    location: string;
    content: string;
    created_at: string;
}

const defaultTestimonials = [
    {
        id: "default-1",
        name: t('testimonials.1.author', 'en'),
        location: t('testimonials.1.location', 'en'),
        content: t('testimonials.1.text', 'en'),
        created_at: new Date().toISOString(),
    },
    {
        id: "default-2",
        name: t('testimonials.2.author', 'en'),
        location: t('testimonials.2.location', 'en'),
        content: t('testimonials.2.text', 'en'),
        created_at: new Date().toISOString(),
    },
    {
        id: "default-3",
        name: t('testimonials.3.author', 'en'),
        location: t('testimonials.3.location', 'en'),
        content: t('testimonials.3.text', 'en'),
        created_at: new Date().toISOString(),
    },
];


const Testimonials = () => {
    const { lang } = useLanguage();
    const { toast } = useToast();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', location: '', content: '' });

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const { data, error } = await supabase
                .from('testimonials')
                .select('*')
                .eq('is_approved', true)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // If no user testimonials exist yet, use the static translations as placeholders
            if (!data || data.length === 0) {
                // We resolve translations here based on current language
                const translatedDefaults = [
                    { id: "1", name: t('testimonials.1.author', lang), location: t('testimonials.1.location', lang), content: t('testimonials.1.text', lang), created_at: new Date().toISOString() },
                    { id: "2", name: t('testimonials.2.author', lang), location: t('testimonials.2.location', lang), content: t('testimonials.2.text', lang), created_at: new Date().toISOString() },
                    { id: "3", name: t('testimonials.3.author', lang), location: t('testimonials.3.location', lang), content: t('testimonials.3.text', lang), created_at: new Date().toISOString() },
                ];
                setTestimonials(translatedDefaults);
            } else {
                setTestimonials(data);
            }
        } catch (error: any) {
            console.error('Error fetching testimonials:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.content.trim()) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('testimonials').insert([
                {
                    name: formData.name.trim(),
                    location: formData.location.trim() || 'Uganda',
                    content: formData.content.trim(),
                    is_approved: false
                }
            ]);

            if (error) throw error;

            toast({
                title: "Testimonial Submitted",
                description: "Thank you! Your testimonial is pending review by our team.",
            });

            setIsOpen(false);
            setFormData({ name: '', location: '', content: '' });
        } catch (error: any) {
            toast({
                title: "Submission Failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-24 bg-background relative overflow-hidden transition-colors duration-500">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <h2 className="mb-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl uppercase">
                        {t('testimonials.title', lang)}
                    </h2>
                    <div className="w-24 h-1 bg-secondary mx-auto mb-6 rounded-full" />
                    <p className="text-lg font-medium text-foreground/60 md:text-xl max-w-2xl mx-auto uppercase tracking-wide">
                        {t('testimonials.subtitle', lang)}
                    </p>
                </div>

                <div className="max-w-5xl mx-auto px-12">
                    <Carousel
                        opts={{
                            align: "start",
                            loop: true,
                        }}
                        className="w-full"
                    >
                        <CarouselContent>
                            {testimonials.map((testimonial) => (
                                <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3 p-4">
                                    <Card className="glass border-none shadow-xl h-full transition-all duration-500 hover:scale-105 group">
                                        <CardContent className="p-8 flex flex-col h-full">
                                            <Quote className="h-10 w-10 text-secondary/40 mb-6 group-hover:text-secondary transition-colors duration-500" />

                                            <p className="text-foreground/80 font-medium leading-relaxed mb-8 flex-grow italic">
                                                "{testimonial.content}"
                                            </p>

                                            <div className="flex items-center gap-4 pt-6 border-t border-foreground/5">
                                                <Avatar className="h-12 w-12 border-2 border-secondary/20 bg-muted flex items-center justify-center">
                                                    <AvatarFallback className="text-lg font-bold text-primary">{testimonial.name.charAt(0).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-bold text-foreground uppercase tracking-tight leading-none mb-1">
                                                        {testimonial.name}
                                                    </p>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                                                        {testimonial.location}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="hidden md:flex -left-16 glass border-none hover:bg-secondary hover:text-white text-foreground transition-all duration-300" />
                        <CarouselNext className="hidden md:flex -right-16 glass border-none hover:bg-secondary hover:text-white text-foreground transition-all duration-300" />
                    </Carousel>
                </div>

                <div className="mt-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button size="lg" className="h-14 px-8 gap-3 text-sm md:text-base font-bold uppercase tracking-widest bg-primary hover:brightness-110 text-primary-foreground shadow-xl hover:scale-105 transition-all rounded-xl">
                                <PlusCircle className="h-5 w-5" />
                                {lang === 'en' ? 'Share Your Experience' : 'Gaba Ebi Wakozire'}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] glass border-primary/20 rounded-[2rem]">
                            <DialogHeader>
                                <DialogTitle className="font-display text-2xl uppercase tracking-tight">{lang === 'en' ? 'Submit Testimonial' : 'Gaba Ebi Wakozire'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 px-2">{lang === 'en' ? 'Your Name' : 'Eizina Ryaawe'}</label>
                                        <Input
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="e.g. Aaron Kwesiga"
                                            className="h-12 bg-background/50 border-foreground/10 rounded-xl px-4 font-medium transition-all focus:border-primary/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 px-2">{lang === 'en' ? 'Location / Farm Type' : 'Ahantu'}</label>
                                        <Input
                                            value={formData.location}
                                            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                            placeholder="e.g. Dairy Farmer, Kabale"
                                            className="h-12 bg-background/50 border-foreground/10 rounded-xl px-4 font-medium transition-all focus:border-primary/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 px-2">{lang === 'en' ? 'Your Experience' : 'Ebi Wakozire'}</label>
                                        <textarea
                                            required
                                            value={formData.content}
                                            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                            placeholder="Tell us how Kigezi Vet has helped your animals..."
                                            className="w-full min-h-[120px] bg-background/50 border border-foreground/10 rounded-xl p-4 font-medium focus:ring-1 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all resize-none"
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-14 rounded-xl bg-secondary hover:brightness-110 text-white font-bold uppercase tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                                    {lang === 'en' ? 'Submit for Review' : 'Sindika'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Decorative pulse background elements */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
        </section>
    );
};

export default Testimonials;
