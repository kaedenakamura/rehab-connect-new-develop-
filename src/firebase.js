import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// 本番環境では環境変数 (.env) で管理.
// ここではモックアップ用に注入された設定を使用
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
export const db = getFirestore(app);
export const auth = getAuth(app);
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'rehab-app-v2';