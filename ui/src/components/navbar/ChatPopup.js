import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faComments, faUser, faPaperPlane, faUndo } from '@fortawesome/free-solid-svg-icons';
import './styles/ChatPopup.css';
import { aiBotProcessor } from '../../processor/aiBotProcessor';
import { marked } from 'marked';
import { useDispatch, useSelector } from 'react-redux';
import { setChatOpen } from '../../redux/slices/chatSlice';
import { indexDbManager } from '../../store/indexdb_manager';

function ChatPopup() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);
  const [isLimited, setIsLimited] = useState(false);
  
  const dispatch = useDispatch();
  const isOpen = useSelector(state => state.chat.isChatOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      dispatch(setChatOpen(false));
      setIsClosing(false);
    }, 200);
  };

  const handleSendMessage = async (e) => {
    if (isLoading) return;
    if (isLimited) return;
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage = {
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await aiBotProcessor.sendInquiry(inputMessage, history);
      const botResponse = {
        text: marked(response.answer),
        sender: 'bot',
        timestamp: new Date(),
        references: response.reference_contents
      };
      setMessages(prev => [...prev, botResponse]);
      setHistory(prev => [...prev, response.answer]);
    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorResponse = {
        text: error.message || "Sorry, I encountered an error while processing your request.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  };

  useEffect(() => {
    if (messages.length >= 14) {
      setIsLimited(true);
    }
  }, [messages]);

  // Load chat data from IndexedDB when component mounts
  useEffect(() => {
    const loadChatData = async () => {
      try {
        const chatData = await indexDbManager.chat.getChat();
        
        if (chatData) {
          setMessages(chatData.messages || []);
          setHistory(chatData.history || []);
          setIsLimited(chatData.messages && chatData.messages.length >= 14);
        }
      } catch (error) {
        console.error('Error loading chat data:', error);
      }
    };
    
    loadChatData();
  }, []);

  // Save chat data to IndexedDB whenever messages or history change
  useEffect(() => {
    const saveChatData = async () => {
      try {
        await indexDbManager.chat.saveChat({ messages, history });
      } catch (error) {
        console.error('Error saving chat data:', error);
      }
    };
    
    if (messages.length > 0 || history.length > 0) {
      saveChatData();
    }
  }, [messages, history]);

  const resetChat = () => {
    setMessages([]);
    setHistory([]);
    setInputMessage('');
    setIsLimited(false);
    indexDbManager.chat.clearChat().catch(error => {
      console.error('Error clearing chat data:', error);
    });
  };

  if (!isOpen) return null;

  return (
    <div className={`chat-popup-overlay ${!isOpen ? 'hidden' : ''} ${isClosing ? 'closing' : ''}`} 
         onClick={handleClose}>
      <div className="chat-popup-container" onClick={e => e.stopPropagation()}>
        <div className="chat-popup-header">
          <div className="header-title">
            <h4>AI Assistant</h4>
            <button className="icon-button" onClick={resetChat} title="New Chat">
              <FontAwesomeIcon icon={faUndo} />
            </button>
          </div>
          <div className="header-buttons">
            <button className="icon-button" onClick={handleClose} title="Close">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
        
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.sender}`}>
              <FontAwesomeIcon 
                icon={message.sender === 'bot' ? faComments : faUser} 
                className="message-icon"
              />
              <div className="message-content">
                {message.sender === 'bot' ? (
                  <div dangerouslySetInnerHTML={{ __html: message.text }} />
                ) : (
                  <p>{message.text}</p>
                )}
                {message.references && message.references.length > 0 && (
                  <div className="references">
                    <h3>Related Articles:</h3>
                    <ul>
                      {message.references.map((ref, idx) => (
                        <li key={idx}>
                          <a href={ref.path}>{ref.title}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <span className="timestamp">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message bot loading">
              <FontAwesomeIcon icon={faComments} className="message-icon" />
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isLimited ? "You've reached the chat limit. Please start a new session." : "Type your message..."}
            className="chat-input"
            style={{
              color: isLimited ? 'var(--text-light)' : 'var(--text-dark)'
            }}
            disabled={isLimited}
            autoFocus
            ref={inputRef}
          />
          <button type="submit" className="send-button" disabled={isLoading || isLimited}>
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatPopup; 