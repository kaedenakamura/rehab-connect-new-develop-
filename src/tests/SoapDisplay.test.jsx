/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';

// 各テストの実行後に、DOM（描画された画面）を完全にリセットする
// これにより「Found multiple elements」エラーを防止します
afterEach(() => {
  cleanup();
});

/**
 * 理学療法評価（SOAP）の表示用コンポーネント
 * 膝OA（変形性膝関節症）の臨床データを想定したテストを実施します。
 */
const SimpleSoapDisplay = ({ s, o, a, p }) => (
  <div className="p-4 border rounded-xl bg-white shadow-sm font-sans">
    <div className="mb-2 p-2 bg-orange-50 rounded border border-orange-100" data-testid="s-box">
      <span className="font-bold text-xs text-orange-600 block mb-1">S (Subjective)</span>
      <p className="text-sm text-slate-700">{s}</p>
    </div>
    <div className="mb-2 p-2 bg-blue-50 rounded border border-blue-100" data-testid="o-box">
      <span className="font-bold text-xs text-blue-600 block mb-1">O (Objective)</span>
      <p className="text-sm text-slate-700">{o}</p>
    </div>
    <div className="mb-2 p-2 bg-emerald-50 rounded border border-emerald-100" data-testid="a-box">
      <span className="font-bold text-xs text-emerald-600 block mb-1">A (Assessment)</span>
      <p className="text-sm text-slate-700">{a}</p>
    </div>
    <div className="p-2 bg-purple-50 rounded border border-purple-100" data-testid="p-box">
      <span className="font-bold text-xs text-purple-600 block mb-1">P (Plan)</span>
      <p className="text-sm text-slate-700">{p}</p>
    </div>
  </div>
);

describe('SOAP表示コンポーネントの検証', () => {
  it('右膝OAの臨床評価データが正しく画面に表示されること', () => {
    const testData = {
      s: "歩行時の右膝内側部痛、階段昇降困難",
      o: "立脚初期のラテラルスラスト、ROM屈曲120度",
      a: "支持性低下、脂肪体インピンジメントの疑い",
      p: "Q-setting、IFPモビライゼーション実施"
    };

    render(<SimpleSoapDisplay {...testData} />);

    const sBox = screen.getByTestId('s-box');
    expect(sBox).toBeDefined();
    expect(sBox.textContent).toContain('階段昇降困難');
  });

  it('データが未入力（空文字）の場合でもレイアウトが崩れないこと', () => {
    // 1つ目のテストが終わった後に cleanup() が走るので、s-box は1つだけ見つかるようになります
    render(<SimpleSoapDisplay s="" o="" a="" p="" />);

    const sBox = screen.getByTestId('s-box');
    expect(sBox).toBeDefined();
    // 項目名が表示されていることを確認
    expect(sBox.textContent).toContain('S (Subjective)');
  });
});