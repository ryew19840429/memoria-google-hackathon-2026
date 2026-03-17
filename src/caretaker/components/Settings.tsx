import { useState } from 'react';
import { ArrowLeft, Globe, Moon, Volume2, Mic } from 'lucide-react';
import { Modal } from './Modal';

export default function Settings() {
  const [wanderingAlert, setWanderingAlert] = useState(true);
  const [fallsAlert, setFallsAlert] = useState(true);
  const [medsAlert, setMedsAlert] = useState(true);
  const [hydrationAlert, setHydrationAlert] = useState(false);
  
  const [voiceGender, setVoiceGender] = useState('Female');
  const [voiceTone, setVoiceTone] = useState('Supportive');
  const [reminderFreq, setReminderFreq] = useState(4);

  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <div className="max-w-md mx-auto bg-slate-50 dark:bg-background-dark h-full flex flex-col">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center p-4 justify-center w-full">
          <h1 className="text-lg font-bold leading-tight tracking-tight text-center text-slate-900 dark:text-white">Alerts & Preferences</h1>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Safety Alerts Section */}
        <section className="mt-4">
          <div className="px-4 py-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Safety Alerts</h2>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-4 bg-white dark:bg-slate-800 px-4 min-h-[72px] py-3 justify-between border-b border-slate-100 dark:border-slate-700">
              <div className="flex flex-col justify-center">
                <p className="text-base font-medium leading-normal text-slate-900 dark:text-white">Wandering</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">Notify when Client leaves safe zones</p>
              </div>
              <div className="shrink-0">
                <label className="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none p-0.5 transition-all" style={{ backgroundColor: wanderingAlert ? '#2563eb' : '#e2e8f0', justifyContent: wanderingAlert ? 'flex-end' : 'flex-start' }}>
                  <div className="h-full w-[27px] rounded-full bg-white shadow-md"></div>
                  <input type="checkbox" className="hidden" checked={wanderingAlert} onChange={() => setWanderingAlert(!wanderingAlert)} />
                </label>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white dark:bg-slate-800 px-4 min-h-[72px] py-3 justify-between border-b border-slate-100 dark:border-slate-700">
              <div className="flex flex-col justify-center">
                <p className="text-base font-medium leading-normal text-slate-900 dark:text-white">Falls</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">Immediate alert on impact detection</p>
              </div>
              <div className="shrink-0">
                <label className="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none p-0.5 transition-all" style={{ backgroundColor: fallsAlert ? '#2563eb' : '#e2e8f0', justifyContent: fallsAlert ? 'flex-end' : 'flex-start' }}>
                  <div className="h-full w-[27px] rounded-full bg-white shadow-md"></div>
                  <input type="checkbox" className="hidden" checked={fallsAlert} onChange={() => setFallsAlert(!fallsAlert)} />
                </label>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white dark:bg-slate-800 px-4 min-h-[72px] py-3 justify-between border-b border-slate-100 dark:border-slate-700">
              <div className="flex flex-col justify-center">
                <p className="text-base font-medium leading-normal text-slate-900 dark:text-white">Missed Medication</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">Alert if schedule is not followed</p>
              </div>
              <div className="shrink-0">
                <label className="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none p-0.5 transition-all" style={{ backgroundColor: medsAlert ? '#2563eb' : '#e2e8f0', justifyContent: medsAlert ? 'flex-end' : 'flex-start' }}>
                  <div className="h-full w-[27px] rounded-full bg-white shadow-md"></div>
                  <input type="checkbox" className="hidden" checked={medsAlert} onChange={() => setMedsAlert(!medsAlert)} />
                </label>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white dark:bg-slate-800 px-4 min-h-[72px] py-3 justify-between">
              <div className="flex flex-col justify-center">
                <p className="text-base font-medium leading-normal text-slate-900 dark:text-white">Low Hydration</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">Remind Client to drink water</p>
              </div>
              <div className="shrink-0">
                <label className="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none p-0.5 transition-all" style={{ backgroundColor: hydrationAlert ? '#2563eb' : '#e2e8f0', justifyContent: hydrationAlert ? 'flex-end' : 'flex-start' }}>
                  <div className="h-full w-[27px] rounded-full bg-white shadow-md"></div>
                  <input type="checkbox" className="hidden" checked={hydrationAlert} onChange={() => setHydrationAlert(!hydrationAlert)} />
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* AI Voice Settings */}
        <section className="mt-8">
          <div className="px-4 py-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">AI Voice Assistant</h2>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-base font-medium text-slate-900 dark:text-white">Voice Gender</label>
                <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold">{voiceGender}</span>
              </div>
              <div className="flex gap-2">
                {['Male', 'Female', 'Non-binary'].map(gender => (
                  <button 
                    key={gender}
                    onClick={() => setVoiceGender(gender)}
                    className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium ${voiceGender === gender ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                  >
                    {gender}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-base font-medium">Voice Personality</label>
                <span className="text-blue-600 text-sm font-semibold">Warm & Nurturing</span>
              </div>
              <select className="w-full h-12 rounded-lg border-slate-200 bg-slate-50 text-slate-700 focus:ring-blue-600 focus:border-blue-600 px-3">
                <option>Warm & Nurturing</option>
                <option>Professional & Clear</option>
                <option>Bright & Energetic</option>
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-base font-medium">Voice Tone</label>
                <span className="text-blue-600 text-sm font-semibold">{voiceTone}</span>
              </div>
              <div className="flex gap-2">
                {['Supportive', 'Authoritative', 'Casual'].map(tone => (
                  <button 
                    key={tone}
                    onClick={() => setVoiceTone(tone)}
                    className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium ${voiceTone === tone ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-600'}`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-base font-medium">Reminder Frequency</label>
                <span className="text-slate-500 text-sm">Every {reminderFreq} hours</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={reminderFreq} 
                onChange={(e) => setReminderFreq(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-full appearance-none accent-blue-600 cursor-pointer" 
              />
              <div className="flex justify-between text-xs text-slate-400 px-1">
                <span>Low</span>
                <span>Moderate</span>
                <span>High</span>
              </div>
            </div>

            {/* Preview Voice Button */}
            <button 
              onClick={() => setActiveModal('previewVoice')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              <Volume2 className="w-5 h-5" />
              Preview AI Voice
            </button>
          </div>
        </section>

        {/* General App Preferences */}
        <section className="mt-8">
          <div className="px-4 py-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">App Preferences</h2>
          </div>
          <div className="bg-white">
            <button 
              onClick={() => setActiveModal('language')}
              className="w-full flex items-center justify-between px-4 py-4 border-b border-slate-100"
            >
              <div className="flex items-center gap-3">
                <Globe className="text-slate-400 w-5 h-5" />
                <span className="text-base">Language</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <span className="text-sm">English</span>
                <span className="text-lg">&gt;</span>
              </div>
            </button>
            <button 
              onClick={() => setActiveModal('appearance')}
              className="w-full flex items-center justify-between px-4 py-4"
            >
              <div className="flex items-center gap-3">
                <Moon className="text-slate-400 w-5 h-5" />
                <span className="text-base">Appearance</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <span className="text-sm">System Default</span>
                <span className="text-lg">&gt;</span>
              </div>
            </button>
          </div>
        </section>
      </main>

      <Modal isOpen={activeModal === 'previewVoice'} onClose={() => setActiveModal(null)} title="Voice Preview">
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center relative">
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-ping opacity-20"></div>
            <Mic className="w-10 h-10 text-blue-600" />
          </div>
          <div className="text-center">
            <p className="font-bold text-lg text-slate-900">Playing Sample</p>
            <p className="text-slate-500 text-sm mt-1">Previewing {voiceGender} voice with {voiceTone} tone...</p>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full w-1/3 animate-pulse"></div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'language'} onClose={() => setActiveModal(null)} title="Select Language">
        <div className="space-y-2">
          {['English', 'Spanish', 'French', 'German', 'Mandarin'].map((lang) => (
            <button 
              key={lang}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-medium ${lang === 'English' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'}`}
              onClick={() => setActiveModal(null)}
            >
              {lang}
            </button>
          ))}
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'appearance'} onClose={() => setActiveModal(null)} title="Appearance">
        <div className="space-y-2">
          {['System Default', 'Light Mode', 'Dark Mode'].map((theme) => (
            <button 
              key={theme}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-medium ${theme === 'System Default' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'}`}
              onClick={() => setActiveModal(null)}
            >
              {theme}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
