import React, { useState, useEffect } from 'react';
import { db, appId } from '../firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { Trash2, Plus } from 'lucide-react';

const TIMES = [];
for(let h=9; h<18; h++) {
  for(let m=0; m<60; m+=20) {
    TIMES.push(`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`);
  }
}

export default function Schedule({ selectedPatientId, setSelectedPatientId }) {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [duration, setDuration] = useState(20);

  useEffect(() => {
    const unsubP = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'patients'), (s) => 
      setPatients(s.docs.map(d => ({id: d.id, ...d.data()})))
    );
    const unsubA = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'appointments'), (s) => 
      setAppointments(s.docs.map(d => ({id: d.id, ...d.data()})))
    );
    return () => { unsubP(); unsubA(); };
  }, []);

  const addApp = async (time) => {
    if(!selectedPatientId) return alert("患者を選択してください");
    const p = patients.find(pt => pt.id === selectedPatientId);
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'appointments'), {
      patientId: p.id, patientName: p.name, time, duration, date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="w-full lg:w-64 space-y-4">
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <label className="text-xs font-bold text-slate-400 uppercase block mb-2">患者選択</label>
          <select className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold" value={selectedPatientId || ""} onChange={e => setSelectedPatientId(e.target.value)}>
            <option value="">選択してください</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button onClick={() => setDuration(20)} className={`p-2 rounded-lg text-xs font-bold border ${duration === 20 ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'}`}>20分</button>
            <button onClick={() => setDuration(40)} className={`p-2 rounded-lg text-xs font-bold border ${duration === 40 ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'}`}>40分</button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="divide-y">
          {TIMES.map(t => {
            const app = appointments.find(a => a.time === t);
            return (
              <div key={t} className={`p-4 flex items-center group ${app ? 'bg-blue-50/30' : 'hover:bg-slate-50 cursor-pointer'}`} onClick={() => !app && addApp(t)}>
                <div className="w-16 font-black text-slate-300 text-sm group-hover:text-blue-500">{t}</div>
                <div className="flex-1 px-4">
                  {app ? (
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">{app.patientName} ({app.duration}分)</span>
                      <button onClick={(e) => { e.stopPropagation(); deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'appointments', app.id)); }} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                    </div>
                  ) : (
                    <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest group-hover:text-blue-300">Available</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}