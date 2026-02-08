# 実装計画: 百人一首ゲーム

## 概要

Docker上で動作するブラウザベースの百人一首ゲームを、Node.js + Express + Vanilla JavaScriptで実装する。歌データ管理、ゲームロジック、UI描画、Docker環境を段階的に構築する。

## タスク

- [ ] 1. プロジェクト基盤の構築
  - [x] 1.1 Node.jsプロジェクトの初期化とディレクトリ構造の作成
    - `package.json` を作成し、express, jest, fast-check を依存関係に追加する
    - `public/` ディレクトリ（HTML/CSS/JS）と `src/` ディレクトリ（サーバー）を作成する
    - テスト用の `tests/unit/` と `tests/property/` ディレクトリを作成する
    - _Requirements: 6.1, 6.2_

  - [x] 1.2 百人一首の歌データファイル（poems.json）を作成する
    - 100首すべての歌データ（id, author, upperVerse, lowerVerse）をJSON配列で作成する
    - _Requirements: 1.1_

  - [x] 1.3 歌データのバリデーション関数を実装する
    - `src/poemValidator.js` に Poem オブジェクトの構造検証関数を作成する
    - id が1〜100の整数、author/upperVerse/lowerVerse が非空文字列であることを検証する
    - _Requirements: 1.2_

  - [ ]* 1.4 歌データのプロパティテストを作成する
    - **Property 1: 歌データ構造の検証**
    - **Property 2: 歌データのシリアライズ往復**
    - **Validates: Requirements 1.2, 1.3**

- [ ] 2. ゲームエンジンの実装
  - [x] 2.1 GameEngine クラスを実装する
    - `public/js/gameEngine.js` にゲームロジックを実装する
    - initGame(): 歌をシャッフルし場に配置する
    - getCurrentReadingCard(): 現在の読み札を返す
    - selectCard(cardId): 取り札の正誤判定を行う
    - nextRound(): 次のラウンドに進む
    - isGameOver(): ゲーム終了判定を行う
    - _Requirements: 2.1, 2.2, 3.1, 3.3, 4.1, 4.2_

  - [x] 2.2 ScoreManager クラスを実装する
    - `public/js/scoreManager.js` にスコア管理ロジックを実装する
    - addCorrect(), addIncorrect(), getScore(), getAccuracy(), reset() を実装する
    - _Requirements: 5.1, 5.2_

  - [ ]* 2.3 GameEngine のプロパティテストを作成する
    - **Property 3: シャッフルは有効な順列を生成する**
    - **Property 4: 読み札は有効な歌データを提供する**
    - **Property 5: ラウンド進行は次の歌に進む**
    - **Property 6: 取り札選択の正誤判定とスコア更新**
    - **Validates: Requirements 2.1, 2.2, 3.1, 3.3, 4.1, 4.2**

  - [ ]* 2.4 ScoreManager のプロパティテストを作成する
    - **Property 7: 正答率の計算整合性**
    - **Validates: Requirements 5.1**

- [x] 3. チェックポイント - コアロジックの検証
  - すべてのテストが通ることを確認し、問題があればユーザーに確認する。

- [ ] 4. UIの実装
  - [x] 4.1 HTMLとCSSの作成
    - `public/index.html` にゲーム画面のHTML構造を作成する
    - `public/css/style.css` に和風デザインテーマを実装する（落ち着いた配色、縦書き対応、レスポンシブ）
    - 取り札のグリッドレイアウト、読み札表示エリア、スコアボードを配置する
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 4.2 UIRenderer クラスを実装する
    - `public/js/uiRenderer.js` に画面描画ロジックを実装する
    - renderGameField(): 取り札のグリッド表示
    - renderReadingCard(): 読み札（上の句・作者名）の表示
    - showCorrectFeedback() / showIncorrectFeedback(): 正誤フィードバック（緑/赤ハイライト）
    - renderGameOver(): ゲーム終了画面の表示
    - updateScoreBoard(): スコアボードの更新
    - _Requirements: 3.1, 3.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3_

  - [x] 4.3 メインアプリケーションの統合
    - `public/js/app.js` で GameEngine, ScoreManager, UIRenderer を統合する
    - ゲーム開始ボタン、取り札クリック、もう一度プレイボタンのイベントハンドラを接続する
    - _Requirements: 2.1, 2.3, 4.1, 5.3_

- [ ] 5. サーバーとDocker環境の構築
  - [x] 5.1 Express サーバーを実装する
    - `src/server.js` に静的ファイル配信と歌データAPIを実装する
    - ポート8080でリクエストを受け付ける
    - _Requirements: 6.1, 6.3_

  - [x] 5.2 Dockerfile と docker-compose.yml を作成する
    - Node.js ベースの Dockerfile を作成する
    - docker-compose.yml でポート8080のマッピングを設定する
    - `docker compose up` のみで起動可能にする
    - _Requirements: 6.2_

- [x] 6. 最終チェックポイント - 全体の検証
  - すべてのテストが通ることを確認し、問題があればユーザーに確認する。

## 備考

- `*` マーク付きのタスクはオプションであり、コア機能を優先する場合はスキップ可能
- 各タスクは対応する要件番号を参照し、トレーサビリティを確保している
- チェックポイントで段階的に検証を行う
- プロパティテストは設計書の正当性プロパティに基づいて実装する
- ユニットテストは具体的な例とエッジケースを検証する
