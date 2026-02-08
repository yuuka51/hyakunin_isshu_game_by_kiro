/**
 * Express サーバーのユニットテスト
 * Requirements: 6.1, 6.3
 */

const path = require('path');
const fs = require('fs');

// server.js をテスト用にインポート（require.main !== module なのでlistenは呼ばれない）
const { app, poems } = require('../../src/server');

// supertest がなくても動作するよう、簡易的なHTTPテストを実装
const http = require('http');

let server;
let baseUrl;

beforeAll((done) => {
    server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        done();
    });
});

afterAll((done) => {
    server.close(done);
});

/**
 * 簡易HTTPリクエストヘルパー
 */
function httpGet(urlPath) {
    return new Promise((resolve, reject) => {
        http.get(`${baseUrl}${urlPath}`, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data,
                });
            });
        }).on('error', reject);
    });
}

describe('Express Server', () => {
    describe('歌データAPI: GET /api/poems', () => {
        test('200ステータスコードを返す', async () => {
            const res = await httpGet('/api/poems');
            expect(res.statusCode).toBe(200);
        });

        test('JSON形式でレスポンスを返す', async () => {
            const res = await httpGet('/api/poems');
            expect(res.headers['content-type']).toMatch(/application\/json/);
        });

        test('配列形式の歌データを返す', async () => {
            const res = await httpGet('/api/poems');
            const data = JSON.parse(res.body);
            expect(Array.isArray(data)).toBe(true);
        });

        test('歌データが読み込まれている場合、空でない配列を返す', async () => {
            const res = await httpGet('/api/poems');
            const data = JSON.parse(res.body);
            // poems.json が正しく読み込まれていれば100首
            if (poems.length > 0) {
                expect(data.length).toBeGreaterThan(0);
            }
        });

        test('各歌データが必要なフィールドを持つ', async () => {
            const res = await httpGet('/api/poems');
            const data = JSON.parse(res.body);
            if (data.length > 0) {
                const firstPoem = data[0];
                expect(firstPoem).toHaveProperty('id');
                expect(firstPoem).toHaveProperty('author');
                expect(firstPoem).toHaveProperty('upperVerse');
                expect(firstPoem).toHaveProperty('lowerVerse');
            }
        });
    });

    describe('静的ファイル配信', () => {
        test('index.html を配信する', async () => {
            const res = await httpGet('/');
            expect(res.statusCode).toBe(200);
            expect(res.headers['content-type']).toMatch(/text\/html/);
        });

        test('CSS ファイルを配信する', async () => {
            const res = await httpGet('/css/style.css');
            expect(res.statusCode).toBe(200);
            expect(res.headers['content-type']).toMatch(/text\/css/);
        });

        test('JavaScript ファイルを配信する', async () => {
            const res = await httpGet('/js/app.js');
            expect(res.statusCode).toBe(200);
            expect(res.headers['content-type']).toMatch(/javascript/);
        });
    });

    describe('サーバー設定', () => {
        test('poems データがモジュールからエクスポートされている', () => {
            expect(Array.isArray(poems)).toBe(true);
        });

        test('app がモジュールからエクスポートされている', () => {
            expect(app).toBeDefined();
            expect(typeof app.listen).toBe('function');
        });
    });
});
