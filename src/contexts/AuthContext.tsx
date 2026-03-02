import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'super_admin' | 'staff_admin' | 'farmer' | null;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userRole: UserRole;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null, user: null, userRole: null, isAdmin: false, loading: true,
  signIn: async () => ({ error: null }), signUp: async () => ({ error: null }), signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(() => {
    return (localStorage.getItem('kigezi_user_role') as UserRole) || null;
  });
  const [loading, setLoading] = useState(true);

  // Hardcoded Super Admin check
  const SUPER_ADMIN_EMAIL = 'aaronkwesiga20@gmail.com';

  const checkAdmin = async (userId: string, email?: string) => {
    try {
      // Check Database Role
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      const dbRole = data?.role as string;
      let finalRole: UserRole = 'farmer';

      // Priority: Database Role > Hardcoded Email (for emergency access)
      if (dbRole === 'super_admin' || dbRole === 'staff_admin' || dbRole === 'admin') {
        finalRole = (dbRole === 'admin' ? 'staff_admin' : dbRole as UserRole);
      } else if (email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
        finalRole = 'super_admin';
      }

      if (finalRole !== userRole) {
        setUserRole(finalRole);
        localStorage.setItem('kigezi_user_role', finalRole || '');
      }
    } catch (error) {
      console.error('Error in checkAdmin:', error);
    }
  };

  useEffect(() => {
    const handleSession = async (currentSession: Session | null) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        // If we have a cached role, we can stop loading early
        const cachedRole = localStorage.getItem('kigezi_user_role');
        if (cachedRole) {
          setLoading(false);
        }

        // Always refresh role in background
        await checkAdmin(currentSession.user.id, currentSession.user.email);
      }

      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signOut = async () => {
    // 1. Clear all client-side storage first
    localStorage.clear();
    sessionStorage.clear();

    // 2. Reset React state immediately
    setSession(null);
    setUser(null);
    setUserRole(null);

    // 3. Redirect to login right away (don't wait for Supabase)
    window.location.hash = '/login';

    // 4. Fire the Supabase signOut in background so the server session ends
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase signOut error (safe to ignore, already redirected):', err);
    }
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      userRole,
      isAdmin: userRole === 'super_admin' || userRole === 'staff_admin',
      loading,
      signIn,
      signUp,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};
