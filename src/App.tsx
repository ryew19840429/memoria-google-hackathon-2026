/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, HeartPulse, LogOut, Home, MessageSquare, History, BookHeart, AlertTriangle, Camera } from 'lucide-react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from './firebase';
import MemoriaApp from './patient/memoria/App';
import EmergencyApp from './patient/emergency/App';
import CompanionApp from './patient/companion/App';
import CaretakerApp from './caretaker/App';
import AnchorApp from './patient/anchor/App';

function NavButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2 transition-colors border-none outline-none ring-0 ${active ? "text-blue-500" : "text-slate-400 hover:text-slate-600"}`}
    >
      {React.cloneElement(icon, { className: `size-6` })}
      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{label}</span>
    </button>
  );
}

export default function App() {
  const [role, setRole] = useState<'patient' | 'caretaker' | null>(null);
  const [patientView, setPatientView] = useState<'home' | 'chat' | 'history' | 'memories' | 'emergency' | 'anchor'>('home');
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isCompanionReady, setIsCompanionReady] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem('app_role');
    if (savedRole === 'patient' || savedRole === 'caretaker') {
      setRole(savedRole);
    }
    
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
    });
    return unsubscribe;
  }, []);

  const handleSelectRole = (selectedRole: 'patient' | 'caretaker') => {
    setRole(selectedRole);
    localStorage.setItem('app_role', selectedRole);
  };

  const handleLogout = () => {
    setRole(null);
    localStorage.removeItem('app_role');
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 space-y-8 text-center"
        >
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">Welcome</h1>
            <p className="text-slate-500">Please select your role to continue</p>
          </div>

          <div className="grid gap-4">
            <button 
              onClick={() => handleSelectRole('patient')}
              className="flex items-center gap-4 p-6 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
            >
              <div className="size-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                <User className="size-6 text-blue-600 group-hover:text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Patient</h2>
                <p className="text-sm text-slate-500">Access companion, memories, and emergency tools</p>
              </div>
            </button>

            <button 
              onClick={() => handleSelectRole('caretaker')}
              className="flex items-center gap-4 p-6 rounded-2xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all group text-left"
            >
              <div className="size-12 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                <HeartPulse className="size-6 text-emerald-600 group-hover:text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Caretaker</h2>
                <p className="text-sm text-slate-500">Monitor health, activity, and manage settings</p>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (role === 'caretaker') {
    return (
      <div className="relative">
        <button 
          onClick={handleLogout}
          className="fixed top-4 right-4 z-[100] bg-white p-2 rounded-full shadow-md text-slate-500 hover:text-red-500 transition-colors"
          title="Switch Role"
        >
          <LogOut className="size-5" />
        </button>
        <CaretakerApp />
      </div>
    );
  }

  // Patient Role
  return (
    <div className="relative h-screen bg-slate-50 flex flex-col overflow-hidden">
      <button 
        onClick={handleLogout}
        className="fixed top-4 right-4 z-[100] bg-white p-2 rounded-full shadow-md text-slate-500 hover:text-red-500 transition-colors"
        title="Switch Role"
      >
        <LogOut className="size-5" />
      </button>

      <div className="flex-1 h-full relative overflow-hidden">
        <div className={(patientView === 'home' || patientView === 'chat' || patientView === 'history') ? 'block h-full' : 'hidden'}>
          <CompanionApp 
            activeTab={patientView as 'home' | 'chat' | 'history'} 
            onReady={setIsCompanionReady} 
          />
        </div>
        {isCompanionReady && patientView === 'memories' && <MemoriaApp />}
        {isCompanionReady && patientView === 'emergency' && <EmergencyApp />}
        {isCompanionReady && patientView === 'anchor' && <AnchorApp />}
      </div>

      {isCompanionReady && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 px-2 py-2 z-[100] pb-safe">
          <div className="max-w-md mx-auto flex justify-between items-center">
            <NavButton active={patientView === 'home'} onClick={() => setPatientView('home')} icon={<Home />} label="Home" />
            <NavButton active={patientView === 'chat'} onClick={() => setPatientView('chat')} icon={<MessageSquare />} label="Chat" />
            <NavButton active={patientView === 'history'} onClick={() => setPatientView('history')} icon={<History />} label="History" />
            <NavButton active={patientView === 'memories'} onClick={() => setPatientView('memories')} icon={<BookHeart />} label="Memories" />
            <NavButton active={patientView === 'anchor'} onClick={() => setPatientView('anchor')} icon={<Camera />} label="Identify" />
            <NavButton active={patientView === 'emergency'} onClick={() => setPatientView('emergency')} icon={<AlertTriangle />} label="Alert" />
          </div>
        </nav>
      )}
    </div>
  );
}
