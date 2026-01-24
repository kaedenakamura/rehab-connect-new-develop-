

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