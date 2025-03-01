// EmptyChatState.js
import React from 'react';

const EmptyChatState = () => {
  return (
    <div className="empty-chat">
      <svg 
        width="80" 
        height="80" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        <path d="M8 10h.01"></path>
        <path d="M12 10h.01"></path>
        <path d="M16 10h.01"></path>
      </svg>
      <h3>Welcome to LeetCode Assistant</h3>
      <p>Enter a LeetCode problem URL or ask a coding question to start!</p>
      <div className="examples-list">
        <p className="examples-header">You can try:</p>
        <ul>
          <li>Paste a LeetCode problem URL</li>
          <li>"Help me understand dynamic programming"</li>
          <li>"How do I implement a binary search tree?"</li>
        </ul>
      </div>
    </div>
  );
};

export default EmptyChatState;