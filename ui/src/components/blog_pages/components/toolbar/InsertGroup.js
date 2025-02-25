import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faLink, 
    faImage, 
    faCode, 
    faFileCode,
    faListUl,
    faListOl
} from '@fortawesome/free-solid-svg-icons';

const InsertGroup = ({ 
    onLink, 
    onImage, 
    onInlineCode, 
    onCodeBlock,
    onBulletList,
    onNumberList 
}) => {
    return (
        <div className="toolbar-group insert-group">
            <button 
                onClick={onLink} 
                title="Insert Link"
                className="toolbar-button"
            >
                <FontAwesomeIcon icon={faLink} />
            </button>
            <button 
                onClick={onImage} 
                title="Insert Image"
                className="toolbar-button"
            >
                <FontAwesomeIcon icon={faImage} />
            </button>
            <button 
                onClick={onInlineCode} 
                title="Insert Inline Code"
                className="toolbar-button"
            >
                <FontAwesomeIcon icon={faCode} />
            </button>
            <button 
                onClick={onCodeBlock} 
                title="Insert Code Block"
                className="toolbar-button"
            >
                <FontAwesomeIcon icon={faFileCode} />
            </button>
            <button 
                onClick={onBulletList} 
                title="Bullet List"
                className="toolbar-button"
            >
                <FontAwesomeIcon icon={faListUl} />
            </button>
            <button 
                onClick={onNumberList} 
                title="Numbered List"
                className="toolbar-button"
            >
                <FontAwesomeIcon icon={faListOl} />
            </button>
        </div>
    );
};

export default InsertGroup; 