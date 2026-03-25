import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PawPrint, Stethoscope, ChevronRight, ChevronLeft, Calendar, DollarSign, Heart, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Farmer {
  id: string;
  full_name: string;
  email: string | null;
  phone_number: string | null;
  village: string | null;
}

interface Livestock {
  id: string;
  species: string;
  breed: string | null;
  identifier: string | null;
  gender: string | null;
}

interface MedicalRecord {
  id: string;
  visit_date: string;
  symptoms: string;
  diagnosis: string;
  treatment_given: string;
  medications_used: string | null;
  cost: number | null;
  next_visit_date: string | null;
  vet_name: string | null;
  notes: string | null;
}

const SPECIES_ICON: Record<string, string> = {
  Cattle: '🐄', Goat: '🐐', Sheep: '🐑', Poultry: '🐔', Pig: '🐖',
  Dog: '🐕', Cat: '🐈', Rabbit: '🐇', Other: '🐾'
};

export default function Dashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [myProfile, setMyProfile] = useState<Farmer | null>(null);
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<Livestock | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    // 1. Fetch farmer profile matching user email
    if (!user?.email) return;

    // RLS ensures they can only read their own row
    const { data: farmerData, error: farmerError } = await supabase
      .from('farmers')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (farmerData) {
      setMyProfile(farmerData as Farmer);
      
      // 2. Fetch livestock linked to this farmer (RLS protects this too)
      const { data: livestockData } = await supabase
        .from('livestock')
        .select('*')
        .order('species');
        
      if (livestockData) {
        setLivestock(livestockData as Livestock[]);
      }
    }
    setLoading(false);
  };

  const fetchRecords = async (animal: Livestock) => {
    setSelectedAnimal(animal);
    
    // RLS protects medical records
    const { data } = await supabase
      .from('medical_records')
      .select('*')
      .eq('livestock_id', animal.id)
      .order('visit_date', { ascending: false });
      
    setRecords((data as MedicalRecord[]) || []);
  };

  const goBack = () => {
    setSelectedAnimal(null);
    setRecords([]);
  };

  if (authLoading || loading) return <div className="flex min-h-[50vh] items-center justify-center"><div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (isAdmin) return <Navigate to="/admin" />; // Admins should use Command Center

  return (
    <div className="min-h-screen bg-background px-6 py-12 md:py-16 relative overflow-hidden font-sans">
      <div className="container relative z-10 mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-5 duration-1000">
        
        <div className="mb-10 border-b border-foreground/10 pb-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground uppercase leading-none mb-2">
              My <span className="text-primary">Livestock</span>
            </h1>
            <p className="text-md text-foreground/50 tracking-tight uppercase font-medium">
              View your animals and medical history
            </p>
          </div>
          
          <div className="bg-card px-6 py-4 rounded-2xl border border-foreground/5 shadow-md flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl uppercase">
              {myProfile?.full_name?.charAt(0) || user.email?.charAt(0)}
            </div>
            <div className="text-left">
              <p className="font-bold text-lg uppercase leading-tight">{myProfile?.full_name || 'Farmer Profile'}</p>
              <p className="text-xs text-foreground/50 font-medium">{user.email}</p>
            </div>
          </div>
        </div>

        {!myProfile ? (
          <div className="bg-card border border-foreground/5 rounded-3xl p-10 text-center shadow-xl">
            <PawPrint className="h-16 w-16 text-foreground/20 mx-auto mb-4" />
            <h3 className="text-2xl font-bold uppercase tracking-tight mb-2">No Records Found</h3>
            <p className="text-foreground/60 max-w-md mx-auto">
              Your email address is not currently linked to any registered farmer records. If you recently registered at the clinic, please ask the vet to update your file with your email address: <strong className="text-primary">{user.email}</strong>.
            </p>
          </div>
        ) : !selectedAnimal ? (
          <div className="space-y-6">
            <h3 className="font-bold uppercase tracking-widest text-sm text-foreground/50 mb-4 px-2">My Registered Animals ({livestock.length})</h3>
            
            {livestock.length === 0 ? (
              <div className="border border-dashed border-foreground/20 rounded-3xl p-10 text-center">
                <p className="text-foreground/50 font-medium uppercase tracking-widest">No animals registered yet</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {livestock.map(animal => (
                  <button 
                    key={animal.id} 
                    onClick={() => fetchRecords(animal)}
                    className="group bg-card border border-foreground/5 rounded-2xl p-6 text-left hover:border-primary/30 hover:shadow-lg transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center text-3xl shadow-sm">{SPECIES_ICON[animal.species] || '🐾'}</div>
                      <div>
                        <p className="font-bold text-xl uppercase tracking-tight group-hover:text-primary transition-colors">{animal.identifier || animal.species}</p>
                        <p className="text-xs text-foreground/40 font-medium uppercase tracking-widest mt-1">
                          {[animal.species, animal.breed, animal.gender].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-foreground/20 group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right-8">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" onClick={goBack} className="rounded-xl font-bold uppercase tracking-widest text-sm gap-2">
                <ChevronLeft className="h-4 w-4" /> Back to Animals
              </Button>
            </div>
            
            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-background flex items-center justify-center text-3xl shadow-sm">
                  {SPECIES_ICON[selectedAnimal.species] || '🐾'}
                </div>
                <div>
                  <h2 className="font-bold text-2xl uppercase tracking-tight">{selectedAnimal.identifier || selectedAnimal.species}</h2>
                  <p className="text-sm font-medium text-primary/70 uppercase tracking-widest mt-0.5">
                    {[selectedAnimal.species, selectedAnimal.breed, selectedAnimal.gender].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>
            </div>

            <h3 className="font-bold uppercase tracking-widest text-sm text-foreground/50 mb-4 px-2">Clinical History ({records.length})</h3>

            <div className="space-y-4">
              {records.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 opacity-30 text-center">
                  <ClipboardList className="h-12 w-12 mb-3" />
                  <p className="font-bold uppercase tracking-widest">No medical history available</p>
                </div>
              )}
              {records.map(record => (
                <div key={record.id} className="bg-card border border-foreground/5 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm shrink-0">
                      <Stethoscope className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-lg uppercase tracking-tight">{format(new Date(record.visit_date), 'dd MMMM yyyy')}</p>
                      {record.vet_name && <p className="text-xs text-foreground/50 font-medium uppercase tracking-widest mt-1">Attending: Dr. {record.vet_name}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 bg-muted/30 p-5 rounded-2xl">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Symptoms</p>
                      <p className="text-sm font-medium">{record.symptoms || '—'}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Diagnosis</p>
                      <p className="text-sm font-medium text-foreground">{record.diagnosis || '—'}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Treatment Given</p>
                      <p className="text-sm font-medium">{record.treatment_given || '—'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {record.medications_used && <Badge className="bg-accent/10 text-accent border-none text-xs font-bold gap-1.5 px-3 py-1.5 rounded-lg"><Heart className="h-3.5 w-3.5" />{record.medications_used}</Badge>}
                    {record.cost != null && <Badge className="bg-muted text-foreground/60 border-none text-xs font-bold gap-1.5 px-3 py-1.5 rounded-lg"><DollarSign className="h-3.5 w-3.5" />UGX {record.cost.toLocaleString()}</Badge>}
                    {record.next_visit_date && <Badge className="bg-secondary/10 text-secondary border-none text-xs font-bold gap-1.5 px-3 py-1.5 rounded-lg"><Calendar className="h-3.5 w-3.5" />Next Appointment: {format(new Date(record.next_visit_date), 'dd MMM yyyy')}</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
