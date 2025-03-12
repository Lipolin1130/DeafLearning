import React from "react";
import { Link } from "react-router-dom";
import "./ReviewConversations.css"; // 引入 CSS 檔案

const conversations = [
  { date: "8/1", content: "剛開學交不到新朋友" },
  { date: "8/2", content: "在玩溜滑梯時交到一個朋友" },
  { date: "8/5", content: "不小心跌倒了" },
  { date: "8/9", content: "忘記把國語作業帶回家了" },
  { date: "8/11", content: "和好朋友吵架" },
  { date: "8/18", content: "被老師罵了" },
];

const ReviewConversations = () => {
  return (
    <div className="review-container">
      {/* 左上角：標題區（Logo + 文案） */}
      <div className="every-title-area">
        <img
          src="/images/heart-hand.png"
          alt="手語愛心"
          className="every-heart-hand"
        />
        <h1>生聲 — 交談回顧</h1>
      </div>
      <Link to="/dialogue" className="go-back-button">回上一頁</Link>
      <div className="review-table-container">
        <table className="review-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>交談內容</th>
            </tr>
          </thead>
          <tbody>
            {conversations.map((conv, index) => (
              <tr key={index}>
                <td>{conv.date}</td>
                <td>{conv.content}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReviewConversations;
