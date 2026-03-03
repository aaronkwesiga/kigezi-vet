import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from './ui/button';
import { Sparkles, Stethoscope, ChevronRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const AIFeatures = () => {
    const { lang } = useLanguage();

    const features = [
        {
            icon: Sparkles,
            title: lang === 'en' ? 'AI Vet Assistant' : 'AI Assistant ya Vet',
            description: lang === 'en'
                ? 'Get instant answers for your livestock and crop questions with our dedicated AI chat companion.'
                : 'Tunga eby\'okugarukamu by\'amaani aha bibuuzo byaawe eby\'enyamaishwa n\'ebihingwa.',
            link: '#', // The AIChatAssistant handles this but we can link to a demo or info
            isChat: true,
            color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            badge: 'LIVE CHAT'
        },
        {
            icon: Stethoscope,
            title: lang === 'en' ? 'AI Health Checker' : 'AI Health Checker',
            description: lang === 'en'
                ? 'Analyze symptoms quickly and get preliminary health guidance for your animals.'
                : 'Kebera oburwaire bw\'enyamaishwa zaawe oyeebere obuyambi bw\'amaani.',
            link: '/ai-symptom-checker',
            isChat: false,
            color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            badge: 'DIAGNOSTICS'
        }
    ];

    return (
        <section className="py-20 md:py-32 bg-muted/30 relative overflow-hidden transition-colors duration-500">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/5 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="mb-16 md:mb-24 text-center">
                    <div className="inline-flex items-center gap-3 rounded-full bg-primary/5 px-6 py-2 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-primary border border-primary/20 shadow-sm mb-6">
                        <Zap className="h-4 w-4" />
                        Next-Gen Agriculture
                    </div>
                    <h2 className="mb-6 md:mb-8 font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl lg:text-7xl uppercase leading-[1.1]">
                        AI <span className="text-primary">Innovations</span>
                    </h2>
                    <p className="mx-auto max-w-3xl text-lg font-medium text-foreground/40 uppercase tracking-[0.1em] md:text-xl leading-relaxed">
                        Harnessing Artificial Intelligence to empower Kigezi farmers.
                    </p>
                </div>

                <div className="grid gap-10 md:gap-12 md:grid-cols-2">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="group relative flex flex-col rounded-[2.5rem] bg-card border border-foreground/5 p-10 md:p-14 transition-all hover:-translate-y-2 hover:border-primary/20 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000"
                            style={{ animationDelay: `${idx * 200}ms` }}
                        >
                            <div className="absolute top-0 right-0 p-8">
                                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${feature.color}`}>
                                    {feature.badge}
                                </span>
                            </div>

                            <div className={`mb-10 flex h-20 w-20 items-center justify-center rounded-2xl md:rounded-3xl border shadow-lg transition-all group-hover:scale-110 ${feature.color}`}>
                                <feature.icon className="h-10 w-10" />
                            </div>

                            <h3 className="mb-6 font-display text-2xl md:text-4xl font-bold text-foreground uppercase tracking-tight leading-tight">
                                {feature.title}
                            </h3>

                            <p className="mb-10 text-base md:text-lg font-medium text-foreground/50 leading-relaxed flex-1">
                                {feature.description}
                            </p>

                            <div className="mt-auto">
                                {feature.isChat ? (
                                    <Button
                                        onClick={() => {
                                            // This assumes the AIChatAssistant component is present and can be opened
                                            const btn = document.querySelector('button.fixed.bottom-6.right-6') as HTMLButtonElement;
                                            if (btn) btn.click();
                                        }}
                                        className="h-14 md:h-16 w-full rounded-2xl bg-primary text-white hover:brightness-110 transition-all font-bold uppercase tracking-widest text-xs md:text-sm shadow-xl shadow-primary/20"
                                    >
                                        <span className="flex items-center justify-center gap-4">
                                            Initialize AI Chat
                                            <ChevronRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                                        </span>
                                    </Button>
                                ) : (
                                    <Link to={feature.link}>
                                        <Button className="h-14 md:h-16 w-full rounded-2xl bg-secondary text-white hover:brightness-110 transition-all font-bold uppercase tracking-widest text-xs md:text-sm shadow-xl shadow-secondary/20">
                                            <span className="flex items-center justify-center gap-4">
                                                Access Health Checker
                                                <ChevronRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                                            </span>
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AIFeatures;
