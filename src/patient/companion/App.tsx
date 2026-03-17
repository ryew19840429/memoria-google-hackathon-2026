/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, Component } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  deleteUser,
  User 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  deleteDoc,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../../firebase';
import { UserProfile, MemoryItem, ChatMessage } from './types';
import { COMPANION_OPTIONS, VOICE_OPTIONS, generateCompanionResponse, generateSpeech } from './services/geminiService';
import { 
  Mic, 
  Settings, 
  Calendar, 
  Droplets, 
  Lightbulb, 
  ChevronRight, 
  Home, 
  MessageSquare, 
  History, 
  User as UserIcon,
  LogOut,
  Send,
  Volume2,
  VolumeX,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import IntroScreen from './IntroScreen';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    const state = (this as any).state;
    const props = (this as any).props;
    if (state.hasError) {
      let message = "Something went wrong.";
      try {
        const errInfo = JSON.parse(state.error.message);
        if (errInfo.error && errInfo.error.includes("insufficient permissions")) {
          message = "You don't have permission to access this data. Please check your account.";
        }
      } catch (e) {
        message = state.error?.message || message;
      }

      return (
        <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
          <AlertCircle className="size-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Oops!</h2>
          <p className="text-slate-600 mb-6">{message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-6 py-2 rounded-lg font-bold"
          >
            Reload App
          </button>
        </div>
      );
    }

    return props.children;
  }
}

export default function CompanionAppWrapper(props: any) {
  return (
    <ErrorBoundary>
      <CompanionApp {...props} />
    </ErrorBoundary>
  );
}

function CompanionApp({ activeTab, onReady }: { activeTab: 'home' | 'chat' | 'history' | 'profile', onReady?: (ready: boolean) => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLiveSessionActive, setIsLiveSessionActive] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const liveSessionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueueRef = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);

  const getPatientContext = () => {
    if (!profile) return '';
    const profileContext = [
      `Patient Name: ${profile.patientName || profile.displayName}`,
      profile.dateOfBirth ? `Date of Birth: ${profile.dateOfBirth}` : null,
      profile.homeAddress ? `Home Address: ${profile.homeAddress}` : null,
      profile.medications?.length ? `Medications: ${profile.medications.join(', ')}` : null,
      profile.conditions?.length ? `Conditions: ${profile.conditions.join(', ')}` : null,
      profile.allergies?.length ? `Allergies: ${profile.allergies.join(', ')}` : null,
    ].filter(Boolean).join('\n');

    const memoryContext = memories.map(m => `${m.type}: ${m.content}`).join('\n');
    
    return `--- PATIENT PROFILE ---\n${profileContext}\n\n--- MEMORIES & NOTES ---\n${memoryContext}`;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, 'users', u.uid);
        try {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
            onReady?.(true);
          } else {
            // New user, will trigger onboarding
            setProfile(null);
            onReady?.(false);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${u.uid}`);
        }
      } else {
        setProfile(null);
        onReady?.(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user && profile) {
      const qMemories = query(collection(db, 'users', user.uid, 'memories'), orderBy('createdAt', 'desc'));
      const unsubMemories = onSnapshot(qMemories, (snapshot) => {
        setMemories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MemoryItem)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/memories`));

      const qChats = query(collection(db, 'users', user.uid, 'chats'), orderBy('timestamp', 'asc'));
      const unsubChats = onSnapshot(qChats, (snapshot) => {
        setChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/chats`));

      return () => {
        unsubMemories();
        unsubChats();
      };
    }
  }, [user, profile]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleOnboarding = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const newProfile: UserProfile = {
      uid: user.uid,
      displayName: user.displayName || 'User',
      email: user.email || '',
      createdAt: serverTimestamp(),
      ...data
    };
    try {
      await setDoc(doc(db, 'users', user.uid), newProfile);
      setProfile(newProfile);
      onReady?.(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const handleDeleteProfile = async () => {
    if (!user) return;
    
    try {
      // 1. Delete chats
      const chatsSnap = await getDocs(collection(db, 'users', user.uid, 'chats'));
      for (const d of chatsSnap.docs) {
        await deleteDoc(d.ref);
      }
      
      // 2. Delete memories
      const memoriesSnap = await getDocs(collection(db, 'users', user.uid, 'memories'));
      for (const d of memoriesSnap.docs) {
        await deleteDoc(d.ref);
      }
      
      // 3. Delete user profile
      await deleteDoc(doc(db, 'users', user.uid));
      
      // 4. Delete auth user
      await deleteUser(user);
      
      // Reset state
      setUser(null);
      setProfile(null);
      setIsProfileOpen(false);
    } catch (err) {
      console.error("Error deleting profile:", err);
      // If it's a re-authentication error, we might need to handle it, 
      // but for now we'll just log it.
      if (err instanceof Error && err.message.includes("requires-recent-login")) {
        alert("This action requires a recent login. Please sign out and sign in again to delete your profile.");
      }
    }
  };

  const sendMessage = async (text: string, isVoice = false) => {
    if (!user || !profile || !text.trim()) return;

    const userMsg: ChatMessage = {
      uid: user.uid,
      role: 'user',
      text,
      timestamp: serverTimestamp(),
      isVoice
    };

    try {
      await addDoc(collection(db, 'users', user.uid, 'chats'), userMsg);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/chats`);
    }
    
    setInputText('');
    setIsTyping(true);

    // Generate AI Response
    const context = getPatientContext();
    const history = chats.slice(-10).map(c => ({
      role: c.role,
      parts: [{ text: c.text }]
    }));

    const companion = COMPANION_OPTIONS.find(o => o.id === profile.companionAvatar);
    const systemInstruction = `You are ${profile.companionName || companion?.name || 'a digital nurse'}, a supportive companion for an Alzheimer's patient named ${profile.patientName || profile.displayName} in the Memoria app. 
    Be warm, patient, and reassuring. Use the provided context to have personal conversations. 
    Keep responses concise and easy to understand.
    IMPORTANT CAPABILITIES: As a digital nurse, you can help with all digital tasks (e.g., calling emergency or caretaker, reading the agenda, comforting the patient via chat, reading out recipes, providing instructions for how to make coffee, and reading out calendar items for the day and next day).
    IMPORTANT LIMITATIONS: You CANNOT perform any physical tasks (e.g., making breakfast, making coffee, giving a massage, or physically handing objects). If asked to do a physical task, gently remind the patient that you are a digital companion and offer a digital alternative (like reading instructions or calling a caretaker to help).`;

    try {
      const aiResponse = await generateCompanionResponse(text, history, context, systemInstruction);
      setIsTyping(false);
      
      const modelMsg: ChatMessage = {
        uid: user.uid,
        role: 'model',
        text: aiResponse || "I'm here for you.",
        timestamp: serverTimestamp()
      };
      try {
        await addDoc(collection(db, 'users', user.uid, 'chats'), modelMsg);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/chats`);
      }

      // Speak if it was a voice interaction or on home screen
      if (isVoice || activeTab === 'home') {
        const voice = VOICE_OPTIONS.find(v => v.id === profile.companionVoice);
        const audioResult = await generateSpeech(aiResponse || "I'm here for you.", voice?.voiceName || 'Kore');
        if (audioResult) {
          playAudio(audioResult.data, audioResult.mimeType);
        }
      }
    } catch (error) {
      setIsTyping(false);
      console.error("AI Error", error);
    }
  };

  const playAudio = async (base64: string, mimeType?: string) => {
    try {
      // Try standard Audio element first for common formats
      if (mimeType?.includes('mpeg') || mimeType?.includes('mp3') || mimeType?.includes('wav')) {
        const audio = new Audio(`data:${mimeType};base64,${base64}`);
        audioRef.current = audio;
        setIsSpeaking(true);
        audio.play();
        audio.onended = () => setIsSpeaking(false);
        return;
      }

      // Fallback to AudioContext for raw PCM or unknown formats
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const ctx = audioContextRef.current;
      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const bytes = new Int16Array(len / 2);
      for (let i = 0; i < len; i += 2) {
        bytes[i / 2] = (binaryString.charCodeAt(i + 1) << 8) | binaryString.charCodeAt(i);
      }

      const float32 = new Float32Array(bytes.length);
      for (let i = 0; i < bytes.length; i++) {
        float32[i] = bytes[i] / 32768.0;
      }

      const buffer = ctx.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      setIsSpeaking(true);
      source.start();
      source.onended = () => setIsSpeaking(false);
    } catch (err) {
      console.error("Playback error", err);
      setIsSpeaking(false);
    }
  };

  const sayHi = async () => {
    const voice = VOICE_OPTIONS.find(v => v.id === profile.companionVoice);
    const audioResult = await generateSpeech("Hi!", voice?.voiceName || 'Kore');
    if (audioResult) {
      await playAudio(audioResult.data, audioResult.mimeType);
    }
  };

  const startListening = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      sendMessage(transcript, true);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsSpeaking(false);
    }
    if (isLiveSessionActive) {
      stopLiveSession();
    }
  };

  const stopLiveSession = () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.close();
      liveSessionRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsLiveSessionActive(false);
    setIsSpeaking(false);
    audioQueueRef.current = [];
    isPlayingRef.current = false;
  };

  const startLiveConversation = async () => {
    if (!user || !profile) return;
    
    setError(null);
    setIsLiveSessionActive(true);
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') await ctx.resume();

    const companion = COMPANION_OPTIONS.find(o => o.id === profile.companionAvatar);
    const context = getPatientContext();
    
    const systemInstruction = `You are ${profile.companionName || companion?.name || 'a digital nurse'}, a supportive companion for an Alzheimer's patient named ${profile.patientName || profile.displayName} in the Memoria app. 
    Be warm, patient, and reassuring. Use the provided context to have personal conversations. 
    Keep responses concise and easy to understand.
    IMPORTANT: You are in a LIVE BIDIRECTIONAL VOICE CONVERSATION. 
    Your goal is to be a gentle guide to help the person remember important things and preserve their identity. 
    If they seem confused, gently remind them of where they are or who you are.
    Context about the patient:
    ${context}`;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
    
    const sessionPromise = ai.live.connect({
      model: "gemini-2.5-flash-native-audio-preview-09-2025",
      callbacks: {
        onopen: async () => {
          console.log("Live session opened");
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            const source = ctx.createMediaStreamSource(stream);
            const processor = ctx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              // Convert Float32 to Int16
              const pcmData = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
              }
              // Convert to Base64
              const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
                });
              });
            };

            source.connect(processor);
            processor.connect(ctx.destination);
          } catch (err) {
            console.error("Microphone access denied", err);
            setError("Microphone access denied. Please allow microphone access in your browser settings.");
            stopLiveSession();
          }
        },
        onmessage: async (message: LiveServerMessage) => {
          if (message.serverContent?.modelTurn?.parts) {
            for (const part of message.serverContent.modelTurn.parts) {
              if (part.inlineData?.data) {
                const base64Audio = part.inlineData.data;
                const binaryString = atob(base64Audio);
                const bytes = new Int16Array(binaryString.length / 2);
                for (let i = 0; i < binaryString.length; i += 2) {
                  bytes[i / 2] = (binaryString.charCodeAt(i + 1) << 8) | binaryString.charCodeAt(i);
                }
                audioQueueRef.current.push(bytes);
                if (!isPlayingRef.current) {
                  playNextChunk();
                }
              }
            }
          }
          if (message.serverContent?.interrupted) {
            audioQueueRef.current = [];
            isPlayingRef.current = false;
            setIsSpeaking(false);
          }
        },
        onclose: () => {
          console.log("Live session closed");
          stopLiveSession();
        },
        onerror: (err) => {
          console.error("Live session error", err);
          stopLiveSession();
        }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: profile.companionVoice === 'puck' ? 'Puck' : profile.companionVoice === 'fenrir' ? 'Fenrir' : 'Kore' } },
        },
        systemInstruction,
      },
    });

    liveSessionRef.current = await sessionPromise;
  };

  const playNextChunk = () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      setIsSpeaking(false);
      return;
    }

    isPlayingRef.current = true;
    setIsSpeaking(true);
    const chunk = audioQueueRef.current.shift()!;
    const ctx = audioContextRef.current!;
    
    const float32 = new Float32Array(chunk.length);
    for (let i = 0; i < chunk.length; i++) {
      float32[i] = chunk[i] / 32768.0;
    }

    const buffer = ctx.createBuffer(1, float32.length, 24000); // Live API usually returns 24kHz
    buffer.getChannelData(0).set(float32);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = playNextChunk;
    source.start();
  };

  useEffect(() => {
    let scrollTimeout: any;
    const handleScroll = () => {
      document.body.classList.add('is-scrolling');
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        document.body.classList.remove('is-scrolling');
      }, 1000);
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
        <div className="size-24 bg-primary/10 rounded-full flex items-center justify-center mb-8">
          <div className="size-16 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold">M</div>
        </div>
        <h1 className="text-4xl font-bold mb-4">Memoria</h1>
        <p className="text-slate-600 mb-8 max-w-sm">
          A supportive digital companion to help preserve life stories and identity.
        </p>
        <button 
          onClick={handleLogin}
          className="bg-primary text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  if (!profile) {
    if (!hasStarted) {
      return <IntroScreen onStart={() => setHasStarted(true)} />;
    }
    return <Onboarding onComplete={handleOnboarding} />;
  }

  return (
    <div className="h-full bg-bg-light flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative font-display">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-100">
        <div className="size-10 rounded-full bg-orange-200 flex items-center justify-center overflow-hidden border-2 border-orange-300">
          <UserIcon className="size-6 text-orange-400 fill-orange-400" />
        </div>
        <h1 className="text-lg font-bold text-slate-800">
          {activeTab === 'home' ? 'Memoria' : activeTab === 'chat' ? 'Chat' : activeTab === 'history' ? 'History' : 'Profile'}
        </h1>
        <button onClick={() => setIsProfileOpen(true)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <Settings className="w-6 h-6 text-slate-600" />
        </button>
      </header>
      <main className="flex-1 flex flex-col w-full pl-4 pt-4 pr-0 pb-24 overflow-hidden min-h-0">
        {activeTab === 'home' && (
          <Dashboard 
            profile={profile} 
            memories={memories} 
            onVoiceClick={startLiveConversation} 
            onSayHi={sayHi}
            isSpeaking={isSpeaking}
            isListening={isListening}
            isLiveSessionActive={isLiveSessionActive}
            error={error}
            stopAudio={stopAudio}
          />
        )}
        {activeTab === 'chat' && (
          <ChatView 
            chats={chats} 
            onSendMessage={sendMessage} 
            inputText={inputText}
            setInputText={setInputText}
            isSpeaking={isSpeaking}
            stopAudio={stopAudio}
            isTyping={isTyping}
          />
        )}
        {activeTab === 'history' && <HistoryView chats={chats} />}
      </main>

      <AnimatePresence>
        {isProfileOpen && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-50 bg-bg-light flex flex-col"
          >
            <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-100">
              <button onClick={() => setIsProfileOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ChevronRight className="w-6 h-6 text-slate-600 rotate-180" />
              </button>
              <h1 className="text-lg font-bold text-slate-800">Profile</h1>
              <div className="w-10" />
            </header>
            <div className="flex-1 overflow-y-auto pl-4 pt-4 pr-0 pb-24">
              <ProfileView 
                profile={profile} 
                memories={memories} 
                onLogout={() => signOut(auth)} 
                onDeleteProfile={handleDeleteProfile}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Onboarding({ onComplete }: { onComplete: (data: Partial<UserProfile>) => void }) {
  const [step, setStep] = useState(1);
  const [patientName, setPatientName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [medications, setMedications] = useState('');
  const [conditions, setConditions] = useState('');
  const [allergies, setAllergies] = useState('');
  
  const [companionName, setCompanionName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    
    let formatted = val;
    if (val.length > 2) {
      formatted = val.slice(0, 2) + '/' + val.slice(2);
    }
    if (val.length > 4) {
      formatted = formatted.slice(0, 5) + '/' + formatted.slice(5);
    }
    
    setDateOfBirth(formatted);
  };

  const handleTestVoice = async (voiceId: string) => {
    const voice = VOICE_OPTIONS.find(v => v.id === voiceId);
    if (!voice) return;
    setIsTestingVoice(true);
    try {
      const result = await generateSpeech("Hello, I am your digital companion. I am here to help you.", voice.voiceName);
      if (result) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const binaryString = window.atob(result.data);
        const bytes = new Int16Array(binaryString.length / 2);
        for (let i = 0; i < binaryString.length; i += 2) {
          bytes[i / 2] = (binaryString.charCodeAt(i + 1) << 8) | binaryString.charCodeAt(i);
        }
        const float32 = new Float32Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) float32[i] = bytes[i] / 32768.0;
        const buffer = ctx.createBuffer(1, float32.length, 24000);
        buffer.getChannelData(0).set(float32);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTestingVoice(false);
    }
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      await onComplete({
        patientName,
        dateOfBirth,
        profilePicture,
        homeAddress,
        medications: medications.split(',').map(s => s.trim()).filter(Boolean),
        conditions: conditions.split(',').map(s => s.trim()).filter(Boolean),
        allergies: allergies.split(',').map(s => s.trim()).filter(Boolean),
        companionAvatar: selectedAvatar,
        companionVoice: selectedVoice,
        companionName
      });
    } catch (e) {
      console.error(e);
      setIsFinishing(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return patientName.trim().length > 0 && dateOfBirth.trim().length > 0;
    if (step === 2) return homeAddress.trim().length > 0;
    if (step === 3) return true; // Medical info is optional
    if (step === 4) return selectedAvatar !== '';
    if (step === 5) return companionName.trim().length > 0;
    if (step === 6) return selectedVoice !== '';
    return false;
  };

  const nextStep = () => {
    if (step < 6) setStep(step + 1);
    else handleFinish();
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 max-w-md mx-auto relative">
      <div className="flex-1 flex flex-col p-6 overflow-y-auto pb-32">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pt-12">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">Welcome</h2>
              <p className="text-slate-500 text-sm">Let's start with some basic info.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">What should we call you?</label>
                <input 
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full p-4 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:border-primary focus:ring-0 transition-all text-lg font-medium text-slate-900"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Date of Birth</label>
                <input 
                  type="text"
                  value={dateOfBirth}
                  onChange={handleDateChange}
                  placeholder="DD/MM/YYYY"
                  className="w-full p-4 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:border-primary focus:ring-0 transition-all text-lg font-medium text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Profile Picture URL (Optional)</label>
                <input 
                  type="url"
                  value={profilePicture}
                  onChange={(e) => setProfilePicture(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full p-4 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:border-primary focus:ring-0 transition-all text-lg font-medium text-slate-900"
                />
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pt-12">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">Home Address</h2>
              <p className="text-slate-500 text-sm">Where do you live?</p>
            </div>
            <div className="space-y-4">
              <input 
                type="text"
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
                placeholder="Enter your full address"
                className="w-full p-4 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:border-primary focus:ring-0 transition-all text-lg font-medium text-slate-900"
                autoFocus
              />
              {homeAddress.trim().length > 5 && (
                <div className="w-full h-64 bg-slate-100 rounded-2xl overflow-hidden shadow-sm border border-slate-200 relative group">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(homeAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    allowFullScreen
                    className="opacity-90 group-hover:opacity-100 transition-opacity"
                  ></iframe>
                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-white/20">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Home className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-slate-800 font-bold text-sm truncate">{homeAddress}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pt-12">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">Medical Info</h2>
              <p className="text-slate-500 text-sm">Optional. Separate items with commas.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Medications</label>
                <input 
                  type="text"
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  placeholder="e.g. Aspirin, Lisinopril"
                  className="w-full p-4 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:border-primary focus:ring-0 transition-all text-lg font-medium text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Conditions</label>
                <input 
                  type="text"
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  placeholder="e.g. Hypertension, Diabetes"
                  className="w-full p-4 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:border-primary focus:ring-0 transition-all text-lg font-medium text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Allergies</label>
                <input 
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Peanuts"
                  className="w-full p-4 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:border-primary focus:ring-0 transition-all text-lg font-medium text-slate-900"
                />
              </div>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">Meet your team</h2>
              <p className="text-slate-500 text-sm">Select a companion who feels right for you.</p>
            </div>
            <div className="grid gap-4">
              {COMPANION_OPTIONS.map(opt => (
                <button 
                  key={opt.id}
                  onClick={() => {
                    setSelectedAvatar(opt.id);
                    if (!companionName) setCompanionName(opt.name);
                  }}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left group",
                    selectedAvatar === opt.id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-transparent bg-white shadow-sm hover:border-slate-200"
                  )}
                >
                  <div className="relative">
                    <img src={opt.imageUrl} alt={opt.name} className="size-20 rounded-2xl object-cover shadow-md" referrerPolicy="no-referrer" />
                    {selectedAvatar === opt.id && (
                      <div className="absolute -top-2 -right-2 bg-primary text-white p-1 rounded-full shadow-lg">
                        <ChevronRight className="size-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-900">{opt.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{opt.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pt-12">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">Name your nurse</h2>
              <p className="text-slate-500 text-sm">You can keep their name or give them a new one.</p>
            </div>
            <input 
              type="text"
              value={companionName}
              onChange={(e) => setCompanionName(e.target.value)}
              placeholder="Nurse's name"
              className="w-full p-4 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:border-primary focus:ring-0 transition-all text-lg font-medium text-slate-900"
              autoFocus
            />
          </motion.div>
        )}

        {step === 6 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">Their Voice</h2>
              <p className="text-slate-500 text-sm">Choose how you'd like them to sound.</p>
            </div>
            <div className="grid gap-4">
              {VOICE_OPTIONS.map(opt => (
                <div key={opt.id} className="relative group">
                  <button 
                    onClick={() => setSelectedVoice(opt.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all",
                      selectedVoice === opt.id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-transparent bg-white shadow-sm hover:border-slate-200"
                    )}
                  >
                    <span className="font-bold text-lg text-slate-900">{opt.name}</span>
                    <Volume2 className={cn("size-6", selectedVoice === opt.id ? "text-primary" : "text-slate-400")} />
                  </button>
                  <button 
                    onClick={() => handleTestVoice(opt.id)}
                    disabled={isTestingVoice}
                    className="absolute right-16 top-1/2 -translate-y-1/2 text-xs text-primary font-bold bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors"
                  >
                    {isTestingVoice ? "..." : "Listen"}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {canProceed() && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-12 z-50"
          >
            <div className="max-w-md mx-auto flex gap-4">
              {step > 1 && (
                <button 
                  onClick={() => setStep(step - 1)} 
                  className="flex-1 py-4 font-bold text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200"
                >
                  Back
                </button>
              )}
              <button 
                disabled={isFinishing}
                onClick={nextStep}
                className="flex-[2] bg-primary text-white py-4 rounded-xl font-bold shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {isFinishing && <div className="size-4 border-2 border-white border-t-transparent animate-spin rounded-full" />}
                {step === 4 ? "Complete Setup" : "Continue"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Dashboard({ profile, memories, onVoiceClick, onSayHi, isSpeaking, isListening, isLiveSessionActive, error, stopAudio }: any) {
  const companion = COMPANION_OPTIONS.find(o => o.id === profile.companionAvatar);
  const now = new Date();

  return (
    <div className="flex-1 overflow-y-auto space-y-8 pb-8 pr-4 h-full min-h-0">
      <section className="space-y-1">
        <p className="text-primary font-bold tracking-widest uppercase text-xs">YOUR COMPANION</p>
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">Hi {profile.patientName?.split(' ')[0] || profile.displayName.split(' ')[0]}</h1>
      </section>

      <section className="mt-4">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
            <AlertCircle className="size-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}
        <button 
          onClick={() => { if (isLiveSessionActive) stopAudio(); else onVoiceClick(); }}
          className={cn(
            "w-full rounded-[2.5rem] p-6 shadow-2xl flex flex-col items-center gap-4 transition-all active:scale-[0.98]",
            isLiveSessionActive ? "bg-emerald-500 shadow-emerald-500/20" : "bg-primary shadow-primary/30 hover:bg-primary-hover"
          )}
        >
          <div className="bg-white/20 p-2 rounded-full relative">
            <img src={companion?.imageUrl} alt={companion?.name} className="size-32 md:size-40 rounded-full object-cover bg-white shadow-inner" referrerPolicy="no-referrer" />
            {(isSpeaking || isLiveSessionActive) && (
              <motion.div 
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-white rounded-full"
              />
            )}
          </div>
          <div className="text-center text-white space-y-1">
            <h2 className="text-2xl font-bold">{isLiveSessionActive ? "Conversation Active" : "Help me with something"}</h2>
            <p className="text-white/90 text-sm font-medium">{isLiveSessionActive ? "I'm listening, speak freely" : `Tap or say "Hey ${profile.companionName || companion?.name}"`}</p>
          </div>
        </button>
        {isLiveSessionActive && (
          <button 
            onClick={stopAudio}
            className="w-full mt-4 flex items-center justify-center gap-2 text-primary font-bold"
          >
            <VolumeX className="size-5" /> End Conversation
          </button>
        )}
      </section>

      <section className="space-y-4 pt-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest ml-1">Proactive Whispers</h3>
        <div className="grid gap-4">
          <WhisperCard 
            icon={<Calendar className="text-amber-600 size-6" />} 
            bg="bg-amber-100" 
            title="Sarah is coming over at 2 PM" 
            subtitle="Calendar Sync • 3h from now" 
          />
          <WhisperCard 
            icon={<Droplets className="text-blue-600 size-6" />} 
            bg="bg-blue-100" 
            title="Remember to drink some water" 
            subtitle="Wellness Goal • 4 glasses today" 
          />
          <WhisperCard 
            icon={<Lightbulb className="text-emerald-600 size-6" />} 
            bg="bg-emerald-100" 
            title="It's a bright day, want to go for a walk?" 
            subtitle="Activity Suggestion • 72°F outside" 
          />
        </div>
      </section>
    </div>
  );
}

function WhisperCard({ icon, bg, title, subtitle }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 shadow-sm">
      <div className={cn("p-3 rounded-full flex items-center justify-center", bg)}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</p>
        <p className="text-sm text-slate-500 font-medium">{subtitle}</p>
      </div>
      <ChevronRight className="size-5 text-slate-300" />
    </div>
  );
}

function ChatView({ chats, onSendMessage, inputText, setInputText, isSpeaking, stopAudio, isTyping }: any) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chats, isTyping]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 scroll-smooth pr-4">
        {chats.map((chat: ChatMessage, i: number) => (
          <div key={i} className={cn("flex", chat.role === 'user' ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[80%] p-4 rounded-2xl text-sm",
              chat.role === 'user' ? "bg-primary text-white rounded-tr-none" : "bg-slate-800 text-white shadow-sm rounded-tl-none"
            )}>
              {chat.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-1 p-3 bg-slate-800 rounded-2xl rounded-tl-none w-16 items-center justify-center">
              <div className="size-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="size-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="size-1.5 bg-slate-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
        {isSpeaking && (
          <div className="flex justify-start">
            <button onClick={stopAudio} className="text-xs text-primary font-bold flex items-center gap-1">
              <VolumeX className="size-3" /> Stop audio
            </button>
          </div>
        )}
      </div>
      <div className="pt-4 flex gap-2">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSendMessage(inputText)}
          placeholder="Type a message..."
          className="flex-1 bg-slate-800 text-white placeholder:text-slate-400 border-none rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-primary"
        />
        <button 
          onClick={() => onSendMessage(inputText)}
          className="bg-primary text-white p-3 rounded-xl shadow-lg shadow-primary/20"
        >
          <Send className="size-6" />
        </button>
      </div>
    </div>
  );
}

function HistoryView({ chats }: { chats: ChatMessage[] }) {
  return (
    <div className="flex-1 overflow-y-auto space-y-6 pb-8 pr-4 h-full min-h-0">
      <div className="space-y-4">
        {chats.length === 0 ? (
          <p className="text-slate-500 text-center py-12">No conversations yet.</p>
        ) : (
          chats.slice().reverse().map((chat, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded", chat.role === 'user' ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700")}>
                  {chat.role}
                </span>
                <span className="text-[10px] text-slate-400">
                  {chat.timestamp?.toDate().toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{chat.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ProfileView({ profile, memories, onLogout, onDeleteProfile }: { profile: UserProfile, memories: MemoryItem[], onLogout: () => void, onDeleteProfile: () => void }) {
  const avatar = COMPANION_OPTIONS.find(o => o.id === profile.companionAvatar);
  const voice = VOICE_OPTIONS.find(v => v.id === profile.companionVoice);
  const [showAddMemory, setShowAddMemory] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newMemory, setNewMemory] = useState({ type: 'story' as any, content: '' });

  const handleAddMemory = async () => {
    if (!newMemory.content.trim()) return;
    try {
      await addDoc(collection(db, 'users', profile.uid, 'memories'), {
        uid: profile.uid,
        type: newMemory.type,
        content: newMemory.content,
        createdAt: serverTimestamp()
      });
      setNewMemory({ type: 'story', content: '' });
      setShowAddMemory(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${profile.uid}/memories`);
    }
  };

  const handleDeleteMemory = async (memoryId: string) => {
    try {
      await deleteDoc(doc(db, 'users', profile.uid, 'memories', memoryId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${profile.uid}/memories/${memoryId}`);
    }
  };

  return (
    <div className="space-y-8 pr-4">
      
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="size-16 bg-slate-100 rounded-full flex items-center justify-center">
            <UserIcon className="size-8 text-slate-400" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-slate-900 dark:text-white">{profile.patientName || profile.displayName}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{profile.email}</p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-700 space-y-4">
          <h4 className="text-xs font-bold uppercase text-slate-900 dark:text-slate-400 tracking-widest">Your Companion</h4>
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
            <div className="flex items-center gap-3">
              <img src={avatar?.imageUrl} className="size-10 rounded-full object-cover" referrerPolicy="no-referrer" />
              <span className="font-medium text-slate-900 dark:text-white">{profile.companionName || avatar?.name}</span>
            </div>
            <span className="text-xs text-slate-400">{voice?.name} voice</span>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-700 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase text-slate-900 dark:text-slate-400 tracking-widest">Memory Vault</h4>
            <button 
              onClick={() => setShowAddMemory(!showAddMemory)}
              className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full shadow-sm hover:bg-primary/90 transition-colors"
            >
              {showAddMemory ? 'Cancel' : '+ Add Memory'}
            </button>
          </div>

          {showAddMemory && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-3">
              <select 
                value={newMemory.type}
                onChange={(e) => setNewMemory({ ...newMemory, type: e.target.value as any })}
                className="w-full bg-white dark:bg-slate-800 border-none rounded-lg text-sm text-white p-2"
              >
                <option value="story">Life Story</option>
                <option value="family_member" style={{color: 'white'}}>Family Member</option>
                <option value="calendar">Important Date</option>
              </select>
              <textarea 
                value={newMemory.content}
                onChange={(e) => setNewMemory({ ...newMemory, content: e.target.value })}
                placeholder="Describe the memory..."
                className="w-full bg-white dark:bg-slate-800 border-none rounded-lg text-sm min-h-[80px] p-2"
              />
              <button 
                onClick={handleAddMemory}
                className="w-full bg-primary text-white py-2 rounded-lg font-bold text-sm"
              >
                Save to Vault
              </button>
            </div>
          )}

          <div className="space-y-2">
            {memories.map((m, i) => (
              <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm flex justify-between items-start group">
                <div className="flex-1">
                  <span className="text-[10px] font-bold uppercase text-primary block mb-1">{m.type.replace('_', ' ')}</span>
                  <p className="text-slate-700 dark:text-slate-300">{m.content}</p>
                </div>
                <button 
                  onClick={() => m.id && handleDeleteMemory(m.id)}
                  className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove memory"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-700 space-y-2">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-4 text-red-500 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
          >
            <LogOut className="size-5" /> Sign Out
          </button>
          
          {!showDeleteConfirm ? (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-2 text-[10px] text-slate-400 hover:text-red-500 font-medium transition-colors uppercase tracking-widest"
            >
              Delete Profile & Data
            </button>
          ) : (
            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20 space-y-3">
              <p className="text-xs text-red-600 dark:text-red-400 text-center font-medium">
                Are you sure? This will permanently delete your profile and all your memories.
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold"
                >
                  Cancel
                </button>
                <button 
                  onClick={onDeleteProfile}
                  className="flex-1 py-2 bg-red-500 text-white rounded-lg text-xs font-bold"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 p-2 transition-colors",
        active ? "text-primary" : "text-slate-400 hover:text-slate-600"
      )}
    >
      {React.cloneElement(icon, { className: cn("size-6", active ? "fill-current" : "") })}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}
