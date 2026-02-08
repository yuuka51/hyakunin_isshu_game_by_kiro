/**
 * GameEngine クラスのユニットテスト
 *
 * Requirements: 2.1, 2.2, 3.1, 3.3, 4.1, 4.2
 */
const { GameEngine, fisherYatesShuffle } = require('../../public/js/gameEngine');

/**
 * テスト用の歌データを生成するヘルパー
 * @param {number} count - 生成する歌の数
 * @returns {Poem[]} テスト用歌データ配列
 */
function createTestPoems(count = 5) {
    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        author: `作者${i + 1}`,
        upperVerse: `上の句${i + 1}`,
        lowerVerse: `下の句${i + 1}`,
    }));
}

describe('fisherYatesShuffle', () => {
    test('シャッフル後の配列は元の配列と同じ長さを持つ', () => {
        const original = [1, 2, 3, 4, 5];
        const shuffled = fisherYatesShuffle(original);
        expect(shuffled).toHaveLength(original.length);
    });

    test('シャッフル後の配列は元の配列と同じ要素を含む', () => {
        const original = [1, 2, 3, 4, 5];
        const shuffled = fisherYatesShuffle(original);
        expect(shuffled.sort()).toEqual(original.sort());
    });

    test('元の配列を変更しない（非破壊的）', () => {
        const original = [1, 2, 3, 4, 5];
        const copy = [...original];
        fisherYatesShuffle(original);
        expect(original).toEqual(copy);
    });

    test('空配列をシャッフルしても空配列を返す', () => {
        const result = fisherYatesShuffle([]);
        expect(result).toEqual([]);
    });

    test('要素が1つの配列をシャッフルしてもその要素を返す', () => {
        const result = fisherYatesShuffle([42]);
        expect(result).toEqual([42]);
    });
});

describe('GameEngine', () => {
    describe('constructor', () => {
        test('有効な歌データ配列で初期化できる', () => {
            const poems = createTestPoems();
            const engine = new GameEngine(poems);
            expect(engine).toBeDefined();
        });

        test('空配列で初期化するとエラーをスローする', () => {
            expect(() => new GameEngine([])).toThrow('poems must be a non-empty array');
        });

        test('配列でない値で初期化するとエラーをスローする', () => {
            expect(() => new GameEngine('not an array')).toThrow('poems must be a non-empty array');
        });

        test('null で初期化するとエラーをスローする', () => {
            expect(() => new GameEngine(null)).toThrow('poems must be a non-empty array');
        });

        test('undefined で初期化するとエラーをスローする', () => {
            expect(() => new GameEngine(undefined)).toThrow('poems must be a non-empty array');
        });
    });

    describe('initGame (Req 2.1, 2.2)', () => {
        test('ゲーム初期化後、スコアが0に設定される', () => {
            const engine = new GameEngine(createTestPoems());
            const state = engine.initGame();
            expect(state.score).toBe(0);
        });

        test('ゲーム初期化後、不正解数が0に設定される', () => {
            const engine = new GameEngine(createTestPoems());
            const state = engine.initGame();
            expect(state.incorrectCount).toBe(0);
        });

        test('ゲーム初期化後、ゲーム終了フラグがfalseに設定される', () => {
            const engine = new GameEngine(createTestPoems());
            const state = engine.initGame();
            expect(state.isGameOver).toBe(false);
        });

        test('ゲーム初期化後、残りカード数が歌データ数と一致する', () => {
            const poems = createTestPoems(10);
            const engine = new GameEngine(poems);
            const state = engine.initGame();
            expect(state.remainingCards).toHaveLength(10);
        });

        test('ゲーム初期化後、totalRoundsが歌データ数と一致する', () => {
            const poems = createTestPoems(10);
            const engine = new GameEngine(poems);
            const state = engine.initGame();
            expect(state.totalRounds).toBe(10);
        });

        test('ゲーム初期化後、currentRoundが1に設定される', () => {
            const engine = new GameEngine(createTestPoems());
            const state = engine.initGame();
            expect(state.currentRound).toBe(1);
        });

        test('ゲーム初期化後、残りカードは元の歌データと同じ要素を含む', () => {
            const poems = createTestPoems(5);
            const engine = new GameEngine(poems);
            const state = engine.initGame();
            const remainingIds = state.remainingCards.map((c) => c.id).sort();
            const originalIds = poems.map((p) => p.id).sort();
            expect(remainingIds).toEqual(originalIds);
        });

        test('initGameを再度呼び出すとゲームがリセットされる', () => {
            const poems = createTestPoems(3);
            const engine = new GameEngine(poems);
            engine.initGame();

            // 正解してスコアを上げる
            const currentPoem = engine.getCurrentReadingCard();
            engine.selectCard(currentPoem.id);

            // リセット
            const state = engine.initGame();
            expect(state.score).toBe(0);
            expect(state.isGameOver).toBe(false);
            expect(state.remainingCards).toHaveLength(3);
        });
    });

    describe('getCurrentReadingCard (Req 3.1)', () => {
        test('ゲーム初期化後、有効な歌データを返す', () => {
            const poems = createTestPoems();
            const engine = new GameEngine(poems);
            engine.initGame();
            const card = engine.getCurrentReadingCard();
            expect(card).toBeDefined();
            expect(card).not.toBeNull();
            expect(card.id).toBeDefined();
            expect(card.author).toBeDefined();
            expect(card.upperVerse).toBeDefined();
            expect(card.lowerVerse).toBeDefined();
        });

        test('返される歌データは元の歌データに含まれる', () => {
            const poems = createTestPoems();
            const engine = new GameEngine(poems);
            engine.initGame();
            const card = engine.getCurrentReadingCard();
            const found = poems.find((p) => p.id === card.id);
            expect(found).toBeDefined();
        });

        test('ゲーム終了後はnullを返す', () => {
            const poems = createTestPoems(1);
            const engine = new GameEngine(poems);
            engine.initGame();
            const currentPoem = engine.getCurrentReadingCard();
            engine.selectCard(currentPoem.id);
            engine.nextRound();
            expect(engine.isGameOver()).toBe(true);
            expect(engine.getCurrentReadingCard()).toBeNull();
        });
    });

    describe('selectCard (Req 4.1, 4.2)', () => {
        test('正しい取り札を選択した場合、correct: true を返す', () => {
            const poems = createTestPoems();
            const engine = new GameEngine(poems);
            engine.initGame();
            const currentPoem = engine.getCurrentReadingCard();
            const result = engine.selectCard(currentPoem.id);
            expect(result.correct).toBe(true);
        });

        test('正しい取り札を選択した場合、correctCardに現在の歌データを返す', () => {
            const poems = createTestPoems();
            const engine = new GameEngine(poems);
            engine.initGame();
            const currentPoem = engine.getCurrentReadingCard();
            const result = engine.selectCard(currentPoem.id);
            expect(result.correctCard).toEqual(currentPoem);
        });

        test('正しい取り札を選択した場合、スコアが1加算される (Req 4.1)', () => {
            const poems = createTestPoems();
            const engine = new GameEngine(poems);
            engine.initGame();
            const currentPoem = engine.getCurrentReadingCard();
            engine.selectCard(currentPoem.id);
            expect(engine.getGameState().score).toBe(1);
        });

        test('正しい取り札を選択した場合、その取り札がGame_Fieldから除去される (Req 4.1)', () => {
            const poems = createTestPoems(5);
            const engine = new GameEngine(poems);
            engine.initGame();
            const currentPoem = engine.getCurrentReadingCard();
            engine.selectCard(currentPoem.id);
            const state = engine.getGameState();
            expect(state.remainingCards).toHaveLength(4);
            const removedCard = state.remainingCards.find((c) => c.id === currentPoem.id);
            expect(removedCard).toBeUndefined();
        });

        test('誤った取り札を選択した場合、correct: false を返す', () => {
            const poems = createTestPoems(5);
            const engine = new GameEngine(poems);
            engine.initGame();
            const currentPoem = engine.getCurrentReadingCard();
            // 現在の読み札とは異なるIDを選択
            const wrongId = poems.find((p) => p.id !== currentPoem.id).id;
            const result = engine.selectCard(wrongId);
            expect(result.correct).toBe(false);
        });

        test('誤った取り札を選択した場合、スコアが変更されない (Req 4.2)', () => {
            const poems = createTestPoems(5);
            const engine = new GameEngine(poems);
            engine.initGame();
            const currentPoem = engine.getCurrentReadingCard();
            const wrongId = poems.find((p) => p.id !== currentPoem.id).id;
            engine.selectCard(wrongId);
            expect(engine.getGameState().score).toBe(0);
        });

        test('誤った取り札を選択した場合、残りカード数が変更されない (Req 4.2)', () => {
            const poems = createTestPoems(5);
            const engine = new GameEngine(poems);
            engine.initGame();
            const currentPoem = engine.getCurrentReadingCard();
            const wrongId = poems.find((p) => p.id !== currentPoem.id).id;
            engine.selectCard(wrongId);
            expect(engine.getGameState().remainingCards).toHaveLength(5);
        });

        test('誤った取り札を選択した場合、不正解数が1増加する', () => {
            const poems = createTestPoems(5);
            const engine = new GameEngine(poems);
            engine.initGame();
            const currentPoem = engine.getCurrentReadingCard();
            const wrongId = poems.find((p) => p.id !== currentPoem.id).id;
            engine.selectCard(wrongId);
            expect(engine.getGameState().incorrectCount).toBe(1);
        });

        test('ゲーム終了後にselectCardを呼ぶと correct: false を返す', () => {
            const poems = createTestPoems(1);
            const engine = new GameEngine(poems);
            engine.initGame();
            const currentPoem = engine.getCurrentReadingCard();
            engine.selectCard(currentPoem.id);
            engine.nextRound(); // ゲーム終了
            const result = engine.selectCard(1);
            expect(result.correct).toBe(false);
            expect(result.correctCard).toBeNull();
        });

        test('正解後にcorrectCardが正しい歌データを返す', () => {
            const poems = createTestPoems(5);
            const engine = new GameEngine(poems);
            engine.initGame();
            const currentPoem = engine.getCurrentReadingCard();
            const wrongId = poems.find((p) => p.id !== currentPoem.id).id;
            const result = engine.selectCard(wrongId);
            // 不正解でもcorrectCardは現在の正解カードを返す
            expect(result.correctCard.id).toBe(currentPoem.id);
        });
    });

    describe('nextRound (Req 3.3)', () => {
        test('次のラウンドに進むとcurrentRoundが増加する', () => {
            const poems = createTestPoems(5);
            const engine = new GameEngine(poems);
            engine.initGame();
            expect(engine.getGameState().currentRound).toBe(1);

            const currentPoem = engine.getCurrentReadingCard();
            engine.selectCard(currentPoem.id);
            engine.nextRound();
            expect(engine.getGameState().currentRound).toBe(2);
        });

        test('次のラウンドに進むと読み札が変わる', () => {
            const poems = createTestPoems(5);
            const engine = new GameEngine(poems);
            engine.initGame();
            const firstCard = engine.getCurrentReadingCard();

            engine.selectCard(firstCard.id);
            engine.nextRound();
            const secondCard = engine.getCurrentReadingCard();

            // 読み札が変わっていることを確認（異なるIDであるべき）
            expect(secondCard).not.toBeNull();
            expect(secondCard.id).not.toBe(firstCard.id);
        });

        test('ゲーム進行中はtrueを返す', () => {
            const poems = createTestPoems(5);
            const engine = new GameEngine(poems);
            engine.initGame();
            const currentPoem = engine.getCurrentReadingCard();
            engine.selectCard(currentPoem.id);
            const result = engine.nextRound();
            expect(result).toBe(true);
        });

        test('最後のラウンドの後はfalseを返しゲーム終了になる', () => {
            const poems = createTestPoems(2);
            const engine = new GameEngine(poems);
            engine.initGame();

            // ラウンド1
            let currentPoem = engine.getCurrentReadingCard();
            engine.selectCard(currentPoem.id);
            engine.nextRound(); // ラウンド2へ

            // ラウンド2
            currentPoem = engine.getCurrentReadingCard();
            engine.selectCard(currentPoem.id);
            const result = engine.nextRound(); // ゲーム終了

            expect(result).toBe(false);
            expect(engine.isGameOver()).toBe(true);
        });

        test('ゲーム終了後にnextRoundを呼ぶとfalseを返す', () => {
            const poems = createTestPoems(1);
            const engine = new GameEngine(poems);
            engine.initGame();
            const currentPoem = engine.getCurrentReadingCard();
            engine.selectCard(currentPoem.id);
            engine.nextRound(); // ゲーム終了
            expect(engine.nextRound()).toBe(false);
        });
    });

    describe('isGameOver', () => {
        test('ゲーム初期化直後はfalseを返す', () => {
            const engine = new GameEngine(createTestPoems());
            engine.initGame();
            expect(engine.isGameOver()).toBe(false);
        });

        test('すべてのラウンドが終了するとtrueを返す', () => {
            const poems = createTestPoems(2);
            const engine = new GameEngine(poems);
            engine.initGame();

            // ラウンド1
            let currentPoem = engine.getCurrentReadingCard();
            engine.selectCard(currentPoem.id);
            engine.nextRound();

            // ラウンド2
            currentPoem = engine.getCurrentReadingCard();
            engine.selectCard(currentPoem.id);
            engine.nextRound();

            expect(engine.isGameOver()).toBe(true);
        });

        test('すべての取り札が除去されるとtrueを返す', () => {
            const poems = createTestPoems(2);
            const engine = new GameEngine(poems);
            engine.initGame();

            // 全カードを正解で除去
            let currentPoem = engine.getCurrentReadingCard();
            engine.selectCard(currentPoem.id);
            engine.nextRound();

            currentPoem = engine.getCurrentReadingCard();
            engine.selectCard(currentPoem.id);
            engine.nextRound();

            expect(engine.isGameOver()).toBe(true);
            expect(engine.getGameState().remainingCards).toHaveLength(0);
        });
    });

    describe('getGameState', () => {
        test('ゲーム状態オブジェクトが必要なフィールドをすべて含む', () => {
            const engine = new GameEngine(createTestPoems());
            engine.initGame();
            const state = engine.getGameState();

            expect(state).toHaveProperty('remainingCards');
            expect(state).toHaveProperty('currentPoem');
            expect(state).toHaveProperty('currentRound');
            expect(state).toHaveProperty('totalRounds');
            expect(state).toHaveProperty('score');
            expect(state).toHaveProperty('incorrectCount');
            expect(state).toHaveProperty('isGameOver');
        });

        test('remainingCardsは元の配列のコピーを返す（参照が異なる）', () => {
            const engine = new GameEngine(createTestPoems());
            engine.initGame();
            const state1 = engine.getGameState();
            const state2 = engine.getGameState();
            expect(state1.remainingCards).not.toBe(state2.remainingCards);
            expect(state1.remainingCards).toEqual(state2.remainingCards);
        });
    });

    describe('getScoreData', () => {
        test('初期状態ではスコア0、正答率0を返す', () => {
            const engine = new GameEngine(createTestPoems(5));
            engine.initGame();
            const scoreData = engine.getScoreData();
            expect(scoreData.score).toBe(0);
            expect(scoreData.incorrectCount).toBe(0);
            expect(scoreData.accuracy).toBe(0);
            expect(scoreData.remaining).toBe(5);
        });

        test('正解後にスコアと正答率が更新される', () => {
            const engine = new GameEngine(createTestPoems(5));
            engine.initGame();
            const currentPoem = engine.getCurrentReadingCard();
            engine.selectCard(currentPoem.id);
            const scoreData = engine.getScoreData();
            expect(scoreData.score).toBe(1);
            expect(scoreData.accuracy).toBe(100);
            expect(scoreData.remaining).toBe(4);
        });

        test('正解と不正解が混在する場合の正答率が正しい', () => {
            const poems = createTestPoems(5);
            const engine = new GameEngine(poems);
            engine.initGame();
            const currentPoem = engine.getCurrentReadingCard();

            // 1回不正解
            const wrongId = poems.find((p) => p.id !== currentPoem.id).id;
            engine.selectCard(wrongId);

            // 1回正解
            engine.selectCard(currentPoem.id);

            const scoreData = engine.getScoreData();
            expect(scoreData.score).toBe(1);
            expect(scoreData.incorrectCount).toBe(1);
            expect(scoreData.accuracy).toBe(50); // 1/2 * 100 = 50
        });
    });

    describe('完全なゲームフロー', () => {
        test('3首のゲームを最後までプレイできる', () => {
            const poems = createTestPoems(3);
            const engine = new GameEngine(poems);
            engine.initGame();

            expect(engine.isGameOver()).toBe(false);

            // ラウンド1: 正解
            let currentPoem = engine.getCurrentReadingCard();
            expect(currentPoem).not.toBeNull();
            let result = engine.selectCard(currentPoem.id);
            expect(result.correct).toBe(true);
            expect(engine.getGameState().remainingCards).toHaveLength(2);
            engine.nextRound();

            // ラウンド2: 不正解 → 正解
            currentPoem = engine.getCurrentReadingCard();
            expect(currentPoem).not.toBeNull();
            const wrongId = engine.getGameState().remainingCards.find(
                (c) => c.id !== currentPoem.id
            ).id;
            result = engine.selectCard(wrongId);
            expect(result.correct).toBe(false);
            expect(engine.getGameState().remainingCards).toHaveLength(2);

            result = engine.selectCard(currentPoem.id);
            expect(result.correct).toBe(true);
            expect(engine.getGameState().remainingCards).toHaveLength(1);
            engine.nextRound();

            // ラウンド3: 正解
            currentPoem = engine.getCurrentReadingCard();
            expect(currentPoem).not.toBeNull();
            result = engine.selectCard(currentPoem.id);
            expect(result.correct).toBe(true);
            expect(engine.getGameState().remainingCards).toHaveLength(0);
            engine.nextRound();

            // ゲーム終了
            expect(engine.isGameOver()).toBe(true);
            expect(engine.getGameState().score).toBe(3);
            expect(engine.getGameState().incorrectCount).toBe(1);
        });
    });
});
