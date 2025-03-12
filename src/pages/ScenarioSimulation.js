// src/pages/ScenarioSimulation.js
import React from 'react';
import { Link } from 'react-router-dom';
import './ScenarioSimulation.css';

function ScenarioSimulation() {
  return (
    <div className="scenario-simulation-container">
      {/* 右上角「回首頁」按鈕
      <button className="back-button">回首頁</button> */}

      {/* 左上角：標題區（Logo + 文案） */}
      <div className="every-title-area">
        <img
          src="/images/heart-hand.png"
          alt="手語愛心"
          className="every-heart-hand"
        />
        <h1>生聲 — 情景模擬</h1>
      </div>

      {/* 三欄：初級(1000)、中級(1500)、高級(2000) */}
      <div className="levels">
        {/* 初級(詞彙1000) */}
        <div className="level">
          <h2>初級（詞彙1000）</h2>
          <ul>
            <li><Link to="/scenario/school">學校</Link></li>
            <li><Link to="/scenario/family">家庭</Link></li>
            <li><Link to="/scenario/greet">打招呼</Link></li>
            <li><Link to="/scenario/ending">結束對話</Link></li>
          </ul>
        </div>

        {/* 中級(詞彙1500) */}
        <div className="level">
          <h2>中級（詞彙1500）</h2>
          <ul>
            <li><Link to="/scenario/emotion">心情</Link></li>
            <li><Link to="/scenario/body">身體</Link></li>
            <li><Link to="/scenario/personality">個性</Link></li>
            <li><Link to="/scenario/hobby">興趣</Link></li>
          </ul>
        </div>

        {/* 高級(詞彙2000) */}
        <div className="level">
          <h2>高級（詞彙2000）</h2>
          <ul>
            <li><Link to="/scenario/weather">天氣</Link></li>
            <li><Link to="/scenario/traffic">交通</Link></li>
            <li><Link to="/scenario/eating">用餐</Link></li>
            <li><Link to="/scenario/shopping">購物</Link></li>
          </ul>
        </div>
      </div>

      {/* 右上角「回首頁」按鈕 */}
      <Link to="/" className="go-back-button">回首頁</Link>
    </div>
  );
}

export default ScenarioSimulation;
