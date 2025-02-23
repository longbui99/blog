import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import storageRegistry from '../../store/storage_registry';
import './styles/RawEditor.css';

const RawEditor = () => {
    const [rawContent, setRawContent] = useState('');
    const blogContent = useSelector(state => state.blog.content);
    const isCreating = useSelector(state => state.editing.isCreating);

    useEffect(() => {
        const content = isCreating ? '' : blogContent?.content || '';
        setRawContent(content);
        storageRegistry.update('currentContent', content);
    }, [blogContent, isCreating]);

    const handleRawContentChange = (e) => {
        const newContent = e.target.value;
        setRawContent(newContent);
        storageRegistry.update('currentContent', newContent);
    };

    return (
        <textarea 
            className="raw-content-editor"
            value={rawContent}
            onChange={handleRawContentChange}
            placeholder="Enter raw HTML content..."
        />
    );
};

export default RawEditor; 