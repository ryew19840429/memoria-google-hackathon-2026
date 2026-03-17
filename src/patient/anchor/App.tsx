import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Settings, 
  Phone, 
  MessageCircle, 
  UserPlus, 
  ArrowLeft, 
  RefreshCw, 
  Image as ImageIcon,
  Heart,
  Users
} from 'lucide-react';
import { LovedOne, AppView } from './types';
import { MOCK_LOVED_ONES } from './constants';
import { identifyPerson } from './services/geminiService';

export default function App() {
  const [view, setView] = useState<AppView>('identify');
  const [lovedOnes, setLovedOnes] = useState<LovedOne[]>(MOCK_LOVED_ONES);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [identifiedPerson, setIdentifiedPerson] = useState<LovedOne | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLovedOne, setNewLovedOne] = useState({ name: '', relationship: '', imageUrl: '' });
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);

  const handleAddLovedOne = () => {
    // Logic to add the loved one would go here
    setLovedOnes([...lovedOnes, { ...newLovedOne, id: Date.now().toString(), phoneNumber: '' }]);
    setIsAddModalOpen(false);
    setNewLovedOne({ name: '', relationship: '', imageUrl: '' });
  };

  const handleIdentify = async () => {
    setIsIdentifying(true);
    setIdentifiedPerson(null);
    
    // Simulate taking a photo by picking a random loved one's image
    // RESTRICTION: Only simulate the cat (Luna) or the lady (Sarah)
    const restrictedPool = lovedOnes.filter(lo => lo.name === 'Sarah' || lo.name === 'Luna');
    
    // Ensure we pick a different one than the current one if possible
    const otherLovedOnes = restrictedPool.filter(lo => lo.imageUrl !== currentPhoto);
    const pool = otherLovedOnes.length > 0 ? otherLovedOnes : restrictedPool;
    const randomLovedOne = pool[Math.floor(Math.random() * pool.length)];
    
    setCurrentPhoto(randomLovedOne.imageUrl);

    // In a real app, we'd convert the image to base64. 
    // For this simulation, we'll just pass a dummy base64 or the URL if the service supported it.
    // Since Gemini needs base64, we'll fetch the image and convert it.
    try {
      const response = await fetch(randomLovedOne.imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const result = await identifyPerson(base64data, lovedOnes);
        setIdentifiedPerson(result);
        setIsIdentifying(false);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Simulation error:", error);
      // Fallback for simulation if fetch fails (e.g. CORS)
      setTimeout(() => {
        setIdentifiedPerson(randomLovedOne);
        setIsIdentifying(false);
      }, 1500);
    }
  };

  return (
    <div className="h-full pb-20 bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <div className="max-w-md mx-auto bg-white h-full shadow-xl flex flex-col relative overflow-hidden">
        
        {/* Add Loved One Modal */}
        <AnimatePresence>
          {isAddModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
              >
                <h3 className="text-lg font-bold mb-4">Add Loved One</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Name"
                    className="w-full p-2 border rounded-lg"
                    value={newLovedOne.name}
                    onChange={(e) => setNewLovedOne({ ...newLovedOne, name: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Relationship"
                    className="w-full p-2 border rounded-lg"
                    value={newLovedOne.relationship}
                    onChange={(e) => setNewLovedOne({ ...newLovedOne, relationship: e.target.value })}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full p-2 border rounded-lg"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setNewLovedOne({ ...newLovedOne, imageUrl: event.target?.result as string });
                        };
                        reader.readAsDataURL(e.target.files[0]);
                      }
                    }}
                  />
                </div>
                <div className="flex gap-2 mt-6">
                  <button 
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-2 rounded-lg bg-slate-100 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddLovedOne}
                    className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="px-4 py-3 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md z-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
              <Heart className="text-white w-5 h-5 fill-current" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800">Memory Anchor</h1>
          </div>
          <button 
            onClick={() => setView(view === 'identify' ? 'settings' : 'identify')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            {view === 'identify' ? <Settings className="w-5 h-5 text-slate-500" /> : <ArrowLeft className="w-5 h-5 text-slate-500" />}
          </button>
        </header>

        <main className="flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {view === 'identify' ? (
              <motion.div 
                key="identify"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex-1 flex flex-col p-4 gap-6 overflow-hidden"
              >
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold text-slate-800">Who is this?</h2>
                  <p className="text-slate-500 text-sm">Point the camera to identify your loved one.</p>
                </div>

                {/* Horizontal Split Layout */}
                <div className="flex gap-4 items-start">
                  {/* Left: Viewfinder (Portrait Crop) */}
                  <div className="w-[45%] aspect-[3/4] relative bg-slate-100 rounded-2xl overflow-hidden border-2 border-slate-50 shadow-inner shrink-0">
                    {currentPhoto ? (
                      <img 
                        src={currentPhoto} 
                        alt="Current view" 
                        className="w-full h-full object-cover object-center"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                        <Camera className="w-10 h-10 mb-2 opacity-20" />
                        <p className="text-xs font-medium uppercase">Ready</p>
                      </div>
                    )}

                    {/* Scanning Overlay */}
                    {isIdentifying && (
                      <motion.div 
                        initial={{ top: '0%' }}
                        animate={{ top: '100%' }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] z-10"
                      />
                    )}

                    {/* Detection Frame */}
                    <div className="absolute inset-3 border border-dashed border-white/50 rounded-lg pointer-events-none" />
                  </div>

                  {/* Right: Result Area */}
                  <div className="flex-1 flex flex-col gap-3 min-h-[200px] justify-center">
                    {identifiedPerson ? (
                      <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-3"
                      >
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 shadow-sm">
                          <div className="flex flex-col gap-2">
                            <div>
                              <p className="text-blue-700 text-xs font-bold uppercase tracking-widest mb-0.5">{identifiedPerson.relationship}</p>
                              <h3 className="text-lg font-bold text-blue-900 leading-tight">{identifiedPerson.name}</h3>
                            </div>
                            <p className="text-blue-700 italic text-xs leading-snug">"{identifiedPerson.greeting}"</p>
                          </div>
                        </div>
                        
                        {identifiedPerson.phoneNumber && (
                          <div className="flex flex-col gap-2">
                            <a 
                              href={`tel:${identifiedPerson.phoneNumber}`}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95"
                            >
                              <Phone className="w-4 h-4" />
                              Call
                            </a>
                            <button className="w-full py-2 bg-white text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors text-xs font-bold flex items-center justify-center gap-2">
                              <MessageCircle className="w-4 h-4" />
                              Message
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ) : isIdentifying ? (
                      <div className="flex flex-col items-center justify-center text-slate-400 py-8">
                        <RefreshCw className="w-6 h-6 animate-spin mb-2" />
                        <p className="text-xs font-medium">Identifying...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-xl text-slate-300 py-12 px-4 text-center">
                        <p className="text-xs font-medium leading-tight uppercase tracking-wider">Tap the button below to start</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Main Action Button */}
                <div className="mt-auto pb-6 flex justify-center">
                  <button 
                    onClick={handleIdentify}
                    disabled={isIdentifying}
                    className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 cursor-pointer ${isIdentifying ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700 ring-8 ring-blue-50'}`}
                  >
                    <Camera className="w-10 h-10" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col p-4 gap-4 overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Loved Ones</h2>
                    <p className="text-slate-500 text-xs">Manage people for identification</p>
                  </div>
                  <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-600 text-white p-2 rounded-lg shadow-md cursor-pointer"
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 overflow-y-auto flex-1 pr-1">
                  {lovedOnes.map((person) => (
                    <div key={person.id} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm group hover:shadow-md transition-shadow">
                      <div className="aspect-[4/5] relative">
                        <img 
                          src={person.imageUrl} 
                          alt={person.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-1.5 right-1.5">
                          <span className="bg-white/90 backdrop-blur-sm text-[8px] font-bold px-1.5 py-0.5 rounded-full text-blue-600 uppercase tracking-wider shadow-sm">
                            {person.relationship}
                          </span>
                        </div>
                      </div>
                      <div className="p-2">
                        <h4 className="font-bold text-slate-800 text-xs truncate">{person.name}</h4>
                        <p className="text-xs text-slate-600 truncate">{person.phoneNumber || 'No phone'}</p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add Placeholder */}
                  {/* Removed Add New button */}
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-start gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-md text-blue-600 shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">Caregiver Tip</h4>
                      <p className="text-xs text-slate-600 leading-tight">
                        Upload clear, front-facing photos. The AI works best with high-quality images.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Bottom Nav */}
        <nav className="border-t border-slate-100 px-6 py-3 flex justify-around bg-white shrink-0">
          <button 
            onClick={() => setView('identify')}
            className={`flex flex-col items-center gap-1 cursor-pointer ${view === 'identify' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            <Camera className="w-5 h-5" />
            <span className="text-xs font-bold uppercase">Identify</span>
          </button>
          <button 
            onClick={() => setView('settings')}
            className={`flex flex-col items-center gap-1 cursor-pointer ${view === 'settings' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            <Users className="w-5 h-5" />
            <span className="text-xs font-bold uppercase">Family</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
