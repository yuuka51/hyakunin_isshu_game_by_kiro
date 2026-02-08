/**
 * GameEngine - 百人一首ゲームのコアロジック管理
 *
 * 責務:
 * - ゲームの初期化とシャッフル
 * - 読み札の順序管理
 * - 取り札選択の正誤判定
 * - ゲーム進行の制御
 *
 * Requirements: 2.1, 2.2, 3.1, 3.3, 4.1, 4.2
 */

/**
 * Fisher-Yates シャッフルアルゴリズム
 * 配列をインプレースでランダムに並び替える
 * @param {Array} array - シャッフル対象の配列
 * @returns {Array} シャッフルされた配列（同じ参照）
 */
function fisherYatesShuffle(array) {
    const arr = array.slice(); // 元の配列を変更しないようコピー
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
}

class GameEngine {
    /**
     * @param {Poem[]} poems - 百人一首の歌データ配列
     */
    constructor(poems) {
        if (!Array.isArray(poems) || poems.length === 0) {
            throw new Error('poems must be a non-empty array');
        }
        this._allPoems = poems.slice(); // 元データのコピーを保持
        this._remainingCards = [];      // 場に残っている取り札
        this._readingOrder = [];        // 読み札の出題順序
        this._currentRound = 0;        // 現在のラウンド番号（0始まり、表示時は+1）
        this._totalRounds = 0;         // 総ラウンド数
        this._score = 0;               // 正解スコア
        this._incorrectCount = 0;      // 不正解数
        this._gameOver = false;        // ゲーム終了フラグ
    }

    /**
     * ゲーム初期化: 歌をシャッフルし場に配置する
     * - 100首からランダムに選択した歌の取り札をGame_Fieldに配置する (Req 2.1)
     * - 取り札をランダムな順序でGame_Fieldに配置する (Req 2.2)
     * - スコアを0に設定する
     */
    initGame() {
        // 読み札の出題順序をシャッフルで決定
        this._readingOrder = fisherYatesShuffle(this._allPoems);

        // 場に配置する取り札もシャッフル（表示順序のランダム化）
        this._remainingCards = fisherYatesShuffle(this._allPoems);

        this._totalRounds = this._readingOrder.length;
        this._currentRound = 0;
        this._score = 0;
        this._incorrectCount = 0;
        this._gameOver = false;

        return this.getGameState();
    }

    /**
     * 現在の読み札を取得する
     * 現在の読み札の上の句と作者名を含む有効なPoemオブジェクトを返す (Req 3.1)
     * @returns {Poem|null} 現在の読み札の歌データ、ゲーム終了時はnull
     */
    getCurrentReadingCard() {
        if (this._gameOver || this._currentRound >= this._totalRounds) {
            return null;
        }
        return this._readingOrder[this._currentRound];
    }

    /**
     * 取り札の選択を判定する
     * - 正しい取り札の場合: スコアを1加算し、取り札をGame_Fieldから除去する (Req 4.1)
     * - 誤った取り札の場合: 誤りであることをフィードバックし、スコアを変更しない (Req 4.2)
     * @param {number} cardId - 選択された取り札のID
     * @returns {{ correct: boolean, correctCard: Poem }} 判定結果
     */
    selectCard(cardId) {
        if (this._gameOver) {
            return { correct: false, correctCard: null };
        }

        const currentPoem = this.getCurrentReadingCard();
        if (!currentPoem) {
            return { correct: false, correctCard: null };
        }

        const isCorrect = cardId === currentPoem.id;

        if (isCorrect) {
            // 正解: スコア加算 + 取り札を場から除去
            this._score += 1;
            this._remainingCards = this._remainingCards.filter(
                (card) => card.id !== cardId
            );
        } else {
            // 不正解: スコア変更なし、不正解数を記録
            this._incorrectCount += 1;
        }

        return {
            correct: isCorrect,
            correctCard: currentPoem,
        };
    }

    /**
     * 次のラウンドに進む
     * 現在のラウンド終了後、次の読み札に自動的に進む (Req 3.3)
     * @returns {boolean} 次のラウンドに進めた場合true、ゲーム終了の場合false
     */
    nextRound() {
        if (this._gameOver) {
            return false;
        }

        this._currentRound += 1;

        // すべてのラウンドが終了、またはすべての取り札が除去された場合
        if (this._currentRound >= this._totalRounds || this._remainingCards.length === 0) {
            this._gameOver = true;
            return false;
        }

        return true;
    }

    /**
     * ゲーム終了判定を行う
     * @returns {boolean} ゲームが終了している場合true
     */
    isGameOver() {
        return this._gameOver;
    }

    /**
     * ゲーム状態を取得する
     * @returns {GameState} 現在のゲーム状態
     */
    getGameState() {
        return {
            remainingCards: this._remainingCards.slice(), // コピーを返す
            currentPoem: this.getCurrentReadingCard(),
            currentRound: this._currentRound + 1,        // 1始まりで表示
            totalRounds: this._totalRounds,
            score: this._score,
            incorrectCount: this._incorrectCount,
            isGameOver: this._gameOver,
        };
    }

    /**
     * スコア情報を取得する
     * @returns {{ score: number, incorrectCount: number, remaining: number, accuracy: number }}
     */
    getScoreData() {
        const totalAttempts = this._score + this._incorrectCount;
        const accuracy = totalAttempts > 0
            ? Math.round((this._score / totalAttempts) * 10000) / 100
            : 0;

        return {
            score: this._score,
            incorrectCount: this._incorrectCount,
            remaining: this._remainingCards.length,
            accuracy: accuracy,
        };
    }
}

// ブラウザ環境とNode.js環境の両方で動作するようにエクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameEngine, fisherYatesShuffle };
} else if (typeof window !== 'undefined') {
    window.GameEngine = GameEngine;
    window.fisherYatesShuffle = fisherYatesShuffle;
}
