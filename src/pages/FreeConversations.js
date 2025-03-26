import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaMicrophone,
  FaArrowLeft,
  FaCamera,
  FaPhone,
  FaBook,
} from "react-icons/fa";
import "./FreeConversations.css";

const FreeConversations = () => {
  const [messages, setMessages] = useState([]);
  const [recording, setRecording] = useState(false);

  // 用於錄音
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // 後端 API URL (請依照實際部署調整)
  const BASE_URL = "http://140.134.25.53:8081/api";

  // 開始 / 停止錄音
  const handleRecord = async () => {
    if (!recording) {
      setRecording(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
          const audioUrl = URL.createObjectURL(audioBlob);

          // 1. 在前端顯示使用者剛錄好的語音訊息 (type: 'user')
          setMessages((prev) => [
            ...prev,
            {
              type: "user",
              audio: audioUrl,
            },
          ]);

          // 2. 語音轉文字：呼叫後端 /speech_to_text/ API
          const sttText = await convertSpeechToText(audioBlob);

          // 3. AI 生成回應 (Placeholder)
          const aiText = await getAiResponse(sttText);

          // 4. 呼叫文字轉語音 API，取得 AI 的語音回覆
          const aiAudioUrl = await getTtsAudio(aiText);

          // 5. 在前端顯示 AI 的語音與文字訊息 (type: 'ai')
          setMessages((prev) => [
            ...prev,
            {
              type: "ai",
              audio: aiAudioUrl,
              text: aiText,
            },
          ]);

          // 6. 將本次對話記錄存入 localStorage 以便 ReviewConversations.js 讀取
          const newRecord = {
            date: new Date().toLocaleString(),
            content: `使用者：${sttText}\nAI：${aiText}`,
          };

          // 讀取現有的對話紀錄（若無則建立空陣列）
          const stored = localStorage.getItem("conversations");
          const existingConversations = stored ? JSON.parse(stored) : [];
          existingConversations.push(newRecord);
          localStorage.setItem("conversations", JSON.stringify(existingConversations));
        };

        mediaRecorder.start();
      } catch (error) {
        console.error("無法錄音：", error);
        setRecording(false);
      }
    } else {
      setRecording(false);
      mediaRecorderRef.current?.stop();
    }
  };

  // 語音轉文字：呼叫後端 /speech_to_text/ API
  const convertSpeechToText = async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");

    try {
      const response = await fetch(`${BASE_URL}/speech_to_text/`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`STT API 錯誤: ${response.status}`);
      }
      const data = await response.json();
      // 假設後端回傳格式: { text: "辨識後的文字" }
      return data.text || "無法辨識語音";
    } catch (error) {
      console.error("convertSpeechToText error:", error);
      return "語音辨識失敗";
    }
  };

  // AI 生成回應 (Placeholder)：未來可整合 GPT 或其他 NLP 模型
  const getAiResponse = async (userText) => {
    return `你剛才說的是：${userText}`;
  };

  // 文字轉語音：呼叫後端 /generate/tts/ API，回傳 wav 檔案
  const getTtsAudio = async (text) => {
    try {
      const response = await fetch(
        `${BASE_URL}/generate/tts/?text=${encodeURIComponent(text)}`
      );
      if (!response.ok) {
        throw new Error(`TTS API 錯誤: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const audioBlob = new Blob([arrayBuffer], { type: "audio/wav" });
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error("getTtsAudio error:", error);
      return "";
    }
  };

  return (
    <div className="chat-container">
      {/* 上方標題區域 */}
      <div className="every-title-area">
        <img
          src="/images/heart-hand.png"
          alt="手語愛心"
          className="every-heart-hand"
        />
        <h1>生聲 — 自由對話</h1>
      </div>

      {/* 聊天框 */}
      <div className="chat-box">
        <Link to="/dialogue" className="back-button">
          <FaArrowLeft size={24} />
        </Link>
        <h2 className="chat-title">AI 導師</h2>

        {/* 訊息列表 */}
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="empty-message">請點擊錄音鍵開始對話</div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`message ${msg.type}`}>
                <span className="avatar">{msg.type === "ai" ? "🤖" : "😊"}</span>
                <audio controls className="audio-player">
                  <source src={msg.audio} type="audio/wav" />
                  Your browser does not support the audio element.
                </audio>
                {/* 書本圖示：顯示 AI 回覆文字內容 */}
                {msg.type === "ai" && msg.text && (
                  <button
                    className="book-icon"
                    onClick={() => alert(`AI 回覆文字：${msg.text}`)}
                  >
                    <FaBook size={20} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* 底部功能按鈕 */}
        <div className="chat-controls">
          <button className="icon-button">
            {/* 這裡可以放 icon */}
          </button>
          <button onClick={handleRecord} className="record-button">
            {recording ? "。。。" : <FaMicrophone size={24} />}
          </button>
          <button className="icon-button">
            {/* 這裡可以放 icon */}
          </button>
        </div>
      </div>

      {/* 回上一頁的按鈕 */}
      <Link to="/dialogue" className="go-back-button">
        回上一頁
      </Link>
    </div>
  );
};

export default FreeConversations;
