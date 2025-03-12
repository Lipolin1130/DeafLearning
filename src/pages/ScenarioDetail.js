// src/pages/ScenarioDetail.js

import React, { useState, useRef } from 'react';
import { FaMicrophone } from 'react-icons/fa'; 
import { useParams, Link } from 'react-router-dom';
import './ScenarioDetail.css';

import defaultImage1 from '../assets/default1.jpg';
import defaultImage2 from '../assets/default2.jpg';

// 嘴型 GIF
import mouthGif1 from '../assets/mouth1.gif';
import mouthGif2 from '../assets/mouth2.gif';
import mouthGif3 from '../assets/mouth3.gif';

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
          { text: "老師，這題可以再解釋一次嗎？", mouthGif: mouthGif1 },
          { text: "老師，這個作業是幾號交？", mouthGif: mouthGif2 },
          { text: "老師，剛剛那題的答案是什麼？", mouthGif: mouthGif1 },
          { text: "老師我的肚子不舒服！", mouthGif: mouthGif2 },
          { text: "你有聽到老師剛剛講什麼？", mouthGif: mouthGif3 },
          { text: "你有多的鉛筆嗎？", mouthGif: mouthGif1 },
          { text: "你的作業寫完了嗎？", mouthGif: mouthGif2 },
          { text: "你的筆記可以借我看一下嗎？", mouthGif: mouthGif3 },
          { text: "你的尺掉了，我幫你撿起來！", mouthGif: mouthGif1 },
          { text: "下課要不要一起去福利社買東西？", mouthGif: mouthGif2 }
        ]
      },
      "操場": {
        images: [playgroundImg1, playgroundImg2],
        lines: [
          { text: "我們一起來打球吧！", mouthGif: mouthGif3 },
          { text: "我想練跑步，你要一起嗎？", mouthGif: mouthGif1 },
          { text: "操場上有很多同學在運動。", mouthGif: mouthGif2 },
          { text: "小心！不要跑太快，容易跌倒。", mouthGif: mouthGif1 },
          { text: "請幫我撿一下那顆籃球。", mouthGif: mouthGif2 },
          { text: "你想玩躲避球還是羽毛球？", mouthGif: mouthGif3 },
          { text: "太陽很大，別忘了補充水分。", mouthGif: mouthGif2 },
          { text: "這裡可以自由活動，但要注意安全。", mouthGif: mouthGif1 },
          { text: "我們一起做體操好嗎？", mouthGif: mouthGif2 },
          { text: "我可以和你組隊打球嗎？", mouthGif: mouthGif3 }
        ]
      },
      "保健室": {
        images: [healthOfficeImg1, healthOfficeImg2],
        lines: [
          { text: "我肚子痛，想請護士阿姨看看。", mouthGif: mouthGif1 },
          { text: "頭好痛，可以量一下體溫嗎？", mouthGif: mouthGif3 },
          { text: "我不小心摔倒了，需要擦藥。", mouthGif: mouthGif2 },
          { text: "請問有沒有感冒藥可以拿？", mouthGif: mouthGif1 },
          { text: "我想休息一下再回去上課。", mouthGif: mouthGif3 },
          { text: "護士說要先填寫健康狀況表。", mouthGif: mouthGif2 },
          { text: "最近天氣變化大，要小心感冒。", mouthGif: mouthGif1 },
          { text: "你也不舒服嗎？要不要一起等醫生？", mouthGif: mouthGif2 },
          { text: "喝點溫水休息一下，會好一點。", mouthGif: mouthGif1 },
          { text: "謝謝你的照顧，我好像好多了。", mouthGif: mouthGif3 }
        ]
      }
    }
  },
  family: {
    title: "初級：家庭",
    tip: "點擊錄音練習，獲得發音指導！",
    locations: {
      "客廳": {
        images: [defaultImage1, defaultImage2],
        lines: [
          { text: "家庭對話1", mouthGif: mouthGif1 },
          { text: "家庭對話2", mouthGif: mouthGif2 }
        ]
      },
      "廚房": {
        images: [defaultImage1, defaultImage2],
        lines: [
          { text: "家庭對話3", mouthGif: mouthGif3 },
          { text: "家庭對話4", mouthGif: mouthGif2 }
        ]
      },
      "房間": {
        images: [defaultImage1, defaultImage2],
        lines: [
          { text: "家庭對話5", mouthGif: mouthGif1 },
          { text: "家庭對話6", mouthGif: mouthGif3 }
        ]
      }
    }
  }
};

function ScenarioDetail() {
  const { topic } = useParams();
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

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

  // 分析結果 (顯示在中間區)
  const [similarity, setSimilarity] = useState("");
  const [advice, setAdvice] = useState("");

  // 下拉式選單變動
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

  // ============== 錄音核心功能 ==============
  // 開始錄音
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

        // 錄音結束後，進行分析（後端實際分析）
        handleAnalyze(audioBlob);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('無法錄音:', error);
    }
  };

  // 停止錄音
  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  // 一個按鈕 toggle 開始/停止
  const toggleRecording = () => {
    if (isRecording) {
      // 若正在錄音 → 停止
      stopRecording();
    } else {
      // 若未錄音 → 開始
      startRecording();
    }
  };

  // ============== 分析: 向後端請求 ==============
  const handleAnalyze = async (audioBlob) => {
    // 若當前還沒隨機出句子，就提示
    if (!currentLineObj) {
      setSimilarity("--");
      setAdvice("請先選擇地點並產生句子");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, `_userAudio.wav`);
      // 修改 key 為 "text" 而非 "targetText"
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
        // 使用從後端回傳的 evaluation 作為相似度與建議
        setSimilarity(data.evaluation || "--");
        setAdvice(data.evaluation || "請再試一次");
      }
    } catch (error) {
      console.error("分析時發生錯誤:", error);
      setSimilarity("失敗");
      setAdvice("分析錯誤，請稍後再試");
    }
  };

  return (
    <div className="scenario-detail-container">

      {/* 左上角：標題區（Logo + 文案） */}
      <div className="every-title-area">
        <img
          src="/images/heart-hand.png"
          alt="手語愛心"
          className="every-heart-hand"
        />
        <h1>生聲 — 情景模擬</h1>
      </div>

      <h2>{currentScenario.title}</h2>

      {/* 主要內容：左(圖片區+地點選擇) 中(相似度) 右(AI嘴型) */}
      <div className="scenario-content">

        {/* 左側圖片區 + 對話框 */}
        <div className="scenario-images">
          <img
            src={locationImages[0]}
            alt="場景圖1"
            className="scenario-img"
          />

          <div className="dialog-image-container">
            <img
              src={locationImages[1]}
              alt="場景圖2"
              className="scenario-img"
            />
          </div>
          {/* 若已隨機出句子，就在泡泡顯示文字 */}
          {currentLineObj && (
            <div className="dialog-bubble">
              {currentLineObj.text}
            </div>
          )}
        </div>

        {/* 中間區 - 相似度 / 提示 */}
        <div className="scenario-middle">
          <p>{similarity}</p>
          {advice && (
            <p>
              <span className="advice-label">建議：</span>
              <span className="advice-text">{advice}</span>
            </p>
          )}
          {similarity === "" && advice === "" && <p>{currentScenario.tip}</p>}
        </div>

        {/* 右側 - AI 嘴型對照 */}
        <div className="scenario-ai">
          {currentLineObj ? (
            <img
              src={currentLineObj.mouthGif}
              alt="嘴型GIF"
              className="ai-face"
            />
          ) : (
            <div style={{ width: 200, height: 200, background: "#eee" }} />
          )}
        </div>
      </div>

      {/* 地點下拉 + 隨機句子按鈕 */}
      <div className="location-controls">
        <label htmlFor="locationSelect">
          選擇地點：
        </label>
        <select
          id="locationSelect"
          value={selectedLocation}
          onChange={handleLocationChange}
        >
          <option value="">請選擇</option>
          {Object.keys(currentScenario.locations).map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        <button onClick={getRandomLine} disabled={!selectedLocation}>
          ▶ 開始
        </button>
      </div>

      {/* 錄音按鈕 */}
      <div className="scenario-controls">
        <button
          className={`record-btn ${isRecording ? 'recording' : ''}`}
          onClick={toggleRecording}
        >
          <span className="record-text">
            {isRecording ? "停止" : "錄音"}
          </span>
          <FaMicrophone className="microphone-icon" />
        </button>
      </div>

      {/* 回到情景模擬首頁 */}
      <Link to="/scenario" className="go-back-button">回上一頁</Link>
    </div>
  );
}

export default ScenarioDetail;
