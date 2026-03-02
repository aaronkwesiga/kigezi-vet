import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { MessageCircle, Package, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import DomesticAnimalsBackground from './DomesticAnimalsBackground';

const HeroSection = () => {
  const { lang } = useLanguage();

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-6 py-20 md:py-32 bg-transparent transition-colors duration-500">
      {/* High-Visibility Domestic Animal Background */}
      <DomesticAnimalsBackground />

      {/* Dark Overlay for Readability - UCU/Bukoola Style */}
      <div className="absolute inset-0 z-[1] bg-black/50 pointer-events-none" />

      <div className="container relative z-10 mx-auto text-center">
        <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-1000">
          <Badge className="mb-6 md:mb-8 bg-white/10 text-white border border-white/20 px-6 md:px-8 py-2 md:py-3 text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em] shadow-sm backdrop-blur-md">
            {t('hero.est', lang) || 'Est. 2024'}
          </Badge>
          <h1 className="font-display text-4xl font-black tracking-tighter text-white md:text-6xl lg:text-7xl xl:text-8xl uppercase leading-[0.95] mb-8 md:mb-10 drop-shadow-2xl">
            {t('hero.title', lang)} <br />
            <span className="text-white block mt-4 md:mt-8 text-xl md:text-2xl lg:text-3xl tracking-[0.4em] font-black drop-shadow-[0_4px_12px_rgba(0,0,0,1)] [text-shadow:0_0_30px_rgba(255,255,255,0.3)]">
              {t('hero.subtitle', lang)}
            </span>
          </h1>
          <div className="w-24 h-1 bg-secondary mx-auto mb-10 md:mb-12 rounded-full" />
          <p className="max-w-2xl mx-auto text-base md:text-lg font-bold text-white/90 tracking-widest mb-10 md:mb-14 leading-relaxed uppercase drop-shadow-md">
            Professional Veterinary Care for the Kigezi Region
          </p>

          <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
            <Link to="/chat">
              <Button size="lg" className="h-14 md:h-16 px-8 md:px-10 gap-3 text-lg md:text-xl font-bold uppercase tracking-widest bg-secondary hover:brightness-110 text-white shadow-xl hover:scale-105 transition-all border border-white/10 rounded-xl md:rounded-2xl">
                <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
                {t('hero.cta', lang)}
              </Button>
            </Link>
            <Link to="/products">
              <Button size="lg" variant="outline" className="h-14 md:h-16 px-8 md:px-10 gap-3 border border-foreground/10 text-lg md:text-xl font-bold uppercase tracking-widest text-foreground backdrop-blur-md hover:bg-foreground hover:text-background transition-all hover:scale-105 rounded-xl md:rounded-2xl shadow-sm">
                <Package className="h-5 w-5 md:h-6 md:w-6 text-secondary" />
                {t('hero.products', lang)}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-40">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Explore Services</span>
        <ChevronDown className="h-6 w-6 text-primary" />
      </div>
    </section>
  );
};

export default HeroSection;
