// ROMの目標達成判定
export const isGoalAchieved = (current, target) => {
  if (!current || !target) return false;
  return Number(current) >= Number(target);
};

// VASの改善判定
export const checkPainProgress = (currentVas, prevVas) => {
  const curr = Number(currentVas);
  const prev = Number(prevVas);
  if (curr < prev) return '改善';
  if (curr > prev) return '増悪';
  return '不変';
};

// 日付のフォーマット
export const formatDate = (timestamp) => {
  if (!timestamp) return '日付なし';
  
  // Firestoreの Timestamp 型の場合
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    const date = timestamp.toDate();
    return date.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  }
  
  // Date型の場合
  if (timestamp instanceof Date) {
    return timestamp.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  }
  
  // 文字列の場合
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('ja-JP', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
    }
  }
  
  return '日付なし';
};

// SOAPデータの空欄判定
export const getDisplayText = (text, defaultText = '特記なし') => {
  if (!text || text.trim() === '') {
    return defaultText;
  }
  return text;
};

// SOAP履歴用：日付のフォーマット
export const formatRecordDate = (timestamp) => {
  if (!timestamp) return '日付なし';
  
  // Firestoreの Timestamp 型の場合
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    const date = timestamp.toDate();
    return date.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).replace(/\//g, '/');
  }
  
  // Date型の場合
  if (timestamp instanceof Date) {
    return timestamp.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).replace(/\//g, '/');
  }
  
  // 文字列の場合（YYYY-MM-DD形式など）
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('ja-JP', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      }).replace(/\//g, '/');
    }
  }
  
  return '日付なし';
};

// SOAP履歴用：SOAPフィールドの整形表示
export const formatSoapField = (value, label = '') => {
  if (!value || value.trim() === '') {
    return '特記なし';
  }
  return value;
};

// SOAP履歴用：記録の並び替え（新しい順）
export const sortRecordsByDate = (records, ascending = false) => {
  if (!records || records.length === 0) return [];
  
  const sorted = [...records].sort((a, b) => {
    const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date || 0);
    const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date || 0);
    return ascending ? dateA - dateB : dateB - dateA;
  });
  
  return sorted;
};
