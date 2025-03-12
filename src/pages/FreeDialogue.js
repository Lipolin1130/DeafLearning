import React from "react";
import { Link } from "react-router-dom";
import "./FreeDialogue.css";

const FreeDialogue = () => {
  return (
    <div className="free-dialogue-container">
      {/* 標題區（Logo + 文案） */}
      <div className="every-title-area">
        <img
          src="/images/heart-hand.png"
          alt="手語愛心"
          className="every-heart-hand"
        />
        <h1>生聲 — 自由對話</h1>
      </div>
      <div className="button-container">
        <Link
          to="/free"
          className="dialogue-button free"
        >
          自由對話
        </Link>
        <Link
          to="/review"
          className="dialogue-button review"
        >
          交談回顧
        </Link>
      </div>
      <div className="description-wrapper">
        <p className="description-text">自由對話可以選擇語音或視訊交談ㄛ！</p>
      </div>
      {/* 右上角「回首頁」按鈕 */}
      <Link to="/" className="go-back-button">回首頁</Link>
    </div>
  );
};

export default FreeDialogue;
