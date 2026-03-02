import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { t } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, UserPlus, Mail, Key, User, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import ConsultationBackground from '@/components/ConsultationBackground';

const Login = () => {
  const { lang } = useLanguage();
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  const [farmerEmail, setFarmerEmail] = useState('');
  const [farmerPassword, setFarmerPassword] = useState('');
  const [farmerName, setFarmerName] = useState('');
  const [farmerLoading, setFarmerLoading] = useState(false);
  const [farmerMode, setFarmerMode] = useState<'login' | 'signup'>('login');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    const { error } = await signIn(adminEmail, adminPassword);
    setAdminLoading(false);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
    else { navigate('/admin'); }
  };

  const handleFarmerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFarmerLoading(true);
    if (farmerMode === 'signup') {
      if (!farmerName.trim()) {
        toast({ title: 'Error', description: t('auth.nameRequired', lang), variant: 'destructive' });
        setFarmerLoading(false); return;
      }
      const { error } = await signUp(farmerEmail, farmerPassword, farmerName.trim());
      setFarmerLoading(false);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
      else { toast({ title: t('auth.checkEmail', lang), description: t('auth.verifyEmail', lang) }); }
    } else {
      const { error } = await signIn(farmerEmail, farmerPassword);
      setFarmerLoading(false);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
      else { navigate('/chat'); }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-24 relative overflow-hidden transition-colors duration-500">
      {/* Dynamic African Consultation Background */}
      <ConsultationBackground />

      {/* Dark Overlay for Readability */}
      <div className="absolute inset-0 z-[1] bg-black/50 pointer-events-none" />

      {/* Gradient overlay accents */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/40" />
        <div className="absolute top-0 left-0 h-[800px] w-[800px] bg-primary/5 blur-[200px] -ml-40 -mt-40" />
      </div>

      <div className="w-full max-w-4xl relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="mb-12 md:mb-16 text-center">
          <div className="mx-auto mb-6 md:mb-8 flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-xl md:rounded-2xl bg-primary shadow-xl border border-white/10">
            <ShieldCheck className="h-8 w-8 md:h-10 md:w-10 text-primary-foreground" />
          </div>
          <h1 className="mb-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl uppercase leading-none">
            Access <span className="text-primary">Gate</span>
          </h1>
          <p className="text-lg md:text-xl font-medium text-foreground/40 tracking-tight uppercase mb-10 md:mb-14">
            {t('login.subtitle', lang) || 'Authorize Veterinary Session'}
          </p>
        </div>

        <div className="bg-card rounded-2xl md:rounded-[3rem] p-5 md:p-6 shadow-2xl overflow-hidden border border-foreground/5">
          <Tabs defaultValue="farmer" className="w-full">
            <TabsList className="mb-8 md:mb-10 grid w-full grid-cols-2 bg-muted p-1.5 md:p-2 rounded-xl md:rounded-[3rem] h-14 md:h-16 border border-foreground/5">
              <TabsTrigger
                value="farmer"
                className="rounded-lg md:rounded-[2.5rem] font-bold uppercase tracking-widest text-[10px] md:text-xs h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                <UserPlus className="h-3.5 w-3.5 md:h-5 md:w-5 mr-2 md:mr-3" />
                {t('auth.farmer', lang)}
              </TabsTrigger>
              <TabsTrigger
                value="admin"
                className="rounded-lg md:rounded-[2.5rem] font-bold uppercase tracking-widest text-[10px] md:text-xs h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                <Lock className="h-3.5 w-3.5 md:h-5 md:w-5 mr-2 md:mr-3" />
                {t('auth.admin', lang)}
              </TabsTrigger>
            </TabsList>

            <div className="px-5 md:px-8 pb-10 md:pb-14">
              <TabsContent value="farmer" className="mt-0 space-y-8 md:space-y-10 animate-in fade-in slide-in-from-left-5 duration-700">
                <div className="flex p-1.5 bg-muted rounded-xl md:rounded-[3rem] mb-8 md:mb-10 border border-foreground/5 leading-none h-12 md:h-14">
                  <button
                    onClick={() => setFarmerMode('login')}
                    className={`flex-1 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-lg md:rounded-[2.5rem] transition-all ${farmerMode === 'login' ? 'bg-background text-foreground shadow-md border border-foreground/10' : 'text-foreground/30 hover:text-foreground'}`}
                  >
                    {t('auth.login', lang)}
                  </button>
                  <button
                    onClick={() => setFarmerMode('signup')}
                    className={`flex-1 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-lg md:rounded-[2.5rem] transition-all ${farmerMode === 'signup' ? 'bg-background text-foreground shadow-md border border-foreground/10' : 'text-foreground/30 hover:text-foreground'}`}
                  >
                    {t('auth.signup', lang)}
                  </button>
                </div>

                <form onSubmit={handleFarmerSubmit} className="space-y-6 md:space-y-8">
                  <div className="mb-10 text-left">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground uppercase tracking-tight mb-2">Farmer Portal</h2>
                    <p className="text-[10px] md:text-xs font-medium text-foreground/40 uppercase tracking-widest">Authorization required for service access</p>
                  </div>

                  {farmerMode === 'signup' && (
                    <div className="space-y-2.5 md:space-y-3">
                      <label className="ml-4 md:ml-6 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-primary/40">Identity Tag</label>
                      <div className="relative">
                        <User className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 h-5 w-5 md:h-6 md:w-6 text-foreground/10" />
                        <Input
                          value={farmerName}
                          onChange={(e) => setFarmerName(e.target.value)}
                          placeholder="ENTER FULL NAME"
                          className="h-12 md:h-14 pl-14 md:pl-16 rounded-lg md:rounded-xl bg-background border border-foreground/5 text-xs md:text-base font-medium text-foreground focus:border-primary focus:ring-0 uppercase transition-all placeholder:text-foreground/20"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2.5 md:space-y-3">
                    <label className="ml-4 md:ml-6 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-primary/40">Signal Address (Email)</label>
                    <div className="relative">
                      <Mail className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 h-5 w-5 md:h-6 md:w-6 text-foreground/10" />
                      <Input
                        type="email"
                        value={farmerEmail}
                        onChange={(e) => setFarmerEmail(e.target.value)}
                        placeholder="UPLINK@FARM.COM"
                        className="h-12 md:h-14 pl-14 md:pl-16 rounded-lg md:rounded-xl bg-background border border-foreground/5 text-xs md:text-base font-medium text-foreground focus:border-primary focus:ring-0 uppercase transition-all placeholder:text-foreground/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5 md:space-y-3">
                    <label className="ml-4 md:ml-6 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-primary/40">Access Keyword</label>
                    <div className="relative">
                      <Key className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 h-5 w-5 md:h-6 md:w-6 text-foreground/10" />
                      <Input
                        type="password"
                        value={farmerPassword}
                        onChange={(e) => setFarmerPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-12 md:h-14 pl-14 md:pl-16 rounded-lg md:rounded-xl bg-background border border-foreground/5 text-xs md:text-base font-medium text-foreground focus:border-primary focus:ring-0 uppercase transition-all placeholder:text-foreground/20"
                        required minLength={6}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 md:h-16 rounded-xl md:rounded-2xl bg-secondary hover:brightness-110 text-white font-bold text-lg md:text-xl uppercase tracking-widest shadow-xl border border-white/10 transition-all active:scale-[0.98] disabled:opacity-50"
                    disabled={farmerLoading}
                  >
                    {farmerLoading ? (
                      <div className="h-6 w-6 md:h-8 md:w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
                    ) : (
                      <span className="flex items-center justify-center gap-3 md:gap-4">
                        {farmerMode === 'signup' ? 'Initialize Unit' : 'Authorize Entrance'}
                        <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
                      </span>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="admin" className="mt-0 space-y-8 md:space-y-10 animate-in fade-in slide-in-from-right-5 duration-700">
                <div className="text-center mb-8 md:mb-10">
                  <div className="mx-auto mb-5 md:mb-6 flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-xl md:rounded-2xl bg-primary/10 text-primary border border-primary/20 animate-pulse shadow-xl">
                    <Lock className="h-8 md:h-10 md:w-10" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground uppercase tracking-tight mb-2">Staff Terminal</h2>
                  <p className="text-[10px] md:text-xs font-medium text-foreground/40 uppercase tracking-widest leading-none">Command Access Only • Encrypted credential input</p>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-6 md:space-y-8">
                  <div className="space-y-2.5 md:space-y-3">
                    <label className="ml-4 md:ml-6 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-primary/40">Admin Identity</label>
                    <div className="relative">
                      <Mail className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 h-5 w-5 md:h-6 md:w-6 text-foreground/10" />
                      <Input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="CMD@KIGEZI.VET"
                        className="h-12 md:h-14 pl-14 md:pl-16 rounded-lg md:rounded-xl bg-background border border-foreground/5 text-xs md:text-base font-medium text-foreground focus:border-primary focus:ring-0 uppercase transition-all placeholder:text-foreground/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5 md:space-y-3">
                    <label className="ml-4 md:ml-6 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-primary/40">Command Secret</label>
                    <div className="relative">
                      <Key className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 h-5 w-5 md:h-6 md:w-6 text-foreground/10" />
                      <Input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-12 md:h-14 pl-14 md:pl-16 rounded-lg md:rounded-xl bg-background border border-foreground/5 text-xs md:text-base font-medium text-foreground focus:border-primary focus:ring-0 uppercase transition-all placeholder:text-foreground/20"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 md:h-16 rounded-xl md:rounded-2xl bg-secondary hover:brightness-110 text-white font-bold text-lg md:text-xl uppercase tracking-widest shadow-xl border border-white/10 transition-all active:scale-[0.98] disabled:opacity-50"
                    disabled={adminLoading}
                  >
                    {adminLoading ? (
                      <div className="h-6 w-6 md:h-8 md:w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
                    ) : (
                      <span className="flex items-center justify-center gap-4 md:gap-6">
                        Launch Command <Zap className="h-6 w-6 md:h-8 md:w-8 fill-white" />
                      </span>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <p className="mt-12 md:mt-16 text-center text-[10px] md:text-sm font-black uppercase tracking-[0.4em] text-foreground/60 leading-relaxed max-w-2xl mx-auto border-t border-foreground/5 pt-10">
          Kigezi Veterinary High-Security Layer • Authorized Personnel Only<br />
          <span className="mt-2 block text-xs tracking-[0.6em] text-foreground/40 font-medium">System Pulse: <span className="text-secondary animate-pulse font-black">Online</span></span>
        </p>
      </div>
    </div>
  );
};

export default Login;
