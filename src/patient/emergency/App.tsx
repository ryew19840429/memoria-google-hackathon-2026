import { useState, useEffect } from 'react';
import { X, Phone, RadioTower, Heart, TrendingUp, MapPin, XCircle, Mic, PhoneOff, PhoneCall, Loader2, CheckCircle2, Volume2 } from 'lucide-react';

export default function EmergencyApp() {
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'active'>('idle');
  const [emergencyCalled, setEmergencyCalled] = useState(false);

  const handleConnectAudio = () => {
    setCallStatus('connecting');
    // Simulate instant auto-answer connection
    setTimeout(() => {
      setCallStatus('active');
    }, 1500);
  };

  const handleEndAudio = () => {
    setCallStatus('idle');
  };

  return (
    <div className="h-full bg-bg-light dark:bg-background-dark flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative font-display">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800">
        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
        </button>
        <h1 className="text-lg font-bold text-slate-800 dark:text-white">Emergency Alert</h1>
        <button className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
          <Phone className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {/* Status Section */}
        <div className="flex flex-col items-center px-4 py-8 text-center">
        <div className={`size-24 rounded-full flex items-center justify-center mb-6 ring-4 ${emergencyCalled ? 'bg-emergency/10 ring-emergency/20' : 'bg-warning/10 ring-warning/20'}`}>
          <RadioTower className={`w-12 h-12 ${emergencyCalled ? 'text-emergency' : 'text-warning'}`} />
        </div>
        <h1 className="text-slate-900 dark:text-slate-100 tracking-tight text-3xl font-extrabold leading-tight pb-3">
          {emergencyCalled ? 'Emergency Services Called' : 'Fall Detected'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg font-medium leading-normal max-w-md">
          {emergencyCalled 
            ? 'Help is currently being dispatched to the location.' 
            : 'Fall detected at 10:42 AM. Please assess the situation via live audio before dispatching help.'}
        </p>
      </div>

      {/* Dispatcher Brief Card */}
      <div className="px-4 pb-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight">
              {emergencyCalled ? 'Dispatcher Brief' : 'Live Patient Status'}
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emergency/10 text-emergency">
              <span className="size-2 rounded-full bg-emergency animate-pulse"></span> Live Data
            </span>
          </div>

          <div className="flex flex-wrap gap-4 p-4">
            {/* Heart Rate */}
            <div className="flex min-w-[140px] flex-1 flex-col gap-2 rounded-2xl p-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Heart className="w-4 h-4 fill-slate-400" />
                <p className="text-sm font-semibold">Heart Rate</p>
              </div>
              <p className="text-slate-900 dark:text-slate-100 tracking-tight text-3xl font-extrabold leading-tight">98 bpm</p>
              <p className="text-emerald-600 dark:text-emerald-400 text-sm font-bold leading-normal flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> +5% from baseline
              </p>
            </div>

            {/* Location */}
            <div className="flex min-w-[140px] flex-1 flex-col gap-2 rounded-2xl p-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <MapPin className="w-4 h-4 fill-slate-400" />
                <p className="text-sm font-semibold">Location</p>
              </div>
              <p className="text-slate-900 dark:text-slate-100 tracking-tight text-3xl font-extrabold leading-tight">Living Room</p>
              <p className="text-primary text-sm font-bold leading-normal">Smart Hub Detection</p>
            </div>
          </div>

          {/* Medical History */}
          <div className="px-4 pb-4">
            <div className="p-5 rounded-2xl bg-warning/10 border border-warning/20">
              <p className="text-warning text-xs font-bold uppercase tracking-widest mb-3">Medical History Summary</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">Condition</span>
                  <span className="text-slate-900 dark:text-white text-sm font-bold text-right">Type 2 Diabetes</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">Medication</span>
                  <span className="text-slate-900 dark:text-white text-sm font-bold text-right">Metformin, Lisinopril</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">Blood Type</span>
                  <span className="text-slate-900 dark:text-white text-sm font-bold text-right">O Positive</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map/Location Visual */}
      <div className="px-4 pb-8">
        <div className="relative h-56 w-full rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
            <iframe
              title="Emergency Location Map"
              className="w-full h-full object-cover opacity-80 pointer-events-none"
              src="https://maps.google.com/maps?q=Kerkstraat%201,%20Amsterdam&t=&z=15&ie=UTF8&iwloc=&output=embed"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background-light/60 dark:from-background-dark/60 to-transparent"></div>
            <div className="absolute flex flex-col items-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <MapPin className="w-12 h-12 text-emergency fill-emergency drop-shadow-lg" />
              <div className="bg-white dark:bg-slate-800 px-4 py-1.5 rounded-full shadow-lg text-xs font-extrabold text-slate-900 dark:text-slate-100 mt-2 whitespace-nowrap">
                Kerkstraat 1, Amsterdam
              </div>
            </div>
          </div>
        </div>
      </div>
      </main>

      {/* Sticky Bottom Action */}
      <div className="mt-auto p-6 bg-bg-light dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 sticky bottom-16 z-10">
        <div className="max-w-md mx-auto flex flex-col gap-5">
          
          {/* Live Audio Connection Button */}
          {callStatus === 'idle' && (
            <button 
              onClick={handleConnectAudio}
              className="w-full py-5 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg flex items-center justify-center gap-4 transition-all active:scale-[0.98] shadow-sm"
            >
              <Volume2 className="w-6 h-6" />
              <div className="flex flex-col items-start">
                <span>Talk to client</span>
                <span className="text-xs font-medium text-primary-50 opacity-80">Auto-answers immediately</span>
              </div>
            </button>
          )}
          
          {callStatus === 'connecting' && (
            <button disabled className="w-full py-4 px-6 rounded-2xl bg-primary/70 text-white font-bold text-lg flex items-center justify-center gap-3 shadow-sm">
              <Loader2 className="w-6 h-6 animate-spin" />
              Connecting to Speaker...
            </button>
          )}

          {callStatus === 'active' && (
            <div className="w-full rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 overflow-hidden shadow-sm">
              <div className="p-4 flex items-center justify-between bg-emerald-100/50 dark:bg-emerald-900/40">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                  </div>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">Live Audio Active</span>
                </div>
                <span className="text-emerald-600 dark:text-emerald-500 text-sm font-medium">00:12</span>
              </div>
              <button 
                onClick={handleEndAudio}
                className="w-full py-3 px-6 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-md flex items-center justify-center gap-2 transition-colors border-t border-emerald-100 dark:border-emerald-800/50"
              >
                <PhoneOff className="w-5 h-5" />
                End Call
              </button>
            </div>
          )}

          {/* Emergency & Cancel Buttons */}
          <div className="flex gap-5">
            {!emergencyCalled ? (
              <button 
                onClick={() => setEmergencyCalled(true)}
                className="flex-[1.5] py-5 px-6 rounded-2xl bg-emergency hover:bg-red-700 text-white font-bold text-[15px] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-sm"
              >
                <PhoneCall className="w-5 h-5" />
                Dispatch 112
              </button>
            ) : (
              <div className="flex-[1.5] py-5 px-6 rounded-2xl bg-emergency/10 border border-emergency/20 text-emergency font-bold text-[15px] flex items-center justify-center gap-3">
                <CheckCircle2 className="w-5 h-5" />
                112 Dispatched
              </div>
            )}
            
            <button className="flex-1 py-5 px-6 rounded-2xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold text-[15px] flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
              <XCircle className="w-5 h-5" />
              False Alarm
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
