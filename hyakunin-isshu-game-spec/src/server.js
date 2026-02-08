/**
 * Express Server - 百人一首ゲーム
 * 静的ファイル配信と歌データAPIを提供する
 * ポート8080でHTTPリクエストを受け付ける
 *
 * Requirements:
 * - 6.1: Docker_Containerが起動された場合、Webサーバーを起動し、ブラウザからアクセス可能な状態にする
 * - 6.3: Webサーバーが起動した場合、ポート8080でHTTPリクエストを受け付ける
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8080;

// プロジェクトルートのパスを解決
const projectRoot = path.join(__dirname, '..');

// 歌データの読み込み
let poems = [];
try {
    const poemsPath = path.join(projectRoot, 'data', 'poems.json');
    const poemsData = fs.readFileSync(poemsPath, 'utf-8');
    poems = JSON.parse(poemsData);
    console.log(`歌データを読み込みました: ${poems.length}首`);
} catch (err) {
    console.error('歌データの読み込みに失敗しました:', err.message);
}

// 静的ファイル配信（public/ ディレクトリ）
app.use(express.static(path.join(projectRoot, 'public')));

// 歌データAPI
app.get('/api/poems', (req, res) => {
    if (poems.length === 0) {
        return res.status(500).json({ error: '歌データが読み込まれていません' });
    }
    res.json(poems);
});

// サーバー起動（テスト時にはexportのみ行う）
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`百人一首ゲームサーバーが起動しました: http://localhost:${PORT}`);
    });
}

module.exports = { app, poems };
