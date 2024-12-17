# ベースイメージを指定
FROM node:22-slim

# 作業ディレクトリを設定
WORKDIR /usr/src/app

# package.json と package-lock.json をコピーして依存関係をインストール
COPY package.json package-lock.json ./
RUN npm install

# 必要なポートを開放
EXPOSE 3010

# 実行用に src と dist をマウントする
CMD ["node", "dist/index.js"]
