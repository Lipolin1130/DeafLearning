// src/pages/ScenarioDetail.js

import React, { useState, useRef } from 'react';
import { FaMicrophone } from 'react-icons/fa'; 
import { useParams, Link } from 'react-router-dom';
import './ScenarioDetail.css';

import defaultImage1 from '../assets/default1.jpg';
import defaultImage2 from '../assets/default2.jpg';

// 口型影片 (mp4 檔案)
import mouthVideo1 from '../assets/mouth1.mp4';
import mouthVideo2 from '../assets/mouth2.mp4';
import mouthVideo3 from '../assets/mouth3.mp4';
import mouthVideo4 from '../assets/mouth4.mp4';
import mouthVideo5 from '../assets/mouth5.mp4';
import mouthVideo6 from '../assets/mouth6.mp4';
import mouthVideo7 from '../assets/mouth7.mp4';
import mouthVideo8 from '../assets/mouth8.mp4';
// import mouthVideo9 from '../assets/mouth9.mp4';
import mouthVideo10 from '../assets/mouth10.mp4';

// 示範：地點用不同圖片
import classroomImg1 from '../assets/classroom1.png';
import classroomImg2 from '../assets/classroom2.jpeg';
import playgroundImg1 from '../assets/playground1.png';
import playgroundImg2 from '../assets/playground2.jpeg';
import healthOfficeImg1 from '../assets/health1.png';
import healthOfficeImg2 from '../assets/health2.jpeg';

const scenarioData = {
  school: {
    title: "初級：學校",
    tip: "點擊錄音練習，獲得發音指導！",
    locations: {
      "教室": {
        images: [classroomImg1, classroomImg2],
        lines: [
          { text: "老師，這題可以再解釋一次嗎？", mouthVideo: mouthVideo1 },
          { text: "老師，這個作業是幾號交？", mouthVideo: mouthVideo2 },
          { text: "老師，剛剛那題的答案是什麼？", mouthVideo: mouthVideo3 },
          { text: "老師我的肚子不舒服！", mouthVideo: mouthVideo4 },
          { text: "你有聽到老師剛剛講什麼？", mouthVideo: mouthVideo5 },
          { text: "你有多的鉛筆嗎？", mouthVideo: mouthVideo6 },
          { text: "你的作業寫完了嗎？", mouthVideo: mouthVideo7 },
          { text: "你的筆記可以借我看一下嗎？", mouthVideo: mouthVideo8 },
          // { text: "你的尺掉了，我幫你撿起來！", mouthVideo: mouthVideo9 },
          { text: "下課要不要一起去福利社買東西？", mouthVideo: mouthVideo10 }
        ]
      },
      // "操場": {
      //   images: [playgroundImg1, playgroundImg2],
      //   lines: [
      //     { text: "可以借我一顆球嗎？", mouthVideo: mouthVideo11 },
      //     { text: "小心！球飛過來了！", mouthVideo: mouthVideo12 },
      //     { text: "我可以加入你們的隊伍嗎？", mouthVideo: mouthVideo13 },
      //     { text: "太熱了，我要休息一下。", mouthVideo: mouthVideo14 },
      //     { text: "這裡有長椅，我們坐一下吧！", mouthVideo: mouthVideo15 },
      //     { text: "我的鞋帶鬆了。", mouthVideo: mouthVideo16 },
      //     { text: "小心別摔倒，地上有點濕滑！", mouthVideo: mouthVideo17 },
      //     { text: "我們換個地方玩吧！", mouthVideo: mouthVideo18 },
      //     { text: "我們還差一個人才能比賽。", mouthVideo: mouthVideo19 },
      //     { text: "我不太會踢足球，你可以教我嗎？", mouthVideo: mouthVideo20 }
      //   ]
      // },
      // "保健室": {
      //   images: [healthOfficeImg1, healthOfficeImg2],
      //   lines: [
      //     { text: "我剛剛在操場跑步時扭傷了腳！", mouthVideo: mouthVideo21 },
      //     { text: "可以幫我量體溫嗎？", mouthVideo: mouthVideo22 },
      //     { text: "我的眼睛很癢。", mouthVideo: mouthVideo23 },
      //     { text: "我最近一直咳嗽，可能是感冒了。", mouthVideo: mouthVideo24 },
      //     { text: "我的心跳好像有點快！", mouthVideo: mouthVideo25 },
      //     { text: "我可以休息一下嗎？", mouthVideo: mouthVideo26 },
      //     { text: "我可以打電話給家長嗎？", mouthVideo: mouthVideo27 },
      //     { text: "我好像過敏了。", mouthVideo: mouthVideo28 },
      //     { text: "我想吐！", mouthVideo: mouthVideo29 },
      //     { text: "我咳嗽得很厲害。", mouthVideo: mouthVideo30 }
      //   ]
      // }
    }
  },
  family: {
    title: "初級：家庭",
    tip: "點擊錄音練習，獲得發音指導！",
    locations: {
      "客廳": {
        images: [defaultImage1, defaultImage2],
        lines: [
          { text: "家庭對話1", mouthVideo: mouthVideo1 },
          { text: "家庭對話2", mouthVideo: mouthVideo1 }
        ]
      },
      "廚房": {
        images: [defaultImage1, defaultImage2],
        lines: [
          { text: "家庭對話3", mouthVideo: mouthVideo1 },
          { text: "家庭對話4", mouthVideo: mouthVideo1 }
        ]
      },
      "房間": {
        images: [defaultImage1, defaultImage2],
        lines: [
          { text: "家庭對話5", mouthVideo: mouthVideo1 },
          { text: "家庭對話6", mouthVideo: mouthVideo1 }
        ]
      }
    }
  }
};

function ScenarioDetail() {
  const { topic } = useParams();
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const videoRef = useRef(null); // 用於控制影片播放

  // 錄音/音訊相關狀態
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);

  // 取得當前場景
  const currentScenario = scenarioData[topic] || {
    title: "未知場景",
    tip: "目前沒有此場景資料",
    locations: {}
  };

  // 地點與句子狀態
  const [selectedLocation, setSelectedLocation] = useState("");
  const [currentLineObj, setCurrentLineObj] = useState(null);

  // 評估結果與建議狀態
  const [similarity, setSimilarity] = useState("");
  const [advice, setAdvice] = useState("");

  // 下拉選單變動
  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
    setCurrentLineObj(null);
    setSimilarity("");
    setAdvice("");
  };

  // 隨機出句子
  const getRandomLine = () => {
    if (!selectedLocation) return;
    const locationData = currentScenario.locations[selectedLocation];
    if (!locationData?.lines?.length) return;
    const randomIndex = Math.floor(Math.random() * locationData.lines.length);
    setCurrentLineObj(locationData.lines[randomIndex]);
    setSimilarity("");
    setAdvice("");
  };

  // 根據所選地點載入對應圖片
  let locationImages = [defaultImage1, defaultImage2];
  if (selectedLocation && currentScenario.locations[selectedLocation]) {
    locationImages = currentScenario.locations[selectedLocation].images;
  }

  // 錄音核心功能
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        // 錄音結束後，進行分析
        handleAnalyze(audioBlob);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      // 錄音開始時，暫停影片播放
      if (videoRef.current) {
        videoRef.current.pause();
      }
    } catch (error) {
      console.error('無法錄音:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
      // 錄音停止後，自動播放影片
      if (videoRef.current) {
        videoRef.current.play();
      }
    } else {
      startRecording();
    }
  };

  // 分析: 向後端請求
  const handleAnalyze = async (audioBlob) => {
    if (!currentLineObj) {
      setSimilarity("--");
      setAdvice("請先選擇地點並產生句子");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, `_userAudio.wav`);
      formData.append("text", currentLineObj.text);

      const res = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      console.log("後端回傳內容:", data);

      if (data.error) {
        console.error("後端錯誤:", data.error);
        setSimilarity("失敗");
        setAdvice("後端錯誤：" + data.error);
      } else {
        setSimilarity(data.evaluation || "--");
        setAdvice(data.advice || "請再試一次");
      }
    } catch (error) {
      console.error("分析時發生錯誤:", error);
      setSimilarity("失敗");
      setAdvice("分析錯誤，請稍後再試");
    }
  };

  return (
    <div className="scenario-detail-container">
      {/* 左上角：標題區 */}
      <div className="every-title-area">
        <img src="/images/heart-hand.png" alt="手語愛心" className="every-heart-hand" />
        <h1>生聲 — 情景模擬</h1>
      </div>
      <h2>{currentScenario.title}</h2>

      <div className="scenario-content">
        {/* 左側：圖片與對話框 */}
        <div className="scenario-images">
          <img src={locationImages[0]} alt="場景圖1" className="scenario-img" />
          <div className="dialog-image-container">
            <img src={locationImages[1]} alt="場景圖2" className="scenario-img" />
          </div>
          {currentLineObj && (
            <div className="dialog-bubble">
              {currentLineObj.text}
            </div>
          )}
        </div>

        {/* 中間：評估結果與建議 */}
        <div className="scenario-middle">
          <p className="evaluation-text">{similarity}</p>
          {advice && (
            <p className="advice-text">
              <span className="advice-label">建議：</span>
              <span>{advice}</span>
            </p>
          )}
          {similarity === "" && advice === "" && <p>{currentScenario.tip}</p>}
        </div>

        {/* 右側：AI 口型對照 - 使用 mp4 影片 */}
        <div className="scenario-ai">
          {currentLineObj ? (
            <video
              ref={videoRef}
              className="ai-face"
              src={currentLineObj.mouthVideo}
              autoPlay
              loop
              controls
            />
          ) : (
            <div style={{ width: 200, height: 200, background: "#eee" }} />
          )}
        </div>
      </div>

      {/* 下方：選擇地點與隨機句子按鈕 */}
      <div className="location-controls">
        <label htmlFor="locationSelect">選擇地點：</label>
        <select id="locationSelect" value={selectedLocation} onChange={handleLocationChange}>
          <option value="">請選擇</option>
          {Object.keys(currentScenario.locations).map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
        <button onClick={getRandomLine} disabled={!selectedLocation}>
          ▶ 開始
        </button>
      </div>

      {/* 錄音按鈕 */}
      <div className="scenario-controls">
        <button className={`record-btn ${isRecording ? 'recording' : ''}`} onClick={toggleRecording}>
          <span className="record-text">{isRecording ? "停止" : "錄音"}</span>
          <FaMicrophone className="microphone-icon" />
        </button>
      </div>

      {/* 返回按鈕 */}
      <Link to="/scenario" className="go-back-button">回上一頁</Link>
    </div>
  );
}

export default ScenarioDetail;
