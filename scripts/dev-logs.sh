#!/bin/bash

# 開発環境のログを表示するスクリプト

echo "📋 開発環境のログを表示します..."
echo "Ctrl+C で終了できます"
echo ""

# 全サービスのログを表示
docker compose logs -f --tail=50