#!/bin/bash

# WSL Docker開発環境セットアップスクリプト

echo "🚀 WSL Docker開発環境をセットアップしています..."

# Dockerが起動しているかチェック
if ! docker info > /dev/null 2>&1; then
    echo "❌ Dockerが起動していません。Dockerを起動してから再実行してください。"
    exit 1
fi

# Docker Composeが利用可能かチェック
if ! docker compose version > /dev/null 2>&1; then
    echo "❌ Docker Composeが利用できません。Docker Composeをインストールしてください。"
    exit 1
fi

echo "✅ Docker環境を確認しました"

# 既存のコンテナを停止・削除
echo "🧹 既存のコンテナをクリーンアップしています..."
docker compose down --volumes --remove-orphans

# イメージをビルド
echo "🔨 Dockerイメージをビルドしています..."
docker compose build --no-cache

# 開発環境を起動
echo "🚀 開発環境を起動しています..."
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# データベースの準備ができるまで待機
echo "⏳ データベースの準備を待っています..."
sleep 10

# ヘルスチェック
echo "🔍 サービスの状態を確認しています..."
docker compose ps

echo ""
echo "🎉 開発環境のセットアップが完了しました！"
echo ""
echo "📋 アクセス情報:"
echo "  - フロントエンド: http://localhost:3000"
echo "  - バックエンドAPI: http://localhost:3001"
echo "  - データベース: localhost:5432"
echo ""
echo "🛠️  便利なコマンド:"
echo "  - ログを確認: docker compose logs -f"
echo "  - 環境を停止: docker compose down"
echo "  - 環境を再起動: docker compose restart"
echo "  - データベースに接続: docker compose exec database psql -U dev_user -d vocabulary_db_dev"
echo ""