import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { t, languageNames, Language } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { Menu, X, Globe, LogOut, Zap, Sun, Moon, Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const { lang, setLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, isAdmin, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const fetchUnread = async () => {
      let query = supabase.from('chat_messages').select('*', { count: 'exact', head: true });

      if (isAdmin) {
        // Admins see unread messages from visitors
        query = query.eq('sender_type', 'visitor').eq('is_read', false);
      } else {
        // Farmers see unread messages from admins for their specific conversation
        const convoId = localStorage.getItem(`chat_convo_${user.id}`);
        if (!convoId) {
          setUnreadCount(0);
          return;
        }
        query = query.eq('conversation_id', convoId).eq('sender_type', 'admin').eq('is_read', false);
      }

      const { count } = await query;
      setUnreadCount(count || 0);
    };

    fetchUnread();

    const channel = supabase
      .channel('navbar-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, () => fetchUnread())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_messages' }, () => fetchUnread())
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'chat_messages' }, () => fetchUnread())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, isAdmin]);

  const links = [
    { to: '/', label: t('nav.home', lang) },
    { to: '/products', label: t('nav.products', lang) },
    { to: '/chat', label: t('nav.chat', lang) },
    { to: '/ai-symptom-checker', label: 'AI Health Checker', badge: 'NEW' },
    { to: '/contact', label: t('nav.contact', lang) },


  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-primary/10 bg-background/80 backdrop-blur-xl transition-colors duration-500">
      <div className="container mx-auto flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
        <Link to="/" className="flex items-center gap-3 md:gap-4 group">
          <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg md:rounded-xl bg-primary shadow-sm transition-all group-hover:scale-105 border border-primary/10">
            <span className="font-display text-lg md:text-xl font-bold text-primary-foreground">K</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg md:text-xl font-bold text-foreground leading-none tracking-tight uppercase">
              Kigezi Vet
            </span>
            <span className="text-[7px] md:text-[9px] font-bold uppercase tracking-[0.2em] text-primary/60 mt-1 md:mt-1.5 flex items-center gap-1.5">
              <Zap className="h-2.5 w-2.5 md:h-3.5 md:w-3.5 fill-secondary/40 text-secondary" /> Expert Hub
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-[10px] md:text-xs lg:text-sm font-black uppercase tracking-[0.25em] transition-all hover:text-primary relative group/nav ${isActive(link.to)
                ? 'text-primary scale-105 underline decoration-primary/30 decoration-2 underline-offset-8'
                : link.to === '/ai-symptom-checker' ? 'text-primary/90' : 'text-foreground/60'
                }`}
            >
              {link.label}
              {(link as any).badge && (
                <span className="ml-1 px-1 py-0.5 text-[7px] bg-primary text-white rounded font-bold animate-pulse">
                  {(link as any).badge}
                </span>
              )}

              {link.to === '/chat' && unreadCount > 0 && (
                <span className="absolute -top-2 -right-3 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary border border-background"></span>
                </span>
              )}
            </Link>
          ))}
          {user && isAdmin && (
            <Link
              to="/admin"
              className={`text-[9px] md:text-xs lg:text-sm font-bold uppercase tracking-[0.2em] transition-all hover:text-primary relative group/nav ${isActive('/admin')
                ? 'text-primary scale-105 underline decoration-primary/30 decoration-2 underline-offset-8'
                : 'text-foreground/60'
                }`}
            >
              {t('admin.dashboard', lang)}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-3 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary border border-background"></span>
                </span>
              )}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2.5 md:gap-3.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 md:h-11 md:w-11 rounded-lg md:rounded-xl bg-muted/50 border border-foreground/5 text-foreground hover:bg-primary hover:text-white transition-all"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon className="h-4 w-4 md:h-5 md:w-5 text-primary" /> : <Sun className="h-4 w-4 md:h-5 md:w-5 text-secondary" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 md:h-11 px-3 md:px-5 gap-2 md:gap-2.5 rounded-lg md:rounded-xl bg-muted/50 border border-foreground/5 text-foreground font-bold hover:bg-primary hover:text-white transition-all uppercase tracking-widest text-[9px]">
                <Globe className="h-3.5 w-3.5 text-secondary" />
                <span className="hidden lg:inline">{languageNames[lang]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background border border-primary/20 rounded-2xl md:rounded-3xl p-2 md:p-3 shadow-2xl min-w-[140px] md:min-w-[180px]">
              {(Object.keys(languageNames) as Language[]).map((l) => (
                <DropdownMenuItem
                  key={l}
                  onClick={() => setLang(l)}
                  className="rounded-lg md:rounded-xl font-bold text-foreground uppercase tracking-widest hover:bg-primary hover:text-white focus:bg-primary focus:text-white transition-colors cursor-pointer px-4 md:px-6 py-2 md:py-3 text-xs md:text-sm mb-1"
                >
                  {languageNames[l]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="rounded-lg md:rounded-xl h-9 md:h-11 px-3 md:px-5 font-bold text-[9px] md:text-xs uppercase tracking-widest text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all"
            >
              <LogOut className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2 md:mr-2.5" />
              <span className="hidden sm:inline">{t('auth.logout', lang)}</span>
            </Button>
          ) : (
            <Link to="/login">
              <Button
                variant="default"
                size="sm"
                className="rounded-lg md:rounded-xl h-9 md:h-11 px-3 md:px-6 font-bold text-[9px] md:text-xs uppercase tracking-widest bg-secondary hover:brightness-110 text-white shadow-md transition-all hover:scale-105 border border-white/10"
              >
                {t('auth.login', lang)}
              </Button>
            </Link>
          )}

          <button
            className="md:hidden rounded-lg p-2.5 bg-muted text-foreground hover:bg-primary hover:text-white transition-all border border-foreground/5"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-primary/10 bg-background/95 px-6 py-10 md:hidden space-y-6 animate-in slide-in-from-top-10 duration-500 shadow-2xl">
          <div className="relative group mb-6"> {/* Added search input for mobile */}
            <Input
              placeholder={t('nav.search', lang)}
              className="h-10 w-full rounded-xl bg-muted/60 border-2 border-foreground/10 pl-10 pr-4 text-base font-bold text-foreground placeholder:text-foreground/40 focus:bg-background focus:ring-0 focus:border-primary transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40 group-focus-within:text-primary transition-colors" />
          </div>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block text-2xl md:text-3xl font-bold uppercase tracking-tight ${link.to === '/ai-symptom-checker' ? 'text-primary' : 'text-foreground/30'}`}
            >
              {link.label}
              {(link as any).badge && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-white rounded align-middle">
                  {(link as any).badge}
                </span>
              )}
            </Link>

          ))}
          {user && isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="block text-2xl md:text-3xl font-bold uppercase tracking-tight text-foreground/30"
            >
              {t('admin.dashboard', lang)}
            </Link>
          )}

          {user && (
            <button
              onClick={() => {
                setMobileOpen(false);
                signOut();
              }}
              className="flex items-center gap-4 text-2xl md:text-3xl font-bold uppercase tracking-tight text-primary transition-all active:scale-95"
            >
              <LogOut className="h-6 w-6 md:h-8 md:w-8" />
              {t('auth.logout', lang)}
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
