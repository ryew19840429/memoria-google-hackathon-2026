import React from 'react';
import { Activity, Heart, Moon, Footprints, AlertCircle, ChevronRight, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen flex flex-col">
      <header className="bg-white p-6 border-b border-slate-100">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Good Morning</h1>
            <p className="text-slate-500">Here's Jane's status for today</p>
          </div>
          <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <span className="size-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Live
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            icon={<Heart className="w-5 h-5 text-red-500" />} 
            label="Heart Rate" 
            value="72 bpm" 
            trend="+2%" 
            trendUp={true}
          />
          <StatCard 
            icon={<Footprints className="w-5 h-5 text-blue-500" />} 
            label="Steps" 
            value="1,240" 
            trend="On track" 
            trendUp={true}
          />
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-slate-800">Recent Activity</h2>
            <button className="text-blue-600 text-xs font-bold uppercase tracking-wider">View All</button>
          </div>
          <div className="space-y-3">
            <ActivityItem 
              icon={<Moon className="w-4 h-4" />} 
              title="Woke up" 
              time="7:30 AM" 
              color="bg-indigo-100 text-indigo-600"
            />
            <ActivityItem 
              icon={<Activity className="w-4 h-4" />} 
              title="Morning Walk" 
              time="8:15 AM" 
              color="bg-emerald-100 text-emerald-600"
            />
            <ActivityItem 
              icon={<AlertCircle className="w-4 h-4" />} 
              title="Missed Medication" 
              time="9:00 AM" 
              color="bg-red-100 text-red-600"
              isAlert={true}
            />
          </div>
        </section>

        <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-4">Health Trends</h2>
          <div className="h-32 flex items-end gap-2 px-2">
            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-blue-100 rounded-t-md transition-all hover:bg-blue-500" 
                  style={{ height: `${h}%` }}
                ></div>
                <span className="text-xs font-bold text-slate-600">M T W T F S S"[i]</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, trend, trendUp }: any) {
  return (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold text-slate-900">{value}</span>
        <span className={`text-xs font-bold ${trendUp ? 'text-emerald-700' : 'text-red-700'}`}>{trend}</span>
      </div>
    </div>
  );
}

function ActivityItem({ icon, title, time, color, isAlert }: any) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl bg-white border ${isAlert ? 'border-red-100 bg-red-50/30' : 'border-slate-100'}`}>
      <div className={`size-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-bold text-slate-900">{title}</h4>
        <p className="text-xs text-slate-500">{time}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300" />
    </div>
  );
}
