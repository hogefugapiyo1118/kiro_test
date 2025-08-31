# 英単語学習アプリ

効率的な英単語学習を支援するWebアプリケーション。フラッシュカード学習機能と進捗管理機能を提供します。

## 技術スタック

### フロントエンド
- React 18 + TypeScript
- Tailwind CSS
- React Router
- Vite

### バックエンド
- Node.js + Express.js
- TypeScript
- Supabase (PostgreSQL + Auth)

### ホスティング
- Render (Web Service + Static Site)

## セットアップ手順

### 1. Supabaseプロジェクト作成

1. [Supabase](https://supabase.com)でアカウント作成
2. 新しいプロジェクトを作成
3. プロジェクトURL、anon key、service role keyを取得

### 2. データベーススキーマ設定

1. Supabaseダッシュボードの「SQL Editor」を開く
2. `database/schema.sql`の内容をコピー&ペースト
3. 実行してテーブルとRLSポリシーを作成

### 3. 環境変数設定

#### バックエンド
```bash
cd backend
cp .env.example .env
```

`.env`ファイルを編集:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

#### フロントエンド
```bash
cd frontend
cp .env.example .env
```

`.env`ファイルを編集:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3001/api
```

### 4. 依存関係インストール

#### バックエンド
```bash
cd backend
npm install
```

#### フロントエンド
```bash
cd frontend
npm install
```

### 5. 開発サーバー起動

#### バックエンド
```bash
cd backend
npm run dev
```

#### フロントエンド
```bash
cd frontend
npm run dev
```

## 利用可能なスクリプト

### バックエンド
- `npm run dev` - 開発サーバー起動（nodemon）
- `npm run build` - TypeScriptビルド
- `npm start` - 本番サーバー起動
- `npm test` - テスト実行

### フロントエンド
- `npm run dev` - 開発サーバー起動（Vite）
- `npm run build` - 本番ビルド
- `npm run preview` - ビルド結果プレビュー
- `npm test` - テスト実行

## API エンドポイント

### 認証
- `POST /api/auth/login` - ログイン
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/logout` - ログアウト

### 単語管理
- `GET /api/vocabulary` - 単語一覧取得
- `POST /api/vocabulary` - 単語作成
- `GET /api/vocabulary/:id` - 単語詳細取得
- `PUT /api/vocabulary/:id` - 単語更新
- `DELETE /api/vocabulary/:id` - 単語削除

### 学習機能
- `GET /api/study/session` - 学習セッション開始
- `POST /api/study/result` - 学習結果記録

### ダッシュボード
- `GET /api/dashboard/stats` - 統計データ取得
- `GET /api/dashboard/progress` - 学習進捗取得

## デプロイ

### Renderでのデプロイ

1. GitHubリポジトリを作成してコードをプッシュ
2. Renderでアカウント作成
3. Web Serviceを作成（バックエンド用）
4. Static Siteを作成（フロントエンド用）
5. 環境変数を設定

詳細な手順は後のタスクで実装予定です。

## 開発状況

- [x] プロジェクト初期設定とSupabase環境構築
- [ ] データベーススキーマとモデル実装
- [ ] 認証システム実装
- [ ] 単語管理API実装
- [ ] フロントエンド単語管理UI実装
- [ ] フラッシュカード学習機能実装
- [ ] ダッシュボード・統計機能実装
- [ ] レスポンシブデザイン実装
- [ ] エラーハンドリングとバリデーション強化
- [ ] テスト実装
- [ ] パフォーマンス最適化
- [ ] Renderデプロイ設定

## ライセンス

MIT License