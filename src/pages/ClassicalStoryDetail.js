import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import "./ClassicalStoryDetail.css";

import { StoryContext } from "./StoryContext.js";

import helen1 from "../assets/helen1.jpg";
import helen2 from "../assets/helen2.jpg";
import helen3 from "../assets/helen3.jpg";
import helen4 from "../assets/helen4.jpg";
import helen5 from "../assets/helen5.jpg";
import helen6 from "../assets/helen6.jpg";
import helen7 from "../assets/helen7.jpg";
import helen8 from "../assets/helen8.jpg";
import helen9 from "../assets/helen9.jpg";
import helen10 from "../assets/helen10.jpg";
import helen11 from "../assets/helen11.jpg";

import mouth1 from "../assets/helen/1.mp4";
import mouth2 from "../assets/helen/2.mp4";
import mouth3 from "../assets/helen/3.mp4";
import mouth4 from "../assets/helen/4.mp4";
import mouth5 from "../assets/helen/5.mp4";
import mouth6 from "../assets/helen/6.mp4";
import mouth7 from "../assets/helen/7.mp4";
import mouth8 from "../assets/helen/8.mp4";
import mouth9 from "../assets/helen/9.mp4";
import mouth10 from "../assets/helen/10.mp4";
import mouth11 from "../assets/helen/11.mp4";


import replayIcon from "../assets/Replay.png";
import pauseIcon from "../assets/Pause.png";
import resumeIcon from "../assets/Resume.png";

const storydata = {
  helen: {
    title: "初級：海倫．凱勒",
    frames: [
      {
        text: "海倫．凱勒是一個很不一樣的人，因為她小時候生病後，就看不見、聽不到了。",
        picture: helen1,
        duration: 7500,
        mouth: mouth1,
        clickable: ["不一樣", "生病", "看不見", "聽不到"],
      },
      {
        text: "她的生活變得很難，不能和家人說話，也不知道外面的世界是什麼樣子。",
        picture: helen2,
        duration: 6500,
        mouth: mouth2,
        clickable: ["家人", "說話"],
      },
      {
        text: "因此，她常常覺得很孤單，也很生氣，因為家人不能明白她的感覺。",
        picture: helen3,
        duration: 6500,
        mouth: mouth3,
        clickable: ["孤單", "生氣", "家人", "明白", "感覺"],
      },
      {
        text: "但有一天，一位叫安妮的老師來到她家，改變了她的生活。",
        picture: helen4,
        duration: 5500,
        mouth: mouth4,
        clickable: ["老師"],
      },
      {
        text: "安妮教海倫用手去「看」東西。她在海倫的手上寫下「水」這個字，然後讓海倫摸水。",
        picture: helen5,
        duration: 7500,
        mouth: mouth5,
        clickable: ["摸"],
      },
      {
        text: "那一刻，海倫突然知道了——雖然她看不見、聽不到，但她可以用手來「讀書」和「說話」。",
        picture: helen6,
        duration: 7500,
        mouth: mouth6,
        clickable: ["知道", "看不見", "聽不到", "說話", "讀書"],
      },
      {
        text: "從那時起，海倫變得很努力。他學會了看書、寫字",
        picture: helen7,
        duration: 5500,
        mouth: mouth7,
        clickable: ["努力"],
      },
      {
        text: "還進入了學校，努力追趕其他同學。",
        picture: helen8,
        duration: 3500,
        mouth: mouth8,
        clickable: ["學校", "努力"],
      },
      {
        text: "後來，海倫寫了很多書，告訴大家……",
        picture: helen9,
        duration: 3400,
        mouth: mouth9,
      },
      {
        text: "就算他看不見、聽不到，也可以完成很多很棒的事。",
        picture: helen10,
        duration: 4500,
        mouth: mouth10,
        clickable: ["看不見", "聽不到"],
      },
      {
        text: "海倫的故事告訴我們，只要努力面對事情，就能變得更好。",
        picture: helen11,
        duration: 5500,
        mouth: mouth11,
        clickable: ["努力", "面對"],
      },
    ],
  },
};

function renderTextWithLinks(
  text,
  clickableWords = [],
  currentIndex,
  topic,
  setStoryState
) {
  if (!clickableWords || clickableWords.length === 0) return text;

  const parts = [];
  let lastIndex = 0;

  clickableWords.forEach((word) => {
    const index = text.indexOf(word, lastIndex);
    if (index > -1) {
      if (index > lastIndex) {
        parts.push(text.slice(lastIndex, index));
      }
      parts.push(
        <Link
          key={index}
          to={`/word/${word}`}
          className="clickable-word"
          onClick={() => setStoryState({ topic, currentFrame: currentIndex })}
        >
          {word}
        </Link>
      );
      lastIndex = index + word.length;
    }
  });

  parts.push(text.slice(lastIndex));
  return parts;
}

function ClassicalStoryDetail() {
  const { topic } = useParams();
  const { storyState, setStoryState } = useContext(StoryContext);
  const currentStory = storydata[topic] || {
    title: "未知場景",
    frames: [],
  };

  const [currentIndex, setCurrentIndex] = useState(
    storyState.currentFrame || 0
  );
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isPaused && currentIndex < currentStory.frames.length - 1) {
      const currentFrame = currentStory.frames[currentIndex];
      const timer = setTimeout(() => {
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, currentFrame.duration);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentStory.frames, isPaused]);

  if (currentStory.frames.length === 0) {
    return <div>no data</div>;
  }

  const currentFrame = currentStory.frames[currentIndex];

  return (
    <div className="story-detail-container">
      <div className="every-title-area">
        <img
          src="/images/heart-hand.png"
          alt="手語愛心"
          className="every-heart-hand"
        />
        <h1>生聲 — 故事學習：經典故事</h1>
      </div>
      <h2 className="story-title">{currentStory.title}</h2>
      <div className="story-container">
        <img src={currentFrame.picture} alt="分鏡圖" className="story-image" />
        <div className="controls">
          <button onClick={() => setIsPaused(!isPaused)}>
            <img
              src={isPaused ? resumeIcon : pauseIcon}
              alt={isPaused ? "播放" : "暫停"}
              style={{ width: "30px", marginRight: "8px" }}
            />
          </button>
          <button
            onClick={() => {
              setCurrentIndex(0);
              setIsPaused(false);
            }}
          >
            <img
              src={replayIcon}
              alt="重新播放"
              style={{ width: "30px", marginRight: "8px" }}
            />
          </button>
        </div>
        <p className="story-line">
          {renderTextWithLinks(
            currentFrame.text,
            currentFrame.clickable,
            currentIndex,
            topic,
            setStoryState
          )}
        </p>
      </div>
      <div className="ai-section">
        {/* <h3>AI同步口型對照</h3> */}
        {currentFrame.mouth && (
          <video src={currentFrame.mouth} width="100%" controls autoPlay loop />
        )}
      </div>
        {/* 返回按鈕 */}
        <Link to="/story/classic" className="go-back-button">回上一頁</Link>
    </div>
  );
}

export default ClassicalStoryDetail;
