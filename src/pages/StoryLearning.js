import React from 'react';
import { Link } from 'react-router-dom';
import './StoryLearning.css';

function StoryLearning() {
  return (
    <div className="story-learning-container">
      <div className="every-title-area">
        <img src="/images/heart-hand.png" alt="手語愛心" className="every-heart-hand" />
        <h1>生聲 — 故事學習</h1>
      </div>

      <div className="classic-story">
        <Link to="/story/classic" className="story-button classic">經典故事</Link>
        <Link to="/story/create" className="story-button create">創建故事</Link>
      </div>

      <div className="description-container">
        <p className="description">創建故事可以建立屬於自己的故事ㄛ！</p>
      </div>
      <Link to="/" className="go-back-button">回首頁</Link>
    </div>
  );
}

export default StoryLearning;
