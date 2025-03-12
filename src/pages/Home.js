import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <div className="home-overlay"></div>
      <div className="home-content">
        <div className="logo-area">
          <img
            src="/images/heart-hand.png"
            alt="手語愛心"
            className="heart-hand"
          />
          <h1 className="site-title">生聲</h1>
        </div>

        <div className="feature-list">
          <Link to="/story" className="feature-item">故事學習</Link>
          <Link to="/scenario" className="feature-item">情景模擬</Link>
          <Link to="/dialogue" className="feature-item">自由對話</Link>
          <Link to="/collection" className="feature-item">收藏字庫</Link>
        </div>

        <div className="learn-question">今天想怎麼學習？</div>
      </div>
    </div>
  );
}

export default Home;
