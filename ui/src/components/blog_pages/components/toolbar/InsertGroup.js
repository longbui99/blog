import React from 'react';

const InsertGroup = ({ onLink, onImage, onInlineCode, onCodeBlock }) => {
    return (
        <div className="toolbar-group insert-group">
            <button onClick={onLink} title="Insert Link">
                <i className="fas fa-link"></i>
            </button>
            <button onClick={onImage} title="Insert Image">
                <i className="fas fa-image"></i>
            </button>
            <button onClick={onInlineCode} title="Insert Inline Code">
                <i className="fas fa-code"></i>
            </button>
            <button onClick={onCodeBlock} title="Insert Code Block">
                <i className="fas fa-file-code"></i>
            </button>
        </div>
    );
};

export default InsertGroup; 