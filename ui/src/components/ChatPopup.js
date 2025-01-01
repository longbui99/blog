import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faRobot, faUser, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import '../styles/ChatPopup.css';
import { aiBotProcessor } from '../processor/aiBotProcessor';
import { marked } from 'marked';

function ChatPopup({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  const handleSendMessage = async (e) => {
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
      const response = await aiBotProcessor.sendInquiry(inputMessage);
      const botResponse = {
        text: marked(response.answer),
        sender: 'bot',
        timestamp: new Date(),
        references: response.reference_contents
      };
      setMessages(prev => [...prev, botResponse]);
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
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`chat-popup-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div className="chat-popup-container" onClick={e => e.stopPropagation()}>
        <div className="chat-popup-header">
          <h4>AI Assistant</h4>
          <button className="close-button" onClick={handleClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.sender}`}>
              <FontAwesomeIcon 
                icon={message.sender === 'bot' ? faRobot : faUser} 
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
              <FontAwesomeIcon icon={faRobot} className="message-icon" />
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
            placeholder="Type your message..."
            className="chat-input"
            disabled={isLoading}
          />
          <button type="submit" className="send-button" disabled={isLoading}>
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatPopup; 