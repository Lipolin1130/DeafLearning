# 使用官方的 Python 影像作為基礎
FROM python:3.11-slim

# 設定工作目錄
WORKDIR /app

# 安裝系統依賴
RUN apt-get update && apt-get install -y \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# 複製 requirements.txt 並安裝 Python 依賴
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 複製整個專案檔案到容器中
COPY . .

# 開放 Flask 的 5000 端口
EXPOSE 5000

# 設定啟動命令
CMD ["python", "app.py"]