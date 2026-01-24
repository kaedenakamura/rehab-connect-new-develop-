import React, { useState, useEffect } from 'react';
import { db, appId } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Calendar, Users, Clock, ChevronRight } from 'lucide-react';

export default function Dashboard({ setView, setSelectedPatientId }) {
  const [stats, setStats] = useState({ appointments: [], patients: [] });

  useEffect(() => {
    const unsubA = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'appointments'), (snap) => {
      setStats(prev => ({ ...prev, appointments: snap.docs.map(d => d.data()) }));
    });
    const unsubP = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'patients'), (snap) => {
      setStats(prev => ({ ...prev, patients: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
    });
    return () => { unsubA(); unsubP(); };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="本日の予約" value={stats.appointments.length} icon={<Calendar className="text-blue-500" />} />
        <StatCard title="登録患者数" value={stats.patients.length} icon={<Users className="text-emerald-500" />} />
        <StatCard title="平均改善率" value="12%" icon={<Clock className="text-amber-500" />} />
      </div>

      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-slate-50/50">
          <h3 className="font-bold text-slate-800">本日のスケジュール</h3>
        </div>
        <div className="divide-y">
          {stats.appointments.sort((a,b) => a.time.localeCompare(b.time)).map((app, i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer" 
                 onClick={() => { setSelectedPatientId(app.patientId); setView('detail'); }}>
              <div className="flex items-center gap-6">
                <span className="font-black text-blue-600 w-16">{app.time}</span>
                <span className="font-bold">{app.patientName} 様</span>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </div>
          ))}
          {stats.appointments.length === 0 && <div className="p-10 text-center text-slate-400">本日の予約はありません。</div>}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white p-6 rounded-3xl border shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        <p className="text-3xl font-black text-slate-800 mt-1">{value}</p>
      </div>
      <div className="p-4 bg-slate-50 rounded-2xl">{icon}</div>
    </div>
  );
}