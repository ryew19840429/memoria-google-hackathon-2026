/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Activity, TrendingUp, Home, User, MessageCircle, Settings as SettingsIcon } from 'lucide-react';

// Components
import Dashboard from './components/Dashboard';
import ActivityLog from './components/ActivityLog';
import HealthTrends from './components/HealthTrends';
import ClientProfile from './components/ClientProfile';
import ConversationCoach from './components/ConversationCoach';
import Settings from './components/Settings';

export default function CaretakerApp() {
  const [currentTab, setCurrentTab] = useState('overview');
  const [healthSubTab, setHealthSubTab] = useState('activity');
  const [profileSubTab, setProfileSubTab] = useState('profile');

  const renderContent = () => {
    switch (currentTab) {
      case 'overview': 
        return <Dashboard />;
      case 'health': 
        return (
          <div className="flex flex-col h-full min-h-screen bg-slate-50 max-w-md mx-auto shadow-xl">
            <div className="px-4 pt-4 pb-2 bg-slate-50">
              <div className="flex bg-slate-200/70 p-1 rounded-xl">
                <button 
                  onClick={() => setHealthSubTab('activity')}
                  className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${healthSubTab === 'activity' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Activity Log
                </button>
                <button 
                  onClick={() => setHealthSubTab('trends')}
                  className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${healthSubTab === 'trends' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Health Trends
                </button>
              </div>
            </div>
            <div className="flex-1 relative">
              {healthSubTab === 'activity' ? <ActivityLog /> : <HealthTrends />}
            </div>
          </div>
        );
      case 'coach': 
        return <ConversationCoach />;
      case 'profile': 
        return (
          <div className="flex flex-col h-full min-h-screen bg-slate-50 max-w-md mx-auto shadow-xl">
            <div className="px-4 pt-4 pb-2 bg-slate-50">
              <div className="flex bg-slate-200/70 p-1 rounded-xl">
                <button 
                  onClick={() => setProfileSubTab('profile')}
                  className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${profileSubTab === 'profile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Client Profile
                </button>
                <button 
                  onClick={() => setProfileSubTab('settings')}
                  className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${profileSubTab === 'settings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Settings
                </button>
              </div>
            </div>
            <div className="flex-1 relative">
              {profileSubTab === 'profile' ? <ClientProfile /> : <Settings />}
            </div>
          </div>
        );
      default: 
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {renderContent()}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 max-w-md mx-auto">
        <NavItem 
          icon={<Home className="w-6 h-6" />} 
          label="Overview" 
          isActive={currentTab === 'overview'} 
          onClick={() => setCurrentTab('overview')} 
        />
        <NavItem 
          icon={<Activity className="w-6 h-6" />} 
          label="Health" 
          isActive={currentTab === 'health'} 
          onClick={() => setCurrentTab('health')} 
        />
        <NavItem 
          icon={<MessageCircle className="w-6 h-6" />} 
          label="Coach" 
          isActive={currentTab === 'coach'} 
          onClick={() => setCurrentTab('coach')} 
        />
        <NavItem 
          icon={<User className="w-6 h-6" />} 
          label="Profile" 
          isActive={currentTab === 'profile'} 
          onClick={() => setCurrentTab('profile')} 
        />
      </nav>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'}`}
    >
      {icon}
      <span className="text-xs font-bold uppercase tracking-tighter text-slate-600">{label}</span>
    </button>
  );
}

