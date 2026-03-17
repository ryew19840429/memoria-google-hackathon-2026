import { useState } from 'react';
import { ArrowLeft, Calendar, Moon, Brain, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { Modal } from './Modal';

export default function HealthTrends() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <div className="max-w-md mx-auto bg-slate-50 dark:bg-background-dark h-full flex flex-col">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center p-4 justify-between w-full">
          <div className="w-10 h-10"></div>
          <div className="flex flex-col items-center">
            <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">Health & Trends</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Client: Eleanor Vance</p>
          </div>
          <button 
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setActiveModal('calendar')}
          >
            <Calendar className="text-slate-700 dark:text-slate-300 w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 w-full">
        <div className="px-4 pt-6 pb-2">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Weekly Overview</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Summary of the last 7 days</p>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4">
          <div 
            className="flex flex-col gap-2 rounded-xl p-5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm cursor-pointer hover:border-blue-300 transition-colors"
            onClick={() => setActiveModal('sleepData')}
          >
            <div className="flex items-center justify-between">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Avg Sleep</p>
              <Moon className="text-blue-600 dark:text-blue-400 w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">82%</p>
            <div className="flex items-center gap-1">
              <TrendingUp className="text-green-500 w-3 h-3" />
              <p className="text-green-500 text-xs font-semibold">+5% vs last week</p>
            </div>
          </div>
          <div 
            className="flex flex-col gap-2 rounded-xl p-5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm cursor-pointer hover:border-blue-300 transition-colors"
            onClick={() => setActiveModal('cognitiveData')}
          >
            <div className="flex items-center justify-between">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Cognitive</p>
              <Brain className="text-blue-600 dark:text-blue-400 w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">74/100</p>
            <div className="flex items-center gap-1">
              <TrendingDown className="text-red-500 w-3 h-3" />
              <p className="text-red-500 text-xs font-semibold">-2% vs last week</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 px-4 py-4">
          <div 
            className="flex flex-col gap-4 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm cursor-pointer hover:border-blue-300 transition-colors"
            onClick={() => setActiveModal('sleepChart')}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Sleep Quality</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">7.5h <span className="text-sm font-normal text-slate-400">avg</span></p>
              </div>
              <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <p className="text-green-600 dark:text-green-400 text-xs font-bold">+10%</p>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-3 h-32 items-end px-1">
              {/* Bar chart mockup */}
              <div className="flex flex-col items-center gap-2"><div className="bg-blue-200 dark:bg-blue-900/30 rounded-t-full w-full h-[60%]"></div><p className="text-slate-400 text-[10px] font-bold">M</p></div>
              <div className="flex flex-col items-center gap-2"><div className="bg-blue-200 dark:bg-blue-900/30 rounded-t-full w-full h-[45%]"></div><p className="text-slate-400 text-[10px] font-bold">T</p></div>
              <div className="flex flex-col items-center gap-2"><div className="bg-blue-200 dark:bg-blue-900/30 rounded-t-full w-full h-[35%]"></div><p className="text-slate-400 text-[10px] font-bold">W</p></div>
              <div className="flex flex-col items-center gap-2"><div className="bg-blue-600 dark:bg-blue-500 rounded-t-full w-full h-[90%] shadow-[0_0_12px_rgba(19,127,236,0.3)]"></div><p className="text-blue-600 dark:text-blue-400 text-[10px] font-bold">T</p></div>
              <div className="flex flex-col items-center gap-2"><div className="bg-blue-200 dark:bg-blue-900/30 rounded-t-full w-full h-[70%]"></div><p className="text-slate-400 text-[10px] font-bold">F</p></div>
              <div className="flex flex-col items-center gap-2"><div className="bg-blue-200 dark:bg-blue-900/30 rounded-t-full w-full h-[85%]"></div><p className="text-slate-400 text-[10px] font-bold">S</p></div>
              <div className="flex flex-col items-center gap-2"><div className="bg-blue-200 dark:bg-blue-900/30 rounded-t-full w-full h-[40%]"></div><p className="text-slate-400 text-[10px] font-bold">S</p></div>
            </div>
          </div>

          <div 
            className="flex flex-col gap-4 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm cursor-pointer hover:border-blue-300 transition-colors"
            onClick={() => setActiveModal('hydrationChart')}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Hydration Levels</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">1.8L <span className="text-sm font-normal text-slate-400">avg</span></p>
              </div>
              <div className="px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-xs font-bold">-5%</p>
              </div>
            </div>
            <div className="relative h-32 w-full pt-4">
              <svg fill="none" height="100%" preserveAspectRatio="none" viewBox="0 0 400 100" width="100%" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 80C20 80 40 20 60 20C80 20 100 50 120 50C140 50 160 90 180 90C200 90 220 30 240 30C260 30 280 70 300 70C320 70 340 40 360 40C380 40 400 60 400 60V100H0V80Z" fill="url(#blueGradient)" opacity="0.2"></path>
                <path d="M0 80C20 80 40 20 60 20C80 20 100 50 120 50C140 50 160 90 180 90C200 90 220 30 240 30C260 30 280 70 300 70C320 70 340 40 360 40C380 40 400 60 400 60" stroke="#2563eb" strokeLinecap="round" strokeWidth="3"></path>
                <defs>
                  <linearGradient id="blueGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb"></stop>
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex justify-between mt-2 px-1">
                <p className="text-slate-400 text-[10px] font-bold">M</p>
                <p className="text-slate-400 text-[10px] font-bold">T</p>
                <p className="text-slate-400 text-[10px] font-bold">W</p>
                <p className="text-slate-400 text-[10px] font-bold">T</p>
                <p className="text-slate-400 text-[10px] font-bold">F</p>
                <p className="text-slate-400 text-[10px] font-bold">S</p>
                <p className="text-slate-400 text-[10px] font-bold">S</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div 
              className="flex flex-col gap-4 p-5 rounded-xl border border-slate-200 bg-white shadow-sm cursor-pointer hover:border-blue-300 transition-colors"
              onClick={() => setActiveModal('activityChart')}
            >
              <p className="text-slate-500 text-sm font-medium">Activity Minutes</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold">45m</p>
                <p className="text-green-500 text-xs font-semibold mb-1">+12%</p>
              </div>
              <div className="flex gap-1 h-12 items-end">
                <div className="bg-blue-200 w-full rounded-sm h-[40%]"></div>
                <div className="bg-blue-200 w-full rounded-sm h-[60%]"></div>
                <div className="bg-blue-200 w-full rounded-sm h-[30%]"></div>
                <div className="bg-blue-600 w-full rounded-sm h-[80%]"></div>
                <div className="bg-blue-200 w-full rounded-sm h-[50%]"></div>
                <div className="bg-blue-200 w-full rounded-sm h-[90%]"></div>
                <div className="bg-blue-200 w-full rounded-sm h-[20%]"></div>
              </div>
            </div>
            <div 
              className="flex flex-col gap-4 p-5 rounded-xl border border-slate-200 bg-white shadow-sm cursor-pointer hover:border-blue-300 transition-colors"
              onClick={() => setActiveModal('cognitiveChart')}
            >
              <p className="text-slate-500 text-sm font-medium">Cognitive Clarity</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold">74 <span className="text-sm font-normal text-slate-400">score</span></p>
                <p className="text-green-500 text-xs font-semibold mb-1">+2%</p>
              </div>
              <div className="relative h-12 w-full">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 20">
                  <path d="M0,15 Q10,5 20,12 T40,8 T60,15 T80,5 T100,10" fill="none" stroke="#2563eb" strokeWidth="2"></path>
                </svg>
              </div>
            </div>
          </div>

          <div 
            className="p-5 rounded-xl border border-blue-200 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={() => setActiveModal('aiInsight')}
          >
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center shrink-0">
                <Sparkles className="text-blue-600 w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">AI Insight</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Eleanor's cognitive clarity correlates highly with her sleep quality. Increasing evening hydration by 200ml might reduce morning confusion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Modal isOpen={activeModal === 'goBack'} onClose={() => setActiveModal(null)} title="Navigation">
        <p className="text-slate-600">This would typically navigate back to the previous screen.</p>
      </Modal>

      <Modal isOpen={activeModal === 'calendar'} onClose={() => setActiveModal(null)} title="Select Date Range">
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-slate-400 font-medium">{day}</div>
            ))}
            {Array.from({ length: 31 }).map((_, i) => (
              <button 
                key={i} 
                className={`p-2 rounded-full hover:bg-blue-50 transition-colors ${i >= 10 && i <= 16 ? 'bg-blue-100 text-blue-700' : 'text-slate-700'} ${i === 16 ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`}
                onClick={() => setActiveModal(null)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'sleepData'} onClose={() => setActiveModal(null)} title="Average Sleep Details">
        <div className="space-y-4 text-slate-600">
          <p>Eleanor's sleep quality has improved by 5% compared to last week.</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Average duration: 7.5 hours</li>
            <li>Deep sleep: 1.2 hours</li>
            <li>Interruptions: 2 per night (avg)</li>
          </ul>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'cognitiveData'} onClose={() => setActiveModal(null)} title="Cognitive Score Details">
        <div className="space-y-4 text-slate-600">
          <p>The cognitive score is slightly down (-2%) this week.</p>
          <p>This is primarily due to a lower score on Tuesday morning. We recommend monitoring hydration and ensuring adequate rest.</p>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'sleepChart'} onClose={() => setActiveModal(null)} title="Sleep Quality Trends">
        <div className="space-y-4 text-slate-600">
          <p>Detailed view of sleep quality over the week.</p>
          <p>Thursday showed the best sleep quality, correlating with increased physical activity that day.</p>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'hydrationChart'} onClose={() => setActiveModal(null)} title="Hydration Trends">
        <div className="space-y-4 text-slate-600">
          <p>Hydration levels are slightly below the target of 2.0L per day.</p>
          <p>Consider offering more water during the afternoon to reach the daily goal.</p>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'activityChart'} onClose={() => setActiveModal(null)} title="Activity Minutes Trends">
        <div className="space-y-4 text-slate-600">
          <p>Physical activity is up 12% this week!</p>
          <p>The new garden walking routine seems to be very effective.</p>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'cognitiveChart'} onClose={() => setActiveModal(null)} title="Cognitive Clarity Trends">
        <div className="space-y-4 text-slate-600">
          <p>Daily breakdown of cognitive clarity scores.</p>
          <p>Scores tend to be highest in the late morning and dip slightly in the late afternoon.</p>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'aiInsight'} onClose={() => setActiveModal(null)} title="AI Insight Details">
        <div className="space-y-4 text-slate-600">
          <p className="font-medium text-slate-900">Correlation Analysis</p>
          <p>Our AI model has detected a strong correlation between Eleanor's sleep quality and her cognitive clarity scores the following day.</p>
          <p>Additionally, increasing evening hydration by 200ml has shown a historical trend of reducing morning confusion incidents.</p>
          <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium mt-2">View Full Report</button>
        </div>
      </Modal>
    </div>
  );
}
