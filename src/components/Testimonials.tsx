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

const testimonials = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    },
];

const Testimonials = () => {
    const { lang } = useLanguage();

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
                                                "{t(`testimonials.${testimonial.id}.text`, lang)}"
                                            </p>

                                            <div className="flex items-center gap-4 pt-6 border-t border-foreground/5">
                                                <Avatar className="h-12 w-12 border-2 border-secondary/20">
                                                    <AvatarImage src={testimonial.image} alt={t(`testimonials.${testimonial.id}.author`, lang)} />
                                                    <AvatarFallback>{t(`testimonials.${testimonial.id}.author`, lang).charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-bold text-foreground uppercase tracking-tight leading-none mb-1">
                                                        {t(`testimonials.${testimonial.id}.author`, lang)}
                                                    </p>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                                                        {t(`testimonials.${testimonial.id}.location`, lang)}
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
            </div>

            {/* Decorative pulse background elements */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
        </section>
    );
};

export default Testimonials;
