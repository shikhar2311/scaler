import EmptyChatState from './EmptyChatState';
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';
// import './.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [problemData, setProblemData] = useState(null);
  const messagesEndRef = useRef(null);

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

  // Check if input is a LeetCode URL
  const isLeetCodeUrl = (text) => {
    return text.trim().match(/^https?:\/\/(www\.)?leetcode\.com\/problems\/[a-zA-Z0-9-]+\/?$/i);
  };

  // Extract problem slug from URL
  const extractProblemSlug = (url) => {
    const match = url.match(/problems\/([a-zA-Z0-9-]+)/i);
    return match ? match[1] : null;
  };

  // Fetch problem details from LeetCode
  const fetchProblemDetails = async (url) => {
    const slug = extractProblemSlug(url);
    if (!slug) return null;

    setIsLoading(true);
    try {
      // This would be replaced with your actual API endpoint for fetching problem details
      const response = await fetch(`http://localhost:8000/api/leetcode/problem/${slug}`);
      const data = await response.json();
      
      if (data.success) {
        return data.problem;
      }
      return null;
    } catch (err) {
      console.error('Error fetching problem details:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle both regular text input and LeetCode URL
  const handleSend = async (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const userInputText = textInput.trim();
    setTextInput('');

    // Add user message to the local state
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: userInputText,
      time: formatTime(),
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Check if the input is a LeetCode URL
    if (isLeetCodeUrl(userInputText) && !problemData) {
      // Fetch problem details
      const problem = await fetchProblemDetails(userInputText);
      
      if (problem) {
        setProblemData(problem);
        
        // Add system message about detected problem
        const systemMessage = {
          id: Date.now() + 1,
          sender: 'system',
          text: `I've loaded the LeetCode problem "${problem.title}". What specific part are you stuck on?`,
          time: formatTime(),
        };
        
        setMessages(prev => [...prev, systemMessage]);
        setIsLoading(false);
        return;
      } else {
        // Failed to fetch problem
        const errorMessage = {
          id: Date.now() + 1,
          sender: 'system',
          text: `I couldn't load the problem from that URL. Please check the link or describe the problem manually.`,
          time: formatTime(),
        };
        
        setMessages(prev => [...prev, errorMessage]);
        setIsLoading(false);
        return;
      }
    }

    // Convert messages to ChatGPT's required format
    const conversation = updatedMessages.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }));

    // Add problem context if available
    let apiBody = { messages: conversation };
    if (problemData) {
      apiBody.problemContext = problemData;
    }

    // Call the backend to get AI response
    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiBody),
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

  // Display problem details if loaded
  const renderProblemContext = () => {
    if (!problemData) return null;
    
    return (
      <div className="problem-context">
        <div className="problem-header">
          <h3>{problemData.title}</h3>
          <span className={`difficulty ${problemData.difficulty.toLowerCase()}`}>
            {problemData.difficulty}
          </span>
        </div>
        <div className="problem-tags">
          {problemData.tags.map((tag, index) => (
            <span key={index} className="problem-tag">{tag}</span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="app-header">
        <h1>LeetCode Assistant</h1>
        <button className="theme-toggle" onClick={toggleDarkMode}>
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
      
      <div className="main-container">
        <div className="chat-container">
          <div className="chat-header">
            <div className="chat-header-user">
              <div className="user-avatar">🤖</div>
              <h2>LeetCode Guide</h2>
            </div>
          </div>
          
          {renderProblemContext()}
          
          <div className="chat-window">
            {messages.length === 0 ? (
              <EmptyChatState />
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
                      <div className="message-avatar">👤</div>
                    )}
                    {message.sender === 'system' && (
                      <div className="message-avatar">ℹ️</div>
                    )}
                    <div className="message-content">
                      <div className="message-text">
                        {message.sender === 'assistant' ? (
                          <ReactMarkdown>{message.text}</ReactMarkdown>
                        ) : (
                          message.text
                        )}
                      </div>
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
              placeholder={problemData 
                ? `Ask about "${problemData.title}"...` 
                : "Enter a LeetCode URL or ask a question..."}
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