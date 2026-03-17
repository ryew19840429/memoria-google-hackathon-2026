import { useState } from 'react';
import { ArrowLeft, Calendar, Filter, Bot, Utensils, Footprints, Search, Pill, Moon, MessageSquarePlus } from 'lucide-react';
import { Modal } from './Modal';

export default function ActivityLog() {
  const [activeTab, setActiveTab] = useState('timeline');
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <div className="max-w-md mx-auto bg-slate-50 dark:bg-background-dark h-full flex flex-col">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-blue-100 dark:border-slate-800">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Activity Log</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Monitoring: Client Jane Doe</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors" onClick={() => setActiveModal('calendar')}>
              <Calendar className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors" onClick={() => setActiveModal('filter')}>
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
        <nav className="flex px-4 overflow-x-auto no-scrollbar">
          <button 
            className={`flex-none py-3 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'timeline' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            onClick={() => setActiveTab('timeline')}
          >
            Timeline
          </button>
          <button 
            className={`flex-none py-3 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'insights' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            onClick={() => setActiveTab('insights')}
          >
            Insights
          </button>
          <button 
            className={`flex-none py-3 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'alerts' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            onClick={() => setActiveTab('alerts')}
          >
            Vital Alerts
          </button>
          <button 
            className={`flex-none py-3 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'media' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            onClick={() => setActiveTab('media')}
          >
            Media
          </button>
        </nav>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {activeTab === 'timeline' && (
          <>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 flex items-start gap-4">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-600 dark:text-blue-400 text-sm">AI Agent Summary</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Jane is having a typical morning. No anomalies detected. Walking activity is up 15% compared to yesterday.</p>
              </div>
            </div>

            <div className="relative space-y-0">
              <div className="absolute left-[23px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-800"></div>
              
              <div className="relative flex gap-4 pb-8">
                <div className="relative z-10 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-full border-2 border-blue-600 text-blue-600">
                  <Utensils className="w-5 h-5" />
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-slate-900 dark:text-white">Ate breakfast</h4>
                    <span className="text-xs font-medium text-slate-400">8:15 AM</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Full meal consumed in the kitchen. Adequate hydration noted.</p>
                </div>
              </div>

              <div className="relative flex gap-4 pb-8">
                <div className="relative z-10 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-full border-2 border-blue-600 text-blue-600">
                  <Footprints className="w-5 h-5" />
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-slate-900 dark:text-white">Took a 20-minute walk</h4>
                    <span className="text-xs font-medium text-slate-400">10:00 AM</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Outdoor activity detected. Heart rate within safe parameters.</p>
                </div>
              </div>

              <div className="relative flex gap-4 pb-8">
                <div className="relative z-10 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-full border-2 border-orange-500 text-orange-500">
                  <Search className="w-5 h-5" />
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-slate-900 dark:text-white">Looked for lost keys</h4>
                    <span className="text-xs font-medium text-slate-400">2:00 PM</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">5 minutes of repetitive searching in living room. <span className="text-emerald-500 font-medium">(Resolved)</span></p>
                </div>
              </div>

              <div className="relative flex gap-4 pb-8">
                <div className="relative z-10 bg-slate-50 p-1.5 rounded-full border-2 border-blue-600 text-blue-600">
                  <Pill className="w-5 h-5" />
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-slate-900">Took afternoon medication</h4>
                    <span className="text-xs font-medium text-slate-400">4:30 PM</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">Adherence confirmed via smart dispenser.</p>
                </div>
              </div>

              <div className="relative flex gap-4 pb-8">
                <div className="relative z-10 bg-slate-50 p-1.5 rounded-full border-2 border-indigo-500 text-indigo-500">
                  <Moon className="w-5 h-5" />
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-slate-900">Napped in living room</h4>
                    <span className="text-xs font-medium text-slate-400">5:00 PM</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">Duration: 45 minutes. Motionless period detected on sofa.</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setActiveModal('addNote')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20 transition-all"
            >
              <MessageSquarePlus className="w-5 h-5" />
              Add Caregiver Note
            </button>
          </>
        )}
        
        {activeTab !== 'timeline' && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
            <div className="bg-slate-100 p-4 rounded-full mb-4">
              <Bot className="w-8 h-8 text-slate-400" />
            </div>
            <p className="font-medium text-slate-900 mb-1">No data available yet</p>
            <p className="text-sm">Check back later for {activeTab} updates.</p>
          </div>
        )}
      </main>

      <Modal isOpen={activeModal === 'calendar'} onClose={() => setActiveModal(null)} title="Select Date">
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-slate-400 font-medium">{day}</div>
            ))}
            {Array.from({ length: 31 }).map((_, i) => (
              <button 
                key={i} 
                className={`p-2 rounded-full hover:bg-blue-50 transition-colors ${i === 15 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-slate-700'}`}
                onClick={() => setActiveModal(null)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'filter'} onClose={() => setActiveModal(null)} title="Filter Activity">
        <div className="space-y-3">
          {['Meals', 'Medication', 'Physical Activity', 'Anomalies', 'Sleep'].map(filter => (
            <label key={filter} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
              <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600" defaultChecked />
              <span className="text-slate-700 font-medium">{filter}</span>
            </label>
          ))}
          <button 
            className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            onClick={() => setActiveModal(null)}
          >
            Apply Filters
          </button>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'addNote'} onClose={() => setActiveModal(null)} title="Add Caregiver Note">
        <div className="space-y-4">
          <textarea 
            className="w-full h-32 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
            placeholder="Type your observation or note here..."
          ></textarea>
          <div className="flex gap-3">
            <button 
              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              onClick={() => setActiveModal(null)}
            >
              Cancel
            </button>
            <button 
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              onClick={() => setActiveModal(null)}
            >
              Save Note
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
