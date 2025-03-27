    import React from 'react';
    import { Link } from 'react-router-dom';
    import './ClassicalStory.css';

    function ClassicalStory() {
        return (
            <div className="classical-story-container">
                <div className="every-title-area">
                    <img src="/images/heart-hand.png" alt="手語愛心" className="every-heart-hand" />
                    <h1>生聲 — 故事學習：經典故事</h1>
                </div>

                <div className="levels">
                    {/* Beginner */}
                    <div className="level">
                        <h2>初級（詞彙1000）</h2>
                        <ul>
                            <li><Link to="/story/classic/helen">海倫．凱勒</Link></li>
                            <li><Link to="/story/classic/redhat">小紅帽</Link></li>
                            <li><Link to="/story/classic/threepig">三隻小豬</Link></li>
                            <li><Link to="/story/classic/fingergirl">拇指姑娘</Link></li>
                            <li><Link to="/story/classic/sleepgirl">睡美人</Link></li>
                        </ul>
                    </div>

                    {/* Intermediate */}
                    <div className="level">
                        <h2>中級（詞彙1500）</h2>
                        <ul>
                            <li><Link to="/story/classic/goldchicken">金雞母</Link></li>
                            <li><Link to="/story/classic/honest">誠實的樵夫</Link></li>
                            <li><Link to="/story/classic/candyhouse">糖果屋</Link></li>
                            <li><Link to="/story/classic/poorgirl">灰姑娘</Link></li>
                            <li><Link to="/story/classic/frogprince">青蛙王子</Link></li>
                        </ul>
                    </div>

                    {/* Advanced */}
                    <div className="level">
                        <h2>高級（詞彙2000）</h2>
                        <ul>
                            <li><Link to="/story/classic/bravetailer">勇敢的裁縫</Link></li>
                            <li><Link to="/story/classic/swan">野天鵝</Link></li>
                            <li><Link to="/story/classic/threehair">魔鬼的三根金髮</Link></li>
                            <li><Link to="/story/classic/stonesoup">石頭湯</Link></li>
                            <li><Link to="/story/classic/citymouse">城市老鼠</Link></li>
                        </ul>
                    </div>
                </div>
                <Link to="/story" className="go-back-button">回上一頁</Link>
            </div>
        )
    }

export default ClassicalStory;
