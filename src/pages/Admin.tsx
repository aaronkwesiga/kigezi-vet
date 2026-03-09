import { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, MessageSquare, Package, Plus, Trash2, Edit2, UserCircle, CheckCircle2, Send, Check, CheckCheck, X, LogOut, Zap, Mic, MicOff, Square, Volume2, Sparkles, Loader2, Camera, Image, Award, Briefcase, Clock, Video, Star } from 'lucide-react';
import { format, isToday, isYesterday, startOfDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

interface Conversation {
  id: string;
  visitor_name: string;
  visitor_phone: string | null;
  status: string;
  created_at: string;
  unread_count?: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_type: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

interface Product {
  id: string;
  name_en: string;
  name_rk: string | null;
  name_rn: string | null;
  description_en: string | null;
  description_rk: string | null;
  description_rn: string | null;
  price: number | null;
  category: string | null;
  in_stock: boolean | null;
  image_url: string | null;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  bio: string | null;
  specialization: string | null;
  experience_years: number | null;
  avatar_url: string | null;
}

interface Testimonial {
  id: string;
  name: string;
  location: string;
  content: string;
  is_approved: boolean;
  created_at: string;
}

const Admin = () => {
  const { user, userRole, isAdmin, loading: authLoading, signOut } = useAuth();
  const { lang } = useLanguage();
  const { toast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name_en: '', name_rk: '', name_rn: '',
    description_en: '', description_rk: '', description_rn: '',
    price: '', category: '', image_url: ''
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isDeletingProfile, setIsDeletingProfile] = useState(false);
  const hasFetchedProfile = useRef(false);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const adminFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (!user || !isAdmin) return;
    fetchConversations();
    fetchProducts();
    fetchProfile();
    fetchTestimonials();

    const channel = supabase
      .channel('admin-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => {
        fetchConversations();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_conversations' }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel).catch(() => { }); };
  }, [user, isAdmin]);

  useEffect(() => {
    if (!selectedConvo) return;

    const channel = supabase
      .channel(`convo-${selectedConvo}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${selectedConvo}` },
        async (payload) => {
          const newMsg = payload.new as Message;

          // If we are looking at this conversation, mark incoming visitor messages as read
          if (newMsg.sender_type === 'visitor') {
            await supabase.from('chat_messages').update({ is_read: true }).eq('id', newMsg.id);
          }

          setMessages(prev => {
            const exists = prev.some(m => m.id === newMsg.id);
            if (exists) return prev;
            return [...prev, { ...newMsg, is_read: newMsg.sender_type === 'visitor' ? true : newMsg.is_read }];
          });
          // Auto-scroll to bottom on new message
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'chat_messages' },
        (payload) => {
          setMessages(prev => prev.filter(m => m.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel).catch(() => { }); };
  }, [selectedConvo]);

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return lang === 'en' ? 'Today' : lang === 'rk' ? 'Erizo' : 'Uyu munsi';
    if (isYesterday(date)) return lang === 'en' ? 'Yesterday' : lang === 'rk' ? 'Nyekiro' : 'Ejo hashize';
    return format(date, 'MMMM d, yyyy');
  };

  const scrollToDate = (date: Date) => {
    const targetDate = startOfDay(date).getTime();
    const targetMsg = messages.find(m => startOfDay(new Date(m.created_at)).getTime() === targetDate);
    if (targetMsg) {
      const el = document.getElementById(`msg-${targetMsg.id}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      toast({ title: "No messages on this date" });
    }
  };

  const fetchConversations = async () => {
    const { data: convos } = await supabase.from('chat_conversations').select('*').order('created_at', { ascending: false });
    if (!convos) return;

    // Fetch unread counts for each conversation
    const convosWithUnread = await Promise.all(convos.map(async (c) => {
      const { count } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', c.id)
        .eq('sender_type', 'visitor')
        .eq('is_read', false);
      return { ...c, unread_count: count || 0 };
    }));

    setConversations(convosWithUnread as Conversation[]);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('name_en');
    setProducts((data as Product[]) || []);
  };

  const fetchTestimonials = async () => {
    const { data } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
    setTestimonials((data as Testimonial[]) || []);
  };

  const fetchProfile = async () => {
    if (!user || hasFetchedProfile.current) return;
    hasFetchedProfile.current = true;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setProfile(data as unknown as Profile);
    } else {
      // Initialize with default state if no profile exists yet
      setProfile({
        id: crypto.randomUUID(), // Temporary local ID
        user_id: user.id,
        full_name: user.user_metadata?.full_name || '',
        bio: '',
        specialization: '',
        experience_years: 0,
        avatar_url: ''
      });
    }
  };

  const saveProfile = async () => {
    if (!user || !profile) return;
    setIsSavingProfile(true);

    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        full_name: profile.full_name,
        bio: profile.bio,
        specialization: profile.specialization,
        experience_years: profile.experience_years,
        avatar_url: profile.avatar_url,
      }, { onConflict: 'user_id' });

    setIsSavingProfile(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile updated' });
    }
  };

  const selectConversation = async (id: string) => {
    setSelectedConvo(id);

    // Mark all visitor messages in this conversation as read
    await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('conversation_id', id)
      .eq('sender_type', 'visitor')
      .eq('is_read', false);

    const { data } = await supabase.from('chat_messages').select('*').eq('conversation_id', id).order('created_at');
    setMessages((data as Message[]) || []);

    // Refresh conversations to update unread counts
    fetchConversations();

    // Auto-scroll to bottom after loading messages
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 200);
  };

  const deleteMessage = async (msgId: string) => {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', msgId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete message.', variant: 'destructive' });
    } else {
      setMessages(prev => prev.filter(m => m.id !== msgId));
    }
  };

  const resolveConversation = async (id: string) => {
    const { error } = await supabase
      .from('chat_conversations')
      .update({ status: 'resolved' })
      .eq('id', id);

    if (!error) {
      toast({ title: 'Consultation resolved' });
      fetchConversations();
    }
  };


  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
    } catch { toast({ title: 'Error', description: 'Microphone access denied.', variant: 'destructive' }); }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current || !selectedConvo) return;
    if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
    const recorder = mediaRecorderRef.current;
    recorder.stop();
    recorder.stream.getTracks().forEach(track => track.stop());
    setIsRecording(false);
    await new Promise<void>(resolve => { recorder.onstop = () => resolve(); });
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const fileName = `voice-notes/${selectedConvo}/${Date.now()}.webm`;
    try {
      const { data, error: uploadError } = await supabase.storage
        .from('chat_recordings')
        .upload(fileName, audioBlob, { contentType: 'audio/webm', upsert: false });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('chat_recordings').getPublicUrl(data.path);
      await sendReply(`[VOICE_NOTE]:${publicUrl}`);
    } catch (err: unknown) {
      const error = err as Error;
      toast({ title: 'Upload Error', description: error.message, variant: 'destructive' });
    }
  };

  const sendReply = async (overrideMsg?: string) => {
    const trimmedReply = (overrideMsg || reply).trim();
    if (!trimmedReply || trimmedReply.length > 5000 || !selectedConvo) return;

    // Optimistic update
    const tempId = crypto.randomUUID();
    const newMsg: Message = {
      id: tempId,
      conversation_id: selectedConvo,
      sender_type: 'admin',
      message: trimmedReply,
      created_at: new Date().toISOString(),
      is_read: true
    };
    setMessages(prev => [...prev, newMsg]);
    if (!overrideMsg) setReply('');

    const { error } = await supabase.from('chat_messages').insert({
      conversation_id: selectedConvo,
      sender_type: 'admin',
      message: trimmedReply,
      is_read: true
    });

    if (error) {
      console.error('Error sending reply:', error);
      toast({
        title: 'Transmission Error',
        description: `Failed to transmit reply: ${error.message}`,
        variant: 'destructive'
      });
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } else {
      // Auto-scroll on successful send
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  const handleAdminImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConvo) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: "Invalid file type", description: "Please upload an image.", variant: "destructive" });
      return;
    }

    setIsUploadingImage(true);
    const fileName = `images/${selectedConvo}/${Date.now()}-${file.name}`;

    try {
      const { data, error: uploadError } = await supabase.storage
        .from('chat_attachments')
        .upload(fileName, file, { contentType: file.type, upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('chat_attachments').getPublicUrl(data.path);
      await sendReply(`[IMAGE]:${publicUrl}`);
    } catch (err: unknown) {
      const error = err as Error;
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUploadingImage(false);
      if (adminFileInputRef.current) adminFileInputRef.current.value = '';
    }
  };

  const handleVideoCall = async () => {
    if (!selectedConvo) return;
    const roomName = `KigeziVet-${selectedConvo}`;
    const jitsiUrl = `https://meet.jit.si/${roomName}`;
    await sendReply(`[VIDEO_CALL]:${jitsiUrl}`);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: "Invalid file type", description: "Please upload an image.", variant: "destructive" });
      return;
    }

    setIsUploadingAvatar(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    try {
      // 1. Upload new image
      const { data, error: uploadError } = await supabase.storage
        .from('profile_assets')
        .upload(filePath, file, { contentType: file.type, upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('profile_assets').getPublicUrl(data.path);

      // 2. Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);

      toast({ title: "Photo Uploaded", description: "Remember to save your profile to persist changes." });
    } catch (err: unknown) {
      const error = err as Error;
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUploadingAvatar(false);
      if (avatarFileInputRef.current) avatarFileInputRef.current.value = '';
    }
  };

  const deleteAvatar = async () => {
    if (!profile?.avatar_url || !user) return;

    try {
      setProfile(prev => prev ? { ...prev, avatar_url: null } : null);
      toast({ title: "Photo Removed", description: "Click Authorize Update to save changes." });
    } catch (err: unknown) {
      const error = err as Error;
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const deleteProfile = async () => {
    if (!user || !profile) return;
    const confirmed = window.confirm('Are you sure you want to delete your professional profile? This action cannot be undone.');
    if (!confirmed) return;

    setIsDeletingProfile(true);
    try {
      // Delete avatar from storage if present
      if (profile.avatar_url) {
        const urlParts = profile.avatar_url.split('/profile_assets/');
        if (urlParts.length > 1) {
          await supabase.storage.from('profile_assets').remove([urlParts[1]]);
        }
      }

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      // Reset local state
      setProfile({
        id: crypto.randomUUID(),
        user_id: user.id,
        full_name: user.user_metadata?.full_name || '',
        bio: '',
        specialization: '',
        experience_years: 0,
        avatar_url: ''
      });
      hasFetchedProfile.current = false;
      setIsEditingProfile(false);
      toast({ title: 'Profile Deleted', description: 'Your professional profile has been removed.' });
    } catch (err: unknown) {
      const error = err as Error;
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsDeletingProfile(false);
    }
  };

  const addProduct = async () => {
    if (!newProduct.name_en.trim()) return;

    const productData = {
      name_en: newProduct.name_en,
      name_rk: newProduct.name_rk || null,
      name_rn: newProduct.name_rn || null,
      description_en: newProduct.description_en || null,
      description_rk: newProduct.description_rk || null,
      description_rn: newProduct.description_rn || null,
      price: newProduct.price ? parseFloat(newProduct.price) : null,
      category: newProduct.category || null,
      image_url: newProduct.image_url || null,
      in_stock: true
    };

    let error;
    if (editingProduct) {
      const { error: updateError } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('products')
        .insert(productData);
      error = insertError;
    }

    if (!error) {
      toast({ title: editingProduct ? 'Product Updated' : 'Product Added' });
      setNewProduct({
        name_en: '', name_rk: '', name_rn: '',
        description_en: '', description_rk: '', description_rn: '',
        price: '', category: '', image_url: ''
      });
      setShowAddProduct(false);
      setEditingProduct(null);
      fetchProducts();
    } else {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const deleteProduct = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    fetchProducts();
  };

  const approveTestimonial = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('testimonials').update({ is_approved: !currentStatus }).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: currentStatus ? 'Testimonial Hidden' : 'Testimonial Approved' });
      fetchTestimonials();
    }
  };

  const deleteTestimonial = async (id: string) => {
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Testimonial Deleted' });
      fetchTestimonials();
    }
  };

  if (authLoading) return <div className="flex min-h-screen items-center justify-center bg-background"><div className="h-16 md:h-24 w-16 md:w-24 border-8 md:border-[12px] border-primary border-t-transparent rounded-full animate-spin shadow-2xl" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="text-center glass p-10 md:p-20 rounded-[3rem] md:rounded-[5rem] border-primary max-w-2xl shadow-2xl">
        <h1 className="mb-6 font-display text-4xl md:text-7xl lg:text-8xl font-bold tracking-tight text-primary uppercase leading-tight">Restricted</h1>
        <p className="text-foreground text-lg md:text-2xl font-medium mb-12 uppercase tracking-widest leading-none">Admin Authorization Required</p>
        <Button onClick={() => signOut()} className="h-16 md:h-24 px-10 md:px-16 rounded-2xl md:rounded-[2.5rem] font-bold uppercase tracking-[0.4em] gap-4 bg-secondary hover:brightness-110 text-white shadow-2xl transition-all text-lg md:text-xl border border-white/10">
          <LogOut className="h-6 w-6 md:h-8 md:w-8" /> Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background px-6 py-16 md:py-24 relative overflow-hidden font-sans transition-colors duration-500">
      {/* Background with Theme Accents */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1542332213-31f87348057f?q=80&w=2000&auto=format&fit=crop"
          alt="Kabale Landscape"
          className="h-full w-full object-cover opacity-10 filter grayscale contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        <div className="absolute top-0 right-1/4 h-[400px] w-[400px] md:h-[700px] md:w-[700px] rounded-full bg-primary/5 blur-[120px] md:blur-[180px] animate-blob" />
        <div className="absolute bottom-0 left-1/4 h-[300px] w-[300px] md:h-[600px] md:w-[600px] rounded-full bg-accent/5 blur-[100px] md:blur-[150px] animate-blob animation-delay-2000" />
      </div>

      <div className="container relative z-10 mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-5 duration-1000">
        <div className="mb-10 flex flex-col items-center justify-between gap-8 md:flex-row md:items-end border-b border-primary/20 pb-8 md:pb-10">
          <div className="text-center md:text-left">
            <Badge className="mb-4 bg-primary/10 text-primary border border-primary/20 px-6 md:px-8 py-2 md:py-3 text-[9px] md:text-xs font-bold uppercase tracking-[0.4em] shadow-sm">
              System Core v4.0
            </Badge>
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl uppercase leading-none mb-4">
              Command <span className="text-primary">Center</span>
            </h1>
            <p className="text-md md:text-xl font-medium text-foreground/42 tracking-tight flex items-center gap-3 justify-center md:justify-start uppercase">
              <Zap className="h-5 w-5 md:h-6 md:w-6 text-secondary fill-secondary animate-pulse" />
              Primary System Online
            </p>
          </div>
          <div className="flex items-center gap-5 md:gap-7 bg-card p-5 md:p-6 rounded-2xl md:rounded-[3rem] border border-foreground/5 shadow-xl">
            <div className="text-right hidden sm:block">
              <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-primary/60">Authorized</p>
              <p className="text-md md:text-xl font-bold text-foreground">{user.email?.split('@')[0].toUpperCase()}</p>
            </div>
            <Button onClick={() => signOut()} size="icon" className="h-10 w-10 md:h-14 md:w-14 rounded-lg md:rounded-xl bg-secondary hover:brightness-110 text-white shadow-lg transition-all border border-white/10">
              <LogOut className="h-4 w-4 md:h-6 md:w-6" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="conversations" className="space-y-8 md:space-y-12">
          <TabsList className="h-auto w-full md:w-fit flex-wrap justify-center md:justify-start gap-2 md:gap-5 rounded-xl md:rounded-[3rem] bg-muted p-2 md:p-2 border border-foreground/5">
            <TabsTrigger value="conversations" className="h-10 md:h-12 flex-1 md:flex-none rounded-lg md:rounded-[2.5rem] px-3 md:px-10 text-[10px] md:text-base font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl transition-all relative">
              <MessageSquare className="mr-2 md:mr-3 h-3.5 w-3.5 md:h-5 md:w-5" /> Consultations
              {conversations.some(c => (c.unread_count || 0) > 0) && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-secondary"></span>
                </span>
              )}
            </TabsTrigger>
            {userRole === 'super_admin' && (
              <TabsTrigger value="products" className="h-10 md:h-12 flex-1 md:flex-none rounded-lg md:rounded-[2.5rem] px-3 md:px-10 text-[10px] md:text-base font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl transition-all">
                <Package className="mr-2 md:mr-3 h-3.5 w-3.5 md:h-5 md:w-5" /> Inventory
              </TabsTrigger>
            )}
            <TabsTrigger value="testimonials" className="h-10 md:h-12 flex-1 md:flex-none rounded-lg md:rounded-[2.5rem] px-3 md:px-10 text-[10px] md:text-base font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl transition-all">
              <Star className="mr-2 md:mr-3 h-3.5 w-3.5 md:h-5 md:w-5" /> Reviews
            </TabsTrigger>
            <TabsTrigger value="profile" className="h-10 md:h-12 flex-1 md:flex-none rounded-lg md:rounded-[2.5rem] px-3 md:px-10 text-[10px] md:text-base font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl transition-all">
              <UserCircle className="mr-2 md:mr-3 h-3.5 w-3.5 md:h-5 md:w-5" /> Portfolio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conversations" className="animate-in fade-in slide-in-from-right-8 duration-1000">
            <div className="grid gap-8 md:gap-10 lg:grid-cols-3 min-h-[500px] md:min-h-[700px]">
              <div className="bg-card rounded-2xl md:rounded-[2.5rem] flex flex-col overflow-hidden border border-foreground/5 shadow-xl">
                <div className="border-b border-foreground/5 p-6 md:p-8 bg-muted/30">
                  <h3 className="flex items-center gap-3 font-display text-xl md:text-2xl font-bold text-foreground tracking-tight uppercase">
                    <LayoutDashboard className="h-5 w-5 md:h-7 md:w-7 text-primary" /> Active Consultations
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3">
                  {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-10 text-center opacity-10">
                      <Zap className="h-12 md:h-16 w-12 md:w-16 mb-4 text-primary" />
                      <p className="font-bold text-lg md:text-xl uppercase">Idle</p>
                    </div>
                  ) : conversations.map(c => (
                    <button
                      key={c.id}
                      onClick={() => selectConversation(c.id)}
                      className={`group w-full rounded-xl md:rounded-2xl border border-foreground/5 p-5 md:p-6 text-left transition-all hover:bg-muted/50 ${selectedConvo === c.id ? 'bg-primary/5 border-primary shadow-md' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl flex items-center justify-center font-bold text-lg md:text-2xl shadow-sm transition-all ${selectedConvo === c.id ? 'bg-primary text-primary-foreground scale-105' : 'bg-muted text-foreground/20'}`}>
                            {(c.visitor_name || 'V').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-md md:text-lg text-foreground block leading-none uppercase tracking-tight">{c.visitor_name || 'Visitor'}</span>
                            <span className="text-[9px] md:text-[10px] font-bold text-primary/40 uppercase tracking-[0.3em] mt-1.5 block">{new Date(c.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(c.unread_count || 0) > 0 && (
                          <Badge className="bg-secondary text-white border-none text-[8px] md:text-[10px] font-black px-2 py-0.5 rounded-full">
                            {c.unread_count}
                          </Badge>
                        )}
                        <Badge className={`px-3 md:px-5 py-1 md:py-1.5 text-[9px] md:text-[10px] font-bold uppercase tracking-widest border-none ${(c.unread_count || 0) > 0 ? 'bg-secondary/20 text-secondary' : 'bg-muted text-foreground/42'}`}>
                          {(c.unread_count || 0) > 0 ? 'Action Needed' : c.status === 'open' ? 'Active' : 'Resolved'}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 bg-card rounded-2xl md:rounded-[2.5rem] overflow-hidden flex flex-col border border-foreground/5 shadow-xl">
                {!selectedConvo ? (
                  <div className="flex h-full items-center justify-center text-foreground/5 px-10 md:px-20 text-center pb-16">
                    <div>
                      <MessageSquare className="h-24 w-24 md:h-32 md:w-32 opacity-5 mx-auto mb-6 md:mb-10" />
                      <h4 className="text-2xl md:text-4xl font-bold uppercase tracking-[0.2em]">Establish Link</h4>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col">
                    <div className="p-6 md:p-8 border-b border-foreground/5 bg-background/50 flex items-center justify-between backdrop-blur-xl">
                      <div className="flex items-center gap-5 md:gap-6">
                        <div className="h-12 w-12 md:h-16 md:w-16 rounded-lg md:rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl md:text-3xl shadow-md border border-white/10">
                          {(conversations.find(c => c.id === selectedConvo)?.visitor_name || 'V').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground text-xl md:text-3xl lg:text-4xl uppercase tracking-tight leading-none mb-1.5">
                            {conversations.find(c => c.id === selectedConvo)?.visitor_name || 'Visitor'}
                          </h3>
                          <p className="text-[9px] md:text-xs font-bold text-secondary tracking-widest uppercase flex items-center gap-2.5">
                            <span className={`h-1.5 md:h-2 w-1.5 md:w-2 rounded-full ${conversations.find(c => c.id === selectedConvo)?.status === 'open' ? 'bg-secondary animate-pulse' : 'bg-muted'}`} />
                            {conversations.find(c => c.id === selectedConvo)?.status === 'open' ? 'Uplink Established' : 'Security Log Closed'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 rounded-xl">
                              <Calendar className="h-5 w-5" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 border-none bg-background shadow-2xl rounded-2xl" align="end">
                            <Calendar
                              mode="single"
                              onSelect={(date) => date && scrollToDate(date)}
                              initialFocus
                              className="rounded-2xl border border-primary/20"
                            />
                          </PopoverContent>
                        </Popover>
                        {conversations.find(c => c.id === selectedConvo)?.status === 'open' && (
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => resolveConversation(selectedConvo)}
                              variant="ghost"
                              className="h-10 md:h-12 px-5 md:px-8 border border-secondary/20 text-secondary font-black uppercase text-[9px] md:text-xs tracking-widest hover:bg-secondary hover:text-white transition-all rounded-lg md:rounded-xl"
                            >
                              Mark Resolved
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col bg-[#efeae2] dark:bg-zinc-900 relative overflow-hidden">
                      {/* WhatsApp Background Pattern */}
                      <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03] pointer-events-none"
                        style={{ backgroundImage: 'url("https://wweb.dev/assets/whatsapp-chat-bg.png")', backgroundSize: '400px' }} />

                      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 custom-scrollbar relative z-10">
                        {messages.map((m, idx) => {
                          const isAdminMsg = m.sender_type === 'admin';
                          const showTail = idx === 0 || messages[idx - 1].sender_type !== m.sender_type;

                          const msgDate = new Date(m.created_at);
                          const prevMsgDate = idx > 0 ? new Date(messages[idx - 1].created_at) : null;
                          const showDateHeader = !prevMsgDate || startOfDay(msgDate).getTime() !== startOfDay(prevMsgDate).getTime();

                          return (
                            <div key={m.id}>
                              {showDateHeader && (
                                <div className="flex justify-center my-6 md:my-10">
                                  <span className="bg-white/30 dark:bg-black/20 backdrop-blur-md px-6 py-2 rounded-full text-[10px] md:text-xs font-black text-foreground/60 uppercase tracking-[0.2em] border border-white/10 shadow-sm">
                                    {getDateLabel(msgDate)}
                                  </span>
                                </div>
                              )}
                              <div
                                id={`msg-${m.id}`}
                                className={`flex w-full mb-1 group ${isAdminMsg ? 'justify-end' : 'justify-start'}`}
                              >
                                <div className={`
                                  relative max-w-[85%] md:max-w-[70%] px-4 py-2 shadow-sm flex flex-col
                                  ${isAdminMsg
                                    ? 'bg-[#dcf8c6] dark:bg-[#005c4b] text-zinc-900 dark:text-zinc-100 rounded-2xl rounded-tr-none'
                                    : 'bg-white dark:bg-[#202c33] text-zinc-900 dark:text-zinc-100 rounded-2xl rounded-tl-none'}
                                  ${showTail && isAdminMsg ? 'after:content-[""] after:absolute after:top-0 after:-right-2 after:w-0 after:h-0 after:border-t-[10px] after:border-t-[#dcf8c6] dark:after:border-t-[#005c4b] after:border-r-[10px] after:border-r-transparent' : ''}
                                  ${showTail && !isAdminMsg ? 'before:content-[""] before:absolute before:top-0 before:-left-2 before:w-0 before:h-0 before:border-t-[10px] before:border-t-white dark:before:border-t-[#202c33] before:border-l-[10px] before:border-l-transparent' : ''}
                                `}>
                                  <div className={`flex items-center gap-2 mb-1 justify-between opacity-40 text-[8px] md:text-[9px] font-black uppercase tracking-[0.1em]`}>
                                    <span>
                                      {isToday(msgDate) ? format(msgDate, 'HH:mm') : format(msgDate, 'MMM d, HH:mm')}
                                    </span>
                                    {isAdminMsg && (
                                      <div className="flex items-center gap-1">
                                        {m.is_read ? <CheckCheck className="h-2.5 w-2.5 text-blue-500" /> : <Check className="h-2.5 w-2.5" />}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex justify-between gap-4">
                                    <p className="text-sm md:text-base leading-relaxed break-words font-medium">
                                      {m.message.startsWith('[VOICE_NOTE]:') ? (
                                        <div className="flex items-center gap-3 py-1">
                                          <audio controls src={m.message.replace('[VOICE_NOTE]:', '')} className="h-8 w-32 md:w-48" />
                                        </div>
                                      ) : m.message.startsWith('[IMAGE]:') ? (
                                        <div className="flex flex-col gap-2 py-1">
                                          <img
                                            src={m.message.replace('[IMAGE]:', '')}
                                            alt="Chat Attachment"
                                            className="max-w-full rounded-lg shadow-sm cursor-pointer hover:brightness-95 transition-all"
                                            onClick={() => window.open(m.message.replace('[IMAGE]:', ''), '_blank')}
                                          />
                                        </div>
                                      ) : m.message.startsWith('[VIDEO_CALL]:') ? (
                                        <div className="flex flex-col gap-2 py-2">
                                          <div className="flex items-center gap-2 mb-1">
                                            <Video className="h-5 w-5 text-blue-500" />
                                            <span className="font-bold">Video Consultation</span>
                                          </div>
                                          <Button
                                            onClick={() => window.open(m.message.replace('[VIDEO_CALL]:', ''), '_blank')}
                                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-xl py-5"
                                          >
                                            Join Video Call
                                          </Button>
                                        </div>
                                      ) : m.message}
                                    </p>
                                    <button
                                      onClick={() => deleteMessage(m.id)}
                                      className="opacity-30 group-hover:opacity-100 transition-opacity text-primary hover:text-red-500 p-1"
                                      title="Delete Message"
                                    >
                                      <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={bottomRef} />
                      </div>

                      <div className="p-4 md:p-6 bg-[#f0f2f5] dark:bg-[#202c33] border-t border-black/5 relative z-20">
                        <form onSubmit={(e) => { e.preventDefault(); sendReply(); }} className="flex items-center gap-3 md:gap-5 max-w-4xl mx-auto">
                          <input
                            type="file"
                            ref={adminFileInputRef}
                            onChange={handleAdminImageUpload}
                            accept="image/*"
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => adminFileInputRef.current?.click()}
                            disabled={isUploadingImage}
                            className="h-10 md:h-12 rounded-full md:rounded-xl text-primary/80 border-primary/20 hover:bg-primary/10 transition-all flex items-center gap-2 px-3 md:px-4"
                          >
                            {isUploadingImage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                            <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Upload Image</span>
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleVideoCall}
                            className="h-10 w-10 md:h-12 md:w-auto md:px-4 rounded-full md:rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-all flex items-center gap-2"
                            title="Start Video Call"
                          >
                            <Video className="h-5 w-5" />
                            <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">Video Call</span>
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`h-10 w-10 md:h-12 md:w-12 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-primary/60 hover:bg-primary/10'}`}
                          >
                            {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                          </Button>

                          <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-2xl md:rounded-[1.5rem] px-4 py-2 md:py-3 shadow-md border border-black/5 relative">
                            {isRecording ? (
                              <div className="flex items-center gap-3 px-2 py-1">
                                <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-sm md:text-base font-bold text-red-500 uppercase tracking-widest">
                                  Recording: {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                                </span>
                              </div>
                            ) : (
                              <Input
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                placeholder="Type a response..."
                                className="bg-transparent border-none focus:ring-0 text-sm md:text-base text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 py-1"
                                maxLength={5000}
                                autoFocus
                              />
                            )}
                          </div>
                          <Button type="submit" disabled={!reply.trim() && !isRecording} className="h-10 w-10 md:h-14 md:w-14 rounded-full bg-secondary hover:brightness-110 text-white shadow-lg flex items-center justify-center">
                            <Send className="h-5 w-5 md:h-6 md:w-6" />
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products" className="animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="mb-12 flex flex-col sm:flex-row items-center justify-between gap-8 border-b border-foreground/5 pb-12">
              <div className="text-center sm:text-left">
                <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground uppercase tracking-tight">Inventory</h2>
                <p className="text-primary font-bold uppercase tracking-[0.4em] text-md md:text-xl mt-3">Supply Chain Control</p>
              </div>
              <Button
                onClick={() => {
                  setEditingProduct(null);
                  setNewProduct({
                    name_en: '', name_rk: '', name_rn: '',
                    description_en: '', description_rk: '', description_rn: '',
                    price: '', category: '', image_url: ''
                  });
                  setShowAddProduct(!showAddProduct);
                }}
                className="h-14 md:h-16 px-8 md:px-12 gap-3 md:gap-5 rounded-xl md:rounded-[2rem] bg-secondary hover:brightness-110 text-white font-bold uppercase tracking-[0.3em] shadow-xl border border-white/10 transition-all text-xs md:text-base"
              >
                <Plus className="h-4 w-4 md:h-5 md:w-5" /> Register Entry
              </Button>
            </div>

            {showAddProduct && (
              <div className="mb-12 animate-in fade-in slide-in-from-top-8 duration-500">
                <div className="bg-card rounded-2xl md:rounded-[3rem] p-8 md:p-12 border border-primary/20 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8">
                    <Button variant="ghost" onClick={() => setShowAddProduct(false)} className="rounded-full h-12 w-12 text-primary/40 hover:text-primary">
                      <X className="h-6 w-6" />
                    </Button>
                  </div>

                  <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground uppercase tracking-tight mb-8 flex items-center gap-4">
                    {editingProduct ? <Edit2 className="h-6 w-6 text-primary" /> : <Plus className="h-6 w-6 text-primary" />}
                    {editingProduct ? 'Modify Technical Record' : 'New Entry Registration'}
                  </h3>

                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 px-2">Designation (English)</label>
                      <Input
                        value={newProduct.name_en}
                        onChange={(e) => setNewProduct({ ...newProduct, name_en: e.target.value })}
                        placeholder="ENTER PRODUCT NAME"
                        className="h-14 md:h-16 bg-muted/30 border-foreground/5 rounded-xl md:rounded-2xl px-6 font-bold uppercase tracking-wider focus:border-primary/50 transition-all"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 px-2">Designation (Rukiga)</label>
                      <Input
                        value={newProduct.name_rk}
                        onChange={(e) => setNewProduct({ ...newProduct, name_rk: e.target.value })}
                        placeholder="EIZINA RY'EKIBUMBE"
                        className="h-14 md:h-16 bg-muted/30 border-foreground/5 rounded-xl md:rounded-2xl px-6 font-bold uppercase tracking-wider focus:border-primary/50 transition-all"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 px-2">Designation (Runyankole)</label>
                      <Input
                        value={newProduct.name_rn}
                        onChange={(e) => setNewProduct({ ...newProduct, name_rn: e.target.value })}
                        placeholder="EIZINA RY'EKURASYA"
                        className="h-14 md:h-16 bg-muted/30 border-foreground/5 rounded-xl md:rounded-2xl px-6 font-bold uppercase tracking-wider focus:border-primary/50 transition-all"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 px-2">Valuation (UGX)</label>
                      <Input
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        placeholder="0.00"
                        className="h-14 md:h-16 bg-muted/30 border-foreground/5 rounded-xl md:rounded-2xl px-6 font-bold uppercase tracking-wider focus:border-primary/50 transition-all"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 px-2">Classification</label>
                      <Input
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        placeholder="E.G. MEDICINE, EQUIPMENT"
                        className="h-14 md:h-16 bg-muted/30 border-foreground/5 rounded-xl md:rounded-2xl px-6 font-bold uppercase tracking-wider focus:border-primary/50 transition-all"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 px-2">Visual Asset URL</label>
                      <Input
                        value={newProduct.image_url}
                        onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                        placeholder="HTTPS://..."
                        className="h-14 md:h-16 bg-muted/30 border-foreground/5 rounded-xl md:rounded-2xl px-6 font-bold uppercase tracking-wider focus:border-primary/50 transition-all"
                      />
                    </div>

                    <div className="md:col-span-2 lg:col-span-3 space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 px-2">Description / Specifications</label>
                      <textarea
                        value={newProduct.description_en}
                        onChange={(e) => setNewProduct({ ...newProduct, description_en: e.target.value })}
                        placeholder="Enter full technical specifications and usage instructions..."
                        className="w-full min-h-[120px] bg-muted/30 border-foreground/5 rounded-xl md:rounded-2xl p-6 font-medium text-foreground focus:ring-1 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="mt-12 flex flex-col sm:flex-row gap-6">
                    <Button
                      onClick={addProduct}
                      className="flex-1 h-16 rounded-xl md:rounded-[2rem] bg-primary hover:brightness-110 text-primary-foreground font-black uppercase tracking-[0.4em] shadow-2xl transition-all"
                    >
                      {editingProduct ? 'Authorize Modifications' : 'Authorize Registration'}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setShowAddProduct(false)}
                      className="h-16 px-10 rounded-xl md:rounded-[2rem] border border-foreground/10 font-bold uppercase tracking-[0.3em] text-foreground/42 hover:bg-muted/50"
                    >
                      Abort
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-card rounded-2xl md:rounded-[3rem] overflow-hidden border border-foreground/5 shadow-2xl">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-primary/5 border-b border-foreground/5 text-foreground/60">
                      <th className="p-6 md:p-8 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em]">Entry Identity</th>
                      <th className="p-6 md:p-8 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em]">Sector</th>
                      <th className="p-6 md:p-8 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em]">Valuation</th>
                      <th className="p-6 md:p-8 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em]">Pulse</th>
                      <th className="p-6 md:p-8 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-center">Directive</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-foreground/5">
                    {products.map(p => (
                      <tr key={p.id} className="transition-all hover:bg-muted/50">
                        <td className="p-6 md:p-8">
                          <p className="font-bold text-lg md:text-xl text-foreground tracking-tight uppercase mb-1.5">{p.name_en}</p>
                          <p className="text-[9px] md:text-[10px] font-bold text-primary/40 uppercase tracking-[0.4em]">#{p.id.split('-')[0]}</p>
                        </td>
                        <td className="p-6 md:p-8">
                          <Badge className="bg-muted text-foreground/40 border border-foreground/5 text-[8px] md:text-[10px] font-bold tracking-widest px-3 md:px-5 py-1.5 uppercase">
                            {p.category || 'GENERAL'}
                          </Badge>
                        </td>
                        <td className="p-6 md:p-8 font-bold text-lg md:text-xl text-foreground tracking-tight">
                          {p.price ? `UGX ${p.price.toLocaleString()}` : 'EXEMPT'}
                        </td>
                        <td className="p-6 md:p-8">
                          <button className={`flex items-center gap-2.5 px-5 py-1.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest border transition-all ${p.in_stock ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-primary/10 text-primary border-primary/20 animate-pulse'}`}>
                            <div className={`h-1.5 md:h-2 w-1.5 md:w-2 rounded-full ${p.in_stock ? 'bg-secondary animate-ping' : 'bg-primary'}`} />
                            {p.in_stock ? 'Operational' : 'Depleted'}
                          </button>
                        </td>
                        <td className="p-6 md:p-8 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setEditingProduct(p);
                                setNewProduct({
                                  name_en: p.name_en || '',
                                  name_rk: p.name_rk || '',
                                  name_rn: p.name_rn || '',
                                  description_en: p.description_en || '',
                                  description_rk: p.description_rk || '',
                                  description_rn: p.description_rn || '',
                                  price: p.price?.toString() || '',
                                  category: p.category || '',
                                  image_url: p.image_url || ''
                                });
                                setShowAddProduct(true);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="h-9 w-9 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-muted/50 text-secondary hover:bg-secondary hover:text-white transition-all shadow-md border border-foreground/5"
                            >
                              <Edit2 className="h-3.5 w-3.5 md:h-5 md:w-5" />
                            </Button>
                            <Button variant="ghost" onClick={() => deleteProduct(p.id)} className="h-9 w-9 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-muted/50 text-primary hover:bg-primary hover:text-white transition-all shadow-md border border-foreground/5">
                              <Trash2 className="h-3.5 w-3.5 md:h-5 md:w-5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="testimonials" className="animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="mb-12 flex flex-col sm:flex-row items-center justify-between gap-8 border-b border-foreground/5 pb-12">
              <div className="text-center sm:text-left">
                <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground uppercase tracking-tight">Reviews</h2>
                <p className="text-primary font-bold uppercase tracking-[0.4em] text-md md:text-xl mt-3">Client Feedback Moderation</p>
              </div>
            </div>

            <div className="bg-card rounded-2xl md:rounded-[3rem] overflow-hidden border border-foreground/5 shadow-2xl">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-primary/5 border-b border-foreground/5 text-foreground/60">
                      <th className="p-6 md:p-8 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em]">Client Details</th>
                      <th className="p-6 md:p-8 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em]">Testimonial Content</th>
                      <th className="p-6 md:p-8 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em]">Status</th>
                      <th className="p-6 md:p-8 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-foreground/5">
                    {testimonials.map(t => (
                      <tr key={t.id} className="transition-all hover:bg-muted/50">
                        <td className="p-6 md:p-8 align-top">
                          <p className="font-bold text-lg text-foreground tracking-tight uppercase mb-1">{t.name}</p>
                          <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">{t.location}</p>
                          <p className="text-[8px] md:text-[9px] font-bold text-foreground/40 uppercase tracking-[0.2em] mt-3">
                            {format(new Date(t.created_at), 'MMM d, yyyy')}
                          </p>
                        </td>
                        <td className="p-6 md:p-8 align-top max-w-md">
                          <p className="text-sm md:text-base font-medium text-foreground/80 leading-relaxed italic">
                            "{t.content}"
                          </p>
                        </td>
                        <td className="p-6 md:p-8 align-top">
                          <Badge className={`px-3 py-1.5 text-[9px] md:text-[10px] font-bold uppercase tracking-widest border-none ${t.is_approved ? 'bg-secondary/20 text-secondary' : 'bg-primary/10 text-primary'}`}>
                            {t.is_approved ? 'Approved' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="p-6 md:p-8 text-center align-top">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              onClick={() => approveTestimonial(t.id, t.is_approved)}
                              className={`h-9 w-9 md:h-12 md:w-12 rounded-lg md:rounded-xl shadow-md border border-foreground/5 transition-all
                                ${t.is_approved ? 'bg-muted/50 text-foreground/40 hover:bg-foreground/10 hover:text-foreground' : 'bg-secondary/10 text-secondary hover:bg-secondary hover:text-white'}`}
                              title={t.is_approved ? "Hide Testimonial" : "Approve Testimonial"}
                            >
                              {t.is_approved ? <X className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" />}
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to permanently delete this testimonial?')) {
                                  deleteTestimonial(t.id);
                                }
                              }}
                              className="h-9 w-9 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-muted/50 text-primary hover:bg-primary hover:text-white transition-all shadow-md border border-foreground/5"
                            >
                              <Trash2 className="h-3.5 w-3.5 md:h-5 md:w-5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {testimonials.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-10 text-center text-foreground/40 font-medium uppercase tracking-widest">
                          No testimonials recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="mb-12 border-b border-foreground/5 pb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground uppercase tracking-tight">Portfolio</h2>
                <p className="text-secondary font-bold uppercase tracking-[0.4em] text-md md:text-xl mt-3">Professional Identity Control</p>
              </div>
              {/* Edit / Delete action buttons shown in view mode */}
              {!isEditingProfile && (
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setIsEditingProfile(true)}
                    className="h-12 px-8 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 font-bold uppercase tracking-widest text-xs transition-all shadow-sm gap-2"
                  >
                    <Edit2 className="h-4 w-4" /> Edit Profile
                  </Button>
                  <Button
                    onClick={deleteProfile}
                    disabled={isDeletingProfile}
                    variant="ghost"
                    className="h-12 px-8 rounded-xl border border-primary/20 text-primary hover:bg-primary hover:text-white font-bold uppercase tracking-widest text-xs transition-all shadow-sm gap-2"
                  >
                    {isDeletingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Delete Profile
                  </Button>
                </div>
              )}
            </div>

            {/* ── READ-ONLY PREVIEW CARD ── */}
            {!isEditingProfile ? (
              <div className="bg-card rounded-[2rem] md:rounded-[4rem] border border-foreground/5 shadow-2xl relative overflow-hidden p-8 md:p-16">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="grid gap-12 lg:grid-cols-2 items-center relative z-10">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="aspect-square rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-foreground/5 shadow-xl group">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name || 'Admin'}
                          className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-muted text-primary/10">
                          <UserCircle className="h-40 w-40 md:h-64 md:w-64" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {(profile?.experience_years ?? 0) > 0 && (
                      <div className="absolute -bottom-6 -right-6 glass p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-xl border border-white/10 transition-transform hover:scale-105">
                        <p className="text-3xl md:text-5xl font-black text-primary leading-none mb-1">{profile?.experience_years}+</p>
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-foreground/60">Years in Field</p>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-8 md:space-y-10 text-left">
                    <div>
                      <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] md:text-xs font-black uppercase tracking-widest mb-6">
                        <Award className="h-4 w-4" /> Professional Pedigree
                      </div>
                      <h3 className="font-display text-4xl md:text-6xl font-bold text-foreground uppercase tracking-tight mb-4 leading-none">
                        {profile?.full_name || <span className="text-foreground/20">No Name Set</span>}
                      </h3>
                      <p className="text-secondary font-black uppercase tracking-[0.2em] text-md md:text-xl flex items-center gap-3">
                        <Briefcase className="h-5 w-5" /> {profile?.specialization || 'Veterinary Specialist'}
                      </p>
                    </div>

                    <p className="text-lg md:text-xl text-foreground/60 leading-relaxed font-medium italic relative">
                      <span className="text-4xl md:text-6xl text-primary/10 absolute -top-4 -left-6 md:-left-8 font-serif">"</span>
                      {profile?.bio || 'No biography added yet. Click Edit Profile to add your professional story.'}
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
            ) : (
              /* ── EDIT FORM ── */
              <div className="bg-card rounded-2xl md:rounded-[3rem] p-8 md:p-12 border border-primary/20 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="absolute top-0 right-0 p-6">
                  <Button
                    variant="ghost"
                    onClick={() => setIsEditingProfile(false)}
                    className="rounded-full h-12 w-12 text-primary/40 hover:text-primary"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                <div className="grid gap-10 lg:grid-cols-3">
                  {/* Avatar Column */}
                  <div className="space-y-8 lg:col-span-1">
                    <div className="flex flex-col items-center">
                      <div className="h-32 w-32 md:h-48 md:w-48 rounded-full bg-muted overflow-hidden border-4 border-primary/20 shadow-xl mb-6">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-primary/20">
                            <UserCircle className="h-20 w-20 md:h-32 md:w-32" />
                          </div>
                        )}
                      </div>
                      <div className="w-full space-y-4">
                        <input
                          type="file"
                          ref={avatarFileInputRef}
                          onChange={handleAvatarUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <div className="flex flex-col gap-3">
                          <Button
                            type="button"
                            onClick={() => avatarFileInputRef.current?.click()}
                            disabled={isUploadingAvatar}
                            className="w-full h-12 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 font-bold uppercase tracking-widest text-xs transition-all shadow-sm"
                          >
                            {isUploadingAvatar ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                            Upload Photo
                          </Button>
                          {profile?.avatar_url && (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={deleteAvatar}
                              className="w-full h-10 rounded-lg text-primary/40 hover:text-primary font-bold uppercase tracking-widest text-[10px] transition-all"
                            >
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                              Remove Photo
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fields Column */}
                  <div className="lg:col-span-2 space-y-8">
                    <div className="grid gap-8 md:grid-cols-2 text-left">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 px-2">Official Name</label>
                        <Input
                          value={profile?.full_name || ''}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                          placeholder="FULL NAME"
                          className="h-14 md:h-16 bg-muted/30 border-foreground/5 rounded-xl md:rounded-2xl px-6 font-bold uppercase tracking-wider focus:border-primary/50 transition-all"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 px-2">Designation / Role</label>
                        <Input
                          value={profile?.specialization || ''}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, specialization: e.target.value } : null)}
                          placeholder="E.G. SENIOR SURGEON"
                          className="h-14 md:h-16 bg-muted/30 border-foreground/5 rounded-xl md:rounded-2xl px-6 font-bold uppercase tracking-wider focus:border-primary/50 transition-all"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 px-2">Experience Term (Years)</label>
                        <Input
                          type="number"
                          value={profile?.experience_years || ''}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, experience_years: parseInt(e.target.value) || 0 } : null)}
                          placeholder="0"
                          className="h-14 md:h-16 bg-muted/30 border-foreground/5 rounded-xl md:rounded-2xl px-6 font-bold uppercase tracking-wider focus:border-primary/50 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 text-left">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 px-2">Professional Biography</label>
                      <textarea
                        value={profile?.bio || ''}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, bio: e.target.value } : null)}
                        placeholder="Write your professional journey and expertise..."
                        className="w-full min-h-[150px] bg-muted/30 border-foreground/5 rounded-xl md:rounded-2xl p-6 font-medium text-foreground focus:ring-1 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        onClick={async () => { await saveProfile(); setIsEditingProfile(false); }}
                        disabled={isSavingProfile}
                        className="flex-1 h-16 rounded-xl md:rounded-[2rem] bg-secondary hover:brightness-110 text-white font-black uppercase tracking-[0.4em] shadow-2xl transition-all flex items-center justify-center gap-4"
                      >
                        {isSavingProfile ? <Loader2 className="h-6 w-6 animate-spin" /> : <CheckCircle2 className="h-6 w-6" />}
                        Authorize Portfolio Update
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setIsEditingProfile(false)}
                        className="h-16 px-10 rounded-xl md:rounded-[2rem] border border-foreground/10 font-bold uppercase tracking-[0.3em] text-foreground/40 hover:bg-muted/50"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
