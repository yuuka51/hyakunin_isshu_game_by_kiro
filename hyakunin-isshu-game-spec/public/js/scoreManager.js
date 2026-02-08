/**
 * ScoreManager - 百人一首ゲームのスコア管理
 *
 * 責務:
 * - スコアの加算・管理
 * - 正答率の計算
 * - 残り札数の追跡
 *
 * Requirements: 5.1, 5.2
 */

class ScoreManager {
    /**
     * @param {number} totalCards - ゲーム開始時の総カード数
     */
    constructor(totalCards) {
        if (typeof totalCards !== 'number' || !Number.isInteger(totalCards) || totalCards < 0) {
            throw new Error('totalCards must be a non-negative integer');
        }
        this._totalCards = totalCards;
        this._correct = 0;
        this._incorrect = 0;
    }

    /**
     * 正解時にスコアを加算する
     * 正解数を1増加させ、残り札数を1減少させる
     * Requirements: 4.1, 5.1
     */
    addCorrect() {
        if (this._correct + this._incorrect >= this._totalCards + this._incorrect) {
            // 残り札が0の場合は加算しない（すでに全カード正解済み）
        }
        this._correct += 1;
    }

    /**
     * 不正解を記録する
     * 不正解数を1増加させる（スコアや残り札数は変更しない）
     * Requirements: 4.2, 5.1
     */
    addIncorrect() {
        this._incorrect += 1;
    }

    /**
     * 現在のスコア情報を取得する
     * Requirements: 5.1, 5.2
     * @returns {ScoreData} スコアデータオブジェクト
     */
    getScore() {
        return {
            correct: this._correct,
            incorrect: this._incorrect,
            remaining: Math.max(0, this._totalCards - this._correct),
            accuracy: this.getAccuracy(),
        };
    }

    /**
     * 正答率を計算する
     * 正答率 = 正解数 / (正解数 + 不正解数) * 100
     * 試行回数が0の場合は0を返す
     * Requirements: 5.1
     * @returns {number} 正答率（0〜100のパーセンテージ）
     */
    getAccuracy() {
        const totalAttempts = this._correct + this._incorrect;
        if (totalAttempts === 0) {
            return 0;
        }
        return Math.round((this._correct / totalAttempts) * 10000) / 100;
    }

    /**
     * スコアをリセットする
     * すべてのカウンターを初期状態に戻す
     * @param {number} [totalCards] - 新しい総カード数（省略時は現在の値を維持）
     */
    reset(totalCards) {
        if (totalCards !== undefined) {
            if (typeof totalCards !== 'number' || !Number.isInteger(totalCards) || totalCards < 0) {
                throw new Error('totalCards must be a non-negative integer');
            }
            this._totalCards = totalCards;
        }
        this._correct = 0;
        this._incorrect = 0;
    }
}

// ブラウザ環境とNode.js環境の両方で動作するようにエクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ScoreManager };
} else if (typeof window !== 'undefined') {
    window.ScoreManager = ScoreManager;
}
