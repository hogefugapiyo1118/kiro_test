# WSL Docker開発環境

このプロジェクトはWSL上のDockerコンテナで開発環境を構築できます。

## 前提条件

- WSL2がインストールされていること
- Docker Desktop for WindowsまたはWSL内にDockerがインストールされていること
- Docker Composeが利用可能であること

## クイックスタート

### 1. 開発環境の起動

```bash
# セットアップスクリプトを実行
./scripts/dev-setup.sh
```

### 2. 手動での起動（詳細制御が必要な場合）

```bash
# コンテナをビルド
docker compose build

# 開発環境を起動
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# ログを確認
docker compose logs -f
```

## アクセス情報

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:3001
- **データベース**: localhost:5432
  - ユーザー: `dev_user`
  - パスワード: `dev_password`
  - データベース名: `vocabulary_db_dev`

## 便利なコマンド

### 開発中によく使うコマンド

```bash
# ログを確認
./scripts/dev-logs.sh
# または
docker compose logs -f

# 特定のサービスのログを確認
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f database

# コンテナの状態を確認
docker compose ps

# 環境を停止
docker compose down

# 環境を再起動
docker compose restart

# 特定のサービスを再起動
docker compose restart backend
```

### データベース操作

```bash
# データベースに接続
docker compose exec database psql -U dev_user -d vocabulary_db_dev

# データベースのバックアップ
docker compose exec database pg_dump -U dev_user vocabulary_db_dev > backup.sql

# SQLファイルを実行
docker compose exec -T database psql -U dev_user -d vocabulary_db_dev < your_file.sql
```

### 開発環境のリセット

```bash
# 全てのコンテナとボリュームを削除（データも削除されます）
docker compose down --volumes --remove-orphans

# イメージを再ビルド
docker compose build --no-cache

# 環境を再起動
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

## トラブルシューティング

### ポートが既に使用されている場合

```bash
# 使用中のポートを確認
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001
netstat -tulpn | grep :5432

# プロセスを終了
sudo kill -9 <PID>
```

### WSL固有の問題

```bash
# WSLのメモリ使用量を確認
free -h

# WSLを再起動（Windows側で実行）
wsl --shutdown
wsl
```

### Docker関連の問題

```bash
# Dockerサービスの状態を確認
sudo service docker status

# Dockerサービスを再起動
sudo service docker restart

# Docker Composeのバージョンを確認
docker compose version
```

## ファイル構成

```
.
├── docker-compose.yml          # メインのDocker Compose設定
├── docker-compose.dev.yml      # 開発環境用の追加設定
├── .dockerignore              # Docker用の除外ファイル
├── backend/
│   ├── Dockerfile             # バックエンド用Dockerfile
│   └── .dockerignore          # バックエンド用除外ファイル
├── frontend/
│   ├── Dockerfile             # フロントエンド用Dockerfile
│   └── .dockerignore          # フロントエンド用除外ファイル
└── scripts/
    ├── dev-setup.sh           # 開発環境セットアップスクリプト
    └── dev-logs.sh            # ログ表示スクリプト
```

## 注意事項

- ホットリロードが有効になっているため、ソースコードの変更は自動的に反映されます
- データベースのデータは永続化されますが、`docker compose down --volumes`を実行すると削除されます
- WSL環境では、ファイルの権限に注意してください
- 初回起動時はイメージのダウンロードとビルドに時間がかかります