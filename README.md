Rehab Connect (リハビリ・コネクト)!
(DEMO版を閲覧する際は、Webブラウザの翻訳機能OFFにてご利用ください)
DEMO：URL：https://rehab-connect-new.web.app

理学療法士の知見とモダンなフロントエンド技術を融合させた、臨床現場のためのリハビリ支援・記録管理アプリケーションです。🌟 

プロジェクトの概要現役の理学療法士が直面する「記録業務の煩雑さ」と「データの視覚化不足」を解決するために開発されました。

正確なSOAP記録の作成、治療経過閲覧、評価指標（ROM/VAS）の自動判定、および経過のグラフ化をサポートします。🚀 

主な機能SOAP記録作成: 臨床推論に基づいたS(主観的)、O(客観的)、A(評価)、P(計画)の入力支援。

リハビリ評価判定:ROM（関節可動域）の目標達成度を自動判定。VAS（痛み）の経過を前回値と比較し、改善/不変/増悪を自動算出。データビジュアライゼーション: Recharts を用いた患者データの推移グラフ表示。

リアルタイム同期: Firebase Firestore によるマルチデバイスでのデータ管理。

モダンUI/UX: Tailwind CSS v4 を活用した、現場で使いやすいレスポンシブデザイン。

🛠 使用技術 (Tech Stack)Frontend: React 18 / Vite / JavaScript (ES6+)Styling: Tailwind CSS v4 / Lucide-React (Icons)Backend/DB: Firebase Auth / FirestoreCharts: RechartsTesting: Vitest / React Testing Library / jsdom

🧪 品質保証 (Quality Assurance)本プロジェクトでは、医療情報を扱う特性上、データの正確性を担保するために以下の自動テストを実装しています。

Unit Test (Vitest): ROMの目標達成判定やVASの改善度判定など、重要なロジックの正確性を検証。UI/Component 

Test: SOAPの入力内容が正しく画面に反映されるか、DOMレベルでの描画テストを実施。テストの実行方法npm test

📐 設計のこだわりロジックの分離: 計算処理を src/utils に集約し、UI（React）とビジネスロジックを分離。メンテナンス性とテストの容易性を確保しました。現場視点のUX: 忙しい臨床現場を想定し、少ないタップ数で入力が完結するインターフェースを追求。
コンポーネント設計: 可読性と再利用性を高めるため、アトミックな設計を意識。

依存関係のインストールcd rehab-connect
npm install
開発サーバー起動npm run dev

👨‍💻 開発者について
29歳 / 元理学療法士・営業 IT技術を学習中。
「人間味のある温かさ」を武器に、エンジニアを目指しています。

