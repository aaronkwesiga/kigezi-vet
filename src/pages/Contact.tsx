import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/i18n';
import { MapPin, Phone, Clock, Mail, Send, ChevronRight, Facebook, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import DomesticAnimalsBackground from '@/components/DomesticAnimalsBackground';

const Contact = () => {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { name, email, subject, message } = formData;
    const mailtoUrl = `mailto:kabalevetdrug@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`;
    window.location.href = mailtoUrl;
    setLoading(false);
    toast({
      title: t('contact.success', lang),
      description: "Opening your email app to send the message...",
    });
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactOptions = [
    {
      icon: MapPin,
      title: t('contact.location', lang),
      detail: t('contact.locationDetail', lang),
      color: 'bg-primary/10 text-primary',
    },
    {
      icon: Phone,
      title: 'WhatsApp / Call',
      detail: '+256 793 322 520',
      color: 'bg-secondary/10 text-secondary',
      href: 'https://wa.me/256793322520'
    },
    {
      icon: Mail,
      title: 'Email Us',
      detail: 'kabalevetdrug@gmail.com',
      color: 'bg-primary/10 text-primary',
      href: 'mailto:kabalevetdrug@gmail.com'
    },
    {
      icon: Clock,
      title: t('contact.hours', lang),
      detail: t('contact.hoursDetail', lang),
      color: 'bg-muted text-foreground/60',
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 relative overflow-x-hidden transition-colors duration-500 flex flex-col items-center">
      {/* Dynamic Background Slideshow shifted to top for zero-interference */}
      <DomesticAnimalsBackground />
      <div className="absolute inset-0 z-0 bg-black/60 pointer-events-none" />

      <div className="w-full max-w-5xl px-4 md:px-6 relative z-10 flex flex-col items-center mx-auto">
        <div className="mb-14 text-center">
          <Badge className="mb-5 px-8 py-2 text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em] bg-primary/5 text-primary border border-primary/20 shadow-sm backdrop-blur-md">
            {t('nav.contact', lang)}
          </Badge>
          <h1 className="mb-5 font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl uppercase leading-none">
            {t('contact.title', lang)}
          </h1>
          <p className="mx-auto max-w-xl text-lg font-medium text-foreground/42 md:text-xl leading-relaxed">
            {t('contact.subtitle', lang)}
          </p>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-5 gap-10 w-full items-center">
          {/* Contact Info & Map */}
          <div className="lg:col-span-2 space-y-6 w-full flex flex-col items-center">
            <div className="flex flex-col md:grid md:grid-cols-2 lg:flex lg:flex-col lg:grid-cols-1 gap-4 w-full items-center">
              {contactOptions.map((item, i) => {
                const commonClasses = `bg-card w-full group flex flex-col items-center text-center md:flex-row md:items-start md:text-left gap-5 rounded-2xl md:rounded-[2rem] p-5 md:p-6 transition-all hover:-translate-y-1 hover:border-primary/20 shadow-xl border border-foreground/5 ${item.href ? 'cursor-pointer' : ''}`;
                return (
                  <div
                    key={i}
                    className={commonClasses}
                  >
                    <div className={`p-3 md:p-4 rounded-xl border border-foreground/5 ${item.color}`}>
                      <item.icon className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg md:text-xl text-foreground mb-0.5 uppercase tracking-tight">{item.title}</h3>
                      {item.href ? (
                        <div className="space-y-2">
                          <a
                            href={item.href}
                            className="text-xs md:text-sm font-bold text-primary hover:underline transition-all block"
                          >
                            {item.detail}
                          </a>
                          {item.href.startsWith('mailto:') && (
                            <a
                              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${item.detail}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] font-bold text-secondary hover:underline transition-all block uppercase tracking-tighter"
                            >
                              Open in Gmail (Web)
                            </a>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs md:text-sm font-medium text-foreground/40 leading-tight mx-auto md:mx-0">{item.detail}</p>

                      )}

                      {item.href && (
                        <span className="mt-3 inline-flex items-center justify-center md:justify-start gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          Open Protocol <ChevronRight className="h-3 w-3" />
                        </span>

                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Map Embed */}
            <div className="relative h-48 md:h-64 lg:h-72 w-full overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] border border-foreground/5 bg-card p-2 shadow-xl">
              <div className="relative h-full w-full rounded-xl md:rounded-[2rem] bg-muted/30 flex flex-col items-center justify-center text-center p-4 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1542332213-31f87348057f?q=80&w=1200&auto=format&fit=crop"
                  alt="Uganda Map"
                  className="absolute inset-0 h-full w-full object-cover opacity-10 grayscale"
                />
                <MapPin className="h-8 w-8 md:h-10 md:w-10 text-primary mb-3 relative z-10 animate-pulse" />
                <h4 className="font-display font-bold text-lg md:text-xl text-foreground relative z-10 uppercase tracking-tight mb-1">Kigezi Vet Drugshop</h4>
                <p className="text-[10px] md:text-xs font-medium text-foreground/40 relative z-10 uppercase tracking-widest leading-none">Opposite All Saints Church, Kabale</p>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Kigezi+Vet+Drugshop+Kabale+Plot+50"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] relative z-10 hover:brightness-110 transition-all shadow-md border border-white/10"
                >
                  Authorize Navigation
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 w-full">
            <form onSubmit={handleSubmit} className="bg-card p-6 md:p-12 rounded-2xl md:rounded-[3rem] border border-foreground/5 shadow-2xl relative overflow-hidden w-full">
              <div className="mb-8 md:mb-12">
                <h3 className="font-display text-2xl md:text-4xl font-bold text-foreground uppercase tracking-tight mb-3">Signal Input</h3>
                <p className="text-xs md:text-sm font-medium text-foreground/40 uppercase tracking-widest">Transmit detailed request below</p>
              </div>

              <div className="space-y-6 md:space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2 md:space-y-3">
                    <label className="text-center block md:text-left md:ml-4 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-primary/40">Identity</label>

                    <Input
                      placeholder="NAME"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-12 md:h-14 rounded-xl bg-muted/20 border border-foreground/5 text-xs md:text-base font-medium text-foreground placeholder:text-foreground/20 focus:border-primary transition-all px-6"
                    />
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <label className="text-center block md:text-left md:ml-4 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-primary/40">Return Signal</label>

                    <Input
                      type="email"
                      placeholder="EMAIL"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-12 md:h-14 rounded-xl bg-muted/20 border border-foreground/5 text-xs md:text-base font-medium text-foreground placeholder:text-foreground/20 focus:border-primary transition-all px-6"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:space-y-3">
                  <label className="text-center block md:text-left md:ml-4 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-secondary/40">Broadside Transmission</label>

                  <Input
                    placeholder="PROTOCOL SUBJECT"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="h-12 md:h-14 rounded-xl bg-muted/20 border border-foreground/5 text-xs md:text-base font-medium text-foreground placeholder:text-foreground/20 focus:border-primary transition-all px-6"
                  />
                </div>

                <div className="space-y-2 md:space-y-3">
                  <label className="text-center block md:text-left md:ml-4 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-primary/40">Data Payload</label>

                  <Textarea
                    placeholder="ENTER MESSAGE PROTOCOL..."
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="flex min-h-[150px] md:min-h-[200px] w-full rounded-2xl bg-muted/20 border border-foreground/5 text-xs md:text-base font-medium text-foreground placeholder:text-foreground/20 focus:border-primary focus:outline-none transition-all p-6 uppercase"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 md:h-16 rounded-xl md:rounded-2xl bg-secondary hover:brightness-110 text-white font-bold text-lg md:text-xl uppercase tracking-widest shadow-xl border border-white/10 transition-all active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Transmit Signal <Send className="ml-3 h-5 w-5 md:h-6 md:w-6" /></>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Global Connection Footprint */}
        <div className="mt-24 md:mt-32 rounded-[2.5rem] md:rounded-[5rem] bg-primary p-6 md:p-20 text-center shadow-2xl relative overflow-hidden transition-all hover:scale-[1.01] w-full mx-auto">
          <div className="absolute inset-0 bg-white opacity-5 pointer-events-none" />
          <div className="relative z-10">
            <h3 className="mb-6 text-2xl md:text-4xl lg:text-5xl font-bold text-primary-foreground uppercase tracking-tight leading-none">Connect with our community</h3>
            <p className="mx-auto max-w-3xl text-lg md:text-2xl lg:text-3xl font-medium text-primary-foreground/60 mb-12 leading-relaxed">
              Join thousands of farmers from the Kigezi region on our social platforms for daily tips and support.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
              <a href="https://facebook.com/kabalevetdrugshop" target="_blank" rel="noopener noreferrer" className="bg-white/10 backdrop-blur-3xl flex items-center gap-4 md:gap-6 px-10 py-5 rounded-2xl md:rounded-[2rem] border border-white/5 hover:bg-white/20 text-white font-bold uppercase text-sm md:text-xl transition-all shadow-xl">
                <Facebook className="h-6 w-6 md:h-8 md:w-8" />
                Facebook
              </a>
              <a href="https://wa.me/256793322520" target="_blank" rel="noopener noreferrer" className="bg-white/10 backdrop-blur-3xl flex items-center gap-4 md:gap-6 px-10 py-5 rounded-2xl md:rounded-[2rem] border border-white/5 hover:bg-white/20 text-white font-bold uppercase text-sm md:text-xl transition-all shadow-xl">
                <MessageSquare className="h-6 w-6 md:h-8 md:w-8" />
                WhatsApp
              </a>
              <a
                href="mailto:kabalevetdrug@gmail.com"
                className="bg-white/10 backdrop-blur-3xl flex items-center gap-4 md:gap-6 px-10 py-5 rounded-2xl md:rounded-[2rem] border border-white/5 hover:bg-white/20 text-white font-bold uppercase text-sm md:text-xl transition-all shadow-xl"
              >
                <Mail className="h-6 w-6 md:h-8 md:w-8" />
                Email Us
              </a>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=kabalevetdrug@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 backdrop-blur-3xl flex items-center gap-4 md:gap-6 px-10 py-5 rounded-2xl md:rounded-[2rem] border border-white/5 hover:bg-white/20 text-white font-bold uppercase text-sm md:text-xl transition-all shadow-xl"
              >
                Gmail
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};



export default Contact;
