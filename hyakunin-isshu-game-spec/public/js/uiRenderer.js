/**
 * UIRenderer - 百人一首ゲームの画面描画ロジック
 *
 * 責務:
 * - 取り札のグリッド表示（縦書き）
 * - 読み札（上の句・作者名）の表示
 * - 正誤フィードバックのアニメーション
 * - スコアボードのリアルタイム更新
 * - ゲーム終了画面の表示
 * - 画面遷移の制御
 *
 * Requirements: 3.1, 3.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3
 */

class UIRenderer {
    /**
     * @param {GameEngine} gameEngine - ゲームエンジンインスタンス（参照用、将来の拡張に備える）
     * @param {ScoreManager} scoreManager - スコアマネージャーインスタンス（参照用、将来の拡張に備える）
     */
    constructor(gameEngine, scoreManager) {
        this._gameEngine = gameEngine || null;
        this._scoreManager = scoreManager || null;

        // DOM要素のキャッシュ
        this._startScreen = document.getElementById('start-screen');
        this._gameScreen = document.getElementById('game-screen');
        this._gameOverScreen = document.getElementById('gameover-screen');
        this._readingAuthor = document.getElementById('reading-author');
        this._readingVerse = document.getElementById('reading-verse');
        this._scoreElement = document.getElementById('score');
        this._accuracyElement = document.getElementById('accuracy');
        this._remainingElement = document.getElementById('remaining');
        this._gameField = document.getElementById('game-field');
        this._finalScore = document.getElementById('final-score');

        /**
         * カードクリック時のコールバック関数
         * app.js から設定される
         * @type {function(number, HTMLElement)|null}
         */
        this.onCardClick = null;
    }

    // =========================================
    // 画面遷移メソッド
    // =========================================

    /**
     * スタート画面を表示する
     */
    showStartScreen() {
        this._startScreen.style.display = '';
        this._gameScreen.style.display = 'none';
        this._gameOverScreen.style.display = 'none';
    }

    /**
     * ゲーム画面を表示する
     */
    showGameScreen() {
        this._startScreen.style.display = 'none';
        this._gameScreen.style.display = '';
        this._gameOverScreen.style.display = 'none';
    }

    /**
     * ゲーム終了画面を表示する
     */
    showGameOverScreen() {
        this._startScreen.style.display = 'none';
        this._gameScreen.style.display = 'none';
        this._gameOverScreen.style.display = '';
    }

    // =========================================
    // ゲームフィールド描画
    // =========================================

    /**
     * 取り札のグリッド表示を描画する
     * 各取り札に下の句を縦書きで表示し、data-id属性でポエムIDを設定する
     *
     * Requirements: 2.1 (取り札をGame_Fieldに配置), 7.3 (縦書き表示)
     *
     * @param {Poem[]} cards - 場に配置する取り札の配列
     */
    renderGameField(cards) {
        // ゲームフィールドをクリア
        this._gameField.innerHTML = '';

        cards.forEach(function (card) {
            var cardElement = document.createElement('div');
            cardElement.className = 'grab-card';
            cardElement.setAttribute('data-id', String(card.id));

            var textSpan = document.createElement('span');
            textSpan.className = 'card-text';
            textSpan.textContent = card.lowerVerse;

            cardElement.appendChild(textSpan);

            // クリックイベントハンドラ
            cardElement.addEventListener('click', this._handleCardClick.bind(this, card.id, cardElement));

            this._gameField.appendChild(cardElement);
        }.bind(this));
    }

    /**
     * カードクリックの内部ハンドラ
     * onCardClick コールバックが設定されている場合に呼び出す
     *
     * @param {number} cardId - クリックされたカードのID
     * @param {HTMLElement} cardElement - クリックされたカードのDOM要素
     * @private
     */
    _handleCardClick(cardId, cardElement) {
        if (typeof this.onCardClick === 'function') {
            this.onCardClick(cardId, cardElement);
        }
    }

    // =========================================
    // 読み札表示
    // =========================================

    /**
     * 読み札（上の句・作者名）を表示する
     * 新しいラウンド開始時に現在の読み札の上の句を画面上部に表示する
     *
     * Requirements:
     * - 3.1: 新しいラウンド開始時に現在の読み札の上の句を画面上部に表示する
     * - 3.2: 上の句が表示された場合、作者名も合わせて表示する
     *
     * @param {Poem} poem - 表示する読み札の歌データ
     */
    renderReadingCard(poem) {
        if (!poem) {
            this._readingAuthor.textContent = '';
            this._readingVerse.textContent = '';
            return;
        }

        // 作者名を表示 (Req 3.2)
        this._readingAuthor.textContent = poem.author;

        // 上の句を表示 (Req 3.1)
        this._readingVerse.textContent = poem.upperVerse;
    }

    // =========================================
    // スコアボード更新
    // =========================================

    /**
     * スコアボードを更新する
     * ゲーム進行中、現在のスコア、正答率、残り札数を画面上に常時表示する
     *
     * Requirements:
     * - 5.1: 現在のスコア、正答率、残り札数を画面上に常時表示する
     *
     * @param {ScoreData} score - スコアデータオブジェクト
     *   @param {number} score.correct - 正解数
     *   @param {number} score.accuracy - 正答率（0〜100）
     *   @param {number} score.remaining - 残り札数
     */
    updateScoreBoard(score) {
        if (!score) {
            return;
        }

        this._scoreElement.textContent = 'スコア: ' + score.correct;
        this._accuracyElement.textContent = '正答率: ' + score.accuracy + '%';
        this._remainingElement.textContent = '残り: ' + score.remaining;
    }

    // =========================================
    // フィードバックアニメーション
    // =========================================

    /**
     * 正解フィードバック（緑ハイライト）を表示し、カードを除去する
     * 正しい取り札が選択された場合、正解の取り札を緑色でハイライトしてから除去する
     *
     * Requirements:
     * - 4.3: 正解・不正解を0.5秒以内に判定して表示する
     * - 4.4: 正しい取り札が選択された場合、正解の取り札を緑色でハイライトしてから除去する
     *
     * @param {HTMLElement} cardElement - 正解のカードDOM要素
     * @returns {Promise<void>} アニメーション完了後に解決するPromise
     */
    showCorrectFeedback(cardElement) {
        return new Promise(function (resolve) {
            // 緑色ハイライトを追加 (Req 4.4)
            cardElement.classList.add('correct');

            // 800ms後にフェードアウトして除去
            setTimeout(function () {
                this.removeCard(cardElement).then(resolve);
            }.bind(this), 800);
        }.bind(this));
    }

    /**
     * 不正解フィードバック（赤ハイライト）を表示する
     * 誤った取り札が選択された場合、誤りの取り札を赤色で一時的にハイライトする
     *
     * Requirements:
     * - 4.3: 正解・不正解を0.5秒以内に判定して表示する
     * - 4.5: 誤った取り札が選択された場合、誤りの取り札を赤色で一時的にハイライトする
     *
     * @param {HTMLElement} cardElement - 不正解のカードDOM要素
     * @returns {Promise<void>} アニメーション完了後に解決するPromise
     */
    showIncorrectFeedback(cardElement) {
        return new Promise(function (resolve) {
            // 赤色ハイライトを追加 (Req 4.5)
            cardElement.classList.add('incorrect');

            // 600ms後にハイライトを除去
            setTimeout(function () {
                cardElement.classList.remove('incorrect');
                resolve();
            }, 600);
        });
    }

    // =========================================
    // カード除去
    // =========================================

    /**
     * カードを場から除去する（アニメーション付き）
     * removingクラスを追加してフェードアウトアニメーションを実行し、
     * アニメーション完了後にDOM要素を削除する
     *
     * @param {HTMLElement} cardElement - 除去するカードのDOM要素
     * @returns {Promise<void>} アニメーション完了後に解決するPromise
     */
    removeCard(cardElement) {
        return new Promise(function (resolve) {
            // フェードアウトアニメーションを開始
            cardElement.classList.add('removing');

            // CSSトランジション完了後にDOM要素を削除（400ms = CSS transition duration）
            setTimeout(function () {
                if (cardElement.parentNode) {
                    cardElement.parentNode.removeChild(cardElement);
                }
                resolve();
            }, 400);
        });
    }

    // =========================================
    // ゲーム終了画面
    // =========================================

    /**
     * ゲーム終了画面を表示する
     * すべての取り札が除去された場合、ゲーム終了画面を表示し、
     * 最終スコアと正答率を表示する
     *
     * Requirements:
     * - 5.2: ゲーム終了画面を表示し、最終スコアと正答率を表示する
     * - 5.3: 「もう一度プレイ」ボタンを表示する
     *
     * @param {ScoreData} finalScore - 最終スコアデータ
     *   @param {number} finalScore.correct - 正解数
     *   @param {number} finalScore.accuracy - 正答率（0〜100）
     *   @param {number} [finalScore.incorrect] - 不正解数
     */
    renderGameOver(finalScore) {
        // 最終スコアと正答率を表示 (Req 5.2)
        this._finalScore.innerHTML =
            '<p><span class="score-label">最終スコア:</span> ' + finalScore.correct + '点</p>' +
            '<p><span class="score-label">正答率:</span> ' + finalScore.accuracy + '%</p>';

        // ゲーム終了画面に遷移（「もう一度プレイ」ボタンは HTML に既に存在） (Req 5.3)
        this.showGameOverScreen();
    }
}

// ブラウザ環境とNode.js環境の両方で動作するようにエクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UIRenderer };
} else if (typeof window !== 'undefined') {
    window.UIRenderer = UIRenderer;
}
