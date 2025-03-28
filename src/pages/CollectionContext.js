import React, { createContext, useState } from "react";

export const CollectionContext = createContext();

export function CollectionProvider({ children }) {
  const [favoriteWords, setFavoriteWords] = useState([]);

  // 收藏
  const addWord = (word) => {
    // 若該單字尚未被收藏，才加入
    if (!favoriteWords.includes(word)) {
      setFavoriteWords([...favoriteWords, word]);
    }
  };

  // 取消收藏
  const removeWord = (word) => {
    setFavoriteWords(favoriteWords.filter((w) => w !== word));
  };

  return (
    <CollectionContext.Provider value={{ favoriteWords, addWord, removeWord }}>
      {children}
    </CollectionContext.Provider>
  );
}
