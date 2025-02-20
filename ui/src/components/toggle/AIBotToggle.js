import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setChatOpen } from '../../redux/slices/chatSlice';
import './styles/AIBotToggle.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';

function AIBotToggle() {
  const dispatch = useDispatch();
  const isOpen = useSelector(state => state.chat.isChatOpen);

  const handleChatClick = () => {
    dispatch(setChatOpen(!isOpen));
  };

  return (
    <button
      className="ai-bot-toggle"
      onClick={handleChatClick}
      title={isOpen ? "Close AI Bot" : "Open AI Bot"}
    >
      <span className="text">
        <FontAwesomeIcon icon={faRobot} />
      </span>
    </button>
  );
}

export default AIBotToggle;
