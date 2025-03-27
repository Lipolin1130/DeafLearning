# 使用官方 Node.js 影像作為基礎
FROM node:18-slim

# 設定工作目錄
WORKDIR /src

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝所有的依賴
RUN npm instal
RUN npm install react-scripts
# 複製專案檔案到容器中
COPY . .

# 開放容器內的 3000 端口
EXPOSE 3000

# 設定啟動命令
CMD ["npm", "start"]