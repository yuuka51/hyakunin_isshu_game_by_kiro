/**
 * UIRenderer クラスのユニットテスト
 *
 * Requirements: 3.1, 3.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3
 *
 * @jest-environment jsdom
 */

const { UIRenderer } = require('../../public/js/uiRenderer');

/**
 * テスト用のHTML構造をセットアップする
 * public/index.html の構造を再現する
 */
function setupDOM() {
    document.body.innerHTML = `
        <div id="app">
            <div id="start-screen">
                <button id="start-btn">ゲーム開始</button>
            </div>
            <div id="game-screen" style="display: none;">
                <div id="reading-card">
                    <div id="reading-author"></div>
                    <div id="reading-verse"></div>
                </div>
                <div id="score-board">
                    <span id="score">スコア: 0</span>
                    <span id="accuracy">正答率: 0%</span>
                    <span id="remaining">残り: 0</span>
                </div>
                <div id="game-field"></div>
            </div>
            <div id="gameover-screen" style="display: none;">
                <div class="gameover-content">
                    <h2 class="gameover-title">ゲーム終了</h2>
                    <div id="final-score"></div>
                    <button id="replay-btn">もう一度プレイ</button>
                </div>
            </div>
        </div>
    `;
}

/**
 * テスト用の歌データを生成するヘルパー
 */
function createTestPoems(count = 5) {
    return Array.from({ length: count }, function (_, i) {
        return {
            id: i + 1,
            author: '作者' + (i + 1),
            upperVerse: '上の句' + (i + 1),
            lowerVerse: '下の句' + (i + 1),
        };
    });
}

describe('UIRenderer', function () {
    var renderer;

    beforeEach(function () {
        setupDOM();
        renderer = new UIRenderer(null, null);
    });

    describe('constructor', function () {
        test('DOM要素を正しくキャッシュする', function () {
            expect(renderer._startScreen).toBe(document.getElementById('start-screen'));
            expect(renderer._gameScreen).toBe(document.getElementById('game-screen'));
            expect(renderer._gameOverScreen).toBe(document.getElementById('gameover-screen'));
            expect(renderer._gameField).toBe(document.getElementById('game-field'));
            expect(renderer._readingAuthor).toBe(document.getElementById('reading-author'));
            expect(renderer._readingVerse).toBe(document.getElementById('reading-verse'));
        });

        test('onCardClick が初期状態で null である', function () {
            expect(renderer.onCardClick).toBeNull();
        });
    });

    describe('画面遷移', function () {
        test('showStartScreen: スタート画面のみ表示する', function () {
            renderer.showStartScreen();
            expect(document.getElementById('start-screen').style.display).not.toBe('none');
            expect(document.getElementById('game-screen').style.display).toBe('none');
            expect(document.getElementById('gameover-screen').style.display).toBe('none');
        });

        test('showGameScreen: ゲーム画面のみ表示する', function () {
            renderer.showGameScreen();
            expect(document.getElementById('start-screen').style.display).toBe('none');
            expect(document.getElementById('game-screen').style.display).not.toBe('none');
            expect(document.getElementById('gameover-screen').style.display).toBe('none');
        });

        test('showGameOverScreen: ゲーム終了画面のみ表示する', function () {
            renderer.showGameOverScreen();
            expect(document.getElementById('start-screen').style.display).toBe('none');
            expect(document.getElementById('game-screen').style.display).toBe('none');
            expect(document.getElementById('gameover-screen').style.display).not.toBe('none');
        });
    });

    describe('renderGameField (Req 2.1, 7.3)', function () {
        test('カードの数だけ .grab-card 要素を生成する', function () {
            var poems = createTestPoems(5);
            renderer.renderGameField(poems);
            var cards = document.querySelectorAll('.grab-card');
            expect(cards.length).toBe(5);
        });

        test('各カードに data-id 属性が設定される', function () {
            var poems = createTestPoems(3);
            renderer.renderGameField(poems);
            var cards = document.querySelectorAll('.grab-card');
            expect(cards[0].getAttribute('data-id')).toBe('1');
            expect(cards[1].getAttribute('data-id')).toBe('2');
            expect(cards[2].getAttribute('data-id')).toBe('3');
        });

        test('各カードに .card-text span が含まれ下の句が表示される', function () {
            var poems = createTestPoems(2);
            renderer.renderGameField(poems);
            var textSpans = document.querySelectorAll('.grab-card .card-text');
            expect(textSpans.length).toBe(2);
            expect(textSpans[0].textContent).toBe('下の句1');
            expect(textSpans[1].textContent).toBe('下の句2');
        });

        test('再描画時に既存のカードがクリアされる', function () {
            renderer.renderGameField(createTestPoems(5));
            expect(document.querySelectorAll('.grab-card').length).toBe(5);

            renderer.renderGameField(createTestPoems(3));
            expect(document.querySelectorAll('.grab-card').length).toBe(3);
        });

        test('空配列を渡すとゲームフィールドが空になる', function () {
            renderer.renderGameField(createTestPoems(5));
            renderer.renderGameField([]);
            expect(document.querySelectorAll('.grab-card').length).toBe(0);
        });

        test('カードクリック時に onCardClick コールバックが呼ばれる', function () {
            var clickedId = null;
            var clickedElement = null;
            renderer.onCardClick = function (id, el) {
                clickedId = id;
                clickedElement = el;
            };

            var poems = createTestPoems(3);
            renderer.renderGameField(poems);

            var firstCard = document.querySelector('.grab-card[data-id="1"]');
            firstCard.click();

            expect(clickedId).toBe(1);
            expect(clickedElement).toBe(firstCard);
        });

        test('onCardClick が未設定の場合、クリックしてもエラーにならない', function () {
            renderer.renderGameField(createTestPoems(1));
            var card = document.querySelector('.grab-card');
            expect(function () { card.click(); }).not.toThrow();
        });
    });

    describe('renderReadingCard (Req 3.1, 3.2)', function () {
        test('上の句を表示する (Req 3.1)', function () {
            var poem = { id: 1, author: '天智天皇', upperVerse: '秋の田の', lowerVerse: 'わが衣手は' };
            renderer.renderReadingCard(poem);
            expect(document.getElementById('reading-verse').textContent).toBe('秋の田の');
        });

        test('作者名を表示する (Req 3.2)', function () {
            var poem = { id: 1, author: '天智天皇', upperVerse: '秋の田の', lowerVerse: 'わが衣手は' };
            renderer.renderReadingCard(poem);
            expect(document.getElementById('reading-author').textContent).toBe('天智天皇');
        });

        test('null を渡すと表示をクリアする', function () {
            var poem = { id: 1, author: '天智天皇', upperVerse: '秋の田の', lowerVerse: 'わが衣手は' };
            renderer.renderReadingCard(poem);
            renderer.renderReadingCard(null);
            expect(document.getElementById('reading-verse').textContent).toBe('');
            expect(document.getElementById('reading-author').textContent).toBe('');
        });
    });

    describe('updateScoreBoard (Req 5.1)', function () {
        test('スコア、正答率、残り札数を表示する', function () {
            renderer.updateScoreBoard({ correct: 5, accuracy: 83.33, remaining: 15 });
            expect(document.getElementById('score').textContent).toBe('スコア: 5');
            expect(document.getElementById('accuracy').textContent).toBe('正答率: 83.33%');
            expect(document.getElementById('remaining').textContent).toBe('残り: 15');
        });

        test('初期状態（スコア0）を正しく表示する', function () {
            renderer.updateScoreBoard({ correct: 0, accuracy: 0, remaining: 100 });
            expect(document.getElementById('score').textContent).toBe('スコア: 0');
            expect(document.getElementById('accuracy').textContent).toBe('正答率: 0%');
            expect(document.getElementById('remaining').textContent).toBe('残り: 100');
        });

        test('null を渡しても何も変更しない', function () {
            renderer.updateScoreBoard({ correct: 5, accuracy: 50, remaining: 10 });
            renderer.updateScoreBoard(null);
            expect(document.getElementById('score').textContent).toBe('スコア: 5');
        });
    });

    describe('showCorrectFeedback (Req 4.3, 4.4)', function () {
        beforeEach(function () {
            jest.useFakeTimers();
        });

        afterEach(function () {
            jest.useRealTimers();
        });

        test('カードに .correct クラスを追加する（緑ハイライト）', function () {
            renderer.renderGameField(createTestPoems(1));
            var card = document.querySelector('.grab-card');
            renderer.showCorrectFeedback(card);
            expect(card.classList.contains('correct')).toBe(true);
        });

        test('800ms後に .removing クラスが追加される', function () {
            renderer.renderGameField(createTestPoems(1));
            var card = document.querySelector('.grab-card');
            renderer.showCorrectFeedback(card);

            jest.advanceTimersByTime(800);
            expect(card.classList.contains('removing')).toBe(true);
        });

        test('800ms + 400ms後にカードがDOMから除去される', function () {
            renderer.renderGameField(createTestPoems(1));
            var card = document.querySelector('.grab-card');
            renderer.showCorrectFeedback(card);

            jest.advanceTimersByTime(800 + 400);
            expect(document.querySelectorAll('.grab-card').length).toBe(0);
        });

        test('Promise が完了後に解決される', async function () {
            renderer.renderGameField(createTestPoems(1));
            var card = document.querySelector('.grab-card');
            var resolved = false;
            renderer.showCorrectFeedback(card).then(function () {
                resolved = true;
            });

            // First setTimeout (800ms) triggers removeCard
            jest.advanceTimersByTime(800);
            // Flush microtask queues multiple times to allow chained promises to resolve
            await Promise.resolve();
            await Promise.resolve();
            // Second setTimeout (400ms) inside removeCard
            jest.advanceTimersByTime(400);
            // Flush microtask queues for the final resolve chain
            await Promise.resolve();
            await Promise.resolve();
            await Promise.resolve();

            expect(resolved).toBe(true);
        });
    });

    describe('showIncorrectFeedback (Req 4.3, 4.5)', function () {
        beforeEach(function () {
            jest.useFakeTimers();
        });

        afterEach(function () {
            jest.useRealTimers();
        });

        test('カードに .incorrect クラスを追加する（赤ハイライト）', function () {
            renderer.renderGameField(createTestPoems(1));
            var card = document.querySelector('.grab-card');
            renderer.showIncorrectFeedback(card);
            expect(card.classList.contains('incorrect')).toBe(true);
        });

        test('600ms後に .incorrect クラスが除去される', function () {
            renderer.renderGameField(createTestPoems(1));
            var card = document.querySelector('.grab-card');
            renderer.showIncorrectFeedback(card);

            jest.advanceTimersByTime(600);
            expect(card.classList.contains('incorrect')).toBe(false);
        });

        test('カードはDOMに残る（除去されない）', function () {
            renderer.renderGameField(createTestPoems(1));
            var card = document.querySelector('.grab-card');
            renderer.showIncorrectFeedback(card);

            jest.advanceTimersByTime(600);
            expect(document.querySelectorAll('.grab-card').length).toBe(1);
        });

        test('Promise が完了後に解決される', function () {
            renderer.renderGameField(createTestPoems(1));
            var card = document.querySelector('.grab-card');
            var resolved = false;
            renderer.showIncorrectFeedback(card).then(function () {
                resolved = true;
            });

            jest.advanceTimersByTime(600);
            return Promise.resolve().then(function () {
                expect(resolved).toBe(true);
            });
        });
    });

    describe('removeCard', function () {
        beforeEach(function () {
            jest.useFakeTimers();
        });

        afterEach(function () {
            jest.useRealTimers();
        });

        test('.removing クラスを追加する', function () {
            renderer.renderGameField(createTestPoems(1));
            var card = document.querySelector('.grab-card');
            renderer.removeCard(card);
            expect(card.classList.contains('removing')).toBe(true);
        });

        test('400ms後にカードがDOMから除去される', function () {
            renderer.renderGameField(createTestPoems(2));
            var card = document.querySelector('.grab-card');
            renderer.removeCard(card);

            jest.advanceTimersByTime(400);
            expect(document.querySelectorAll('.grab-card').length).toBe(1);
        });
    });

    describe('renderGameOver (Req 5.2, 5.3)', function () {
        test('最終スコアを表示する (Req 5.2)', function () {
            renderer.renderGameOver({ correct: 80, accuracy: 88.89 });
            var finalScore = document.getElementById('final-score');
            expect(finalScore.innerHTML).toContain('80');
            expect(finalScore.innerHTML).toContain('88.89');
        });

        test('score-label クラスが使用される', function () {
            renderer.renderGameOver({ correct: 10, accuracy: 100 });
            var labels = document.querySelectorAll('#final-score .score-label');
            expect(labels.length).toBe(2);
        });

        test('ゲーム終了画面に遷移する', function () {
            renderer.renderGameOver({ correct: 10, accuracy: 100 });
            expect(document.getElementById('gameover-screen').style.display).not.toBe('none');
            expect(document.getElementById('game-screen').style.display).toBe('none');
            expect(document.getElementById('start-screen').style.display).toBe('none');
        });

        test('「もう一度プレイ」ボタンが表示される (Req 5.3)', function () {
            renderer.renderGameOver({ correct: 10, accuracy: 100 });
            var replayBtn = document.getElementById('replay-btn');
            expect(replayBtn).not.toBeNull();
            // ゲーム終了画面が表示されているので、ボタンも表示されている
            expect(document.getElementById('gameover-screen').style.display).not.toBe('none');
        });
    });
});
