import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Plus, Trash2, Edit2, ChevronRight, ChevronLeft, User, Heart,
  Stethoscope, Calendar, DollarSign, Search, X, Save, AlertCircle,
  ClipboardList, PawPrint, Clock
} from 'lucide-react';
import { format } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Farmer {
  id: string;
  full_name: string;
  phone_number: string | null;
  village: string | null;
  notes: string | null;
  created_at: string;
}

interface Livestock {
  id: string;
  farmer_id: string;
  species: string;
  breed: string | null;
  identifier: string | null;
  gender: string | null;
  date_of_birth: string | null;
  notes: string | null;
  created_at: string;
}

interface MedicalRecord {
  id: string;
  livestock_id: string;
  visit_date: string;
  symptoms: string;
  diagnosis: string;
  treatment_given: string;
  medications_used: string | null;
  cost: number | null;
  next_visit_date: string | null;
  vet_name: string | null;
  notes: string | null;
  created_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SPECIES_OPTIONS = ['Cattle', 'Goat', 'Sheep', 'Poultry', 'Pig', 'Dog', 'Cat', 'Rabbit', 'Other'];
const GENDER_OPTIONS = ['Male', 'Female', 'N/A'];

const SPECIES_ICON: Record<string, string> = {
  Cattle: '🐄', Goat: '🐐', Sheep: '🐑', Poultry: '🐔', Pig: '🐖',
  Dog: '🐕', Cat: '🐈', Rabbit: '🐇', Other: '🐾'
};

// ─── Sub-forms ────────────────────────────────────────────────────────────────

const BLANK_FARMER = { full_name: '', phone_number: '', village: '', notes: '' };
const BLANK_ANIMAL = { species: 'Cattle', breed: '', identifier: '', gender: 'N/A', date_of_birth: '', notes: '' };
const BLANK_RECORD = {
  visit_date: new Date().toISOString().slice(0, 16),
  symptoms: '', diagnosis: '', treatment_given: '',
  medications_used: '', cost: '', next_visit_date: '', vet_name: '', notes: ''
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function MedicalRecordsTab() {
  const { user } = useAuth();
  const { toast } = useToast();

  // View state: 'farmers' | 'livestock' | 'records'
  const [view, setView] = useState<'farmers' | 'livestock' | 'records'>('farmers');

  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);

  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<Livestock | null>(null);

  const [farmerSearch, setFarmerSearch] = useState('');

  // Farmer form
  const [showFarmerForm, setShowFarmerForm] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [farmerForm, setFarmerForm] = useState(BLANK_FARMER);

  // Livestock form
  const [showAnimalForm, setShowAnimalForm] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Livestock | null>(null);
  const [animalForm, setAnimalForm] = useState(BLANK_ANIMAL);

  // Medical record form
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [recordForm, setRecordForm] = useState(BLANK_RECORD);

  // Loading flags
  const [saving, setSaving] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  useEffect(() => { fetchFarmers(); }, []);

  const fetchFarmers = async () => {
    const { data } = await supabase.from('farmers').select('*').order('full_name');
    setFarmers((data as Farmer[]) || []);
  };

  const fetchLivestock = async (farmerId: string) => {
    const { data } = await supabase.from('livestock').select('*').eq('farmer_id', farmerId).order('species');
    setLivestock((data as Livestock[]) || []);
  };

  const fetchRecords = async (animalId: string) => {
    const { data } = await supabase
      .from('medical_records').select('*').eq('livestock_id', animalId).order('visit_date', { ascending: false });
    setRecords((data as MedicalRecord[]) || []);
  };

  // ── Navigation ─────────────────────────────────────────────────────────────

  const selectFarmer = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setSelectedAnimal(null);
    fetchLivestock(farmer.id);
    setView('livestock');
  };

  const selectAnimal = (animal: Livestock) => {
    setSelectedAnimal(animal);
    fetchRecords(animal.id);
    setView('records');
  };

  const goBack = () => {
    if (view === 'records') { setView('livestock'); setSelectedAnimal(null); setRecords([]); }
    else if (view === 'livestock') { setView('farmers'); setSelectedFarmer(null); setLivestock([]); }
  };

  // ── Farmer CRUD ────────────────────────────────────────────────────────────

  const openFarmerForm = (farmer?: Farmer) => {
    setEditingFarmer(farmer || null);
    setFarmerForm(farmer ? { full_name: farmer.full_name, phone_number: farmer.phone_number || '', village: farmer.village || '', notes: farmer.notes || '' } : BLANK_FARMER);
    setShowFarmerForm(true);
  };

  const saveFarmer = async () => {
    if (!farmerForm.full_name.trim()) { toast({ title: 'Name required', variant: 'destructive' }); return; }
    setSaving(true);
    const payload = { full_name: farmerForm.full_name.trim(), phone_number: farmerForm.phone_number || null, village: farmerForm.village || null, notes: farmerForm.notes || null };
    let error;
    if (editingFarmer) {
      ({ error } = await supabase.from('farmers').update(payload).eq('id', editingFarmer.id));
    } else {
      ({ error } = await supabase.from('farmers').insert(payload));
    }
    setSaving(false);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: editingFarmer ? 'Farmer updated' : 'Farmer registered' });
    setShowFarmerForm(false);
    fetchFarmers();
  };

  const deleteFarmer = async (id: string) => {
    if (!confirm('Delete this farmer and ALL their livestock & records? This cannot be undone.')) return;
    const { error } = await supabase.from('farmers').delete().eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Farmer deleted' });
    fetchFarmers();
    if (selectedFarmer?.id === id) { setView('farmers'); setSelectedFarmer(null); }
  };

  // ── Livestock CRUD ─────────────────────────────────────────────────────────

  const openAnimalForm = (animal?: Livestock) => {
    setEditingAnimal(animal || null);
    setAnimalForm(animal ? { species: animal.species, breed: animal.breed || '', identifier: animal.identifier || '', gender: animal.gender || 'N/A', date_of_birth: animal.date_of_birth || '', notes: animal.notes || '' } : BLANK_ANIMAL);
    setShowAnimalForm(true);
  };

  const saveAnimal = async () => {
    if (!selectedFarmer) return;
    setSaving(true);
    const payload = { farmer_id: selectedFarmer.id, species: animalForm.species, breed: animalForm.breed || null, identifier: animalForm.identifier || null, gender: animalForm.gender || null, date_of_birth: animalForm.date_of_birth || null, notes: animalForm.notes || null };
    let error;
    if (editingAnimal) {
      ({ error } = await supabase.from('livestock').update(payload).eq('id', editingAnimal.id));
    } else {
      ({ error } = await supabase.from('livestock').insert(payload));
    }
    setSaving(false);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: editingAnimal ? 'Animal updated' : 'Animal registered' });
    setShowAnimalForm(false);
    fetchLivestock(selectedFarmer.id);
  };

  const deleteAnimal = async (id: string) => {
    if (!confirm('Delete this animal and ALL its medical records? This cannot be undone.')) return;
    const { error } = await supabase.from('livestock').delete().eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Animal removed' });
    if (selectedFarmer) fetchLivestock(selectedFarmer.id);
    if (selectedAnimal?.id === id) { setView('livestock'); setSelectedAnimal(null); }
  };

  // ── Medical Record CRUD ────────────────────────────────────────────────────

  const openRecordForm = (record?: MedicalRecord) => {
    setEditingRecord(record || null);
    setRecordForm(record ? {
      visit_date: record.visit_date.slice(0, 16),
      symptoms: record.symptoms, diagnosis: record.diagnosis,
      treatment_given: record.treatment_given, medications_used: record.medications_used || '',
      cost: record.cost?.toString() || '', next_visit_date: record.next_visit_date || '',
      vet_name: record.vet_name || '', notes: record.notes || ''
    } : { ...BLANK_RECORD, vet_name: user?.email?.split('@')[0] || '' });
    setShowRecordForm(true);
  };

  const saveRecord = async () => {
    if (!selectedAnimal) return;
    if (!recordForm.symptoms.trim() || !recordForm.diagnosis.trim() || !recordForm.treatment_given.trim()) {
      toast({ title: 'Symptoms, Diagnosis & Treatment are required', variant: 'destructive' }); return;
    }
    setSaving(true);
    const payload = {
      livestock_id: selectedAnimal.id,
      visit_date: recordForm.visit_date || new Date().toISOString(),
      symptoms: recordForm.symptoms.trim(),
      diagnosis: recordForm.diagnosis.trim(),
      treatment_given: recordForm.treatment_given.trim(),
      medications_used: recordForm.medications_used || null,
      cost: recordForm.cost ? parseFloat(recordForm.cost) : null,
      next_visit_date: recordForm.next_visit_date || null,
      vet_name: recordForm.vet_name || null,
      notes: recordForm.notes || null,
    };
    let error;
    if (editingRecord) {
      ({ error } = await supabase.from('medical_records').update(payload).eq('id', editingRecord.id));
    } else {
      ({ error } = await supabase.from('medical_records').insert(payload));
    }
    setSaving(false);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: editingRecord ? 'Record updated' : 'Treatment recorded' });
    setShowRecordForm(false);
    fetchRecords(selectedAnimal.id);
  };

  const deleteRecord = async (id: string) => {
    if (!confirm('Delete this medical record permanently?')) return;
    const { error } = await supabase.from('medical_records').delete().eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Record deleted' });
    if (selectedAnimal) fetchRecords(selectedAnimal.id);
  };

  // ── Filtered farmers ───────────────────────────────────────────────────────

  const filteredFarmers = farmers.filter(f =>
    f.full_name.toLowerCase().includes(farmerSearch.toLowerCase()) ||
    (f.phone_number || '').includes(farmerSearch) ||
    (f.village || '').toLowerCase().includes(farmerSearch.toLowerCase())
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Breadcrumb bar ── */}
      <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-foreground/50">
        <button onClick={() => { setView('farmers'); setSelectedFarmer(null); setSelectedAnimal(null); }} className={`hover:text-primary transition-colors ${view === 'farmers' ? 'text-primary' : ''}`}>Farmers</button>
        {selectedFarmer && (
          <>
            <ChevronRight className="h-4 w-4 opacity-40" />
            <button onClick={() => { setView('livestock'); setSelectedAnimal(null); }} className={`hover:text-primary transition-colors ${view === 'livestock' ? 'text-primary' : ''}`}>{selectedFarmer.full_name}</button>
          </>
        )}
        {selectedAnimal && (
          <>
            <ChevronRight className="h-4 w-4 opacity-40" />
            <span className="text-foreground/80">{SPECIES_ICON[selectedAnimal.species] || '🐾'} {selectedAnimal.identifier || selectedAnimal.species}</span>
          </>
        )}
      </div>

      {/* ══════════════ FARMERS VIEW ══════════════ */}
      {view === 'farmers' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
              <Input value={farmerSearch} onChange={e => setFarmerSearch(e.target.value)} placeholder="Search farmers…" className="pl-10 h-12 rounded-2xl bg-muted border-foreground/10" />
              {farmerSearch && <button onClick={() => setFarmerSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground"><X className="h-4 w-4" /></button>}
            </div>
            <Button onClick={() => openFarmerForm()} className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-bold uppercase tracking-widest gap-2 shadow-lg hover:brightness-110">
              <Plus className="h-5 w-5" /> Register Farmer
            </Button>
          </div>

          {/* Farmer Form */}
          {showFarmerForm && (
            <div className="bg-card border border-foreground/5 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="font-bold uppercase tracking-widest text-sm">{editingFarmer ? 'Edit Farmer' : 'New Farmer'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-foreground/50">Full Name *</label>
                  <Input value={farmerForm.full_name} onChange={e => setFarmerForm(f => ({ ...f, full_name: e.target.value }))} placeholder="John Tumusiime" className="h-11 rounded-xl bg-muted border-foreground/10" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-foreground/50">Phone</label>
                  <Input value={farmerForm.phone_number} onChange={e => setFarmerForm(f => ({ ...f, phone_number: e.target.value }))} placeholder="+256 700 000000" className="h-11 rounded-xl bg-muted border-foreground/10" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-foreground/50">Village / Location</label>
                  <Input value={farmerForm.village} onChange={e => setFarmerForm(f => ({ ...f, village: e.target.value }))} placeholder="Kabale" className="h-11 rounded-xl bg-muted border-foreground/10" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-foreground/50">Notes</label>
                  <Input value={farmerForm.notes} onChange={e => setFarmerForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any additional notes" className="h-11 rounded-xl bg-muted border-foreground/10" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={saveFarmer} disabled={saving} className="h-11 px-8 rounded-xl bg-primary font-bold uppercase tracking-widest gap-2"><Save className="h-4 w-4" />{saving ? 'Saving…' : 'Save'}</Button>
                <Button variant="ghost" onClick={() => setShowFarmerForm(false)} className="h-11 px-6 rounded-xl">Cancel</Button>
              </div>
            </div>
          )}

          {/* Farmer List */}
          <div className="grid gap-3">
            {filteredFarmers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 opacity-20 text-center">
                <User className="h-12 w-12 mb-3" />
                <p className="font-bold uppercase tracking-widest">{farmerSearch ? 'No matches' : 'No farmers yet'}</p>
              </div>
            )}
            {filteredFarmers.map(farmer => (
              <div key={farmer.id} className="group bg-card border border-foreground/5 rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-primary/20 hover:shadow-lg transition-all">
                <button onClick={() => selectFarmer(farmer)} className="flex items-center gap-4 flex-1 text-left">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shadow">{farmer.full_name.charAt(0).toUpperCase()}</div>
                  <div>
                    <p className="font-bold text-lg uppercase tracking-tight">{farmer.full_name}</p>
                    <p className="text-sm text-foreground/40 font-medium">{[farmer.phone_number, farmer.village].filter(Boolean).join(' · ')}</p>
                  </div>
                </button>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" onClick={() => openFarmerForm(farmer)} className="h-9 w-9 rounded-xl"><Edit2 className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteFarmer(farmer.id)} className="h-9 w-9 rounded-xl text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => selectFarmer(farmer)} className="h-9 w-9 rounded-xl text-primary"><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════ LIVESTOCK VIEW ══════════════ */}
      {view === 'livestock' && selectedFarmer && (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={goBack} className="h-10 px-4 rounded-xl gap-2 font-bold uppercase tracking-widest text-sm"><ChevronLeft className="h-4 w-4" /> Back</Button>
            <div className="flex-1">
              <h3 className="font-bold text-lg uppercase tracking-tight">{selectedFarmer.full_name}'s Livestock</h3>
              {selectedFarmer.village && <p className="text-xs text-foreground/40 font-medium uppercase tracking-widest">{selectedFarmer.village}</p>}
            </div>
            <Button onClick={() => openAnimalForm()} className="h-10 px-5 rounded-xl bg-primary font-bold uppercase tracking-widest text-sm gap-2 hover:brightness-110">
              <Plus className="h-4 w-4" /> Add Animal
            </Button>
          </div>

          {/* Livestock Form */}
          {showAnimalForm && (
            <div className="bg-card border border-foreground/5 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="font-bold uppercase tracking-widest text-sm">{editingAnimal ? 'Edit Animal' : 'New Animal'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-foreground/50">Species *</label>
                  <select value={animalForm.species} onChange={e => setAnimalForm(f => ({ ...f, species: e.target.value }))} className="w-full h-11 rounded-xl bg-muted border border-foreground/10 px-3 text-sm font-medium">
                    {SPECIES_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-foreground/50">Breed</label>
                  <Input value={animalForm.breed} onChange={e => setAnimalForm(f => ({ ...f, breed: e.target.value }))} placeholder="e.g. Friesian" className="h-11 rounded-xl bg-muted border-foreground/10" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-foreground/50">Identifier / Tag</label>
                  <Input value={animalForm.identifier} onChange={e => setAnimalForm(f => ({ ...f, identifier: e.target.value }))} placeholder="e.g. KG-001 or Bella" className="h-11 rounded-xl bg-muted border-foreground/10" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-foreground/50">Gender</label>
                  <select value={animalForm.gender} onChange={e => setAnimalForm(f => ({ ...f, gender: e.target.value }))} className="w-full h-11 rounded-xl bg-muted border border-foreground/10 px-3 text-sm font-medium">
                    {GENDER_OPTIONS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-foreground/50">Date of Birth</label>
                  <Input type="date" value={animalForm.date_of_birth} onChange={e => setAnimalForm(f => ({ ...f, date_of_birth: e.target.value }))} className="h-11 rounded-xl bg-muted border-foreground/10" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-foreground/50">Notes</label>
                  <Input value={animalForm.notes} onChange={e => setAnimalForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional info" className="h-11 rounded-xl bg-muted border-foreground/10" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={saveAnimal} disabled={saving} className="h-11 px-8 rounded-xl bg-primary font-bold uppercase tracking-widest gap-2"><Save className="h-4 w-4" />{saving ? 'Saving…' : 'Save'}</Button>
                <Button variant="ghost" onClick={() => setShowAnimalForm(false)} className="h-11 px-6 rounded-xl">Cancel</Button>
              </div>
            </div>
          )}

          {/* Livestock list */}
          <div className="grid gap-3 sm:grid-cols-2">
            {livestock.length === 0 && (
              <div className="sm:col-span-2 flex flex-col items-center justify-center py-16 opacity-20 text-center">
                <PawPrint className="h-12 w-12 mb-3" />
                <p className="font-bold uppercase tracking-widest">No animals registered</p>
              </div>
            )}
            {livestock.map(animal => (
              <div key={animal.id} className="group bg-card border border-foreground/5 rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-primary/20 hover:shadow-lg transition-all">
                <button onClick={() => selectAnimal(animal)} className="flex items-center gap-4 flex-1 text-left">
                  <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center text-2xl shadow">{SPECIES_ICON[animal.species] || '🐾'}</div>
                  <div>
                    <p className="font-bold uppercase tracking-tight">{animal.identifier || animal.species}</p>
                    <p className="text-sm text-foreground/40 font-medium">{[animal.species, animal.breed, animal.gender].filter(Boolean).join(' · ')}</p>
                  </div>
                </button>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" onClick={() => openAnimalForm(animal)} className="h-9 w-9 rounded-xl"><Edit2 className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteAnimal(animal.id)} className="h-9 w-9 rounded-xl text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => selectAnimal(animal)} className="h-9 w-9 rounded-xl text-primary"><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════ MEDICAL RECORDS VIEW ══════════════ */}
      {view === 'records' && selectedAnimal && (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={goBack} className="h-10 px-4 rounded-xl gap-2 font-bold uppercase tracking-widest text-sm"><ChevronLeft className="h-4 w-4" /> Back</Button>
            <div className="flex-1">
              <h3 className="font-bold text-lg uppercase tracking-tight">{SPECIES_ICON[selectedAnimal.species] || '🐾'} {selectedAnimal.identifier || selectedAnimal.species} — Medical History</h3>
              <p className="text-xs text-foreground/40 font-medium uppercase tracking-widest">{selectedFarmer?.full_name}</p>
            </div>
            <Button onClick={() => openRecordForm()} className="h-10 px-5 rounded-xl bg-primary font-bold uppercase tracking-widest text-sm gap-2 hover:brightness-110">
              <Plus className="h-4 w-4" /> New Record
            </Button>
          </div>

          {/* Medical Record Form */}
          {showRecordForm && (
            <div className="bg-card border border-foreground/5 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="font-bold uppercase tracking-widest text-sm flex items-center gap-2"><Stethoscope className="h-4 w-4 text-primary" />{editingRecord ? 'Edit Record' : 'New Treatment Record'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-foreground/50">Visit Date *</label>
                  <Input type="datetime-local" value={recordForm.visit_date} onChange={e => setRecordForm(f => ({ ...f, visit_date: e.target.value }))} className="h-11 rounded-xl bg-muted border-foreground/10" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-foreground/50">Vet Name</label>
                  <Input value={recordForm.vet_name} onChange={e => setRecordForm(f => ({ ...f, vet_name: e.target.value }))} placeholder="Attending vet" className="h-11 rounded-xl bg-muted border-foreground/10" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-foreground/50">Symptoms *</label>
                  <textarea value={recordForm.symptoms} onChange={e => setRecordForm(f => ({ ...f, symptoms: e.target.value }))} placeholder="Observed symptoms…" rows={2} className="w-full rounded-xl bg-muted border border-foreground/10 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-foreground/50">Diagnosis *</label>
                  <textarea value={recordForm.diagnosis} onChange={e => setRecordForm(f => ({ ...f, diagnosis: e.target.value }))} placeholder="Clinical diagnosis…" rows={2} className="w-full rounded-xl bg-muted border border-foreground/10 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-foreground/50">Treatment Given *</label>
                  <textarea value={recordForm.treatment_given} onChange={e => setRecordForm(f => ({ ...f, treatment_given: e.target.value }))} placeholder="Treatment administered…" rows={2} className="w-full rounded-xl bg-muted border border-foreground/10 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-foreground/50">Medications Used</label>
                  <Input value={recordForm.medications_used} onChange={e => setRecordForm(f => ({ ...f, medications_used: e.target.value }))} placeholder="e.g. Oxytetracycline 10ml" className="h-11 rounded-xl bg-muted border-foreground/10" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-foreground/50">Cost (UGX)</label>
                  <Input type="number" value={recordForm.cost} onChange={e => setRecordForm(f => ({ ...f, cost: e.target.value }))} placeholder="0" className="h-11 rounded-xl bg-muted border-foreground/10" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-foreground/50">Next Visit Date</label>
                  <Input type="date" value={recordForm.next_visit_date} onChange={e => setRecordForm(f => ({ ...f, next_visit_date: e.target.value }))} className="h-11 rounded-xl bg-muted border-foreground/10" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-foreground/50">Additional Notes</label>
                  <Input value={recordForm.notes} onChange={e => setRecordForm(f => ({ ...f, notes: e.target.value }))} placeholder="Follow-up instructions, etc." className="h-11 rounded-xl bg-muted border-foreground/10" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={saveRecord} disabled={saving} className="h-11 px-8 rounded-xl bg-primary font-bold uppercase tracking-widest gap-2"><Save className="h-4 w-4" />{saving ? 'Saving…' : 'Save Record'}</Button>
                <Button variant="ghost" onClick={() => setShowRecordForm(false)} className="h-11 px-6 rounded-xl">Cancel</Button>
              </div>
            </div>
          )}

          {/* Records list */}
          <div className="space-y-4">
            {records.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 opacity-20 text-center">
                <ClipboardList className="h-12 w-12 mb-3" />
                <p className="font-bold uppercase tracking-widest">No medical records yet</p>
              </div>
            )}
            {records.map(record => (
              <div key={record.id} className="group bg-card border border-foreground/5 rounded-2xl p-6 shadow hover:border-primary/20 hover:shadow-lg transition-all space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow"><Stethoscope className="h-5 w-5" /></div>
                    <div>
                      <p className="font-bold uppercase tracking-tight">{format(new Date(record.visit_date), 'dd MMM yyyy, HH:mm')}</p>
                      {record.vet_name && <p className="text-xs text-foreground/40 font-medium uppercase tracking-widest">Dr. {record.vet_name}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" onClick={() => openRecordForm(record)} className="h-9 w-9 rounded-xl"><Edit2 className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteRecord(record.id)} className="h-9 w-9 rounded-xl text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Symptoms</p>
                    <p className="text-sm font-medium">{record.symptoms}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Diagnosis</p>
                    <p className="text-sm font-medium">{record.diagnosis}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Treatment</p>
                    <p className="text-sm font-medium">{record.treatment_given}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-1 border-t border-foreground/5">
                  {record.medications_used && <Badge className="bg-accent/10 text-accent border-none text-xs font-bold gap-1.5 px-3 py-1 rounded-lg"><Heart className="h-3 w-3" />{record.medications_used}</Badge>}
                  {record.cost != null && <Badge className="bg-muted text-foreground/60 border-none text-xs font-bold gap-1.5 px-3 py-1 rounded-lg"><DollarSign className="h-3 w-3" />UGX {record.cost.toLocaleString()}</Badge>}
                  {record.next_visit_date && <Badge className="bg-secondary/10 text-secondary border-none text-xs font-bold gap-1.5 px-3 py-1 rounded-lg"><Calendar className="h-3 w-3" />Next: {format(new Date(record.next_visit_date), 'dd MMM yyyy')}</Badge>}
                  {record.notes && <Badge className="bg-muted text-foreground/50 border-none text-xs font-bold px-3 py-1 rounded-lg">{record.notes}</Badge>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
