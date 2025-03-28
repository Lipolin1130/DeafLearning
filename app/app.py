import os
import time
# import whisper
# import Levenshtein
# import openai  # GPT 相關部分（未使用可保留或刪除）
import requests  # 呼叫外部 API
import re
import base64
from pydub import AudioSegment  # 轉換音訊檔
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS

# from dotenv import load_dotenv
# load_dotenv()  # 讀取專案根目錄下的 .env 檔案

# from vosk import Model, KaldiRecognizer
# from gtts import gTTS
# import wave, json
# import io
import uuid

app = Flask(__name__)
CORS(app, origins=["http://140.134.25.53:3000"])

# # 設定 OpenAI API 金鑰（若有使用 GPT 部分，請確保在 .env 或環境變數中設定 OPENAI_API_KEY）
# openai.api_key = os.getenv("OPENAI_API_KEY")
# print("OpenAI API Key:", os.getenv("OPENAI_API_KEY"))

# # 載入 Whisper 模型（使用 "tiny"，適合測試）
# print("Loading Whisper model, please wait...")
# whisper_model = whisper.load_model("tiny")
# print("Whisper model loaded.")

# def calc_similarity(stt_text, target_text):
#     """
#     計算兩段文字的相似度 (0~1)
#     公式：1 - (Levenshtein 距離 / 平均長度)
#     """
#     stt_text = stt_text.strip()
#     target_text = target_text.strip()
#     if not stt_text or not target_text:
#         return 0.0
#     distance = Levenshtein.distance(stt_text, target_text)
#     avg_len = (len(stt_text) + len(target_text)) / 2
#     sim = 1 - distance / avg_len
#     return max(0, min(1, sim))

@app.route('/api/analyze', methods=['POST'])
def analyze():
    try:
        # 1. 取得上傳的音檔與參考文字 (前端需傳入 "file" 與 "text")
        audio_file = request.files.get("file")
        target_text = request.form.get("text", "")
        if not audio_file or not target_text:
            return jsonify({"error": "缺少 file 或 text"}), 400

        # 2. 建立專案目錄內的臨時資料夾（若不存在則自動建立）
        temp_dir = os.path.join(os.getcwd(), "temp")
        if not os.path.exists(temp_dir):
            os.makedirs(temp_dir)

        # 3. 定義原始暫存檔案名稱與完整路徑
        filename = secure_filename(audio_file.filename)
        temp_filename = f"temp_{int(time.time())}_{filename}"
        temp_path = os.path.join(temp_dir, temp_filename)
        audio_file.save(temp_path)
        print("原始暫存檔案路徑:", temp_path)
        print("檔案是否存在:", os.path.exists(temp_path))

        # 4. 使用 pydub 將錄音檔轉換成標準 PCM WAV 格式（單聲道、16位元、16kHz）
        try:
            audio = AudioSegment.from_file(temp_path)
            audio = audio.set_channels(1).set_frame_rate(16000).set_sample_width(2)
            converted_filename = f"converted_{temp_filename}"
            converted_path = os.path.join(temp_dir, converted_filename)
            # 強制指定參數： -ar 16000, -ac 1, -acodec pcm_s16le
            audio.export(converted_path, format="wav", parameters=["-ar", "16000", "-ac", "1", "-acodec", "pcm_s16le"])
            print("轉換後檔案路徑:", converted_path)
            print("轉換後檔案是否存在:", os.path.exists(converted_path))
        except Exception as conv_e:
            print("轉換音訊檔失敗:", conv_e)
            return jsonify({"error": f"轉換音訊檔失敗: {conv_e}"}), 500

        # 5. 呼叫外部評估 API，使用轉換後的檔案
        with open(converted_path, "rb") as f:
            files = {"audio": (filename, f, "audio/wav")}
            # 根據文件要求，參數名稱為 "text"
            data = {"text": target_text}
            eval_response = requests.post("http://140.134.25.53:8081/api/evaluate/", files=files, data=data)
        print("評估 API 回傳狀態碼:", eval_response.status_code)
        print("評估 API 回傳內容:", eval_response.text)

        # 6. 刪除原始及轉換後檔案
        if os.path.exists(temp_path):
            os.remove(temp_path)
        if os.path.exists(converted_path):
            os.remove(converted_path)

        if eval_response.status_code != 200:
            return jsonify({"error": f"評估 API 回傳錯誤，狀態碼：{eval_response.status_code}"}), 400

        eval_data = eval_response.json()
        # 組合評估結果，每項分數換行呈現
        evaluation_str = (
            f"準確度: {eval_data.get('accuracy_score', 'N/A')}%\n"
            f"流暢度: {eval_data.get('fluency_score', 'N/A')}%\n"
            f"完整度: {eval_data.get('completeness_score', 'N/A')}%\n"
            f"發音分數: {eval_data.get('pronunciation_score', 'N/A')}%."
        )
        if eval_data.get("errors"):
            evaluation_str += "\n錯誤資訊: " + str(eval_data.get("errors"))

        # 7. 根據文件，評估 API 應回傳 suggestion (string)
        suggestion = eval_data.get("suggestion", "")
        if suggestion:
            import re
            suggestion = re.sub(r'[#*]', '', suggestion).strip()
        else:
            suggestion = "無建議資訊。"

        # 8. 回傳 JSON 結果
        return jsonify({
            "evaluation": evaluation_str,
            "advice": suggestion,
            "raw": eval_data
        })

    except Exception as e:
        print("分析時發生錯誤:", e)
        return jsonify({"error": str(e)}), 500

# 以下為「自由對話」功能
# 設定後端 EchoLearn API 的 Base URL
ECHOLEARN_API_BASE = "http://140.134.25.53:8081/api"

@app.route('/speech-to-text', methods=['POST'])
def speech_to_text():
    if 'audio' not in request.files:
        return jsonify({'error': '沒有上傳音訊檔案'}), 400

    audio_file = request.files['audio']
    filename = secure_filename(audio_file.filename)
    files = {
        'audio': (filename, audio_file.stream, audio_file.mimetype)
    }
    
    # 呼叫後端 API 的語音辨識端點
    stt_url = f"{ECHOLEARN_API_BASE}/speech_to_text/"
    try:
        resp = requests.post(stt_url, files=files)
        if resp.status_code == 200:
            data = resp.json()
            return jsonify(data)
        else:
            return jsonify({
                'error': f'後端語音辨識失敗，狀態碼: {resp.status_code}',
                'response': resp.text
            }), 500
    except Exception as e:
        return jsonify({'error': f'呼叫後端語音辨識失敗: {str(e)}'}), 500

@app.route('/ai-response', methods=['POST'])
def ai_response():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': '沒有提供文字內容'}), 400

    user_text = data['text']
    print("Received chat prompt:", user_text)
    
    # 傳送給 /chat/response/ API 的參數：使用 query parameter chat_prompt
    payload = {"chat_prompt": user_text}
    ai_url = f"{ECHOLEARN_API_BASE}/chat/response/"
    try:
        # 僅傳送 query 參數
        resp = requests.post(ai_url, params=payload)
        print("chat/response/ status code:", resp.status_code)
        print("chat/response/ response text:", resp.text)
        if resp.status_code in [200, 201]:
            ai_response_data = resp.json()
            print("chat/response/ returned JSON:", ai_response_data)
            # 檢查回傳內容：先看 "text"，若不存在則檢查 "response"
            if "text" in ai_response_data and ai_response_data["text"].strip():
                ai_text = ai_response_data["text"]
            elif "response" in ai_response_data and ai_response_data["response"].strip():
                ai_text = ai_response_data["response"]
            else:
                return jsonify({'error': '後端 AI 未返回有效回應'}), 500
        else:
            return jsonify({
                'error': f'後端 AI 回應失敗，狀態碼: {resp.status_code}',
                'response': resp.text
            }), 500
    except Exception as e:
        return jsonify({'error': f'呼叫後端 AI 回應失敗: {str(e)}'}), 500

    # 移除 # 、 * 、 - 符號
    ai_text = re.sub(r'[#*-]', '', ai_text).strip()
    # 移除常見 emoji（例如表情符號）
    emoji_pattern = re.compile("[" 
                               u"\U0001F600-\U0001F64F"  # emoticons
                               u"\U0001F300-\U0001F5FF"  # symbols & pictographs
                               u"\U0001F680-\U0001F6FF"  # transport & map symbols
                               u"\U0001F1E0-\U0001F1FF"  # flags (iOS)
                               "]+", flags=re.UNICODE)
    ai_text = emoji_pattern.sub(r'', ai_text).strip()
    # 移除換行符號，避免 TTS API 因格式問題失敗
    ai_text = ai_text.replace("\n", " ").replace("\r", " ").strip()
    print("AI text after cleaning:", ai_text)

    # 呼叫後端 TTS API 取得音檔，但不寫入檔案，直接轉換成 Base64
    tts_url = f"{ECHOLEARN_API_BASE}/generate/tts/"
    params = {'text': ai_text}
    try:
        tts_resp = requests.get(tts_url, params=params)
        print("TTS status code:", tts_resp.status_code)
        if tts_resp.status_code == 200:
            # 將二進位音檔資料轉成 Base64 字串
            audio_base64 = base64.b64encode(tts_resp.content).decode('utf-8')
        else:
            print("TTS response text:", tts_resp.text)
            return jsonify({
                'error': f'後端TTS轉換失敗，狀態碼: {tts_resp.status_code}',
                'response': tts_resp.text
            }), 500
    except Exception as e:
        return jsonify({'error': f'呼叫後端TTS轉換失敗: {str(e)}'}), 500

    return jsonify({'text': ai_text, 'audio': audio_base64})

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')
