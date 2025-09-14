#!/usr/bin/env bash
set -euo pipefail

API_BASE="${API_BASE:-http://localhost:3001/api}"
EMAIL="${EMAIL:-user@example.com}"
PASSWORD="${PASSWORD:-your-password}"
TOKEN_FILE="${TOKEN_FILE:-.dev_access_token}" # ルートディレクトリに作成

usage() {
  cat <<EOF
Dev API Helper
Usage: $0 <command> [args]
Commands:
  login                 ログインしてアクセストークン保存
  vocab:list [q]        単語一覧 (オプション: 検索クエリ)
  vocab:get <id>        単語詳細
  vocab:create          標準入力/テンプレで新規作成
  vocab:update <id>     標準入力で更新
  vocab:delete <id>     削除
  raw <METHOD> <PATH>   任意リクエスト (例: raw GET /vocabulary)

環境変数:
  API_BASE  (default: http://localhost:3001/api)
  EMAIL     (login email)
  PASSWORD  (login password)
EOF
}

require_token() {
  if [[ ! -f "$TOKEN_FILE" ]]; then
    echo "[ERROR] トークンがありません。まず 'login' 実行。" >&2
    exit 1
  fi
  ACCESS_TOKEN=$(cat "$TOKEN_FILE")
}

cmd_login() {
  echo "[INFO] Logging in $EMAIL ..." >&2
  RESP=$(curl -s -X POST "$API_BASE/auth/login" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
  TOKEN=$(echo "$RESP" | jq -r '.token // .access_token // empty') || true
  if [[ -z "$TOKEN" || "$TOKEN" == "null" ]]; then
    echo "[ERROR] トークン取得失敗: $RESP" >&2
    exit 1
  fi
  echo "$TOKEN" > "$TOKEN_FILE"
  echo "[OK] Saved token to $TOKEN_FILE" >&2
}

cmd_vocab_list() {
  require_token
  local q="${1:-}"
  local url="$API_BASE/vocabulary"
  if [[ -n "$q" ]]; then
    url+="?query=$(printf '%s' "$q" | jq -s -R -r @uri)"
  fi
  curl -s -H "Authorization: Bearer $ACCESS_TOKEN" "$url" | jq
}

cmd_vocab_get() {
  require_token
  local id="${1:?id required}"
  curl -s -H "Authorization: Bearer $ACCESS_TOKEN" "$API_BASE/vocabulary/$id" | jq
}

cmd_vocab_create() {
  require_token
  if [ -t 0 ]; then
    cat <<'TEMPLATE'
{
  "english_word": "sample",
  "example_sentence": "Sample sentence.",
  "difficulty_level": 1,
  "japanese_meanings": [
    {"meaning": "例", "part_of_speech": "noun", "usage_note": ""}
  ]
}
TEMPLATE
    echo "--- 上記 JSON を編集して Ctrl-D で送信 (再実行でテンプレ再表示) ---" >&2
  fi
  DATA=$(cat)
  curl -s -X POST "$API_BASE/vocabulary" \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d "$DATA" | jq
}

cmd_vocab_update() {
  require_token
  local id="${1:?id required}"; shift
  if [ -t 0 ]; then
    cat <<'TEMPLATE'
{
  "example_sentence": "Updated sentence.",
  "mastery_level": 1,
  "japanese_meanings": [
    {"meaning": "更新例", "part_of_speech": "noun", "usage_note": ""}
  ]
}
TEMPLATE
    echo "--- 上記 JSON を編集して Ctrl-D で送信 ---" >&2
  fi
  DATA=$(cat)
  curl -s -X PUT "$API_BASE/vocabulary/$id" \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d "$DATA" | jq
}

cmd_vocab_delete() {
  require_token
  local id="${1:?id required}"
  curl -s -X DELETE "$API_BASE/vocabulary/$id" \
    -H "Authorization: Bearer $ACCESS_TOKEN" | jq
}

cmd_raw() {
  require_token
  local method="${1:?METHOD required}"; shift
  local path="${1:?PATH required}"; shift
  local body="${1:-}"
  if [[ -n "$body" ]]; then
    curl -s -X "$method" "$API_BASE$path" -H 'Content-Type: application/json' -H "Authorization: Bearer $ACCESS_TOKEN" -d "$body" | jq
  else
    curl -s -X "$method" "$API_BASE$path" -H "Authorization: Bearer $ACCESS_TOKEN" | jq
  fi
}

main() {
  local cmd="${1:-help}"; shift || true
  case "$cmd" in
    login) cmd_login "$@";;
    vocab:list) cmd_vocab_list "$@";;
    vocab:get) cmd_vocab_get "$@";;
    vocab:create) cmd_vocab_create "$@";;
    vocab:update) cmd_vocab_update "$@";;
    vocab:delete) cmd_vocab_delete "$@";;
    raw) cmd_raw "$@";;
    -h|--help|help) usage;;
    *) echo "Unknown command: $cmd" >&2; usage; exit 1;;
  esac
}

main "$@"
