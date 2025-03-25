import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ReviewConversations.css";

const ReviewConversations = () => {
  const [conversations, setConversations] = useState([]);

  // 畫面載入時從 localStorage 取得交談紀錄
  useEffect(() => {
    const storedConversations = localStorage.getItem("conversations");
    if (storedConversations) {
      setConversations(JSON.parse(storedConversations));
    }
  }, []);

  // 更新 localStorage
  const updateLocalStorage = (newConversations) => {
    localStorage.setItem("conversations", JSON.stringify(newConversations));
  };

  // 刪除單筆對話紀錄
  const handleDelete = (indexToDelete) => {
    const updatedConversations = conversations.filter((_, index) => index !== indexToDelete);
    setConversations(updatedConversations);
    updateLocalStorage(updatedConversations);
  };

  // 可選：刪除全部紀錄
  const handleClearAll = () => {
    setConversations([]);
    localStorage.removeItem("conversations");
  };

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

      <Link to="/dialogue" className="go-back-button">
        回上一頁
      </Link>

      {/* 可選：全部刪除按鈕 */}
      {conversations.length > 0 && (
        <div style={{ textAlign: "center", margin: "1rem 0" }}>
          <button onClick={handleClearAll}>刪除全部紀錄</button>
        </div>
      )}

      <div className="review-table-container">
        <table className="review-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>交談內容</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {conversations.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: "center" }}>
                  尚無任何對話紀錄
                </td>
              </tr>
            ) : (
              conversations.map((conv, index) => (
                <tr key={index}>
                  <td>{conv.date}</td>
                  <td>{conv.content}</td>
                  <td>
                    <button onClick={() => handleDelete(index)}>刪除</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReviewConversations;
