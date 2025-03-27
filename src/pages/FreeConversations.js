import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FaMicrophone, FaArrowLeft, FaBook } from "react-icons/fa";
import "./FreeConversations.css";

// Helper: 將字串寫入 DataView
function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Helper: 將 AudioBuffer 編碼成 WAV Blob（16-bit PCM）
function encodeWAV(audioBuffer) {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitsPerSample = 16;
  const blockAlign = numChannels * bitsPerSample / 8;
  const byteRate = sampleRate * blockAlign;
  const samples = audioBuffer.length;
  const dataSize = samples * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // 撰寫 WAV 標頭
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  const channelData = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channelData.push(audioBuffer.getChannelData(ch));
  }
  for (let i = 0; i < samples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = channelData[ch][i];
      sample = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }
  return new Blob([view], { type: "audio/wav" });
}

const FreeConversations = () => {
  const [messages, setMessages] = useState([]);
  const [recording, setRecording] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const BASE_URL = "http://140.134.25.53:5000";

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
          const rawBlob = new Blob(audioChunksRef.current);
          const arrayBuffer = await rawBlob.arrayBuffer();
          const audioContext = new AudioContext();
          const decodedAudio = await audioContext.decodeAudioData(arrayBuffer);
          const wavBlob = encodeWAV(decodedAudio);
          const audioUrl = URL.createObjectURL(wavBlob);

          setMessages((prev) => [
            ...prev,
            { type: "user", audio: audioUrl }
          ]);

          const sttText = await convertSpeechToText(wavBlob);

          if (sttText === "無法辨識語音" || sttText === "語音辨識失敗") {
            openModal("語音辨識失敗，請確認麥克風設定或再試一次！");
            return;
          }

          const aiResponse = await getAiResponse(sttText);
          const aiText = aiResponse.text;
          const aiAudioUrl = aiResponse.audio;

          setMessages((prev) => [
            ...prev,
            { type: "ai", audio: aiAudioUrl, text: aiText }
          ]);

          const newRecord = {
            date: new Date().toLocaleString(),
            content: `學生：<span class="student-label">${sttText}</span><br>AI導師：<span class="ai-label">${aiText}</span>`,
          };          
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

  const convertSpeechToText = async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");

    try {
      const response = await fetch(`${BASE_URL}/speech-to-text`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`STT API 錯誤: ${response.status}`);
      }
      const data = await response.json();
      return data.text || "無法辨識語音";
    } catch (error) {
      console.error("convertSpeechToText error:", error);
      return "語音辨識失敗";
    }
  };

  // 修改 getAiResponse，使用 /ai-response 並傳入 chat_prompt
  const getAiResponse = async (userText) => {
    console.log("userText:", userText); // 檢查是否有傳入內容
    try {
      const response = await fetch(`${BASE_URL}/ai-response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userText }),
      });
      if (!response.ok) {
        throw new Error(`AI API 錯誤: ${response.status}`);
      }
      const data = await response.json();
      console.log("後端回傳 JSON 格式：", data);
      return data;
    } catch (error) {
      console.error("getAiResponse error:", error);
      return { text: "無法取得 AI 回應", audio: "" };
    }
  };  

  const openModal = (text) => {
    setModalText(text);
    setModalOpen(true);
  };

  return (
    <div className="chat-container">
      <div className="every-title-area">
        <img src="/images/heart-hand.png" alt="手語愛心" className="every-heart-hand" />
        <h1>生聲 — 自由對話</h1>
      </div>
      <div className="chat-box">
        <Link to="/dialogue" className="back-button">
          <FaArrowLeft size={24} />
        </Link>
        <h2 className="chat-title">AI 導師</h2>
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
                {msg.type === "ai" && msg.text && (
                  <button className="book-icon" onClick={() => openModal(msg.text)}>
                    <FaBook size={20} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
        <div className="chat-controls">
          <button className="icon-button">{/* 可放其他 icon */}</button>
          <button onClick={handleRecord} className="record-button">
            {recording ? "。。。" : <FaMicrophone size={24} />}
          </button>
          <button className="icon-button">{/* 可放其他 icon */}</button>
        </div>
      </div>
      <Link to="/review" className="go-back-button">
        交談回顧
      </Link>
      {modalOpen && (
        <div className="modal" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setModalOpen(false)}>
              &times;
            </span>
            <p>{modalText}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreeConversations;
