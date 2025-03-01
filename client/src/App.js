import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Dummy list of users for the sidebar
const dummyUsers = [
  { id: 1, name: 'Alice', avatar: '👩‍💼' },
  { id: 2, name: 'Bob', avatar: '👨‍💻' },
  { id: 3, name: 'Charlie', avatar: '🧑‍🎨' },
  { id: 4, name: 'Diana', avatar: '👩‍🔬' },
  { id: 5, name: 'Ethan', avatar: '👨‍🚀' },
];

function App() {
  const [selectedUser, setSelectedUser] = useState(dummyUsers[0]);
  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const messagesEndRef = useRef(null);

  // Switch active user
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setMessages([]); // clear messages when switching users
  };

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode');
  };

  // Format timestamps
  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Send a message and get AI response
  const handleSend = async (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    // Add user message to the local state
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: textInput,
      time: formatTime(),
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setTextInput('');
    setIsLoading(true);

    // Convert messages to ChatGPT's required format
    const conversation = updatedMessages.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }));

    // Call the backend to get AI response
    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: conversation }),
      });
      
      const data = await response.json();
      
      // Extract AI response from the data
      const aiText = data.choices[0].message.content;
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: aiText,
        time: formatTime(),
      };
      
      // Update messages with AI response
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error:', err);
      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'system',
          text: 'Sorry, there was an error connecting to the AI. Please try again.',
          time: formatTime(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="app-header">
        <h1>AI Chat App</h1>
        <button className="theme-toggle" onClick={toggleDarkMode}>
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
      
      <div className="main-container">
        <div className="sidebar">
          <div className="sidebar-header">
            <h3>Contacts</h3>
          </div>
          <div className="users-list">
            {dummyUsers.map((user) => (
              <div
                key={user.id}
                className={`user-item ${selectedUser.id === user.id ? 'active' : ''}`}
                onClick={() => handleUserSelect(user)}
              >
                <div className="user-avatar">{user.avatar}</div>
                <div className="user-name">{user.name}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="chat-container">
          <div className="chat-header">
            <div className="chat-header-user">
              <span className="user-avatar">{selectedUser.avatar}</span>
              <h2>Chat with {selectedUser.name}</h2>
            </div>
          </div>
          
          <div className="chat-window">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <p>No messages yet. Start a conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`message-wrapper ${message.sender}`}
                >
                  <div className={`message ${message.sender}`}>
                    {message.sender === 'assistant' && (
                      <div className="message-avatar">🤖</div>
                    )}
                    {message.sender === 'user' && (
                      <div className="message-avatar">{selectedUser.avatar}</div>
                    )}
                    <div className="message-content">
                      <div className="message-text">{message.text}</div>
                      <div className="message-time">{message.time}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="message-wrapper assistant">
                <div className="message assistant">
                  <div className="message-avatar">🤖</div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSend} className="chat-form">
            <input
              type="text"
              placeholder={`Message ${selectedUser.name}...`}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={!textInput.trim() || isLoading}
              className={isLoading ? 'loading' : ''}
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;