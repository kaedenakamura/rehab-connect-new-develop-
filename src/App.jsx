import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore, collection, addDoc, onSnapshot,
  serverTimestamp, doc, deleteDoc, updateDoc, query, orderBy
} from 'firebase/firestore';
import {
  getAuth, onAuthStateChanged, signInAnonymously
} from 'firebase/auth';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Activity, LayoutDashboard, Calendar, Users,
  Clipboard, Plus, ChevronRight, Clock, Trash2,
  Save, TrendingUp, Search, History, ClipboardList, FileText
} from 'lucide-react';

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

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'rehab-app-v2';

const getCollection = (name) => collection(db, 'artifacts', appId, 'public', 'data', name);

// ==========================================
// 2. 共通パーツ
// ==========================================
const Badge = ({ label, color }) => (
  <span className={`${color} text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-sm uppercase whitespace-nowrap`}>
    <span>{label}</span>
  </span>
);

const StatCard = ({ title, value, unit, icon }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest"><span>{title}</span></p>
      <p className="text-3xl font-black text-slate-800 mt-1"><span>{value}</span> <span className="text-sm font-normal text-slate-500"><span>{unit}</span></span></p>
    </div>
    <div className="p-4 bg-slate-50 rounded-2xl">{icon}</div>
  </div>
);

// ==========================================
// 3. 各画面コンポーネント
// ==========================================

/** ダッシュボード画面 */
const DashboardView = ({ appointments, patients, setView, setSelectedPatientId }) => {
  const today = new Date().toISOString().split('T')[0];
  const todayApps = appointments
    .filter(a => a.date === today)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="本日の予約" value={todayApps.length} unit="件" icon={<Calendar className="text-blue-500" />} />
        <StatCard title="登録患者数" value={patients.length} unit="名" icon={<Users className="text-emerald-500" />} />
        <StatCard title="平均改善率" value="12" unit="%" icon={<TrendingUp className="text-amber-500" />} />
      </div>
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><Clock size={18} className="text-blue-500" /> <span>本日のスケジュール</span></h3>
        </div>
        <div className="divide-y divide-slate-100">
          {todayApps.map(app => (
            <div key={app.id} className="p-5 flex items-center justify-between hover:bg-slate-50 cursor-pointer group" onClick={() => { setSelectedPatientId(app.patientId); setView('detail'); }}>
              <div className="flex items-center gap-6">
                <span className="font-black text-blue-600 w-16"><span>{app.time}</span></span>
                <div>
                  <p className="font-bold text-slate-800"><span>{app.patientName}</span><span> 様</span></p>
                  <p className="text-xs text-slate-400"><span>20分枠 / 運動器リハ</span></p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-all" />
            </div>
          ))}
          {todayApps.length === 0 && <div className="p-16 text-center text-slate-400 font-bold"><span>本日の予約はありません。</span></div>}
        </div>
      </div>
    </div>
  );
};

/** 予約スケジュール画面 */
const ScheduleView = ({ appointments, patients, selectedPatientId, setSelectedPatientId }) => {
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
    await addDoc(getCollection('appointments'), {
      patientId: p.id, patientName: p.name, time, duration, date: today
    });
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'appointments', id));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in">
      <div className="w-full lg:w-72 space-y-4">
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <label className="text-[10px] font-black text-slate-400 mb-2 block tracking-widest uppercase"><span>1. 患者選択</span></label>
          <select className="w-full bg-slate-50 p-3 rounded-xl text-sm font-bold border-none" value={selectedPatientId || ""} onChange={(e) => setSelectedPatientId(e.target.value)}>
            <option value="">患者を選択してください...</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button onClick={() => setDuration(20)} className={`py-3 rounded-xl text-xs font-bold border transition-all ${duration === 20 ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-400 border-slate-100'}`}>20分</button>
            <button onClick={() => setDuration(40)} className={`py-3 rounded-xl text-xs font-bold border transition-all ${duration === 40 ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-400 border-slate-100'}`}>40分</button>
          </div>
        </div>
      </div>
      <div className="flex-1 bg-white rounded-3xl border shadow-sm overflow-hidden h-[70vh] overflow-y-auto">
        <div className="divide-y divide-slate-100">
          {timeSlots.map(time => {
            const app = appointments.find(a => a.time === time && a.date === today);
            return (
              <div key={time} className={`p-4 flex items-center group ${app ? 'bg-blue-50/50' : 'hover:bg-slate-50 cursor-pointer'}`} onClick={() => !app && handleAdd(time)}>
                <div className="w-16 font-black text-slate-300 text-sm group-hover:text-blue-500"><span>{time}</span></div>
                <div className="flex-1 px-4">
                  {app ? (
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-slate-800"><span>{app.patientName}</span><span> 様 </span><span className="text-[10px] text-blue-500 ml-2"><span>{app.duration}</span>分</span></p>
                      <button onClick={(e) => handleDelete(e, app.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-200 font-bold uppercase tracking-widest group-hover:text-blue-300"><span>+ Reserve</span></span>
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

/** 患者一覧画面 */
const PatientListView = ({ patients, onSelect }) => {
  const [search, setSearch] = useState("");
  const filtered = patients.filter(p => p.name.includes(search));

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input type="text" placeholder="名前で検索..." className="w-full bg-white p-4 pl-12 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filtered.map(p => (
            <div key={p.id} className="p-6 flex items-center justify-between hover:bg-slate-50 cursor-pointer group" onClick={() => onSelect(p.id)}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"><span>{p.name[0]}</span></div>
                <div>
                  <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors"><span>{p.name}</span><span> 様</span></p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter"><span>{p.diagnosis || "診断未設定"}</span></p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-all" />
            </div>
          ))}
          {filtered.length === 0 && <div className="p-16 text-center text-slate-400"><span>該当する患者様は見つかりませんでした。</span></div>}
        </div>
      </div>
    </div>
  );
};

/** 患者詳細・カルテ画面  */
const PatientDetailView = ({ patientId, patient, onDeleted }) => {
  const [records, setRecords] = useState([]);
  const [soap, setSoap] = useState({ s: '', o: '', a: '', p: '', rom: '', vas: '' });
  const [activeTab, setActiveTab] = useState('soap');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    const q = query(getCollection('records'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const allData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const filtered = allData.filter(r => r.patientId === patientId);
      setRecords(filtered);
    });
    return () => unsub();
  }, [patientId]);

  const handleDeletePatient = async () => {
    if (!window.confirm("この患者データを完全に削除しますか？")) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'patients', patientId));
      alert("削除しました");
      onDeleted();
    } catch (err) { console.error(err); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!soap.rom && !soap.vas && !soap.s) return;
    setIsSaving(true);
    try {
      await addDoc(getCollection('records'), {
        patientId,
        date: new Date().toISOString().split('T')[0],
        ...soap,
        timestamp: serverTimestamp()
      });
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'patients', patientId), {
        lastRom: soap.rom,
        lastVas: soap.vas,
        updatedAt: serverTimestamp()
      });
      setSoap({ s: '', o: '', a: '', p: '', rom: '', vas: '' });
      alert("保存しました");
      setActiveTab('history');
    } catch (e) { console.error(e); } finally { setIsSaving(false); }
  };

  if (!patient) return <div className="p-20 text-center font-bold text-slate-400"><span>患者データを選択してください。</span></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex justify-between items-center shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center text-3xl font-black shadow-inner"><span>{patient.name[0]}</span></div>
          <div>
            <h3 className="text-3xl font-black tracking-tight"><span>{patient.name}</span><span> 様</span></h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-70"><span>{patient.diagnosis || "診断未設定"}</span></p>
          </div>
        </div>
        <button onClick={handleDeletePatient} className="relative z-10 p-4 hover:bg-white/10 rounded-full text-slate-500 hover:text-red-400 transition-all">
          <Trash2 size={24} />
        </button>
      </div>

      <div className="flex p-1.5 bg-slate-200/50 rounded-2xl w-fit backdrop-blur-sm">
        {[
          { id: 'chart', label: '分析グラフ', icon: <TrendingUp size={16} /> },
          { id: 'history', label: '経過履歴', icon: <History size={16} /> },
          { id: 'soap', label: 'SOAP入力', icon: <Save size={16} /> },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-md transform scale-105' : 'text-slate-500 hover:text-slate-800'}`}>
            {tab.icon} <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'chart' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in">
          <div className="bg-white p-8 rounded-[2rem] border shadow-sm h-80">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4"><span>ROM (可動域) 推移</span></h4>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[...records].reverse()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" hide />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="rom" stroke="#2563eb" strokeWidth={4} dot={{ r: 6, fill: "#2563eb", strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border shadow-sm h-80">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4"><span>VAS (痛み) 推移</span></h4>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[...records].reverse()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" hide />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line type="monotone" dataKey="vas" stroke="#f43f5e" strokeWidth={4} dot={{ r: 6, fill: "#f43f5e", strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6 animate-in fade-in">
          {records.length === 0 ? (
            <div className="bg-white p-24 rounded-[2rem] border-2 border-dashed text-center text-slate-400"><span>記録がありません。「SOAP入力」から追加してください。</span></div>
          ) : (
            records.map((record) => (
              <div key={record.id} className="bg-white rounded-[2rem] border shadow-sm overflow-hidden hover:shadow-xl transition-all">
                <div className="bg-slate-50 px-8 py-5 border-b flex justify-between items-center">
                  <span className="font-black text-slate-700 flex items-center gap-2"><Calendar size={16} className="text-blue-500" /><span>{record.date}</span></span>
                  <div className="flex gap-2">
                    <Badge label={`ROM: ${record.rom}°`} color="bg-blue-600" />
                    <Badge label={`VAS: ${record.vas}`} color="bg-rose-500" />
                  </div>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {['s', 'o', 'a', 'p'].map(k => (
                    <div key={k} className="p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase mb-1"><span>{k}</span></h5>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed"><span>{record[k] || "---"}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'soap' && (
        <form onSubmit={handleSave} className="bg-white p-10 rounded-[2.5rem] border shadow-sm space-y-8 animate-in fade-in">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"><span>ROM (度)</span></label>
              <input
                type="number"
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xl font-black text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                value={soap.rom}
                onChange={e => setSoap({ ...soap, rom: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"><span>VAS (0-10)</span></label>
              <input
                type="number"
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xl font-black text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                value={soap.vas}
                onChange={e => setSoap({ ...soap, vas: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['s', 'o', 'a', 'p'].map(k => (
              <div key={k} className="space-y-1">
                <label className="text-xs font-black text-slate-800 uppercase ml-1"><span>{k}</span></label>
                <textarea
                  className="w-full border-none rounded-2xl p-4 h-32 text-sm font-medium transition-all shadow-inner bg-slate-50 focus:ring-2 focus:ring-blue-400"
                  value={soap[k]}
                  onChange={e => setSoap({ ...soap, [k]: e.target.value })}
                  placeholder={`${k.toUpperCase()}の内容を入力...`}
                />
              </div>
            ))}
          </div>
          <button type="submit" disabled={isSaving} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50">
            <Save size={20} /> <span>{isSaving ? '保存中...' : '記録を保存して履歴を確認'}</span>
          </button>
        </form>
      )}
    </div>
  );
};

// ==========================================
// 4. メインApp
// ==========================================
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const initAuth = async () => {
      try { await signInAnonymously(auth); } catch (err) { console.error("Auth Error:", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubP = onSnapshot(getCollection('patients'), (s) => setPatients(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubA = onSnapshot(getCollection('appointments'), (s) => setAppointments(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unsubP(); unsubA(); };
  }, [user]);

  const handleAddPatient = async () => {
    const name = prompt("患者氏名を入力してください");
    if (!name) return;
    const diag = prompt("診断名を入力してください");
    await addDoc(getCollection('patients'), { name, diagnosis: diag || "未設定", createdAt: serverTimestamp() });
  };

  if (!user) return <div className="h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl shrink-0 z-10">
        <div className="p-10 border-b border-slate-800 text-center">
          <h1 className="text-xl font-black text-blue-400 flex items-center justify-center gap-2 tracking-tighter uppercase">
            <Activity /> <span>Rehab Connect</span>
          </h1>
        </div>
        <nav className="flex-1 p-6 space-y-3">
          {[
            { id: 'dashboard', label: 'ダッシュボード', icon: <LayoutDashboard size={18} /> },
            { id: 'schedule', label: '予約スケジュール', icon: <Calendar size={18} /> },
            { id: 'patients', label: '担当患者管理', icon: <Users size={18} /> },
            { id: 'detail', label: '進捗・リハカルテ', icon: <Clipboard size={18} />, needsPatient: true },
          ].map(item => (
            <button key={item.id} onClick={() => item.needsPatient && !selectedPatientId ? alert("患者を選択してください") : setView(item.id)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${view === item.id ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-800'}`}>
              {item.icon} <span className="text-sm font-bold">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-8 bg-slate-950/50 mt-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-xl shadow-lg border-2 border-blue-400">PT</div>
            <div>
              <p className="text-sm font-bold text-white tracking-tight"><span>リハ 太郎</span><span> 様</span></p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Physical Therapist</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b flex items-center justify-between px-12 shadow-sm z-0">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
            <span>
              {view === 'dashboard' && 'ダッシュボード'}
              {view === 'schedule' && '予約スケジュール'}
              {view === 'patients' && '担当患者管理'}
              {view === 'detail' && 'リハビリ進捗分析'}
            </span>
          </h2>
          <button onClick={handleAddPatient} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 transition-all shadow-lg active:scale-95">
            <Plus size={16} /> <span>新規患者追加</span>
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50 no-scrollbar">
          {view === 'dashboard' && <DashboardView appointments={appointments} patients={patients} setView={setView} setSelectedPatientId={setSelectedPatientId} />}
          {view === 'schedule' && <ScheduleView appointments={appointments} patients={patients} selectedPatientId={selectedPatientId} setSelectedPatientId={setSelectedPatientId} />}
          {view === 'patients' && <PatientListView patients={patients} onSelect={(id) => { setSelectedPatientId(id); setView('detail'); }} />}
          {view === 'detail' && selectedPatient && <PatientDetailView patientId={selectedPatientId} patient={selectedPatient} onDeleted={() => { setSelectedPatientId(null); setView('patients'); }} />}
        </div>
      </main>
    </div>
  );
}