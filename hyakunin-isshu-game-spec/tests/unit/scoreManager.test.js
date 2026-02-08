/**
 * ScoreManager クラスのユニットテスト
 *
 * Requirements: 5.1, 5.2
 */
const { ScoreManager } = require('../../public/js/scoreManager');

describe('ScoreManager', () => {
    describe('constructor', () => {
        test('有効な総カード数で初期化できる', () => {
            const sm = new ScoreManager(100);
            expect(sm).toBeDefined();
        });

        test('総カード数0で初期化できる', () => {
            const sm = new ScoreManager(0);
            expect(sm).toBeDefined();
        });

        test('負の数で初期化するとエラーをスローする', () => {
            expect(() => new ScoreManager(-1)).toThrow('totalCards must be a non-negative integer');
        });

        test('小数で初期化するとエラーをスローする', () => {
            expect(() => new ScoreManager(3.5)).toThrow('totalCards must be a non-negative integer');
        });

        test('文字列で初期化するとエラーをスローする', () => {
            expect(() => new ScoreManager('10')).toThrow('totalCards must be a non-negative integer');
        });

        test('nullで初期化するとエラーをスローする', () => {
            expect(() => new ScoreManager(null)).toThrow('totalCards must be a non-negative integer');
        });

        test('undefinedで初期化するとエラーをスローする', () => {
            expect(() => new ScoreManager(undefined)).toThrow('totalCards must be a non-negative integer');
        });
    });

    describe('初期状態', () => {
        test('初期状態ではcorrectが0', () => {
            const sm = new ScoreManager(10);
            const score = sm.getScore();
            expect(score.correct).toBe(0);
        });

        test('初期状態ではincorrectが0', () => {
            const sm = new ScoreManager(10);
            const score = sm.getScore();
            expect(score.incorrect).toBe(0);
        });

        test('初期状態ではremainingが総カード数と一致する', () => {
            const sm = new ScoreManager(10);
            const score = sm.getScore();
            expect(score.remaining).toBe(10);
        });

        test('初期状態ではaccuracyが0', () => {
            const sm = new ScoreManager(10);
            const score = sm.getScore();
            expect(score.accuracy).toBe(0);
        });
    });

    describe('addCorrect (Req 5.1)', () => {
        test('正解を追加するとcorrectが1増加する', () => {
            const sm = new ScoreManager(10);
            sm.addCorrect();
            expect(sm.getScore().correct).toBe(1);
        });

        test('正解を追加するとremainingが1減少する', () => {
            const sm = new ScoreManager(10);
            sm.addCorrect();
            expect(sm.getScore().remaining).toBe(9);
        });

        test('複数回正解を追加するとcorrectが累積する', () => {
            const sm = new ScoreManager(10);
            sm.addCorrect();
            sm.addCorrect();
            sm.addCorrect();
            expect(sm.getScore().correct).toBe(3);
            expect(sm.getScore().remaining).toBe(7);
        });
    });

    describe('addIncorrect (Req 5.1)', () => {
        test('不正解を追加するとincorrectが1増加する', () => {
            const sm = new ScoreManager(10);
            sm.addIncorrect();
            expect(sm.getScore().incorrect).toBe(1);
        });

        test('不正解を追加してもremainingは変化しない', () => {
            const sm = new ScoreManager(10);
            sm.addIncorrect();
            expect(sm.getScore().remaining).toBe(10);
        });

        test('不正解を追加してもcorrectは変化しない', () => {
            const sm = new ScoreManager(10);
            sm.addIncorrect();
            expect(sm.getScore().correct).toBe(0);
        });

        test('複数回不正解を追加するとincorrectが累積する', () => {
            const sm = new ScoreManager(10);
            sm.addIncorrect();
            sm.addIncorrect();
            sm.addIncorrect();
            expect(sm.getScore().incorrect).toBe(3);
        });
    });

    describe('getScore (Req 5.1, 5.2)', () => {
        test('ScoreDataオブジェクトが必要なフィールドをすべて含む', () => {
            const sm = new ScoreManager(10);
            const score = sm.getScore();
            expect(score).toHaveProperty('correct');
            expect(score).toHaveProperty('incorrect');
            expect(score).toHaveProperty('remaining');
            expect(score).toHaveProperty('accuracy');
        });

        test('正解と不正解が混在する場合のスコアデータが正しい', () => {
            const sm = new ScoreManager(10);
            sm.addCorrect();
            sm.addIncorrect();
            sm.addCorrect();
            const score = sm.getScore();
            expect(score.correct).toBe(2);
            expect(score.incorrect).toBe(1);
            expect(score.remaining).toBe(8);
        });

        test('全問正解時のスコアデータが正しい (Req 5.2)', () => {
            const sm = new ScoreManager(3);
            sm.addCorrect();
            sm.addCorrect();
            sm.addCorrect();
            const score = sm.getScore();
            expect(score.correct).toBe(3);
            expect(score.incorrect).toBe(0);
            expect(score.remaining).toBe(0);
            expect(score.accuracy).toBe(100);
        });

        test('remainingが0未満にならない', () => {
            const sm = new ScoreManager(1);
            sm.addCorrect();
            sm.addCorrect(); // totalCardsを超えて正解を追加
            const score = sm.getScore();
            expect(score.remaining).toBe(0);
        });
    });

    describe('getAccuracy (Req 5.1)', () => {
        test('試行回数が0の場合は0を返す', () => {
            const sm = new ScoreManager(10);
            expect(sm.getAccuracy()).toBe(0);
        });

        test('全問正解の場合は100を返す', () => {
            const sm = new ScoreManager(10);
            sm.addCorrect();
            sm.addCorrect();
            sm.addCorrect();
            expect(sm.getAccuracy()).toBe(100);
        });

        test('全問不正解の場合は0を返す', () => {
            const sm = new ScoreManager(10);
            sm.addIncorrect();
            sm.addIncorrect();
            sm.addIncorrect();
            expect(sm.getAccuracy()).toBe(0);
        });

        test('正解1回、不正解1回の場合は50を返す', () => {
            const sm = new ScoreManager(10);
            sm.addCorrect();
            sm.addIncorrect();
            expect(sm.getAccuracy()).toBe(50);
        });

        test('正解1回、不正解2回の場合は33.33を返す', () => {
            const sm = new ScoreManager(10);
            sm.addCorrect();
            sm.addIncorrect();
            sm.addIncorrect();
            expect(sm.getAccuracy()).toBeCloseTo(33.33, 1);
        });

        test('正解2回、不正解1回の場合は66.67を返す', () => {
            const sm = new ScoreManager(10);
            sm.addCorrect();
            sm.addCorrect();
            sm.addIncorrect();
            expect(sm.getAccuracy()).toBeCloseTo(66.67, 1);
        });

        test('正答率は0〜100の範囲内である', () => {
            const sm = new ScoreManager(100);
            // 多数の正解と不正解を追加
            for (let i = 0; i < 50; i++) {
                sm.addCorrect();
            }
            for (let i = 0; i < 30; i++) {
                sm.addIncorrect();
            }
            const accuracy = sm.getAccuracy();
            expect(accuracy).toBeGreaterThanOrEqual(0);
            expect(accuracy).toBeLessThanOrEqual(100);
        });
    });

    describe('reset', () => {
        test('リセット後にcorrectが0になる', () => {
            const sm = new ScoreManager(10);
            sm.addCorrect();
            sm.addCorrect();
            sm.reset();
            expect(sm.getScore().correct).toBe(0);
        });

        test('リセット後にincorrectが0になる', () => {
            const sm = new ScoreManager(10);
            sm.addIncorrect();
            sm.addIncorrect();
            sm.reset();
            expect(sm.getScore().incorrect).toBe(0);
        });

        test('リセット後にremainingが元の総カード数に戻る', () => {
            const sm = new ScoreManager(10);
            sm.addCorrect();
            sm.addCorrect();
            sm.reset();
            expect(sm.getScore().remaining).toBe(10);
        });

        test('リセット後にaccuracyが0になる', () => {
            const sm = new ScoreManager(10);
            sm.addCorrect();
            sm.reset();
            expect(sm.getScore().accuracy).toBe(0);
        });

        test('新しい総カード数を指定してリセットできる', () => {
            const sm = new ScoreManager(10);
            sm.addCorrect();
            sm.reset(20);
            const score = sm.getScore();
            expect(score.correct).toBe(0);
            expect(score.remaining).toBe(20);
        });

        test('totalCardsなしでリセットすると現在の総カード数を維持する', () => {
            const sm = new ScoreManager(10);
            sm.addCorrect();
            sm.reset();
            expect(sm.getScore().remaining).toBe(10);
        });

        test('不正な総カード数でリセットするとエラーをスローする', () => {
            const sm = new ScoreManager(10);
            expect(() => sm.reset(-5)).toThrow('totalCards must be a non-negative integer');
        });

        test('小数の総カード数でリセットするとエラーをスローする', () => {
            const sm = new ScoreManager(10);
            expect(() => sm.reset(3.5)).toThrow('totalCards must be a non-negative integer');
        });
    });

    describe('ゲームフロー統合テスト', () => {
        test('10枚のゲームで正解7回、不正解3回のスコアが正しい', () => {
            const sm = new ScoreManager(10);

            // 7回正解
            for (let i = 0; i < 7; i++) {
                sm.addCorrect();
            }
            // 3回不正解
            for (let i = 0; i < 3; i++) {
                sm.addIncorrect();
            }

            const score = sm.getScore();
            expect(score.correct).toBe(7);
            expect(score.incorrect).toBe(3);
            expect(score.remaining).toBe(3);
            expect(score.accuracy).toBe(70);
        });

        test('ゲームをリセットして再プレイできる', () => {
            const sm = new ScoreManager(5);

            // 最初のゲーム
            sm.addCorrect();
            sm.addCorrect();
            sm.addIncorrect();
            expect(sm.getScore().correct).toBe(2);

            // リセットして再プレイ
            sm.reset(10);
            expect(sm.getScore().correct).toBe(0);
            expect(sm.getScore().remaining).toBe(10);

            // 2回目のゲーム
            sm.addCorrect();
            expect(sm.getScore().correct).toBe(1);
            expect(sm.getScore().remaining).toBe(9);
        });
    });
});
