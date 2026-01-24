import React, { useState, useEffect, useMemo } from 'react';
import { db, appId } from '../firebase';
import { collection, onSnapshot, addDoc, serverTimestamp, query } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Save, TrendingUp } from 'lucide-react';

export default function PatientDetail({ patientId }) {
  const [records, setRecords] = useState([]);
  const [soap, setSoap] = useState({ s: '', o: '', a: '', p: '', rom: 120, vas: 0 });

  useEffect(() => {
    if (!patientId) return;
    // Rule 1: Correct pathing
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'records');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Rule 2: Manual filtering in memory
      const filtered = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(r => r.patientId === patientId)
        .sort((a, b) => a.date.localeCompare(b.date));
      setRecords(filtered);
    }, (err) => console.error(err));
    return () => unsubscribe();
  }, [patientId]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'records'), {
        patientId,
        date: new Date().toISOString().split('T')[0],
        ...soap,
        timestamp: serverTimestamp()
      });
      setSoap({ s: '', o: '', a: '', p: '', rom: 120, vas: 0 });
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Progress Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><TrendingUp size={18}/> ROM (可動域) の推移</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={records}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" hide />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="rom" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Activity size={18}/> VAS (痛み) の推移</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={records}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" hide />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line type="monotone" dataKey="vas" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SOAP Input Form */}
      <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl border shadow-sm space-y-6">
        <h3 className="text-xl font-bold border-b pb-4">リハビリ実施記録 (SOAP)</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">ROM (度)</label>
            <input type="number" className="w-full bg-slate-50 p-3 rounded-xl border-none mt-1" value={soap.rom} onChange={e => setSoap({...soap, rom: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">VAS (0-10)</label>
            <input type="number" className="w-full bg-slate-50 p-3 rounded-xl border-none mt-1" value={soap.vas} onChange={e => setSoap({...soap, vas: e.target.value})} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SoapBox label="S" value={soap.s} onChange={v => setSoap({...soap, s: v})} />
          <SoapBox label="O" value={soap.o} onChange={v => setSoap({...soap, o: v})} />
          <SoapBox label="A" value={soap.a} onChange={v => setSoap({...soap, a: v})} />
          <SoapBox label="P" value={soap.p} onChange={v => setSoap({...soap, p: v})} />
        </div>
        <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2">
          <Save size={20} /> 記録を保存する
        </button>
      </form>
    </div>
  );
}

function SoapBox({ label, value, onChange }) {
  return (
    <div className="space-y-1">
      <span className="text-xs font-black text-slate-400">{label} (Subjective/Objective/etc.)</span>
      <textarea className="w-full bg-slate-50 rounded-xl p-3 h-24 text-sm border-none focus:ring-2 focus:ring-blue-500" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}