import React, { useState } from 'react';
import './InsertionPopup.css';

const InsertionPopup = ({ type, onSubmit, onClose, initialText = '' }) => {
    const [url, setUrl] = useState('');
    const [text, setText] = useState(initialText);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ url, text });
        onClose();
    };

    return (
        <div className="insertion-popup-overlay">
            <div className="insertion-popup">
                <form onSubmit={handleSubmit}>
                    <h3>{type === 'link' ? 'Insert Link' : 'Insert Image'}</h3>
                    
                    <div className="form-group">
                        <label htmlFor="url">URL:</label>
                        <input
                            type="url"
                            id="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder={type === 'link' ? 'https://example.com' : 'https://example.com/image.jpg'}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="text">
                            {type === 'link' ? 'Display Text:' : 'Alt Text:'}
                        </label>
                        <input
                            type="text"
                            id="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={type === 'link' ? 'Link text' : 'Image description'}
                            required
                        />
                    </div>

                    <div className="button-group">
                        <button type="submit" className="primary">
                            Insert
                        </button>
                        <button type="button" onClick={onClose} className="secondary">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InsertionPopup; 