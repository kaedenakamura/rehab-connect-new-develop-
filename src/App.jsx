import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, doc, addDoc, onSnapshot,
  serverTimestamp, deleteDoc, query, orderBy
} from 'firebase/firestore';
import {
  getAuth, onAuthStateChanged, signInAnonymously
} from 'firebase/auth';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import {
  Activity, LayoutDashboard, Calendar, Users,
  Clipboard, Plus, ChevronRight, Clock, Trash2,
  Save, TrendingUp, Search, FileText
} from 'lucide-react';
import { formatDate, getDisplayText } from './utils/rehabUtils';

// ==========================================
// 1. Firebase設定
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCyt_I1EsiuvgPIYLqqGZzfuGyZvUEvoDw",
  authDomain: "rehab-connect-new.firebaseapp.com",
  projectId: "rehab-connect-new",
  storageBucket: "rehab-connect-new.firebasestorage.app",
  messagingSenderId: "844165899665",
  appId: "1:844165899665:web:99a39c31f4510b42a2a630",
  measurementId: "G-QEYEFCZGXV"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==========================================
// 2. コンポーネント定義
// ==========================================

const StatCard = ({ title, value, unit, icon }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      <p className="text-3xl font-black text-slate-800 mt-1">{value} <span className="text-sm font-normal text-slate-500">{unit}</span></p>
    </div>
    <div className="p-4 bg-slate-50 rounded-2xl">{icon}</div>
  </div>
);

const Dashboard = ({ appointments, patients, setView, setSelectedPatientId }) => {
  const today = new Date().toISOString().split('T')[0];
  const todayApps = appointments
    .filter(a => a.date === today)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="本日の予約" value={todayApps.length} unit="件" icon={<Calendar className="text-blue-500" />} />
        <StatCard title="担当患者数" value={patients.length} unit="名" icon={<Users className="text-emerald-500" />} />
        <StatCard title="リハ進捗率" value="12" unit="%" icon={<TrendingUp className="text-amber-500" />} />
      </div>
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><Clock size={18} className="text-blue-500" /> 本日のスケジュール</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {todayApps.map(app => (
            <div key={app.id} className="p-5 flex items-center justify-between hover:bg-slate-50 cursor-pointer group" onClick={() => { setSelectedPatientId(app.patientId); setView('detail'); }}>
              <div className="flex items-center gap-6">
                <span className="font-black text-blue-600 w-16">{app.time}</span>
                <div>
                  <p className="font-bold text-slate-800">{app.patientName} 様</p>
                  <p className="text-xs text-slate-400">20分枠 / 運動器リハ</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-all" />
            </div>
          ))}
          {todayApps.length === 0 && <div className="p-16 text-center text-slate-400 font-bold">本日の予約はありません。</div>}
        </div>
      </div>
    </div>
  );
};

const Schedule = ({ appointments, patients, selectedPatientId, setSelectedPatientId }) => {
  const [duration, setDuration] = useState(20);
  const today = new Date().toISOString().split('T')[0];
  const timeSlots = [];
  for (let h = 9; h < 18; h++) {
    for (let m = 0; m < 60; m += 20) {
      timeSlots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  }

  const handleAdd = async (time) => {
    if (!selectedPatientId) return alert("患者を選択してください");
    const p = patients.find(pt => pt.id === selectedPatientId);
    await addDoc(collection(db, 'appointments'), {
      patientId: p.id, patientName: p.name, time, duration, date: today
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="w-full lg:w-72 space-y-4">
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <label className="text-[10px] font-black text-slate-400 mb-2 block tracking-widest uppercase">1. 患者選択</label>
          <select className="w-full bg-slate-50 p-3 rounded-xl text-sm font-bold border-none" value={selectedPatientId || ""} onChange={(e) => setSelectedPatientId(e.target.value)}>
            <option value="">患者を選択してください...</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button onClick={() => setDuration(20)} className={`py-3 rounded-xl text-xs font-bold border transition-all ${duration === 20 ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border-slate-100'}`}>20分</button>
            <button onClick={() => setDuration(40)} className={`py-3 rounded-xl text-xs font-bold border transition-all ${duration === 40 ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border-slate-100'}`}>40分</button>
          </div>
        </div>
      </div>
      <div className="flex-1 bg-white rounded-3xl border shadow-sm overflow-hidden h-full max-h-[70vh] overflow-y-auto">
        <div className="divide-y divide-slate-100">
          {timeSlots.map(time => {
            const app = appointments.find(a => a.time === time && a.date === today);
            return (
              <div key={time} className={`p-4 flex items-center group ${app ? 'bg-blue-50/50' : 'hover:bg-slate-50 cursor-pointer'}`} onClick={() => !app && handleAdd(time)}>
                <div className="w-16 font-black text-slate-300 text-sm">{time}</div>
                <div className="flex-1 px-4">
                  {app ? (
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-slate-800">{app.patientName} 様 <span className="text-[10px] text-blue-500 ml-2">{app.duration}分</span></p>
                      <button onClick={(e) => { e.stopPropagation(); deleteDoc(doc(db, 'appointments', app.id)); }} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-200 font-bold uppercase tracking-widest group-hover:text-blue-300">+ Reserve</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const PatientList = ({ patients, onSelect }) => {
  const [search, setSearch] = useState("");
  const filtered = patients.filter(p => p.name.includes(search));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input type="text" placeholder="名前で検索..." className="w-full bg-white p-4 pl-12 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filtered.map(p => (
            <div key={p.id} className="p-6 flex items-center justify-between hover:bg-slate-50 cursor-pointer group" onClick={() => onSelect(p.id)}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500">{p.name[0]}</div>
                <div>
                  <p className="font-bold text-slate-800">{p.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{p.diagnosis || "診断未設定"}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-all" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PatientDetail = ({ patient, records }) => {
  const [activeTab, setActiveTab] = useState('chart');
  const [soap, setSoap] = useState({ s: '', o: '', a: '', p: '', rom: 120, vas: 0 });

  const chartData = useMemo(() =>
    [...records].sort((a, b) => a.date.localeCompare(b.date)).map(r => ({
      date: r.date.slice(5),
      rom: parseInt(r.rom),
      vas: parseInt(r.vas)
    })), [records]
  );

  const handleSave = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'records'), {
      patientId: patient.id, date: new Date().toISOString().split('T')[0], ...soap, timestamp: serverTimestamp()
    });
    setSoap({ s: '', o: '', a: '', p: '', rom: 120, vas: 0 });
    setActiveTab('chart');
  };

  if (!patient) return null;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-8">
          <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center text-3xl font-black">{patient.name[0]}</div>
          <div>
            <h3 className="text-3xl font-black">{patient.name} 様</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{patient.diagnosis || "診断未設定"}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={() => setActiveTab('chart')} className={`px-8 py-3 rounded-2xl text-xs font-black transition-all ${activeTab === 'chart' ? 'bg-slate-800 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}>分析グラフ</button>
        <button onClick={() => setActiveTab('soap')} className={`px-8 py-3 rounded-2xl text-xs font-black transition-all ${activeTab === 'soap' ? 'bg-slate-800 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}>SOAP入力</button>
      </div>

      {activeTab === 'chart' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2rem] border shadow-sm h-80">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">ROM（可動域）推移</h4>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="rom" stroke="#2563eb" strokeWidth={4} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border shadow-sm h-80">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">VAS（痛み）推移</h4>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line type="monotone" dataKey="vas" stroke="#f43f5e" strokeWidth={4} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'soap' && (
        <form onSubmit={handleSave} className="bg-white p-10 rounded-[2.5rem] border shadow-sm space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">ROM 測定値</label>
              <input type="number" className="w-full bg-slate-50 border-none rounded-2xl p-5 text-2xl font-black text-blue-600 focus:ring-2 focus:ring-blue-500" value={soap.rom} onChange={e => setSoap({ ...soap, rom: e.target.value })} />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">VAS (0-10)</label>
              <input type="number" min="0" max="10" className="w-full bg-slate-50 border-none rounded-2xl p-5 text-2xl font-black text-rose-500 focus:ring-2 focus:ring-rose-500" value={soap.vas} onChange={e => setSoap({ ...soap, vas: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SoapBox label="S" value={soap.s} onChange={v => setSoap({ ...soap, s: v })} color="bg-orange-50/50" />
            <SoapBox label="O" value={soap.o} onChange={v => setSoap({ ...soap, o: v })} color="bg-blue-50/50" />
            <SoapBox label="A" value={soap.a} onChange={v => setSoap({ ...soap, a: v })} color="bg-emerald-50/50" />
            <SoapBox label="P" value={soap.p} onChange={v => setSoap({ ...soap, p: v })} color="bg-purple-50/50" />
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl">
            <Save size={20} /> リハビリ記録を保存
          </button>
        </form>
      )}
    </div>
  );
};

const SoapBox = ({ label, value, onChange, color }) => (
  <div className={`p-6 rounded-3xl border border-transparent ${color}`}>
    <span className="w-8 h-8 rounded-xl bg-white flex items-center justify-center font-black text-xs text-slate-600 shadow-sm mb-3">{label}</span>
    <textarea className="w-full bg-transparent border-none p-0 h-24 text-sm font-medium focus:ring-0 placeholder-slate-300" placeholder="内容を入力..." value={value} onChange={e => onChange(e.target.value)} />
  </div>
);

// ==========================================
// 3. メインApp
// ==========================================

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) { console.error("Auth Error:", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubP = onSnapshot(collection(db, 'patients'), (s) =>
      setPatients(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    const unsubA = onSnapshot(collection(db, 'appointments'), (s) =>
      setAppointments(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    const unsubR = onSnapshot(collection(db, 'records'), (s) =>
      setRecords(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return () => { unsubP(); unsubA(); unsubR(); };
  }, [user]);

  const handleAddPatient = async () => {
    const name = prompt("患者氏名を入力してください");
    const diag = prompt("主な診断名を入力してください (例: 右膝OA)");
    if (!name) return;
    await addDoc(collection(db, 'patients'), {
      name, diagnosis: diag || "運動器疾患", createdAt: serverTimestamp()
    });
  };

  if (!user) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl shrink-0 z-10">
        <div className="p-10 border-b border-slate-800 text-center">
          <h1 className="text-xl font-black text-blue-400 flex items-center justify-center gap-2 tracking-tighter">
            <Activity /> REHAB CONNECT
          </h1>
        </div>
        <nav className="flex-1 p-6 space-y-3">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${view === 'dashboard' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-800'}`}>
            <LayoutDashboard size={18} /> <span className="text-sm font-bold">ダッシュボード</span>
          </button>
          <button onClick={() => setView('schedule')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${view === 'schedule' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Calendar size={18} /> <span className="text-sm font-bold">予約スケジュール</span>
          </button>
          <button onClick={() => setView('patients')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${view === 'patients' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Users size={18} /> <span className="text-sm font-bold">担当患者管理</span>
          </button>
          <button onClick={() => selectedPatientId ? setView('detail') : alert("患者を選択してください")} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${view === 'detail' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Clipboard size={18} /> <span className="text-sm font-bold">進捗・リハカルテ</span>
          </button>
        </nav>
        <div className="p-8 bg-slate-950/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-xl shadow-lg border-2 border-blue-400">PT</div>
            <div>
              <p className="text-sm font-bold text-white tracking-tight">リハ 太郎 様</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Physical Therapist</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b flex items-center justify-between px-12 shadow-sm z-0">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">{view === 'detail' ? 'リハビリ進捗分析' : view}</h2>
          <button onClick={handleAddPatient} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 transition-all shadow-lg active:scale-95">
            <Plus size={16} /> 新規患者追加
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50 no-scrollbar">
          {view === 'dashboard' && <Dashboard appointments={appointments} patients={patients} setView={setView} setSelectedPatientId={setSelectedPatientId} />}
          {view === 'schedule' && <Schedule appointments={appointments} patients={patients} selectedPatientId={selectedPatientId} setSelectedPatientId={setSelectedPatientId} />}
          {view === 'patients' && <PatientList patients={patients} onSelect={(id) => { setSelectedPatientId(id); setView('detail'); }} />}
          {view === 'detail' && <PatientDetail patient={patients.find(p => p.id === selectedPatientId)} records={records.filter(r => r.patientId === selectedPatientId)} />}
        </div>
      </main>
    </div>
  );
}