import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserCircle, Award, Clock, Briefcase } from 'lucide-react';

interface Profile {
    full_name: string | null;
    bio: string | null;
    specialization: string | null;
    experience_years: number | null;
    avatar_url: string | null;
}

const AdminPortfolio = () => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminProfile = async () => {
            // First try a profile with a bio
            let { data } = await supabase
                .from('profiles')
                .select('*')
                .not('bio', 'is', null)
                .limit(1)
                .maybeSingle();

            // Fallback: any profile with a name
            if (!data) {
                const fallback = await supabase
                    .from('profiles')
                    .select('*')
                    .not('full_name', 'is', null)
                    .limit(1)
                    .maybeSingle();
                data = fallback.data;
            }

            if (data) {
                setProfile(data as unknown as Profile);
            }
            setLoading(false);
        };

        fetchAdminProfile();
    }, []);

    if (loading) return null;

    // Show a placeholder card even when no profile has been saved yet
    const displayProfile: Profile = profile ?? {
        full_name: 'Kigezi Veterinary Expert',
        bio: 'Dedicated to providing the best veterinary care for the Kigezi region. Profile details coming soon.',
        specialization: 'Veterinary Specialist',
        experience_years: null,
        avatar_url: null,
    };

    return (
        <div className="mt-24 md:mt-40 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="text-center mb-16">
                <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground uppercase tracking-tight mb-4">
                    Meet Your <span className="text-primary">Medical Expert</span>
                </h2>
                <p className="text-foreground/40 font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs">The Visionary Behind Kigezi Veterinary Services</p>
            </div>

            <div className="bg-card rounded-[2rem] md:rounded-[4rem] border border-foreground/5 shadow-2xl relative overflow-hidden p-8 md:p-16">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />

                <div className="grid gap-12 lg:grid-cols-2 items-center relative z-10">
                    <div className="relative">
                        <div className="aspect-square rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-foreground/5 shadow-xl group">
                            {displayProfile.avatar_url ? (
                                <img
                                    src={displayProfile.avatar_url}
                                    alt={displayProfile.full_name || 'Admin'}
                                    className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-muted text-primary/10">
                                    <UserCircle className="h-40 w-40 md:h-64 md:w-64" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {displayProfile.experience_years && (
                            <div className="absolute -bottom-6 -right-6 glass p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-xl border border-white/10 transition-transform hover:scale-105">
                                <p className="text-3xl md:text-5xl font-black text-primary leading-none mb-1">{displayProfile.experience_years}+</p>
                                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-foreground/60">Years in Field</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-8 md:space-y-10 text-left">
                        <div>
                            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] md:text-xs font-black uppercase tracking-widest mb-6">
                                <Award className="h-4 w-4" /> Professional Pedigree
                            </div>
                            <h3 className="font-display text-4xl md:text-6xl font-bold text-foreground uppercase tracking-tight mb-4 leading-none">
                                {displayProfile.full_name}
                            </h3>
                            <p className="text-secondary font-black uppercase tracking-[0.2em] text-md md:text-xl flex items-center gap-3">
                                <Briefcase className="h-5 w-5" /> {displayProfile.specialization || 'Veterinary Specialist'}
                            </p>
                        </div>

                        <p className="text-lg md:text-xl text-foreground/60 leading-relaxed font-medium italic relative">
                            <span className="text-4xl md:text-6xl text-primary/10 absolute -top-4 -left-6 md:-left-8 font-serif">"</span>
                            {displayProfile.bio}
                        </p>

                        <div className="grid gap-6 sm:grid-cols-2 pt-8 border-t border-foreground/5">
                            <div className="flex items-center gap-4 group">
                                <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center text-primary border border-foreground/5 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">Response Time</p>
                                    <p className="font-bold text-foreground uppercase">Instant Access</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center text-primary border border-foreground/5 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                    <Award className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">Certification</p>
                                    <p className="font-bold text-foreground uppercase">Regulated Expert</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPortfolio;
