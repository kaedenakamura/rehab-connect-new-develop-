import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import {
  ChevronLeft,
  Save,
  ClipboardList,
  History,
  User,
  Activity,
  Trash2,
  BarChart3,
  FileText
} from 'lucide-react';

// Firebase 初期化 
const firebaseConfig = typeof __firebase_config !== 'undefined'
  ? JSON.parse(__firebase_config)
  : {
    apiKey: "AIzaSyCDbdD13KZ97acvznknETfDwkLhGpqRebQ",
    authDomain: "rehab-connect-new-develop.firebaseapp.com",
    projectId: "rehab-connect-new-develop",
    storageBucket: "rehab-connect-new-develop.firebasestorage.app",
    messagingSenderId: "1018902093138",
    appId: "1:1018902093138:web:bd9d3ba0b69295fa42ee8b",
  };

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'rehab-connect';

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const targetId = id || 'demo-patient';

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('soap'); 


  const [inputData, setInputData] = useState({
    s: '', o: '', a: '', p: '',
    rom: '',
    vas: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!targetId) return;

    const isPreview = typeof __app_id !== 'undefined';
    const patientRef = isPreview
      ? doc(db, 'artifacts', appId, 'public', 'data', 'patients', targetId)
      : doc(db, 'patients', targetId);

    const fetchPatient = async () => {
      try {
        const snap = await getDoc(patientRef);
        if (snap.exists()) {
          const data = snap.data();
          setPatient({ id: snap.id, ...data });
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    const recordsRef = isPreview
      ? collection(db, 'artifacts', appId, 'public', 'data', 'patients', targetId, 'records')
      : collection(db, 'patients', targetId, 'records');

    const q = query(recordsRef, orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    fetchPatient();
    return () => unsubscribe();
  }, [targetId]);

  // 入力変更処理
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!inputData.s && !inputData.o && !inputData.rom && !inputData.vas) return;
    setIsSaving(true);
    try {
      const isPreview = typeof __app_id !== 'undefined';
      const recordsRef = isPreview
        ? collection(db, 'artifacts', appId, 'public', 'data', 'patients', targetId, 'records')
        : collection(db, 'patients', targetId, 'records');

      await addDoc(recordsRef, {
        ...inputData,
        date: serverTimestamp()
      });

      const patientRef = isPreview
        ? doc(db, 'artifacts', appId, 'public', 'data', 'patients', targetId)
        : doc(db, 'patients', targetId);

      await updateDoc(patientRef, {
        lastRom: inputData.rom,
        lastVas: inputData.vas,
        lastUpdated: serverTimestamp()
      });

      setInputData({ s: '', o: '', a: '', p: '', rom: '', vas: '' });
      alert("記録を保存しました。経過履歴タブで確認できます。");
      setActiveTab('history'); 
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-slate-400">Loading...</div>;

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 pb-20">

      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="bg-[#1a1f36] rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl mb-8">
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-2xl font-black">
              {patient?.name?.charAt(0) || 'ゲ'}
            </div>
            <div>
              <h1 className="text-3xl font-black flex items-center gap-3">
                <span>{patient?.name}</span><span> 様</span>
              </h1>
              <p className="text-blue-300 font-bold mt-1 opacity-80">{patient?.diagnosis || '疾患名未設定'}</p>
            </div>
            <button
              onClick={() => { if (window.confirm("削除しますか？")) deleteDoc(doc(db, 'patients', targetId)).then(() => navigate('/patients')) }}
              className="ml-auto p-3 hover:bg-white/10 rounded-full text-white/30 hover:text-red-400 transition-all"
            >
              <Trash2 size={24} />
            </button>
          </div>
          {/* 装飾用の背景デザイン */}
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
        </div>

        {/* タブナビゲーション */}
        <div className="flex bg-slate-200/50 p-1.5 rounded-2xl w-fit mb-8 border border-slate-200">
          {[
            { id: 'graph', label: '分析グラフ', icon: BarChart3 },
            { id: 'history', label: '経過履歴', icon: History },
            { id: 'soap', label: 'SOAP入力', icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all ${activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* コンテンツエリア */}
        <div className="max-w-5xl">

          {activeTab === 'soap' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* 数値入力エリア */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">ROM (度)</label>
                  <input
                    type="number"
                    name="rom"
                    value={inputData.rom}
                    onChange={handleInputChange}
                    className="w-full text-4xl font-black text-slate-800 outline-none bg-slate-50 p-4 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all"
                    placeholder="0"
                  />
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">VAS (0-10)</label>
                  <input
                    type="number"
                    name="vas"
                    value={inputData.vas}
                    onChange={handleInputChange}
                    className="w-full text-4xl font-black text-slate-800 outline-none bg-slate-50 p-4 rounded-2xl focus:ring-4 focus:ring-red-100 transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* SOAP入力エリア */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {['s', 'o', 'a', 'p'].map((key) => (
                    <div key={key} className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                        {key === 's' ? 'S' : key === 'o' ? 'O' : key === 'a' ? 'A' : 'P'}
                      </label>
                      <textarea
                        name={key}
                        className="w-full p-5 border border-slate-100 rounded-2xl text-sm min-h-[160px] bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                        value={inputData[key]}
                        onChange={handleInputChange}
                        placeholder={`${key.toUpperCase()}の内容を入力...`}
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="mt-10 w-full bg-[#1a1f36] text-white font-black py-5 rounded-2xl hover:bg-slate-800 shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <Save size={20} />
                  <span>記録を保存して履歴を確認</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              {records.length === 0 ? (
                <div className="bg-white rounded-3xl p-20 text-center text-slate-300 font-bold border border-slate-200">
                  記録はまだありません
                </div>
              ) : (
                records.map((record) => (
                  <div key={record.id} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
                      <span className="text-sm font-black text-slate-400">📅 {record.date?.toDate?.().toLocaleString('ja-JP') || '保存中'}</span>
                      <div className="flex gap-4">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-tighter">ROM: {record.rom}度</span>
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full uppercase tracking-tighter">VAS: {record.vas}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      {['s', 'o', 'a', 'p'].map(k => (
                        <div key={k}>
                          <span className="text-[10px] font-black text-slate-300 uppercase block mb-1">{k}</span>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{record[k] || '-'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'graph' && (
            <div className="bg-white rounded-3xl p-20 text-center text-slate-300 font-bold border border-slate-200">
              グラフ機能は現在準備中です
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
