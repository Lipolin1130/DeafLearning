import React, { useContext } from "react";
import { CollectionContext } from "./CollectionContext";
import { Link } from "react-router-dom";
import "./WordCollection.css";

function WordCollection() {
  const { favoriteWords, removeWord } = useContext(CollectionContext);

  return (
    <div className="collection-container">
      {/* 頂部標題區 */}
      <div className="every-title-area">
        <img
          src="images/heart-hand.png"
          alt="手語愛心"
          className="every-heart-hand"
        />
        <h1>生聲 — 收藏字庫</h1>
      </div>

      {/* 單字庫區塊 */}
      <div className="word">
        {/* <div className="collection-subtitle">
          <span className="subtitle-text">單字庫</span>
        </div> */}

        {favoriteWords.length === 0 ? (
          <p className="empty-message">目前尚未收藏任何單字。</p>
        ) : (
          <table className="word-table">
            <thead>
              <tr>
                <th>等級</th>
                <th>單字</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {favoriteWords.map((word) => (
                <tr key={word}>
                  <td>初級</td>
                  <td>{word}</td>
                  <td>
                    <button
                      className="remove-btn"
                      onClick={() => removeWord(word)}
                    >
                      刪除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <Link to="/" className="go-back-button">回上一頁</Link>
    </div>
  );
}

export default WordCollection;