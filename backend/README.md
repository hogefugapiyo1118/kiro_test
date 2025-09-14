# Backend 開発ガイド

本ディレクトリは英単語学習アプリの API サーバ (Node.js + Express + TypeScript + Supabase) 実装です。

## 目次
1. 起動方法
2. API テスト手段の選択肢
   - dev-api.sh (CLI ツール)
   - REST Client (.http ファイル)
3. dev-api.sh の使い方
4. REST Client の使い方
5. 使い分け指針
6. フォルダ構成補足

---
## 1. 起動方法
開発:
```
npm run dev
```
ビルド & 本番起動:
```
npm run build
npm start
```

## 2. API テスト手段の選択肢
| 手段 | 利点 | 適用例 |
|------|------|--------|
| `scripts/dev-api.sh` | 繰り返し処理, シェル連携, CI で流用しやすい | バッチ投入 / 回帰検証 |
| REST Client (`rest-client/requests*.http`) | VS Code 内で視覚的, レスポンス履歴, トークン自動抽出 | 単発確認 / 開発中の素早い手動テスト |

両方併存。好みと用途に応じて使い分けます。

## 3. dev-api.sh の使い方
場所: `backend/scripts/dev-api.sh`

### 3.1 初回権限
```
chmod +x backend/scripts/dev-api.sh
```
(リポジトリに実行権限付与済みなら不要)

### 3.2 ログイン & トークン保存
```
cd backend
npm run api:login
```
環境変数でアカウント指定:
```
EMAIL=user@example.com PASSWORD=your-password npm run api:login
```
トークンはリポジトリルート `.dev_access_token` に保存 (Git 追跡外)。

### 3.3 主なコマンド
```
npm run api:vocab           # 一覧
QUERY=apple npm run api:vocab:q
ID=<UUID> npm run api:vocab:get
npm run api:vocab:create    # テンプレ表示→編集→Ctrl-D
ID=<UUID> npm run api:vocab:update
ID=<UUID> npm run api:vocab:delete
```
任意 HTTP:
```
bash ./scripts/dev-api.sh raw GET /vocabulary
bash ./scripts/dev-api.sh raw PUT /vocabulary/$ID '{"mastery_level":2}'
```

### 3.4 環境変数一覧
| 変数 | 役割 | デフォルト |
|------|------|------------|
| API_BASE | API ベース URL | http://localhost:3001/api |
| EMAIL | ログインメール | user@example.com |
| PASSWORD | ログインパスワード | your-password |
| TOKEN_FILE | トークン保存先 | .dev_access_token |

## 4. REST Client の使い方
ファイル: `backend/rest-client/requests.example.http` (共有用), `backend/rest-client/requests.http` (作業用・gitignore)

### 4.1 代表フロー
1. Login リクエスト ( `# @name login` ) を Send Request
2. 以降は `Authorization: Bearer {{login.response.body.$.token}}` が自動解決
3. 新しいトークンが必要になったら再度 Login を送信

### 4.2 作業用ファイル生成
```
cp backend/rest-client/requests.example.http backend/rest-client/requests.http
```
必要に応じてメール/パスワードを変更。

### 4.3 トークン参照パターン
例: `{{login.response.body.$.token}}` (レスポンス JSON の token フィールド)。
Supabase セッション形式の場合は `{{login.response.body.$.session.access_token}}` のように階層参照可能。

## 5. 使い分け指針
| ニーズ | 推奨手段 |
|--------|----------|
| 単発で挙動をすぐ見たい | REST Client |
| 複数エンドポイントを連続実行 / ループ | dev-api.sh |
| CI による簡易ヘルスチェック | dev-api.sh |
| 新メンバーへ API 共有 | example .http |
| JWT をコピペせず再利用したい | REST Client 自動抽出 |

## 6. フォルダ構成補足
```
backend/
  scripts/
    dev-api.sh            # CLI API ヘルパー
  rest-client/
    requests.example.http # 共有テンプレ
    requests.http         # 個人作業用 (gitignore)
  src/ ...                # アプリケーションコード
```

以上。
