# kakeibo-app — レシート読み込み家計簿

## プロジェクト概要

レシート画像をアップロードすると Claude API が自動読み取りし、カテゴリ別に集計・グラフ表示する家計簿 Web アプリ。

## ディレクトリ構成

```
kakeibo-app/
├── backend/          # Node.js + Express（Claude API 呼び出し）
│   ├── server.js
│   ├── package.json
│   └── .env          # ← 自分で作成（.env.example を参照）
└── frontend/         # React + Vite
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── App.css
        └── components/
            ├── ReceiptUpload.jsx  # 画像アップロード
            ├── ItemList.jsx       # 商品一覧
            └── Charts.jsx         # 円グラフ・棒グラフ
```

## 技術スタック

| 役割 | 技術 |
|------|------|
| フロントエンド | React 18 + Vite |
| バックエンド | Node.js + Express |
| AI 解析 | Claude API (`claude-haiku-4-5-20251001`) |
| グラフ | Chart.js + react-chartjs-2 |
| データ永続化 | localStorage |

## セットアップ

```bash
# 1. APIキーを設定
cp backend/.env.example backend/.env
# backend/.env を編集して ANTHROPIC_API_KEY を設定

# 2. 依存関係インストール
cd backend && npm install
cd ../frontend && npm install

# 3. 起動（ターミナル2つ）
cd backend && npm run dev   # http://localhost:3001
cd frontend && npm run dev  # http://localhost:5173
```

## Git 運用ルール

**コードを変更するたびに必ず GitHub にプッシュすること。**

```bash
git add <変更ファイル>
git commit -m "コミットメッセージ"
git push origin main
```

- コミットメッセージは日本語・英語どちらでも可
- `git add .` は使わず、変更したファイルを個別に指定する
- `backend/.env` は絶対にコミットしない（`.gitignore` で除外済み）
- 破壊的操作（`--force` push、`reset --hard` など）は原則禁止

## 検証ロジック（App.jsx）

レシート登録時に以下の検証を行い、問題があれば画面上に黄色い警告バナーを表示する（登録自体はそのまま行う）。

| 検証内容 | 条件 |
|---|---|
| 負の金額チェック | `item.price < 0` の商品が1件以上ある場合 |
| 重複チェック | 既存エントリと `date` + `total` が一致する場合 |

警告バナーは ✕ ボタンで個別に閉じられる。

## 開発ルール

- コメントは日本語で記載する
- 不要なファイル（`.env`、認証情報など）は絶対にコミットしない
