import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FaMicrophone, FaArrowLeft, FaCamera, FaPhone, FaBook, FaVolumeUp } from "react-icons/fa";
import "./FreeConversations.css";

const FreeConversations = () => {
  const [messages, setMessages] = useState([]);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const audioRefs = useRef([]);
  
  const handleRecord = async () => {
    if (!recording) {
      setRecording(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunks.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setMessages((prev) => [...prev, { type: "user", audio: audioUrl }]);

        const text = await convertSpeechToText(audioBlob);
        const aiReply = await getAiResponse(text);

        setMessages((prev) => [...prev, { type: "ai", audio: aiReply.audio, text: aiReply.text }]);
      };

      mediaRecorder.start();
    } else {
      setRecording(false);
      mediaRecorderRef.current?.stop();
    }
  };

  const convertSpeechToText = async (audioBlob) => {
    return "你好，這是轉換的文本內容";
  };

  const getAiResponse = async (text) => {
    return {
      text: "這是一個 AI 生成的回應！",
      audio: "path-to-ai-generated-audio.mp3",
    };
  };

  const adjustVolume = (index, event) => {
    if (audioRefs.current[index]) {
      audioRefs.current[index].volume = event.target.value;
    }
  };

  return (
    <div className="chat-container">
      <div className="every-title-area">
        <img
          src="/images/heart-hand.png"
          alt="手語愛心"
          className="every-heart-hand"
        />
        <h1>生聲 — 自由對話</h1>
      </div>
      <div className="chat-box">
        <Link to="/dialogue" className="back-button">
          <FaArrowLeft size={24} />
        </Link>
        <h2 className="chat-title">AI 導師</h2>
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              <span className="avatar">{msg.type === "ai" ? "🤖" : "😊"}</span>
              <audio controls className="audio-player" ref={(el) => (audioRefs.current[index] = el)}>
                <source src={msg.audio} type="audio/mp3" />
                Your browser does not support the audio element.
              </audio>
              <div className="volume-control">
                <FaVolumeUp />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  onChange={(e) => adjustVolume(index, e)}
                />
              </div>
              {msg.type === "ai" && msg.text && (
                <button className="book-icon" onClick={() => alert(msg.text)}>
                  <FaBook size={20} />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="chat-controls">
          <button className="icon-button">
            <FaCamera size={24} />
          </button>
          <button onClick={handleRecord} className="record-button">
            {recording ? "停止" : <FaMicrophone size={24} />}
          </button>
          <button className="icon-button">
            <FaPhone size={24} />
          </button>
        </div>
      </div>
      <Link to="/dialogue" className="go-back-button">回上一頁</Link>
    </div>
  );
};

export default FreeConversations;
