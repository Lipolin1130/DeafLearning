// 用來儲存目前的故事主題及frame

import React, { createContext, useState } from "react";

export const StoryContext = createContext();

export const StoryProvider = ({ children }) => {
    const [storyState, setStoryState] = useState({
        topic: "",
        currentFrame: 0,
        currentWord: "",
    });

    return (
        <StoryContext.Provider value={{ storyState, setStoryState }}>
            {children}
        </StoryContext.Provider>
    );
};