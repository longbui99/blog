import React from 'react';

const AlignmentGroup = ({ onAlignment }) => {
    return (
        <div className="toolbar-group alignment-group">
            <button onClick={() => onAlignment('justifyLeft')} title="Align Left">
                <i className="fas fa-align-left"></i>
            </button>
            <button onClick={() => onAlignment('justifyCenter')} title="Align Center">
                <i className="fas fa-align-center"></i>
            </button>
            <button onClick={() => onAlignment('justifyRight')} title="Align Right">
                <i className="fas fa-align-right"></i>
            </button>
            <button onClick={() => onAlignment('justifyFull')} title="Justify">
                <i className="fas fa-align-justify"></i>
            </button>
        </div>
    );
};

export default AlignmentGroup; 