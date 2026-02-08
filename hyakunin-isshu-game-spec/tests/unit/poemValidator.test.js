/**
 * 歌データバリデーション関数のユニットテスト
 */
const { validatePoem, validatePoemCollection } = require('../../src/poemValidator');

describe('validatePoem', () => {
    // 有効な Poem オブジェクト
    const validPoem = {
        id: 1,
        author: '天智天皇',
        upperVerse: '秋の田の かりほの庵の 苫をあらみ',
        lowerVerse: 'わが衣手は 露にぬれつつ',
    };

    describe('有効なデータの検証', () => {
        test('すべてのフィールドが有効な場合、valid: true を返す', () => {
            const result = validatePoem(validPoem);
            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        test('id が 1 の場合、有効と判定する', () => {
            const poem = { ...validPoem, id: 1 };
            expect(validatePoem(poem).valid).toBe(true);
        });

        test('id が 100 の場合、有効と判定する', () => {
            const poem = { ...validPoem, id: 100 };
            expect(validatePoem(poem).valid).toBe(true);
        });

        test('id が 50 の場合、有効と判定する', () => {
            const poem = { ...validPoem, id: 50 };
            expect(validatePoem(poem).valid).toBe(true);
        });
    });

    describe('id フィールドの検証', () => {
        test('id が 0 の場合、無効と判定する', () => {
            const poem = { ...validPoem, id: 0 };
            const result = validatePoem(poem);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('id must be between 1 and 100');
        });

        test('id が 101 の場合、無効と判定する', () => {
            const poem = { ...validPoem, id: 101 };
            const result = validatePoem(poem);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('id must be between 1 and 100');
        });

        test('id が負の数の場合、無効と判定する', () => {
            const poem = { ...validPoem, id: -1 };
            const result = validatePoem(poem);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('id must be between 1 and 100');
        });

        test('id が小数の場合、無効と判定する', () => {
            const poem = { ...validPoem, id: 1.5 };
            const result = validatePoem(poem);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('id must be an integer');
        });

        test('id が文字列の場合、無効と判定する', () => {
            const poem = { ...validPoem, id: '1' };
            const result = validatePoem(poem);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('id must be an integer');
        });

        test('id が undefined の場合、無効と判定する', () => {
            const { id, ...poemWithoutId } = validPoem;
            const result = validatePoem(poemWithoutId);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('id must be an integer');
        });
    });

    describe('author フィールドの検証', () => {
        test('author が空文字列の場合、無効と判定する', () => {
            const poem = { ...validPoem, author: '' };
            const result = validatePoem(poem);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('author must be a non-empty string');
        });

        test('author が空白のみの場合、無効と判定する', () => {
            const poem = { ...validPoem, author: '   ' };
            const result = validatePoem(poem);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('author must be a non-empty string');
        });

        test('author が数値の場合、無効と判定する', () => {
            const poem = { ...validPoem, author: 123 };
            const result = validatePoem(poem);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('author must be a string');
        });

        test('author が undefined の場合、無効と判定する', () => {
            const { author, ...poemWithoutAuthor } = validPoem;
            const result = validatePoem(poemWithoutAuthor);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('author must be a string');
        });
    });

    describe('upperVerse フィールドの検証', () => {
        test('upperVerse が空文字列の場合、無効と判定する', () => {
            const poem = { ...validPoem, upperVerse: '' };
            const result = validatePoem(poem);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('upperVerse must be a non-empty string');
        });

        test('upperVerse が空白のみの場合、無効と判定する', () => {
            const poem = { ...validPoem, upperVerse: '  \t  ' };
            const result = validatePoem(poem);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('upperVerse must be a non-empty string');
        });

        test('upperVerse が数値の場合、無効と判定する', () => {
            const poem = { ...validPoem, upperVerse: 42 };
            const result = validatePoem(poem);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('upperVerse must be a string');
        });
    });

    describe('lowerVerse フィールドの検証', () => {
        test('lowerVerse が空文字列の場合、無効と判定する', () => {
            const poem = { ...validPoem, lowerVerse: '' };
            const result = validatePoem(poem);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('lowerVerse must be a non-empty string');
        });

        test('lowerVerse が空白のみの場合、無効と判定する', () => {
            const poem = { ...validPoem, lowerVerse: '\n\t' };
            const result = validatePoem(poem);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('lowerVerse must be a non-empty string');
        });

        test('lowerVerse が null の場合、無効と判定する', () => {
            const poem = { ...validPoem, lowerVerse: null };
            const result = validatePoem(poem);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('lowerVerse must be a string');
        });
    });

    describe('エッジケース', () => {
        test('null を渡した場合、無効と判定する', () => {
            const result = validatePoem(null);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Poem must be a non-null object');
        });

        test('undefined を渡した場合、無効と判定する', () => {
            const result = validatePoem(undefined);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Poem must be a non-null object');
        });

        test('文字列を渡した場合、無効と判定する', () => {
            const result = validatePoem('not a poem');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Poem must be a non-null object');
        });

        test('配列を渡した場合、無効と判定する', () => {
            const result = validatePoem([1, 2, 3]);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Poem must be a plain object, not an array');
        });

        test('複数のフィールドが無効な場合、すべてのエラーを返す', () => {
            const poem = { id: 'abc', author: '', upperVerse: 42, lowerVerse: null };
            const result = validatePoem(poem);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBe(4);
        });
    });
});

describe('validatePoemCollection', () => {
    // テスト用の有効な100首コレクションを生成するヘルパー
    function createValidCollection() {
        return Array.from({ length: 100 }, (_, i) => ({
            id: i + 1,
            author: `作者${i + 1}`,
            upperVerse: `上の句${i + 1}`,
            lowerVerse: `下の句${i + 1}`,
        }));
    }

    describe('有効なコレクションの検証', () => {
        test('100首の有効なコレクションの場合、valid: true を返す', () => {
            const poems = createValidCollection();
            const result = validatePoemCollection(poems);
            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
        });
    });

    describe('コレクションサイズの検証', () => {
        test('99首の場合、無効と判定する', () => {
            const poems = createValidCollection().slice(0, 99);
            const result = validatePoemCollection(poems);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain(
                'Poem collection must contain exactly 100 poems, but got 99'
            );
        });

        test('101首の場合、無効と判定する', () => {
            const poems = createValidCollection();
            poems.push({
                id: 1,
                author: '追加作者',
                upperVerse: '追加上の句',
                lowerVerse: '追加下の句',
            });
            const result = validatePoemCollection(poems);
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes('exactly 100 poems'))).toBe(true);
        });

        test('空配列の場合、無効と判定する', () => {
            const result = validatePoemCollection([]);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain(
                'Poem collection must contain exactly 100 poems, but got 0'
            );
        });
    });

    describe('IDの一意性の検証', () => {
        test('重複IDがある場合、無効と判定する', () => {
            const poems = createValidCollection();
            poems[99] = { ...poems[99], id: 1 }; // id: 1 を重複させる
            const result = validatePoemCollection(poems);
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes('Duplicate poem IDs'))).toBe(true);
        });
    });

    describe('個別 Poem の検証', () => {
        test('コレクション内に無効な Poem がある場合、エラーを報告する', () => {
            const poems = createValidCollection();
            poems[5] = { id: 6, author: '', upperVerse: '上の句6', lowerVerse: '下の句6' };
            const result = validatePoemCollection(poems);
            expect(result.valid).toBe(false);
            expect(
                result.errors.some((e) => e.includes('Poem at index 5'))
            ).toBe(true);
        });
    });

    describe('エッジケース', () => {
        test('配列でない値を渡した場合、無効と判定する', () => {
            const result = validatePoemCollection('not an array');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Poem collection must be an array');
        });

        test('null を渡した場合、無効と判定する', () => {
            const result = validatePoemCollection(null);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Poem collection must be an array');
        });

        test('オブジェクトを渡した場合、無効と判定する', () => {
            const result = validatePoemCollection({ length: 100 });
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Poem collection must be an array');
        });
    });
});
