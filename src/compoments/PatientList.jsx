import React, { useState, useEffect } from 'react';
import { db, appId } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { ChevronRight, Search } from 'lucide-react';

export default function PatientList({ onSelect }) {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    return onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'patients'), (snap) => {
      setPatients(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const filtered = patients.filter(p => p.name.includes(search));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input type="text" placeholder="名前で検索..." className="w-full bg-white p-4 pl-12 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="divide-y">
          {filtered.map(p => (
            <div key={p.id} className="p-6 flex items-center justify-between hover:bg-slate-50 cursor-pointer group" onClick={() => onSelect(p.id)}>
              <div>
                <p className="font-black text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{p.name}</p>
                <p className="text-xs text-slate-400 font-bold uppercase">{p.diagnosis}</p>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:translate-x-1 transition-all" />
            </div>
          ))}
          {filtered.length === 0 && <div className="p-10 text-center text-slate-400">該当する患者はいません。</div>}
        </div>
      </div>
    </div>
  );
}