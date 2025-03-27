import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// 如果有獨立的 Home
import Home from './pages/Home';
import StoryLearning from './pages/StoryLearning';
import ScenarioSimulation from './pages/ScenarioSimulation'; // 情景模擬首頁
import FreeDialogue from './pages/FreeDialogue'; // 自由對話首頁
import FreeConversations from './pages/FreeConversations'; // 自由對話
import ReviewConversations from './pages/ReviewConversations'; // 交談回顧
import WordCollection from './pages/WordCollection';

// 情景模擬學習介面
import ScenarioDetail from './pages/ScenarioDetail';

// this is story part import
import ClassicalStory from "./pages/ClassicalStory";
import ClassicalStoryDetail from "./pages/ClassicalStoryDetail";
import WordLearning from "./pages/WordLearning";

import { StoryProvider } from "./pages/StoryContext"; // save the topic and frames of story

function App() {
  return (
    <StoryProvider>
    <Router>
      <div>
        {/* 1. 固定頂部導覽列 */}
        <header className="app-header">
          <nav className="main-nav">
            <ul>
              {/* 使用 <Link> 而不是 <a href> */}
              <li><Link to="/">首頁</Link></li>
              <li><Link to="/story">故事學習</Link></li>
              <li><Link to="/scenario">情景模擬</Link></li>
              <li><Link to="/dialogue">自由對話</Link></li>
              <li><Link to="/collection">收藏字庫</Link></li>
            </ul>
          </nav>
        </header>

        {/* 2. 在這裡放多個路由 */}
        <Routes>
          {/* 預設路徑顯示 Home */}
          <Route path="/" element={<Home />} />

          {/* 進入 /story 顯示故事學習頁 */}
          <Route path="/story" element={<StoryLearning />} />

          {/* 進入 /scenario 顯示情景模擬頁 */}
          <Route path="/scenario" element={<ScenarioSimulation />} />

          {/* 進入 /dialogue 顯示自由對話首頁 */}
          <Route path="/dialogue" element={<FreeDialogue />} />

          {/* 進入 /collection 顯示收藏字庫頁 */}
          <Route path="/collection" element={<WordCollection />} />

          {/* 情景模擬 - 場景詳情，使用 URL 參數例如 /scenario/school */}
          <Route path="/scenario/:topic" element={<ScenarioDetail />} />

          {/* 自由對話 */}
          <Route path="/free" element={<FreeConversations />} />
          
          {/* 交談回顧 */}
          <Route path="/review" element={<ReviewConversations />} />

          {/* into storylearning - classical story */}
          <Route path="/story/classic" element={<ClassicalStory />} />

          {/* into wordlearning - classical story */}
          <Route path="/word/:word" element={<WordLearning />} />

          {/* back to the classical story */}
          <Route
            path="/story/classic/:topic"
            element={<ClassicalStoryDetail />}
          />

          
        </Routes>
      </div>
    </Router>
    </StoryProvider>
  );
}

export default App;
