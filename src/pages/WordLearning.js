import React, { useContext, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaMicrophone } from 'react-icons/fa'; 
import "./WordLearning.css";

// To remember the which story and frames
import { StoryContext } from "./StoryContext";

// Save the ai videos and picures
import { wordData } from "./WordData";

// Save the collection word and show on word collection page
import { CollectionContext } from "./CollectionContext";

function WordLearning() {
  const { word } = useParams();
  const navigate = useNavigate();
  const { storyState } = useContext(StoryContext);
  const { favoriteWords, addWord, removeWord } = useContext(CollectionContext);

  const isFavorited = favoriteWords.includes(word);
  // 從對照表中取對應的媒體，如果沒有則使用 default
  const media = wordData[word] || wordData.default;

  // 錄音相關
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);

  // 分析結果（評估分數與建議）
  const [evaluation, setEvaluation] = useState("");
  const [advice, setAdvice] = useState("");

  // 用來控制錄音與影片
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const videoRef = useRef(null);

  // 開始錄音
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      // 收集錄音資料
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      // 錄音結束時處理 Blob
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);

        // 錄音停止後呼叫後端分析
        handleAnalyze(audioBlob);

        // 恢復影片播放
        if (videoRef.current) {
          videoRef.current.play();
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);

      // 錄音開始時，暫停影片
      if (videoRef.current) {
        videoRef.current.pause();
      }
    } catch (error) {
      console.error("無法開始錄音:", error);
    }
  };

  // 停止錄音
  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  // 切換錄音按鈕
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // 呼叫後端 /api/analyze，進行發音評估
  const handleAnalyze = async (audioBlob) => {
    try {
      if (!word) {
        setEvaluation("--");
        setAdvice("請先選擇要練習的單字");
        return;
      }

      const formData = new FormData();
      formData.append("file", audioBlob, `_userAudio.wav`);
      formData.append("text", word);

      const res = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.error) {
        console.error("後端錯誤:", data.error);
        setEvaluation("失敗");
        setAdvice("後端錯誤：" + data.error);
      } else {
        setEvaluation(data.evaluation || "--");
        setAdvice(data.advice || "請再試一次");
      }
    } catch (error) {
      console.error("分析時發生錯誤:", error);
      setEvaluation("失敗");
      setAdvice("分析錯誤，請稍後再試");
    }
  };

  const handleFavorite = () => {
    if (isFavorited) {
      removeWord(word);
    } else {
      addWord(word);
    }
  };

  // 返回故事
  const handleBack = () => {
    navigate(`/story/classic/${storyState.topic}`);
  };

  return (
    <div className="word-learning-container">
      {/* 頁面上方標題 */}
      <div className="every-title-area">
        <img
          src="/images/heart-hand.png"
          alt="手語愛心"
          className="every-heart-hand"
        />
        <h1>生聲 — 故事學習：學習介面</h1>
      </div>

    {/* 單字顯示 */}
    <div className="learn-word-block">
      <h1>詞語：{word}</h1>
      <p>請大聲朗讀這個詞語以練習發音</p>
    </div>

    {/* AI 口型影片 */}
    <div className="learn-ai-block">
      {media.video && (
        <video
          ref={videoRef}
          className="learn-ai-media"
          src={media.video}
          autoPlay
          loop
          controls
        />
      )}
    </div>

    {/* 評估結果區塊 */}
    <div className="learn-middle-panel">
      {(evaluation || advice) ? (
        <>
          {evaluation && <p className="learn-eval-string">{evaluation}</p>}
          {advice && (
            <p className="learn-advice-string">
              <span className="learn-advice-label">建議：</span>
              <span>{advice}</span>
            </p>
          )}
        </>
      ) : (
        <p className="learn-eval-string">
          點擊錄音練習，獲得發音指導！
        </p>
      )}
    </div>

    {/* 錄音按鈕 */}
    <div className="learn-controls">
      <button className={`learn-record-button ${isRecording ? 'recording' : ''}`} onClick={toggleRecording}>
        <span className="learn-record-text">{isRecording ? "停止" : "錄音"}</span>
        <FaMicrophone className="learn-mic-icon" />
      </button>
    </div>

    {/* 收藏按鈕 */}
    <button className={`learn-fav-button ${isFavorited ? "favorited" : ""}`} onClick={handleFavorite}>
      {isFavorited ? "取消" : "收藏"}
    </button>

      {/* 返回故事 */}
      <button onClick={handleBack} className="go-back-button">
        返回故事
      </button>
    </div>
  );
}

export default WordLearning;