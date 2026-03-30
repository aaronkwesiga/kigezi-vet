import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { t } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Lock, UserPlus, Mail, Key, User, ArrowRight,
  ShieldCheck, Zap, RotateCcw, ChevronLeft, Hash, LogIn, KeyRound
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ConsultationBackground from '@/components/ConsultationBackground';

// ── Admin invite code (change this to something secret in production) ──────────
const ADMIN_INVITE_CODE = 'KIGEZI-VET-ADMIN-2026';

// ─────────────────────────────────────────────────────────────────────────────
const Login = () => {
  const { lang } = useLanguage();
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // ── Farmer tab ──────────────────────────────────────────────────────────────
  const [farmerEmail, setFarmerEmail] = useState('');
  const [farmerPassword, setFarmerPassword] = useState('');
  const [farmerName, setFarmerName] = useState('');
  const [farmerLoading, setFarmerLoading] = useState(false);
  const [farmerMode, setFarmerMode] = useState<'login' | 'signup' | 'forgot'>('login');

  // ── Admin-login tab ─────────────────────────────────────────────────────────
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminForgot, setAdminForgot] = useState(false);
  const [adminForgotEmail, setAdminForgotEmail] = useState('');
  const [adminForgotLoading, setAdminForgotLoading] = useState(false);

  // ── Admin-signup tab ────────────────────────────────────────────────────────
  const [asuName, setAsuName] = useState('');
  const [asuEmail, setAsuEmail] = useState('');
  const [asuPassword, setAsuPassword] = useState('');
  const [asuCode, setAsuCode] = useState('');
  const [asuLoading, setAsuLoading] = useState(false);

  // ── Farmer handlers ─────────────────────────────────────────────────────────
  const handleFarmerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFarmerLoading(true);

    if (farmerMode === 'forgot') {
      const { error } = await resetPassword(farmerEmail);
      setFarmerLoading(false);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: t('auth.checkEmail', lang), description: t('auth.resetLinkSent', lang) });
        setFarmerMode('login');
        setFarmerEmail('');
      }
      return;
    }

    if (farmerMode === 'signup') {
      if (!farmerName.trim()) {
        toast({ title: 'Error', description: t('auth.nameRequired', lang), variant: 'destructive' });
        setFarmerLoading(false); return;
      }
      const { data, error } = await signUp(farmerEmail, farmerPassword, farmerName.trim());
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

  // ── Admin-login handler ─────────────────────────────────────────────────────
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    const { error } = await signIn(adminEmail, adminPassword);
    setAdminLoading(false);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
    else { navigate('/admin'); }
  };

  const handleAdminForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminForgotLoading(true);
    const { error } = await resetPassword(adminForgotEmail);
    setAdminForgotLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('auth.checkEmail', lang), description: t('auth.resetLinkSent', lang) });
      setAdminForgot(false);
      setAdminForgotEmail('');
    }
  };

  // ── Admin-signup handler ────────────────────────────────────────────────────
  const handleAdminSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (asuCode.trim().toUpperCase() !== ADMIN_INVITE_CODE) {
      toast({ title: 'Access Denied', description: t('auth.inviteCodeInvalid', lang), variant: 'destructive' });
      return;
    }
    if (!asuName.trim()) {
      toast({ title: 'Error', description: t('auth.nameRequired', lang), variant: 'destructive' });
      return;
    }
    setAsuLoading(true);
    const { data, error } = await signUp(asuEmail, asuPassword, asuName.trim());
    setAsuLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      if (data?.user) {
        // Insert them into admin_requests
        await supabase.from('admin_requests').insert({
          user_id: data.user.id,
          email: asuEmail,
          full_name: asuName.trim(),
          status: 'pending'
        });
      }
      toast({ title: t('auth.adminSignupSuccess', lang), description: "Account created! Please verify your email, then wait for the Main Admin to approve your account." });
      setAsuName(''); setAsuEmail(''); setAsuPassword(''); setAsuCode('');
    }
  };

  // ── Shared input style ──────────────────────────────────────────────────────
  const inputCls = 'h-12 md:h-14 pl-14 md:pl-16 rounded-lg md:rounded-xl bg-background border border-foreground/5 text-xs md:text-base font-medium text-foreground focus:border-primary focus:ring-0 transition-all placeholder:text-foreground/20';
  const labelCls = 'ml-4 md:ml-6 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-primary/40';
  const spinnerEl = <div className="h-6 w-6 animate-spin rounded-full border-4 border-white border-t-transparent" />;
  const submitBtn = (loading: boolean, label: string) => (
    <Button type="submit"
      className="w-full h-14 md:h-16 rounded-xl md:rounded-2xl bg-secondary hover:brightness-110 text-white font-bold text-lg md:text-xl uppercase tracking-widest shadow-xl border border-white/10 transition-all active:scale-[0.98] disabled:opacity-50"
      disabled={loading}>
      {loading ? spinnerEl : (
        <span className="flex items-center justify-center gap-3">
          {label} <ArrowRight className="h-5 w-5" />
        </span>
      )}
    </Button>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-24 relative overflow-hidden transition-colors duration-500">
      <ConsultationBackground />

      <div className="w-full max-w-4xl relative z-10 animate-in fade-in zoom-in duration-700">
        {/* Header securely readable on any background */}
        <div className="text-center mb-8 bg-white/80 dark:bg-black/80 backdrop-blur-md py-6 px-10 rounded-3xl md:rounded-[3rem] shadow-xl max-w-2xl mx-auto border border-foreground/10">
          <div className="mx-auto mb-6 flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-xl md:rounded-2xl bg-primary shadow-xl border border-white/10">
            <ShieldCheck className="h-8 w-8 md:h-10 md:w-10 text-primary-foreground" />
          </div>
          <h1 className="mb-3 font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl uppercase leading-none">
            Kigezi <span className="text-primary">Vet</span>
          </h1>
          <p className="text-xs md:text-sm font-semibold text-foreground/40 tracking-[0.2em] uppercase mb-2">
            Digital Veterinary Consultation Service Platform
          </p>
          <p className="text-[10px] md:text-xs font-medium text-foreground/30 tracking-widest uppercase">
            Authorize your session to continue
          </p>
        </div>

        <div className="bg-card rounded-2xl md:rounded-[3rem] p-5 md:p-6 shadow-2xl overflow-hidden border border-foreground/5">
          <Tabs defaultValue="farmer" className="w-full">
            {/* Tab triggers */}
            <TabsList className="mb-8 md:mb-10 grid w-full grid-cols-3 bg-muted p-1.5 md:p-2 rounded-xl md:rounded-[3rem] h-14 md:h-16 border border-foreground/5">
              <TabsTrigger value="farmer"
                className="rounded-lg md:rounded-[2.5rem] font-bold uppercase tracking-widest text-[9px] md:text-xs h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                <UserPlus className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5" />
                {t('auth.farmer', lang)}
              </TabsTrigger>
              <TabsTrigger value="admin"
                className="rounded-lg md:rounded-[2.5rem] font-bold uppercase tracking-widest text-[9px] md:text-xs h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                <Lock className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5" />
                Admin
              </TabsTrigger>
              <TabsTrigger value="admin-signup"
                className="rounded-lg md:rounded-[2.5rem] font-bold uppercase tracking-widest text-[9px] md:text-xs h-full data-[state=active]:bg-secondary data-[state=active]:text-white transition-all">
                <Zap className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5" />
                {t('auth.adminSignup', lang)}
              </TabsTrigger>
            </TabsList>

            <div className="px-4 md:px-8 pb-10 md:pb-14">

              {/* ═══════════════ FARMER TAB ═══════════════ */}
              <TabsContent value="farmer" className="mt-0 space-y-8 animate-in fade-in slide-in-from-left-5 duration-700">

                {/* Login / Signup / ForgotPassword sub-toggle */}
                {farmerMode !== 'forgot' && (
                  <div className="flex p-1.5 bg-muted rounded-xl md:rounded-[3rem] mb-6 border border-foreground/5 h-12 md:h-14">
                    {(['login', 'signup'] as const).map(m => (
                      <button key={m} onClick={() => setFarmerMode(m)}
                        className={`flex-1 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-lg md:rounded-[2.5rem] transition-all
                          ${farmerMode === m ? 'bg-background text-foreground shadow-md border border-foreground/10' : 'text-foreground/30 hover:text-foreground'}`}>
                        {m === 'login' ? t('auth.login', lang) : t('auth.signup', lang)}
                      </button>
                    ))}
                  </div>
                )}

                <form onSubmit={handleFarmerSubmit} className="space-y-6">
                  <div className="mb-6 text-left">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground uppercase tracking-tight mb-1">
                      {farmerMode === 'forgot' ? t('auth.resetPassword', lang) : 'Farmer Portal'}
                    </h2>
                    <p className="text-[10px] md:text-xs font-medium text-foreground/40 uppercase tracking-widest">
                      {farmerMode === 'forgot'
                        ? t('auth.resetPasswordDesc', lang)
                        : 'Authorization required for service access'}
                    </p>
                  </div>

                  {/* Name field (signup only) */}
                  {farmerMode === 'signup' && (
                    <div className="space-y-2.5">
                      <label className={labelCls}>Full Name</label>
                      <div className="relative">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/10" />
                        <Input value={farmerName} onChange={e => setFarmerName(e.target.value)}
                          placeholder="ENTER FULL NAME" className={inputCls} required />
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div className="space-y-2.5">
                    <label className={labelCls}>Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/10" />
                      <Input type="email" value={farmerEmail} onChange={e => setFarmerEmail(e.target.value.toLowerCase())}
                        placeholder="your@email.com" className={inputCls} required />
                    </div>
                  </div>

                  {/* Password (login / signup only) */}
                  {farmerMode !== 'forgot' && (
                    <div className="space-y-2.5">
                      <label className={labelCls}>Password</label>
                      <div className="relative">
                        <Key className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/10" />
                        <Input type="password" value={farmerPassword} onChange={e => setFarmerPassword(e.target.value)}
                          placeholder="••••••••" className={inputCls} required minLength={6} />
                      </div>
                      {farmerMode === 'login' && (
                        <button type="button"
                          onClick={() => { setFarmerMode('forgot'); }}
                          className="ml-4 text-[10px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">
                          {t('auth.forgotPassword', lang)}
                        </button>
                      )}
                    </div>
                  )}

                  {submitBtn(farmerLoading,
                    farmerMode === 'forgot' ? t('auth.resetPassword', lang)
                      : farmerMode === 'signup' ? t('auth.signup', lang)
                        : t('auth.login', lang))}

                  {/* Back from forgot */}
                  {farmerMode === 'forgot' && (
                    <button type="button"
                      onClick={() => { setFarmerMode('login'); setFarmerEmail(''); }}
                      className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors mx-auto">
                      <ChevronLeft className="h-3.5 w-3.5" /> {t('auth.backToLogin', lang)}
                    </button>
                  )}
                </form>
              </TabsContent>

              {/* ═══════════════ ADMIN LOGIN TAB ═══════════════ */}
              <TabsContent value="admin" className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-5 duration-700">
                <div className="text-center mb-6">
                  <div className="mx-auto mb-5 flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-xl md:rounded-2xl bg-primary/10 text-primary border border-primary/20 animate-pulse shadow-xl">
                    <Lock className="h-8 md:h-10 md:w-10" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground uppercase tracking-tight mb-1">
                    {adminForgot ? t('auth.resetPassword', lang) : 'Staff Terminal'}
                  </h2>
                  <p className="text-[10px] md:text-xs font-medium text-foreground/40 uppercase tracking-widest">
                    {adminForgot ? t('auth.resetPasswordDesc', lang) : 'Admin Access Only • Encrypted Credential Input'}
                  </p>
                </div>

                {/* Forgot password mode */}
                {adminForgot ? (
                  <form onSubmit={handleAdminForgot} className="space-y-6">
                    <div className="space-y-2.5">
                      <label className={labelCls}>Admin Email</label>
                      <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/10" />
                        <Input type="email" value={adminForgotEmail}
                          onChange={e => setAdminForgotEmail(e.target.value.toLowerCase())}
                          placeholder="admin@kigezi.vet" className={inputCls} required />
                      </div>
                    </div>
                    {submitBtn(adminForgotLoading, t('auth.resetPassword', lang))}
                    <button type="button" onClick={() => { setAdminForgot(false); setAdminForgotEmail(''); }}
                      className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors mx-auto">
                      <ChevronLeft className="h-3.5 w-3.5" /> {t('auth.backToLogin', lang)}
                    </button>
                  </form>
                ) : (
                  /* Normal admin login */
                  <form onSubmit={handleAdminLogin} className="space-y-6">
                    <div className="space-y-2.5">
                      <label className={labelCls}>Admin Email</label>
                      <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/10" />
                        <Input type="email" value={adminEmail}
                          onChange={e => setAdminEmail(e.target.value.toLowerCase())}
                          placeholder="admin@kigezi.vet" className={inputCls} required />
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <label className={labelCls}>Password</label>
                      <div className="relative">
                        <Key className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/10" />
                        <Input type="password" value={adminPassword}
                          onChange={e => setAdminPassword(e.target.value)}
                          placeholder="••••••••" className={inputCls} required />
                      </div>
                      <button type="button" onClick={() => setAdminForgot(true)}
                        className="ml-4 text-[10px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">
                        {t('auth.forgotPassword', lang)}
                      </button>
                    </div>
                    <Button type="submit"
                      className="w-full h-14 md:h-16 rounded-xl md:rounded-2xl bg-secondary hover:brightness-110 text-white font-bold text-lg md:text-xl uppercase tracking-widest shadow-xl border border-white/10 transition-all active:scale-[0.98] disabled:opacity-50"
                      disabled={adminLoading}>
                      {adminLoading ? spinnerEl : (
                        <span className="flex items-center justify-center gap-4">
                          Launch Command <Zap className="h-6 w-6 fill-white" />
                        </span>
                      )}
                    </Button>
                  </form>
                )}
              </TabsContent>

              {/* ═══════════════ ADMIN SIGN UP TAB ═══════════════ */}
              <TabsContent value="admin-signup" className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-5 duration-700">
                <div className="text-center mb-6">
                  <div className="mx-auto mb-5 flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-xl md:rounded-2xl bg-secondary/10 text-secondary border border-secondary/20 shadow-xl">
                    <RotateCcw className="h-8 md:h-10 md:w-10" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground uppercase tracking-tight mb-1">
                    {t('auth.adminSignup', lang)}
                  </h2>
                  <p className="text-[10px] md:text-xs font-medium text-foreground/40 uppercase tracking-widest">
                    Restricted • Valid invite code required
                  </p>
                </div>

                <form onSubmit={handleAdminSignup} className="space-y-6">
                  {/* Invite Code */}
                  <div className="space-y-2.5">
                    <label className={labelCls}>{t('auth.inviteCode', lang)}</label>
                    <div className="relative">
                      <Hash className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/10" />
                      <Input value={asuCode} onChange={e => setAsuCode(e.target.value)}
                        placeholder={t('auth.inviteCodePlaceholder', lang)}
                        className={inputCls} required />
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-2.5">
                    <label className={labelCls}>Full Name</label>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/10" />
                      <Input value={asuName} onChange={e => setAsuName(e.target.value)}
                        placeholder="ADMIN FULL NAME" className={inputCls} required />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2.5">
                    <label className={labelCls}>Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/10" />
                      <Input type="email" value={asuEmail}
                        onChange={e => setAsuEmail(e.target.value.toLowerCase())}
                        placeholder="admin@kigezi.vet" className={inputCls} required />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2.5">
                    <label className={labelCls}>Password</label>
                    <div className="relative">
                      <Key className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/10" />
                      <Input type="password" value={asuPassword}
                        onChange={e => setAsuPassword(e.target.value)}
                        placeholder="••••••••" className={inputCls} required minLength={8} />
                    </div>
                    <p className="ml-4 text-[9px] text-foreground/30 uppercase tracking-widest">Minimum 8 characters</p>
                  </div>

                  <Button type="submit"
                    className="w-full h-14 md:h-16 rounded-xl md:rounded-2xl bg-secondary hover:brightness-110 text-white font-bold text-lg md:text-xl uppercase tracking-widest shadow-xl border border-white/10 transition-all active:scale-[0.98] disabled:opacity-50"
                    disabled={asuLoading}>
                    {asuLoading ? spinnerEl : (
                      <span className="flex items-center justify-center gap-3">
                        Create Admin Account <ArrowRight className="h-5 w-5" />
                      </span>
                    )}
                  </Button>

                  <p className="text-center text-[9px] font-bold uppercase tracking-widest text-foreground/30 pt-2">
                    After signup, the super admin must assign your role in the dashboard.
                  </p>
                </form>
              </TabsContent>

            </div>
          </Tabs>
        </div>

        <p className="mt-10 md:mt-14 text-center text-[10px] md:text-sm font-black uppercase tracking-[0.4em] text-foreground/60 leading-relaxed max-w-2xl mx-auto border-t border-foreground/5 pt-8">
          Kigezi Vet • Digital Veterinary Consultation Service Platform<br />
          <span className="mt-2 block text-xs tracking-[0.6em] text-foreground/40 font-medium">
            System Pulse: <span className="text-secondary animate-pulse font-black">Online</span>
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
