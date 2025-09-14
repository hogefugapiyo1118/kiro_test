FROM node:18-alpine

WORKDIR /app

# 依存関係のみ先にコピー (キャッシュ最適化)
COPY package.json package-lock.json ./

# 開発用途: lock が不整合な場合でも起動を優先したいので npm ci ではなく npm install
# 本番イメージを別で作る場合は multi-stage で npm ci を使う
RUN npm install --no-audit --no-fund

# 残りのソースをコピー
COPY . .

EXPOSE 3001

# デフォルトは開発サーバ (docker-compose で上書き可)
CMD ["npm", "run", "dev"]