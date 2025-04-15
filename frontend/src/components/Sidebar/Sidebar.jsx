import React, { useContext, useState, useEffect } from "react";
import "./Sidebar.css";
import { assets } from "../../assets/assets";
import { Context } from "../../context/Context";

const Sidebar = () => {
  const [extended, setExtended] = useState(false);
  const { prevPrompts, setRecentPrompt, newChat, onSent, loadChat, chatHistory } = useContext(Context);
  
  const loadPrompt = (prompt, index) => {
    // Load a specific chat from history
    loadChat(index);
  };

  return (
    <div className="sidebar" style={{ width: extended ? "250px" : "85px" }}>
      <div className="top">
        <img
          onClick={() => setExtended((prev) => !prev)}
          className="menu"
          src={assets.menu_icon}
          alt="Menu"
        />
        <div onClick={() => newChat()} className="new-chat">
          <img src={assets.plus_icon} alt="New Chat" />
          {extended && <p>New Chat</p>}
        </div>
        {extended && (
          <div className="recent">
            <p className="recent-title">Recent Chats</p>
            {chatHistory.map((chat, index) => {
              return (
                <div
                  key={index}
                  className="recent-entry"
                  onClick={() => loadPrompt(chat.title, index)}
                >
                  <img src={assets.message_icon} alt="Message" />
                  <p>{chat.title.length > 18 ? chat.title.slice(0, 18) + "..." : chat.title}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="bottom">
        <div className="bottom-item recent-entry">
          <img src={assets.question_icon} alt="Help" />
          {extended && <p>Help</p>}
        </div>
        <div className="bottom-item recent-entry">
          <img src={assets.history_icon} alt="Activity" />
          {extended && <p>Activity</p>}
        </div>
        <div className="bottom-item recent-entry">
          <img src={assets.setting_icon} alt="Settings" />
          {extended && <p>Settings</p>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;