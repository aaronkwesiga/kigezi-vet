import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/i18n';
import { Button } from './ui/button';
import { Zap, ShieldAlert, BadgeCheck, Stethoscope, ChevronRight, Package, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServiceCards = () => {
  const { lang } = useLanguage();

  const services = [
    {
      icon: Stethoscope,
      title: lang === 'en' ? 'Expert Consultation' : 'Okuhaburwa n\'abashaho',
      description: lang === 'en'
        ? 'Direct uplink to veterinary doctors for professional medical guidance.'
        : 'Okurya akamanyiso n\'abashaho b\'enyamaishwa b\'omutindo ogwa heiguru.',
      color: 'text-primary',
      badge: 'PRIORITY'
    },
    {
      icon: Package,
      title: lang === 'en' ? 'Medical Logistics' : 'Emibazi eguhiire',
      description: lang === 'en'
        ? 'High-grade veterinary medicines, vaccines, and supplements.'
        : 'Emibazi y\'enyamaishwa, enjago, n\'ebirungo eby\'omutindo.',
      color: 'text-secondary',
      badge: 'STOCK_READY'
    },
    {
      icon: ShieldAlert,
      title: lang === 'en' ? 'Emergency Support' : 'Obuyambi bw\'amaani',
      description: lang === 'en'
        ? 'Rapid response protocols for livestock health emergencies.'
        : 'Okuhwera abantu tuba habuiri obwire bw\'ebigwererebyo by\'enyamaishwa.',
      color: 'text-primary',
      badge: '24/7_SIGNAL'
    }
  ];

  return (
    <section className="py-16 md:py-32 bg-background relative transition-colors duration-500">
      <div className="container mx-auto px-6">
        <div className="mb-16 md:mb-24 text-center">
          <h2 className="mb-6 md:mb-8 font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl lg:text-7xl uppercase leading-[1.1]">
            Service <span className="text-secondary">Protocols</span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg font-medium text-foreground/40 uppercase tracking-[0.1em] md:text-xl leading-relaxed">
            Authoritative animal health solutions for Kigezi.
          </p>
        </div>

        <div className="grid gap-10 md:gap-12 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col items-center text-center md:items-start md:text-left rounded-[2rem] md:rounded-[3rem] bg-card border border-foreground/5 p-8 md:p-10 transition-all hover:-translate-y-2 hover:border-primary/20 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              {/* Hover accent */}
              <div className="absolute top-0 right-0 h-32 w-32 md:h-40 md:w-40 bg-primary/5 rounded-full blur-[60px] md:blur-[80px] -mr-16 md:-mr-20 -mt-16 md:-mt-20 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="mb-8 md:mb-10 flex items-center justify-between w-full">
                <div className={`flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-xl md:rounded-2xl bg-muted/50 border border-foreground/5 shadow-sm transition-all group-hover:scale-110 ${service.color}`}>
                  <service.icon className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-primary/60">{service.badge}</span>
                  <div className="h-[1px] w-6 md:w-8 bg-primary/20 mt-1 md:mt-2 ml-auto" />
                </div>
              </div>

              <h3 className="mb-4 font-display text-xl md:text-2xl font-bold text-foreground uppercase tracking-tight leading-tight">
                {service.title}
              </h3>

              <p className="mb-8 md:mb-10 text-sm md:text-base font-medium text-foreground/40 leading-relaxed flex-1">
                {service.description}
              </p>

              <Link to="/chat" className="mt-auto">
                <Button variant="outline" className="h-12 md:h-14 w-full rounded-xl md:rounded-2xl border border-foreground/10 hover:bg-primary hover:text-white transition-all font-bold uppercase tracking-widest text-[10px] md:text-xs group/btn">
                  <span className="relative z-10 flex items-center justify-center gap-4">
                    Initialize Link
                    <ChevronRight className="h-6 w-6 md:h-8 md:w-8 group-hover/btn:translate-x-2 transition-transform" />
                  </span>
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Logistics Uplink CTA */}
        <div className="mt-24 md:mt-32 glass rounded-[3rem] md:rounded-[5rem] p-10 md:p-16 lg:p-20 flex flex-col md:flex-row items-center justify-between gap-12 md:gap-16 border-4 md:border-8 border-foreground/5 shadow-2xl transition-all hover:scale-[1.01]">
          <div className="text-center md:text-left flex-1">
            <div className="mb-6 md:mb-8 inline-flex items-center gap-3 rounded-full bg-secondary/5 px-6 py-2 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-secondary border border-secondary/20 shadow-sm">
              <Package className="h-4 w-4 md:h-5 md:w-5" />
              Supply Operations Active
            </div>
            <h3 className="mb-4 md:mb-6 font-display text-2xl md:text-4xl lg:text-5xl font-bold text-foreground uppercase tracking-tight leading-tight">
              Full Medicine <span className="text-secondary">Inventory</span>
            </h3>
            <p className="max-w-3xl text-base md:text-xl font-medium text-foreground/50 leading-relaxed">
              Access our complete catalog of certified veterinary medicines and farm equipment.
            </p>
          </div>
          <Link to="/products">
            <Button size="lg" className="h-14 md:h-16 px-10 md:px-14 gap-4 text-lg md:text-xl font-bold uppercase tracking-widest bg-secondary text-white shadow-xl hover:scale-105 transition-all border border-white/10 rounded-xl md:rounded-2xl">
              <Search className="h-5 w-5 md:h-6 md:w-6" />
              VIEW CATALOG
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServiceCards;
