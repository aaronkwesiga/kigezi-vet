import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { t } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Mic, MicOff, Square, Volume2, VolumeX, Terminal, Lock, Check, CheckCheck, Trash2, Sparkles, Loader2, Camera, Image, UserCircle } from 'lucide-react';
import { format, isToday, isYesterday, startOfDay } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Video } from 'lucide-react';
import ConsultationBackground from '@/components/ConsultationBackground';

interface Message {
  id: string;
  conversation_id: string;
  sender_type: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

// Web Speech API types
interface ISpeechRecognitionAlternative { transcript: string; confidence: number; }
interface ISpeechRecognitionResult { readonly length: number;[index: number]: ISpeechRecognitionAlternative; isFinal: boolean; }
interface ISpeechRecognitionResultList { readonly length: number;[index: number]: ISpeechRecognitionResult; }
interface ISpeechRecognitionEvent extends Event { readonly resultIndex: number; readonly results: ISpeechRecognitionResultList; }
interface ISpeechRecognition extends EventTarget {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null; onerror: (() => void) | null;
  start(): void; stop(): void;
}

const Chat = () => {
  const { lang } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loadTimeout, setLoadTimeout] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => { if (authLoading) setLoadTimeout(true); }, 10000);
    return () => clearTimeout(timer);
  }, [authLoading]);

  const visitorName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Farmer';
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const state = window.history.state?.usr;
    if (state?.initialMessage) setInput(state.initialMessage);
  }, []);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(false); // Changed from true to false
  const spokenMessageIdsRef = useRef<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [farmerAvatarUrl, setFarmerAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (!ttsEnabled || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.sender_type === 'admin' && !spokenMessageIdsRef.current.has(lastMsg.id)) {
      spokenMessageIdsRef.current.add(lastMsg.id);
      const utterance = new SpeechSynthesisUtterance(lastMsg.message);
      const ttsLang: Record<string, string> = { en: 'en-US', rk: 'en-UG', rn: 'en-UG' };
      utterance.lang = ttsLang[lang] ?? 'en-US';
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }, [messages, ttsEnabled, lang]);

  // Persist and Fetch History
  useEffect(() => {
    if (!user) return;
    const savedId = localStorage.getItem(`chat_convo_${user.id}`);
    if (savedId) {
      setConversationId(savedId);
      setStarted(true);
      fetchHistory(savedId);
    }
    // Load farmer avatar from profile
    supabase
      .from('profiles')
      .select('avatar_url')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.avatar_url) setFarmerAvatarUrl(data.avatar_url);
      });
  }, [user]);

  const fetchHistory = async (id: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data as Message[]);
    }
  };

  useEffect(() => {
    if (!conversationId) return;
    localStorage.setItem(`chat_convo_${user?.id}`, conversationId);

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${conversationId}`,
      }, async (payload) => {
        const newMsg = payload.new as Message;

        // If it's an admin message and we are on the page, mark it as read immediately
        if (newMsg.sender_type === 'admin') {
          await supabase.from('chat_messages').update({ is_read: true }).eq('id', newMsg.id);
        }

        setMessages(prev => {
          const exists = prev.some(m => m.id === newMsg.id);
          if (exists) return prev;
          return [...prev, { ...newMsg, is_read: newMsg.sender_type === 'admin' ? true : newMsg.is_read }];
        });
      })
      .on('postgres_changes', {
        event: 'DELETE', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages(prev => prev.filter(m => m.id !== payload.old.id));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel).catch(() => { }); };
  }, [conversationId, user?.id]);

  const toggleListening = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) as { new(): ISpeechRecognition };
    if (!SpeechRecognitionAPI) { alert('Speech recognition is not supported.'); return; }
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = { en: 'en-US', rk: 'en-UG', rn: 'en-UG' }[lang] ?? 'en-US';
    recognition.interimResults = true;
    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) transcript += event.results[i][0].transcript;
      setInput(prev => prev + transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, lang]);

  const startRecording = useCallback(async () => {
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
    } catch { alert('Microphone access denied.'); }
  }, []);

  const sendMessage = useCallback(async (overrideMsg?: string) => {
    const msgText = overrideMsg || input.trim();
    if (!msgText || !conversationId) return;
    if (!overrideMsg) setInput('');

    // Optimistic update
    const tempId = crypto.randomUUID();
    const newMsg: Message = {
      id: tempId, conversation_id: conversationId, sender_type: 'visitor', message: msgText, created_at: new Date().toISOString(), is_read: false,
    };
    setMessages((prev) => [...prev, newMsg]);

    const { error } = await supabase.from('chat_messages').insert({
      conversation_id: conversationId,
      sender_type: 'visitor',
      message: msgText,
      is_read: false
    });

    if (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: `Failed to send message: ${error.message}${error.details ? ' - ' + error.details : ''}`
      });
      setMessages(prev => prev.filter(m => m.id !== tempId));
      return;
    }

    // Auto-Reply Logic: If this is the first visitor message or sent after hours, provide helpful info
    setTimeout(async () => {
      const now = new Date();
      const hour = now.getHours();
      const isWeekend = now.getDay() === 0 || now.getDay() === 6;
      const isAfterHours = hour < 8 || hour >= 18 || isWeekend;

      let autoReplyTxt = "";

      if (isAfterHours) {
        autoReplyTxt = lang === 'en'
          ? "Our office is currently closed (Hours: 8 AM - 6 PM, Mon-Fri). Your message has been received and a veterinarian will respond as soon as we are back online. For emergencies, please call our emergency line directly."
          : lang === 'rk'
            ? "Ofiisi yitu yaigwa (Esha: 2 zashekya - 12 zaigoro, Orwokubanza - Orwokutaano). Obutumwa bwawe buhikire kandi omushaho naija kukugaruramu ku turaabe turaatandika kukora. Aha mbeera y'obururu, teera esimu y'obururu."
            : "Ibiro byacu bifunze ubu (Amasaha: 8 AM - 6 PM, Kuwa mbere - Kuwa gatanu). Ubutumwa bwawe bwakiriwe kandi umuganga azagusubiza vuba bishoboka. Hamagara umurongo wihuse mu gihe habaye ikibazo gikomeye.";
      } else {
        const visitorMessagesCount = messages.filter(m => m.sender_type === 'visitor').length;
        if (visitorMessagesCount === 0 && !overrideMsg) {
          autoReplyTxt = lang === 'en'
            ? "Acknowledgment Protocol: Message received. A veterinarian will review your consultation shortly. Please remain on the line."
            : lang === 'rk'
              ? "Obutumwa buhikire. Omushaho w'ebitungwa naija kugugaruramu omukanya kake. Lindira hano."
              : "Ubutumwa bwakiriwe. Umuganga w'amatungo agiye kugusubiza mu kanya gato. Tegereza hano.";
        }
      }

      if (autoReplyTxt) {
        const { data: autoMsgData } = await supabase.from('chat_messages').insert({
          conversation_id: conversationId,
          sender_type: 'admin',
          message: autoReplyTxt,
          is_read: true
        }).select().single();

        if (autoMsgData) {
          setMessages(prev => [...prev, autoMsgData as Message]);
        }
      }
    }, 1500);
  }, [conversationId, input, toast, messages, lang]);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || !conversationId) return;
    if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
    const recorder = mediaRecorderRef.current;
    recorder.stop();
    recorder.stream.getTracks().forEach(track => track.stop());
    setIsRecording(false);
    await new Promise<void>(resolve => { recorder.onstop = () => resolve(); });
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const fileName = `voice-notes/${conversationId}/${Date.now()}.webm`;
    try {
      const { data, error: uploadError } = await supabase.storage
        .from('chat_recordings')
        .upload(fileName, audioBlob, { contentType: 'audio/webm', upsert: false });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('chat_recordings').getPublicUrl(data.path);
      await sendMessage(`[VOICE_NOTE]:${publicUrl}`);
    } catch (err: unknown) {
      const error = err as Error;
      alert(`Could not upload: ${error.message}`);
    }
  }, [conversationId, sendMessage]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: "Invalid file type", description: "Please upload an image.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    const fileName = `images/${conversationId}/${Date.now()}-${file.name}`;

    try {
      const { data, error: uploadError } = await supabase.storage
        .from('chat_attachments')
        .upload(fileName, file, { contentType: file.type, upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('chat_attachments').getPublicUrl(data.path);
      await sendMessage(`[IMAGE]:${publicUrl}`);
    } catch (err: unknown) {
      const error = err as Error;
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleVideoCall = async () => {
    if (!conversationId) return;
    const roomName = `KigeziVet-${conversationId}`;
    const jitsiUrl = `https://meet.jit.si/${roomName}`;
    await sendMessage(`[VIDEO_CALL]:${jitsiUrl}`);
  };

  const handleFarmerAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file type', description: 'Please upload an image.', variant: 'destructive' });
      return;
    }
    setIsUploadingAvatar(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `avatars/${user.id}-${Date.now()}.${fileExt}`;
    try {
      const { data, error: uploadError } = await supabase.storage
        .from('profile_assets')
        .upload(filePath, file, { contentType: file.type, upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('profile_assets').getPublicUrl(data.path);
      setFarmerAvatarUrl(publicUrl);
      // Upsert into profiles table
      await supabase.from('profiles').upsert({
        user_id: user.id,
        avatar_url: publicUrl,
        full_name: visitorName,
      }, { onConflict: 'user_id' });
      toast({ title: 'Photo Uploaded', description: 'Your profile photo has been saved.' });
    } catch (err: unknown) {
      const error = err as Error;
      toast({ title: 'Upload Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const startChat = async () => {
    if (!user) return;

    // Check for existing open conversation for this user name
    const { data: existing } = await supabase
      .from('chat_conversations')
      .select('id')
      .eq('visitor_name', visitorName)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      setConversationId(existing.id);
      setStarted(true);
      fetchHistory(existing.id);
      return;
    }

    const newId = crypto.randomUUID();
    const { error } = await supabase.from('chat_conversations').insert({ id: newId, visitor_name: visitorName });
    if (error) {
      console.error('Error starting chat:', error);
      toast({ title: 'Error', description: `Failed to start chat: ${error.message}` });
      return;
    }
    setConversationId(newId);
    setStarted(true);
    const welcomeMsg = t('chat.welcome', lang);
    await supabase.from('chat_messages').insert({ conversation_id: newId, sender_type: 'admin', message: welcomeMsg, is_read: true });
    setMessages([{ id: crypto.randomUUID(), conversation_id: newId, sender_type: 'admin', message: welcomeMsg, created_at: new Date().toISOString(), is_read: true }]);
  };


  if (authLoading) return <div className="flex min-h-screen items-center justify-center bg-background"><div className="h-20 md:h-32 w-20 md:w-32 border-8 md:border-[16px] border-primary border-t-transparent rounded-full animate-spin shadow-2xl" /></div>;
  if (!user) return <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center"><div className="glass p-10 md:p-20 rounded-[3rem] md:rounded-[5rem] border-4 md:border-8 border-primary shadow-2xl"><h1 className="text-4xl md:text-6xl font-black text-foreground uppercase mb-10">Access Denied</h1><Button onClick={() => navigate('/login')} className="h-16 md:h-28 px-10 md:px-16 bg-secondary hover:brightness-110 text-white font-black uppercase text-lg md:text-2xl rounded-2xl md:rounded-[2rem] border-b-8 md:border-b-[12px] border-black/20 transition-all">Authorize Login</Button></div></div>;

  if (!started) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16 relative overflow-hidden transition-colors duration-500">
        {/* Dynamic Background Slideshow - Consultation Themed */}
        <ConsultationBackground />

        {/* Dark Overlay for Readability */}
        <div className="absolute inset-0 z-[1] bg-black/50 pointer-events-none" />

        <div className="w-full max-w-3xl text-center relative z-10 animate-in fade-in zoom-in duration-1000">
          <Badge className="mb-6 md:mb-10 px-8 md:px-12 py-2 md:py-3 bg-primary text-primary-foreground border-none font-black uppercase tracking-[0.4em] text-[9px] md:text-xs shadow-lg">Signal Interface</Badge>
          <h1 className="text-3xl md:text-6xl lg:text-7xl font-black text-foreground uppercase tracking-tighter leading-none mb-6 md:mb-10 drop-shadow-sm">Direct <span className="text-primary">Uplink</span></h1>
          <div className="glass rounded-[1.5rem] md:rounded-[4rem] p-6 md:p-14 shadow-xl">
            {/* Farmer identity card with avatar upload */}
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 mb-8 md:mb-14 p-4 md:p-10 bg-muted/30 rounded-xl md:rounded-[3rem] border-2 md:border-4 border-foreground/5">
              {/* Clickable avatar */}
              <div className="relative group flex-shrink-0">
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleFarmerAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div
                  className="h-20 w-20 md:h-28 md:w-28 rounded-2xl md:rounded-3xl overflow-hidden border-4 border-primary/30 shadow-lg cursor-pointer relative"
                  onClick={() => avatarInputRef.current?.click()}
                  title="Click to upload your photo"
                >
                  {farmerAvatarUrl ? (
                    <img src={farmerAvatarUrl} alt="Your photo" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-primary flex items-center justify-center font-black text-3xl md:text-5xl text-primary-foreground">
                      {visitorName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {isUploadingAvatar
                      ? <Loader2 className="h-6 w-6 text-white animate-spin" />
                      : <Camera className="h-6 w-6 text-white" />}
                  </div>
                </div>
                <span className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-md border-2 border-background">
                  <Camera className="h-3 w-3" />
                </span>
              </div>

              <div className="text-center md:text-left">
                <p className="text-2xl md:text-5xl font-black text-foreground uppercase tracking-tighter leading-none mb-1">{visitorName}</p>
                <p className="text-[10px] md:text-base font-black text-primary/60 uppercase tracking-[0.3em]">{user.email}</p>
                <p className="text-[9px] md:text-xs text-foreground/30 font-bold uppercase tracking-[0.2em] mt-2">Click photo to upload your picture</p>
              </div>
            </div>
            <Button onClick={startChat} className="w-full h-14 md:h-24 rounded-xl md:rounded-[3rem] bg-secondary hover:brightness-110 text-white font-black text-lg md:text-3xl uppercase tracking-[0.3em] shadow-lg transition-all border-b-4 md:border-b-[12px] border-black/20 active:translate-y-0.5">Initialize Chat</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 md:p-8 relative font-sans overflow-hidden transition-colors duration-500">
      <ConsultationBackground />
      <div className="absolute inset-0 z-[1] bg-black/50 pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl h-[85dvh] md:h-[80vh] flex flex-col bg-[#efeae2] dark:bg-zinc-900 rounded-2xl md:rounded-[3rem] overflow-hidden shadow-2xl border-2 md:border-8 border-primary/20 transition-all duration-500">
        {/* WhatsApp Background Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'url("https://wweb.dev/assets/whatsapp-chat-bg.png")', backgroundSize: '400px' }} />

        {/* Header */}
        <div className="bg-primary p-6 md:p-8 flex items-center justify-between border-b-4 md:border-b-8 border-black/10 relative z-20">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 md:h-14 md:w-14 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
              <Terminal className="text-white h-6 w-6 md:h-8 md:w-8" />
            </div>
            <div>
              <h2 className="text-white font-black uppercase tracking-tighter text-lg md:text-2xl leading-none">
                {t('chat.title', lang)}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/60 text-[10px] md:text-xs font-bold tracking-widest uppercase">Encryption Active</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-xl">
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTtsEnabled(!ttsEnabled)}
              className="text-white hover:bg-white/10 rounded-xl"
            >
              {ttsEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 custom-scrollbar relative z-10">
          {messages.map((m, idx) => {
            const isVisitor = m.sender_type === 'visitor';
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
                  className={`flex w-full mb-1 ${isVisitor ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`
                    relative max-w-[85%] md:max-w-[70%] px-4 py-2 shadow-sm
                    ${isVisitor
                      ? 'bg-[#dcf8c6] dark:bg-[#005c4b] text-zinc-900 dark:text-zinc-100 rounded-2xl rounded-tr-none'
                      : 'bg-white dark:bg-[#202c33] text-zinc-900 dark:text-zinc-100 rounded-2xl rounded-tl-none'}
                    ${showTail && isVisitor ? 'after:content-[""] after:absolute after:top-0 after:-right-2 after:w-0 after:h-0 after:border-t-[10px] after:border-t-[#dcf8c6] dark:after:border-t-[#005c4b] after:border-r-[10px] after:border-r-transparent' : ''}
                    ${showTail && !isVisitor ? 'before:content-[""] before:absolute before:top-0 before:-left-2 before:w-0 before:h-0 before:border-t-[10px] before:border-t-white dark:before:border-t-[#202c33] before:border-l-[10px] before:border-l-transparent' : ''}
                  `}>
                    <div className={`flex items-center gap-2 mb-1 justify-between opacity-40 text-[8px] md:text-[9px] font-black uppercase tracking-[0.1em]`}>
                      <span>
                        {isToday(msgDate) ? format(msgDate, 'HH:mm') : format(msgDate, 'MMM d, HH:mm')}
                      </span>
                      {!isVisitor && (
                        <div className="flex items-center gap-1">
                          {m.is_read ? <CheckCheck className="h-2.5 w-2.5 text-blue-500" /> : <Check className="h-2.5 w-2.5" />}
                        </div>
                      )}
                    </div>

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
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-[#f0f2f5] dark:bg-[#202c33] border-t border-black/5 relative z-20">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-2 md:gap-4 max-w-4xl mx-auto">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline" // Changed variant to be more visible
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="h-10 md:h-12 rounded-full md:rounded-xl text-primary/80 border-primary/20 hover:bg-primary/10 transition-all flex items-center gap-2 px-3 md:px-4"
            >
              {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
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
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={lang === 'en' ? "Type a response..." : lang === 'rk' ? "Handiika eky'okugaruramu..." : "Andika igisubizo..."}
                  className="bg-transparent border-none focus:ring-0 text-sm md:text-base text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 py-1"
                  maxLength={5000}
                />
              )}
            </div>

            <Button type="submit" disabled={!input.trim() && !isRecording} className="h-10 w-10 md:h-14 md:w-14 rounded-full bg-secondary hover:brightness-110 text-white shadow-lg flex items-center justify-center">
              <Send className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
