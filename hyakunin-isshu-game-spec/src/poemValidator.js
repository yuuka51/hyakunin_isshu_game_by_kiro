/**
 * 歌データのバリデーション関数
 * Poem オブジェクトの構造検証を行う
 */

/**
 * 単一の Poem オブジェクトを検証する
 * @param {*} poem - 検証対象のオブジェクト
 * @returns {{ valid: boolean, errors: string[] }} 検証結果
 */
function validatePoem(poem) {
    const errors = [];

    // null/undefined チェック
    if (poem === null || poem === undefined || typeof poem !== 'object') {
        return { valid: false, errors: ['Poem must be a non-null object'] };
    }

    // Array チェック
    if (Array.isArray(poem)) {
        return { valid: false, errors: ['Poem must be a plain object, not an array'] };
    }

    // id の検証: 1〜100の整数
    if (!Number.isInteger(poem.id)) {
        errors.push('id must be an integer');
    } else if (poem.id < 1 || poem.id > 100) {
        errors.push('id must be between 1 and 100');
    }

    // author の検証: 非空文字列
    if (typeof poem.author !== 'string') {
        errors.push('author must be a string');
    } else if (poem.author.trim().length === 0) {
        errors.push('author must be a non-empty string');
    }

    // upperVerse の検証: 非空文字列
    if (typeof poem.upperVerse !== 'string') {
        errors.push('upperVerse must be a string');
    } else if (poem.upperVerse.trim().length === 0) {
        errors.push('upperVerse must be a non-empty string');
    }

    // lowerVerse の検証: 非空文字列
    if (typeof poem.lowerVerse !== 'string') {
        errors.push('lowerVerse must be a string');
    } else if (poem.lowerVerse.trim().length === 0) {
        errors.push('lowerVerse must be a non-empty string');
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Poem オブジェクトの配列を検証する
 * 各 Poem の構造検証に加え、100首の完全性とIDの一意性を確認する
 * @param {*} poems - 検証対象の配列
 * @returns {{ valid: boolean, errors: string[] }} 検証結果
 */
function validatePoemCollection(poems) {
    const errors = [];

    // 配列チェック
    if (!Array.isArray(poems)) {
        return { valid: false, errors: ['Poem collection must be an array'] };
    }

    // 100首の完全性チェック
    if (poems.length !== 100) {
        errors.push(`Poem collection must contain exactly 100 poems, but got ${poems.length}`);
    }

    // 各 Poem の個別バリデーション
    const idSet = new Set();
    const duplicateIds = [];

    poems.forEach((poem, index) => {
        const result = validatePoem(poem);
        if (!result.valid) {
            result.errors.forEach((err) => {
                errors.push(`Poem at index ${index}: ${err}`);
            });
        }

        // IDの一意性チェック（有効なIDの場合のみ）
        if (Number.isInteger(poem?.id)) {
            if (idSet.has(poem.id)) {
                duplicateIds.push(poem.id);
            } else {
                idSet.add(poem.id);
            }
        }
    });

    if (duplicateIds.length > 0) {
        errors.push(`Duplicate poem IDs found: ${duplicateIds.join(', ')}`);
    }

    return { valid: errors.length === 0, errors };
}

module.exports = { validatePoem, validatePoemCollection };
