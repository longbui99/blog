import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';
import ChatPopup from './SearchBar';
import { useDispatch, useSelector } from 'react-redux';
import { toggleChat } from '../../redux/slices/chatSlice';

function ChatButton() {
    const dispatch = useDispatch();
    const isChatOpen = useSelector(state => state.chat.isOpen);

    return (
        <>
            <button 
                className="chat-button" 
                onClick={() => dispatch(toggleChat())}
                title="AI Assistant"
            >
                <FontAwesomeIcon icon={faRobot} />
            </button>
            <ChatPopup isOpen={isChatOpen} onClose={() => dispatch(toggleChat())} />
        </>
    );
}

export default ChatButton;