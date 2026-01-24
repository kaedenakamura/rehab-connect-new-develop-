import { describe, it, expect } from 'vitest';
import { isGoalAchieved, checkPainProgress } from './rehabUtils';

describe('リハビリ進捗判定ロジックの検証', () => {

  describe('isGoalAchieved (ROM達成判定)', () => {
    it('現在のROM(140)が目標(135)以上の時、trueを返すこと', () => {
      expect(isGoalAchieved(140, 135)).toBe(true);
    });

    it('現在のROM(120)が目標(135)未満の時、falseを返すこと', () => {
      expect(isGoalAchieved(120, 135)).toBe(false);
    });
  });

  describe('checkPainProgress (VAS改善判定)', () => {
    it('VASが7から3に下がった場合、「改善」と表示されること', () => {
      expect(checkPainProgress(3, 7)).toBe('改善');
    });

    it('VASが5から8に上がった場合、「増悪」と表示されること', () => {
      expect(checkPainProgress(8, 5)).toBe('増悪');
    });
  });
});