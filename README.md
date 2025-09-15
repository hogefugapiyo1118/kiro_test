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
- [x] データベーススキーマとモデル実装
- [x] 認証システム実装
- [x] 単語管理API実装
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

## 初期環境構築 (一度だけ実施)

WSL2 Ubuntu 上にツールを導入し、Supabase プロジェクト・ローカル開発の土台を作ります。

### 1. 前提条件 (WSL2 Ubuntu)
| 項目 | 内容 |
|------|------|
| Windows 10/11 | WSL2 有効化済み (Ubuntu ディストリ) |
| Docker Desktop | WSL2 統合を有効化 (Settings > Resources > WSL integration) |
| Node.js (WSL内) | v18+ 推奨 |

確認コマンド:
```bash
node -v
docker compose version
wsl.exe -l -v   # PowerShell から (状態確認)
```

### 2. Supabase CLI インストール
```bash
npm install supabase --save-dev
```

### 3. Supabase 初期化 & 初回起動
```bash
npx supabase init   # 初回のみ
npx supabase start  # Auth / REST / Realtime / Storage / Studio 起動
```
出力される `API URL`, `anon key`, `service_role key` を控えて `.env` に反映します。

### 4. 環境変数ファイル作成
`backend/.env`:
```
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```
`frontend/.env`:
```
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key
VITE_API_URL=http://localhost:3001/api
```

### 5. 依存関係インストール
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 6. スキーマ、関数適用 (初期)
最初は `database/schema.sql`, `database/functions.sql` を Studio (http://localhost:54323) の SQL Editor で実行。
差分管理導入時:
```bash
npx supabase db diff -f init
npx supabase db push
```

### 7. ユーザ作成
Studio (http://localhost:54323) の Authentication > Users > Add user で新規ユーザの作成

---

## 開発環境での実行 (日常作業)

ここでは初期構築済みであることを前提に日常的な操作をまとめます。

### A. 起動 / 停止
```bash
# Supabase (別ターミナル)
npx supabase start

# アプリ (backend + frontend)
docker compose -f docker-compose.dev.yml up --build

# バックグラウンド化
docker compose -f docker-compose.dev.yml up -d

# 停止
docker compose -f docker-compose.dev.yml down
npx supabase stop
```

### B. 状態確認
```bash
# Supabase
npx supabase status
# アプリ (backend + frontend)
docker compose ps
```

### C. 動作確認
```bash
# Supabase (postgres/CLI)
psql -h localhost -p 54322 -U postgres -d postgres # PW:postgres
# Supabase Studio (GUI)
http://localhost:54323
```

### D. マイグレーション運用
```bash
# 変更から差分作成
npx supabase db diff -f feature_xyz

# 適用
npx supabase db push
```

### E. データリセット (破壊的)
```bash
npx supabase db reset
```
再適用後に必要ならサンプル投入スクリプトを実行 (今後 `npm run seed` 予定)。

### F. Edge Functions
```bash
npx supabase functions new hello
npx supabase functions serve hello
```

### G. 手動(非Docker) デバッグ起動
```bash
npx supabase start
cd backend && npm run dev
cd frontend && npm run dev
```

### H. トラブルシュート (WSL)
| 症状 | 対処 |
|------|------|
| ポート競合 | `npx supabase stop` 後 `docker ps -a` で残存確認・削除 |
| Studio 503 | `npx supabase status` でコンテナ稼働確認、ポート 54323 の競合調査 |
| 401 Unauthorized | `.env` が最新キーか再確認、Supabase 再起動 |
| Migration 未反映 | `supabase/migrations` のファイル名・順序を確認後 `db push` |
| Realtime 不着 | ブラウザ DevTools WS エラーログと `supabase start` のログを確認 |

### I. 本番との差異 (再掲)
| 項目 | ローカル(WSL) | 本番(Render + Supabase) |
|------|---------------|-------------------------|
| URL | http://localhost:54321 | https://<project>.supabase.co |
| キー | CLI 自動生成 | Supabase ダッシュボードから取得 |
| ログ | CLI / Docker | Supabase & Render |
| Secrets 管理 | .env ローカル | Render ダッシュボード + Supabase Settings |