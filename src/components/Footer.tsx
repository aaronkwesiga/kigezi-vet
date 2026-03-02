import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/i18n';
import { MapPin, Phone, Clock, ShieldCheck } from 'lucide-react';

const Footer = () => {
  const { lang } = useLanguage();

  return (
    <footer className="border-t border-primary/10 bg-background py-16 md:py-24 px-6 transition-colors duration-500 overflow-hidden relative">
      <div className="absolute top-0 left-0 h-[400px] w-[400px] md:h-[600px] md:w-[600px] bg-primary/2 blur-[100px] md:blur-[150px] pointer-events-none" />

      <div className="container mx-auto relative z-10">
        <div className="grid gap-12 md:gap-16 lg:gap-24 md:grid-cols-3">
          <div className="space-y-6 md:space-y-8">
            <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-10">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-primary flex items-center justify-center font-bold text-primary-foreground text-xl md:text-2xl shadow-sm border border-white/10">K</div>
              <h3 className="font-display text-lg md:text-xl font-bold text-foreground uppercase tracking-tight leading-none">Kigezi Vet Drugshop</h3>
            </div>
            <div className="flex items-start gap-4 md:gap-6 text-sm md:text-base font-medium text-foreground/42 leading-relaxed group">
              <MapPin className="mt-1 h-5 w-5 md:h-6 md:w-6 shrink-0 text-primary/40 group-hover:text-primary transition-all" />
              <span className="group-hover:text-foreground transition-all">{t('contact.locationDetail', lang)}</span>
            </div>
          </div>

          <div className="space-y-6 md:space-y-8">
            <h4 className="mb-8 md:mb-10 font-bold text-[10px] md:text-xs text-primary/40 uppercase tracking-[0.2em]">{t('contact.hours', lang)}</h4>
            <div className="flex items-start gap-4 md:gap-6 text-sm md:text-base font-medium text-foreground/42 leading-relaxed group">
              <Clock className="mt-1 h-5 w-5 md:h-6 md:w-6 shrink-0 text-primary/40 group-hover:text-primary transition-all" />
              <span className="group-hover:text-foreground transition-all">{t('contact.hoursDetail', lang)}</span>
            </div>
          </div>

          <div className="space-y-6 md:space-y-8">
            <h4 className="mb-8 md:mb-10 font-bold text-[10px] md:text-xs text-primary/40 uppercase tracking-[0.2em]">Global Uplink</h4>
            <div className="flex items-start gap-4 md:gap-6 text-sm md:text-base font-medium text-foreground/42 leading-relaxed group">
              <Phone className="mt-1 h-5 w-5 md:h-6 md:w-6 shrink-0 text-secondary/40 group-hover:text-secondary transition-all" />
              <a href="https://wa.me/256793322520" className="underline decoration-secondary/20 hover:decoration-secondary transition-all hover:text-secondary group-hover:text-secondary">+256 793 322 520</a>
            </div>
            <div className="pt-8 md:pt-10 flex items-center gap-4 md:gap-6">
              <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-secondary/80" />
              <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-foreground/60">Authorized Supplier 2026 • KIGEZI PROTOCOL</p>
            </div>
          </div>
        </div>

        <div className="mt-16 md:mt-24 border-t border-foreground/5 pt-10 md:pt-12 text-center text-[8px] md:text-[10px] font-black text-foreground/60 uppercase tracking-[0.2em] leading-relaxed">
          &copy; {new Date().getFullYear()} KIGEZI VETERINARY DRUGSHOP. ALL DATA TRANSMISSIONS PROTECTED.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
