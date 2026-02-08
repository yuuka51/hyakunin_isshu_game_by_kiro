/**
 * app.js - 百人一首ゲーム メインアプリケーション統合
 *
 * GameEngine, ScoreManager, UIRenderer を統合し、
 * ゲーム全体のフローを制御する。
 *
 * ゲームフロー:
 * 1. プレイヤーがゲーム開始ボタンをクリック
 * 2. /api/poems から歌データを取得
 * 3. GameEngine, ScoreManager, UIRenderer を初期化
 * 4. ゲーム画面を表示し、取り札と読み札を描画
 * 5. プレイヤーが取り札をクリック → 正誤判定 → フィードバック
 * 6. 正解時: 緑ハイライト → カード除去 → 次のラウンド
 * 7. 不正解時: 赤ハイライト → 継続
 * 8. 全ラウンド終了 → ゲーム終了画面
 * 9. もう一度プレイ → 再初期化
 *
 * Requirements: 2.1, 2.3, 4.1, 5.3
 */

(function () {
    'use strict';

    // ゲームコンポーネントの参照
    var gameEngine = null;
    var scoreManager = null;
    var uiRenderer = null;

    // アニメーション中の多重クリック防止フラグ
    var isProcessing = false;

    /**
     * /api/poems から歌データを取得する
     * @returns {Promise<Poem[]>} 歌データの配列
     */
    function fetchPoems() {
        return fetch('/api/poems')
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('歌データの取得に失敗しました (HTTP ' + response.status + ')');
                }
                return response.json();
            });
    }

    /**
     * ゲームを開始する
     * 歌データを取得し、各コンポーネントを初期化してゲーム画面を表示する
     *
     * Requirements:
     * - 2.1: ゲーム開始ボタンクリックでゲームを初期化する
     * - 2.3: ゲーム初期化時にスコアを0に設定し、残り札数を表示する
     */
    function startGame() {
        fetchPoems()
            .then(function (poems) {
                // コンポーネントの初期化
                gameEngine = new GameEngine(poems);
                scoreManager = new ScoreManager(poems.length);
                uiRenderer = new UIRenderer(gameEngine, scoreManager);

                // ゲーム初期化 (Req 2.1)
                gameEngine.initGame();

                // カードクリックのコールバックを設定
                uiRenderer.onCardClick = handleCardClick;

                // ゲーム画面を表示
                uiRenderer.showGameScreen();

                // 取り札を場に配置
                var state = gameEngine.getGameState();
                uiRenderer.renderGameField(state.remainingCards);

                // 読み札を表示
                var readingCard = gameEngine.getCurrentReadingCard();
                uiRenderer.renderReadingCard(readingCard);

                // スコアボードを初期化 (Req 2.3)
                uiRenderer.updateScoreBoard(scoreManager.getScore());

                // 処理フラグをリセット
                isProcessing = false;
            })
            .catch(function (error) {
                showError('歌データの読み込みに失敗しました。ページを再読み込みしてください。');
                console.error('ゲーム開始エラー:', error);
            });
    }

    /**
     * 取り札クリック時のハンドラ
     * 正誤判定を行い、フィードバックアニメーションを表示する
     *
     * Requirements:
     * - 4.1: 正しい取り札をクリックした場合、取り札を除去しスコアを加算する
     *
     * @param {number} cardId - クリックされたカードのID
     * @param {HTMLElement} cardElement - クリックされたカードのDOM要素
     */
    function handleCardClick(cardId, cardElement) {
        // アニメーション中は操作を無視する
        if (isProcessing) {
            return;
        }

        isProcessing = true;

        // 正誤判定
        var result = gameEngine.selectCard(cardId);

        if (result.correct) {
            // 正解: ScoreManager に正解を記録 (Req 4.1)
            scoreManager.addCorrect();

            // スコアボードを更新
            uiRenderer.updateScoreBoard(scoreManager.getScore());

            // 正解フィードバック（緑ハイライト + カード除去）
            uiRenderer.showCorrectFeedback(cardElement)
                .then(function () {
                    // 次のラウンドに進む
                    advanceToNextRound();
                });
        } else {
            // 不正解: ScoreManager に不正解を記録
            scoreManager.addIncorrect();

            // スコアボードを更新
            uiRenderer.updateScoreBoard(scoreManager.getScore());

            // 不正解フィードバック（赤ハイライト）
            uiRenderer.showIncorrectFeedback(cardElement)
                .then(function () {
                    // アニメーション完了後に操作を再開
                    isProcessing = false;
                });
        }
    }

    /**
     * 次のラウンドに進む
     * ゲーム終了判定を行い、継続の場合は次の読み札を表示する
     */
    function advanceToNextRound() {
        var continues = gameEngine.nextRound();

        if (continues) {
            // ゲーム継続: 次の読み札を表示
            var readingCard = gameEngine.getCurrentReadingCard();
            uiRenderer.renderReadingCard(readingCard);
            isProcessing = false;
        } else {
            // ゲーム終了: 終了画面を表示 (Req 5.3)
            var finalScore = scoreManager.getScore();
            uiRenderer.renderGameOver(finalScore);
            isProcessing = false;
        }
    }

    /**
     * もう一度プレイする
     * ゲームを再初期化して最初から開始する
     *
     * Requirements:
     * - 5.3: ゲーム終了画面に「もう一度プレイ」ボタンを表示する
     */
    function replayGame() {
        startGame();
    }

    /**
     * エラーメッセージを表示する
     * @param {string} message - 表示するエラーメッセージ
     */
    function showError(message) {
        var startScreen = document.getElementById('start-screen');
        var gameScreen = document.getElementById('game-screen');
        var gameOverScreen = document.getElementById('gameover-screen');

        // すべての画面を非表示にしてスタート画面を表示
        if (startScreen) startScreen.style.display = '';
        if (gameScreen) gameScreen.style.display = 'none';
        if (gameOverScreen) gameOverScreen.style.display = 'none';

        // エラーメッセージを表示
        var startContent = startScreen ? startScreen.querySelector('.start-content') : null;
        if (startContent) {
            var existingError = startContent.querySelector('.error-message');
            if (existingError) {
                existingError.textContent = message;
            } else {
                var errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = message;
                startContent.appendChild(errorDiv);
            }
        }
    }

    /**
     * DOMContentLoaded 時にイベントハンドラを接続する
     */
    function init() {
        // ゲーム開始ボタン (Req 2.1)
        var startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', startGame);
        }

        // もう一度プレイボタン (Req 5.3)
        var replayBtn = document.getElementById('replay-btn');
        if (replayBtn) {
            replayBtn.addEventListener('click', replayGame);
        }
    }

    // DOM読み込み完了後に初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
