import React, { useContext } from 'react';
// import { useParams, Link } from "react-router-dom";
import { useParams, useNavigate } from "react-router-dom";
import "./WordLearning.css";

import { StoryContext } from "./StoryContext"

function WordLearning() {
  const { word } = useParams();
  const navigate = useNavigate();
  const { storyState } = useContext(StoryContext);

  const handleBack = () => {
    navigate(`/story/classic/${storyState.topic}`);
  };

  return (
    <div className="testtt">
        <div className="every-title-area">
          <img
            src="/images/heart-hand.png"
            alt="手語愛心"
            className="every-heart-hand"
          />
          <h1>生聲 — 故事學習介面</h1>
        </div>
        <div className="word-container">
            <h1>word:{word}</h1>
            <p>here is the place you can put the word here</p>
        </div>

        <button onClick={handleBack}>返回故事</button>
      {/* <Link to="/story/classic/helen" className="back-link">← 回到故事</Link> */}
    </div>
  )
}

export default WordLearning;