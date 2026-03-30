import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Key, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ConsultationBackground from '@/components/ConsultationBackground';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const { lang } = useLanguage();
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase sends the user back with a recovery token in the URL fragment.
  // The auth state change fires with event === 'PASSWORD_RECOVERY' once the
  // token is exchanged, giving us a valid session to call updateUser against.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });

    // Also check if a session already exists (user navigates back to this page)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: t('auth.passwordMismatch', lang), variant: 'destructive' });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: 'Error', description: 'Password must be at least 8 characters.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(newPassword);
    setLoading(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setDone(true);
      toast({ title: t('auth.passwordUpdated', lang), description: 'You can now log in with your new password.' });
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  const inputCls = 'h-12 md:h-14 pl-14 md:pl-16 rounded-lg md:rounded-xl bg-background border border-foreground/5 text-xs md:text-base font-medium text-foreground focus:border-primary focus:ring-0 transition-all placeholder:text-foreground/20';
  const labelCls = 'ml-4 md:ml-6 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-primary/40';

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-24 relative overflow-hidden transition-colors duration-500">
      <ConsultationBackground />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-700">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-xl md:rounded-2xl bg-primary shadow-xl border border-white/10">
            <ShieldCheck className="h-8 w-8 md:h-10 md:w-10 text-primary-foreground" />
          </div>
          <h1 className="mb-2 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl uppercase leading-none">
            {t('auth.resetPassword', lang)}
          </h1>
          <p className="text-[10px] md:text-xs font-medium text-foreground/40 tracking-[0.2em] uppercase">
            Kigezi Vet • Digital Veterinary Consultation Platform
          </p>
        </div>

        <div className="bg-card rounded-2xl md:rounded-[3rem] p-6 md:p-10 shadow-2xl border border-foreground/5">

          {/* ── Success state ── */}
          {done ? (
            <div className="flex flex-col items-center gap-6 py-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 border border-green-500/30">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground uppercase tracking-tight">
                  {t('auth.passwordUpdated', lang)}
                </p>
                <p className="mt-2 text-sm text-foreground/50 uppercase tracking-widest text-xs">
                  Redirecting you to login…
                </p>
              </div>
              <Button
                onClick={() => navigate('/login')}
                className="w-full h-12 rounded-xl bg-primary hover:brightness-110 text-white font-bold uppercase tracking-widest">
                Go to Login Now
              </Button>
            </div>
          ) : !sessionReady ? (
            /* ── Waiting for recovery token ── */
            <div className="flex flex-col items-center gap-6 py-6 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm font-bold text-foreground/50 uppercase tracking-widest">
                Verifying reset link…
              </p>
              <p className="text-xs text-foreground/30 uppercase tracking-widest max-w-xs">
                If this takes too long, please request a new reset link from the login page.
              </p>
              <Button variant="outline" onClick={() => navigate('/login')}
                className="rounded-xl border-foreground/10 uppercase tracking-widest text-xs font-bold">
                Back to Login
              </Button>
            </div>
          ) : (
            /* ── Update password form ── */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="mb-4 text-left">
                <h2 className="text-xl md:text-2xl font-bold text-foreground uppercase tracking-tight mb-1">
                  Set New Password
                </h2>
                <p className="text-[10px] font-medium text-foreground/40 uppercase tracking-widest">
                  Choose a strong password (min. 8 characters)
                </p>
              </div>

              {/* New password */}
              <div className="space-y-2.5">
                <label className={labelCls}>{t('auth.newPassword', lang)}</label>
                <div className="relative">
                  <Key className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/10" />
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputCls}
                    required
                    minLength={8}
                  />
                </div>
              </div>

              {/* Confirm password */}
              <div className="space-y-2.5">
                <label className={labelCls}>{t('auth.confirmPassword', lang)}</label>
                <div className="relative">
                  <Key className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/10" />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputCls}
                    required
                    minLength={8}
                  />
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="ml-4 text-[10px] font-bold text-destructive uppercase tracking-widest">
                    {t('auth.passwordMismatch', lang)}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-14 rounded-xl md:rounded-2xl bg-secondary hover:brightness-110 text-white font-bold text-lg uppercase tracking-widest shadow-xl border border-white/10 transition-all active:scale-[0.98] disabled:opacity-50"
                disabled={loading || (!!confirmPassword && newPassword !== confirmPassword)}>
                {loading ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-white border-t-transparent" />
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    {t('auth.updatePassword', lang)} <ArrowRight className="h-5 w-5" />
                  </span>
                )}
              </Button>
            </form>
          )}
        </div>

        <p className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40">
          Kigezi Vet • Digital Veterinary Consultation Service Platform
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
