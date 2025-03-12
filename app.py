import os
import time
# import whisper
# import Levenshtein
# import openai  # GPT 相關部分（未使用可保留或刪除）
import requests  # 呼叫外部 API
from pydub import AudioSegment  # 轉換音訊檔
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS

# from dotenv import load_dotenv
# load_dotenv()  # 讀取專案根目錄下的 .env 檔案

# from vosk import Model, KaldiRecognizer
import wave, json
import uuid
# from gtts import gTTS
import io

app = Flask(__name__)
CORS(app)

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
            # 設置單聲道、16位元、16kHz
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
        evaluation_str = (
            f"準確度: {eval_data.get('accuracy_score', 'N/A')}%\n"
            f"流暢度: {eval_data.get('fluency_score', 'N/A')}%\n"
            f"完整度: {eval_data.get('completeness_score', 'N/A')}%\n"
            f"發音分數: {eval_data.get('pronunciation_score', 'N/A')}%."
        )
        if eval_data.get("errors"):
            evaluation_str += "\n錯誤資訊: " + str(eval_data.get("errors"))

        # # 7. 使用 GPT 根據評估結果生成更精準的建議
        # gpt_prompt = f"根據以下評估結果，請提出具體的發音改進建議：\n{evaluation_str}\n請用2-3句中文回答。"
        # chat_resp = openai.ChatCompletion.create(
        #     model="gpt-3.5-turbo",  # 若有 GPT-4 權限，可改為 "gpt-4"
        #     messages=[
        #         {"role": "system", "content": "你是一位專業的中文發音老師。"},
        #         {"role": "user", "content": gpt_prompt}
        #     ],
        #     temperature=0.7
        # )
        # gpt_advice = chat_resp["choices"][0]["message"]["content"].strip()

        # 8. 回傳 JSON 結果
        return jsonify({
            "evaluation": evaluation_str,
            # "advice": gpt_advice,
            "raw": eval_data
        })

    except Exception as e:
        print("分析時發生錯誤:", e)
        return jsonify({"error": str(e)}), 500

# 以下為「自由活動」功能
# if not os.path.exists("model"):
#     raise Exception("請下載中文 Vosk 模型並放置在 'model' 資料夾中，參考：https://alphacephei.com/vosk/models")
# model = Model("model")

@app.route('/speech-to-text', methods=['POST'])
def speech_to_text():
    if 'audio' not in request.files:
        return jsonify({'error': '沒有上傳音訊檔案'}), 400

    audio_file = request.files['audio']
    audio_bytes = audio_file.read()
    try:
        wf = wave.open(io.BytesIO(audio_bytes), "rb")
    except Exception as e:
        return jsonify({'error': f'無法讀取音訊檔案: {e}'}), 400

    if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getcomptype() != "NONE":
        return jsonify({'error': '音訊格式不正確，請使用單聲道、16位元、無壓縮的 wav 檔案'}), 400

    rec = KaldiRecognizer(model, wf.getframerate())
    result_text = ""
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            res = json.loads(rec.Result())
            result_text += res.get("text", "") + " "
    res = json.loads(rec.FinalResult())
    result_text += res.get("text", "")
    result_text = result_text.strip()
    if not result_text:
        result_text = "無法辨識語音"
    return jsonify({'text': result_text})

@app.route('/ai-response', methods=['POST'])
def ai_response():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': '沒有提供文字內容'}), 400

    user_text = data['text']
    ai_text = f"你剛才說的是：{user_text}"
    try:
        tts = gTTS(ai_text, lang='zh-tw')
        filename = f"static/audio/{uuid.uuid4().hex}.mp3"
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        tts.save(filename)
    except Exception as e:
        return jsonify({'error': f'文字轉語音失敗: {e}'}), 500

    audio_url = request.host_url + filename
    return jsonify({'text': ai_text, 'audio': audio_url})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
