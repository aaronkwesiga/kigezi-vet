import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/i18n';
import { Button } from './ui/button';
import { Shield, Users, Award, MapPin, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminPortfolio from './AdminPortfolio';

const AboutRegion = () => {
    const { lang } = useLanguage();

    const highlights = [
        {
            icon: Shield,
            title: lang === 'en' ? 'Trusted Protection' : 'Oburinzi Obwesigwa',
            description: lang === 'en' ? 'Safeguarding Kigezi livestock for decades.' : 'Turinda enyamaishwa za Kigezi kumara emyaka mingi.',
        },
        {
            icon: Users,
            title: lang === 'en' ? 'Community First' : 'Abantu weitu okubanza',
            description: lang === 'en' ? 'Owned and operated by local veterinary experts.' : 'Eikirwe kandi ekoresibwa abashaho b\'enyamaishwa b\'omubantu weitu.',
        },
        {
            icon: Award,
            title: lang === 'en' ? 'Certified Quality' : 'Omutindo Oguhikirire',
            description: lang === 'en' ? 'Only the highest grade medical supplies.' : 'Emibazi eguhikirire yonyine ni yo tuguza.',
        }
    ];

    return (
        <section className="py-16 md:py-32 bg-background relative overflow-hidden transition-colors duration-500">
            {/* Theme Aware Pulse Background */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[1000px] h-[600px] md:h-[1000px] rounded-full bg-primary blur-[120px] md:blur-[200px] animate-pulse" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid gap-16 lg:grid-cols-2 items-center">
                    <div className="animate-in fade-in slide-in-from-left-8 duration-1000">
                        <div className="mb-8 inline-flex items-center gap-3 rounded-full bg-primary/5 px-6 md:px-8 py-2 md:py-3 text-[10px] md:text-sm font-bold uppercase tracking-[0.2em] text-primary border border-primary/20 shadow-sm backdrop-blur-md">
                            <MapPin className="h-4 w-4 md:h-5 md:w-5" />
                            Based in Kabale, Kigezi
                        </div>
                        <h2 className="mb-8 font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl lg:text-7xl uppercase leading-[1.1]">
                            Mission <span className="text-secondary">Integrity</span>
                        </h2>
                        <p className="mb-12 text-lg font-medium text-foreground/60 md:text-xl leading-relaxed max-w-2xl">
                            {lang === 'en'
                                ? 'We serve the entire Kigezi region with high-grade veterinary solutions to empower local farmers and protect animal health.'
                                : 'Tuherereza ekyanga kyona ekya Kigezi n\'emibazi y\'enyamaishwa eguhikirire okuhwera abahiisa n\'okurinda amagara g\'enyamaishwa.'}
                        </p>

                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
                            {highlights.map((item, idx) => (
                                <div key={idx} className="flex gap-6 group">
                                    <div className="flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-xl md:rounded-2xl bg-muted/60 border border-foreground/5 text-primary shadow-sm transition-transform group-hover:scale-105">
                                        <item.icon className="h-6 w-6 md:h-7 md:w-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg md:text-xl font-bold text-foreground uppercase tracking-tight mb-1">{item.title}</h3>
                                        <p className="text-sm md:text-base font-medium text-foreground/40 leading-relaxed">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
                        <div className="relative z-10 overflow-hidden rounded-[2rem] md:rounded-[3rem] border border-foreground/5 shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=1200&auto=format&fit=crop"
                                alt="Kabale Cattle"
                                className="h-full w-full object-cover grayscale brightness-90 hover:grayscale-0 transition-all duration-1000 hover:scale-105"
                            />
                            {/* Theme aware overlay */}
                            <div className="absolute inset-0 bg-primary/5 mix-blend-overlay" />
                        </div>
                        {/* Interactive floating badge */}
                        <div className="absolute -bottom-10 md:-bottom-12 -left-6 md:-left-12 z-20 glass rounded-2xl md:rounded-[2rem] p-6 md:p-10 transition-transform hover:scale-105 shadow-xl border border-foreground/5">
                            <p className="text-4xl md:text-7xl lg:text-8xl font-black text-primary leading-none tracking-tighter mb-1 md:mb-2">15+</p>
                            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-foreground/60">Years Experience</p>
                        </div>
                    </div>
                </div>

                <AdminPortfolio />

                <div className="mt-20 md:mt-32 pt-16 md:pt-24 border-t-4 md:border-t-8 border-foreground/5 flex flex-col items-center text-center">
                    <h3 className="mb-10 font-display text-2xl md:text-4xl lg:text-5xl font-bold text-foreground uppercase tracking-tight leading-tight">
                        Ready to <span className="text-secondary">Consult?</span>
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-8 md:gap-12">
                        <Link to="/chat">
                            <Button size="lg" className="h-14 md:h-16 px-8 md:px-12 gap-4 text-lg md:text-xl font-bold uppercase tracking-widest bg-secondary text-white shadow-xl hover:scale-105 transition-all border border-white/10 rounded-xl md:rounded-2xl">
                                <Search className="h-5 w-5 md:h-6 md:w-6" />
                                Find Solution
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutRegion;
